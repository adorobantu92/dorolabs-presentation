/**
 * DoroLabs - GDPR Cookie Consent
 * Manages cookie consent and GA4 loading
 */

(function() {
    'use strict';

    const CONSENT_KEY = 'dorolabs_cookie_consent';
    const GA_ID = 'G-6GPJXFM519';

    // Check current consent status
    function getConsentStatus() {
        return localStorage.getItem(CONSENT_KEY);
    }

    // Save consent choice
    function setConsentStatus(status) {
        localStorage.setItem(CONSENT_KEY, status);
    }

    // Load Google Analytics
    function loadGA4() {
        // Prevent duplicate loading
        if (window.gaLoaded) return;
        window.gaLoaded = true;

        // Initialize gtag first (so it exists even if script fails)
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;

        // Load gtag.js script with error handling
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        script.onerror = function() {
            // Silently fail - likely blocked by ad blocker
            console.log('[Analytics] GA4 blocked or unavailable');
        };
        script.onload = function() {
            gtag('js', new Date());
            gtag('config', GA_ID);
        };
        document.head.appendChild(script);
    }

    // Create and show cookie modal
    function showBanner() {
        // Don't show if already exists
        if (document.getElementById('cookie-banner')) return;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'cookie-overlay';
        overlay.className = 'cookie-overlay';

        // Create modal
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-modal', 'true');
        banner.setAttribute('aria-labelledby', 'cookie-title');
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <h3 id="cookie-title">Respectăm confidențialitatea ta</h3>
                <p>Folosim cookie-uri doar pentru a înțelege ce funcționează pe site și a-l îmbunătăți.<br>
                   <strong>Nu vindem date, nu facem reclame, nu te urmărim pe alte site-uri.</strong></p>
                <p><a href="/ro/confidentialitate.html">Politica de confidențialitate</a></p>
                <div class="cookie-banner-actions">
                    <button type="button" class="btn btn-accent" id="cookie-accept">Accept</button>
                    <button type="button" class="btn btn-outline" id="cookie-refuse">Refuz</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(banner);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.add('cookie-overlay-visible');
            banner.classList.add('cookie-banner-visible');
        });

        // Handle accept
        document.getElementById('cookie-accept').addEventListener('click', function() {
            setConsentStatus('accepted');
            hideBanner();
            loadGA4();
        });

        // Handle refuse
        document.getElementById('cookie-refuse').addEventListener('click', function() {
            setConsentStatus('refused');
            hideBanner();
        });
    }

    // Hide cookie modal
    function hideBanner() {
        const overlay = document.getElementById('cookie-overlay');
        const banner = document.getElementById('cookie-banner');
        
        if (overlay) {
            overlay.classList.remove('cookie-overlay-visible');
        }
        if (banner) {
            banner.classList.remove('cookie-banner-visible');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        setTimeout(() => {
            if (overlay) overlay.remove();
            if (banner) banner.remove();
        }, 300);
    }

    // Allow user to change consent (callable from console or link)
    window.resetCookieConsent = function() {
        localStorage.removeItem(CONSENT_KEY);
        location.reload();
    };

    // Initialize on DOM ready
    function init() {
        const consent = getConsentStatus();

        if (consent === 'accepted') {
            // User already accepted - load GA4
            loadGA4();
        } else if (consent === 'refused') {
            // User refused - do nothing, GA4 stays blocked
        } else {
            // No decision yet - show banner
            showBanner();
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
