/**
 * DoroLabs - Analytics Events & Microsoft Clarity
 * Privacy-first tracking - loads ONLY after consent
 * 
 * GA4 Events:
 * - cta_primary_click, cta_services_click
 * - service_seo_view, service_other_view
 * - contact_page_view, contact_form_submit
 * - phone_click, whatsapp_click
 * - scroll_75, time_on_page_60s
 */

(function() {
    'use strict';

    // ================================
    // Configuration
    // ================================
    
    const CLARITY_ID = 'v80x8sly41'; // Replace with actual Clarity ID
    const CONSENT_KEY = 'dorolabs_cookie_consent';
    
    // Track which events have fired (prevent duplicates)
    const firedEvents = {
        scroll75: false,
        time60s: false,
        pageView: false
    };

    // ================================
    // Consent Check
    // ================================
    
    function hasConsent() {
        return localStorage.getItem(CONSENT_KEY) === 'accepted';
    }

    // ================================
    // GA4 Event Helper
    // ================================
    
    function sendGA4Event(eventName, params = {}) {
        if (!hasConsent()) return;
        if (typeof window.gtag !== 'function') return;
        
        window.gtag('event', eventName, params);
    }

    // ================================
    // Microsoft Clarity
    // ================================
    
    function loadClarity() {
        if (!hasConsent()) return;
        if (window.clarityLoaded) return;
        window.clarityLoaded = true;

        // Skip if placeholder ID
        if (CLARITY_ID === 'REPLACE_WITH_YOUR_CLARITY_ID') {
            console.log('[Analytics] Clarity ID not configured');
            return;
        }

        // Official Clarity script with privacy settings
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", CLARITY_ID);

        // Privacy configuration - no form input recording, IP masking
        if (window.clarity) {
            window.clarity('set', 'content', { input: false });
        }
    }

    // ================================
    // CTA Click Events
    // ================================
    
    function trackCTAClicks() {
        // Primary CTA buttons (Contact buttons in hero/CTA sections)
        document.querySelectorAll('a.btn-primary[href*="contact"], button.btn-primary').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const text = this.textContent.trim().toLowerCase();
                
                // Skip cookie banner buttons
                if (this.id === 'cookie-accept' || this.id === 'cookie-refuse') return;
                
                sendGA4Event('cta_primary_click', {
                    button_text: this.textContent.trim(),
                    page_path: window.location.pathname
                });
            });
        });

        // Services CTA clicks
        document.querySelectorAll('a[href*="/servicii/"]').forEach(function(link) {
            link.addEventListener('click', function() {
                sendGA4Event('cta_services_click', {
                    service_url: this.getAttribute('href'),
                    link_text: this.textContent.trim(),
                    page_path: window.location.pathname
                });
            });
        });
    }

    // ================================
    // Service Page Views
    // ================================
    
    function trackServiceViews() {
        if (firedEvents.pageView) return;
        firedEvents.pageView = true;

        const path = window.location.pathname;

        // SEO service page
        if (path.includes('/servicii/seo')) {
            sendGA4Event('service_seo_view', {
                page_path: path,
                page_title: document.title
            });
        }
        // Other service pages
        else if (path.includes('/servicii/')) {
            const serviceName = path.split('/servicii/')[1]?.replace(/\//g, '') || 'index';
            sendGA4Event('service_other_view', {
                service_name: serviceName,
                page_path: path,
                page_title: document.title
            });
        }
    }

    // ================================
    // Contact Events
    // ================================
    
    function trackContactEvents() {
        const path = window.location.pathname;

        // Contact page view
        if (path.includes('/contact')) {
            sendGA4Event('contact_page_view', {
                page_path: path,
                referrer: document.referrer || 'direct'
            });
        }

        // Contact form submission
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', function() {
                sendGA4Event('contact_form_submit', {
                    page_path: path,
                    form_id: 'contact-form'
                });
            });
        }

        // Phone clicks (tel: links)
        document.querySelectorAll('a[href^="tel:"]').forEach(function(link) {
            link.addEventListener('click', function() {
                sendGA4Event('phone_click', {
                    phone_number: this.getAttribute('href').replace('tel:', ''),
                    page_path: window.location.pathname,
                    click_location: this.closest('footer') ? 'footer' : 'content'
                });
            });
        });

        // WhatsApp clicks
        document.querySelectorAll('a[href*="wa.me"]').forEach(function(link) {
            link.addEventListener('click', function() {
                sendGA4Event('whatsapp_click', {
                    page_path: window.location.pathname,
                    click_location: this.closest('footer') ? 'footer' : 'content'
                });
            });
        });
    }

    // ================================
    // Engagement Events
    // ================================
    
    function trackEngagement() {
        // Scroll depth 75%
        let scrollHandler = function() {
            if (firedEvents.scroll75) return;
            
            const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
            
            if (scrollPercent >= 75) {
                firedEvents.scroll75 = true;
                sendGA4Event('scroll_75', {
                    page_path: window.location.pathname,
                    page_title: document.title
                });
                // Remove listener after firing
                window.removeEventListener('scroll', scrollHandler);
            }
        };
        
        window.addEventListener('scroll', scrollHandler, { passive: true });

        // Time on page 60 seconds
        setTimeout(function() {
            if (firedEvents.time60s) return;
            if (!hasConsent()) return;
            
            firedEvents.time60s = true;
            sendGA4Event('time_on_page_60s', {
                page_path: window.location.pathname,
                page_title: document.title
            });
        }, 60000);
    }

    // ================================
    // Initialize Analytics
    // ================================
    
    function initAnalytics() {
        if (!hasConsent()) return;

        // Wait for GA4 to be ready
        const checkGA4 = setInterval(function() {
            if (typeof window.gtag === 'function') {
                clearInterval(checkGA4);
                
                // Initialize all tracking
                trackCTAClicks();
                trackServiceViews();
                trackContactEvents();
                trackEngagement();
                
                // Load Clarity
                loadClarity();
                
                console.log('[Analytics] Events initialized');
            }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(function() {
            clearInterval(checkGA4);
        }, 5000);
    }

    // ================================
    // Listen for consent changes
    // ================================
    
    // Initialize when consent is given (handles both page load and consent click)
    window.addEventListener('storage', function(e) {
        if (e.key === CONSENT_KEY && e.newValue === 'accepted') {
            initAnalytics();
        }
    });

    // ================================
    // Run on DOM Ready
    // ================================
    
    function init() {
        if (hasConsent()) {
            // Small delay to ensure GA4 loads first
            setTimeout(initAnalytics, 500);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
