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

        // Load gtag.js script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID);
    }

    // Create and show cookie banner
    function showBanner() {
        // Don't show if already exists
        if (document.getElementById('cookie-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <p>Folosim cookie-uri pentru a analiza traficul site-ului și a îmbunătăți experiența ta. 
                   <a href="/ro/confidentialitate.html">Politica de confidențialitate</a></p>
                <div class="cookie-banner-actions">
                    <button type="button" class="btn btn-primary" id="cookie-accept">Accept</button>
                    <button type="button" class="btn btn-outline" id="cookie-refuse">Refuz</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Trigger animation
        requestAnimationFrame(() => {
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

    // Hide cookie banner
    function hideBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.classList.remove('cookie-banner-visible');
            setTimeout(() => banner.remove(), 300);
        }
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
