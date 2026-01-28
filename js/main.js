/**
 * DoroLabs - Main JavaScript
 * Minimal, functional interactions
 */

(function() {
    'use strict';

    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
            }
        });
    }

    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    if (contactForm && formSuccess) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            try {
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Hide form, show success message
                    contactForm.style.display = 'none';
                    formSuccess.style.display = 'block';
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                // Show error message
                alert('There was a problem sending your message. Please try emailing us directly at contact@dorolabs.eu');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll class to header
    const header = document.querySelector('.header');
    if (header) {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        }, { passive: true });
    }

    // Intersection Observer for animations (optional enhancement)
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements that should animate in
        document.querySelectorAll('.value-card, .step, .faq-item, .belief-card').forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });

        // Observe homepage fade-in sections (old)
        document.querySelectorAll('.fade-in-section').forEach(el => {
            observer.observe(el);
        });

        // Observe homepage reveal sections (new dark theme)
        document.querySelectorAll('.reveal-section').forEach(el => {
            observer.observe(el);
        });

        // Observe service page sections (content visible by default, animation is enhancement)
        document.querySelectorAll('.sp-section').forEach(el => {
            el.classList.add('animate-ready');
            observer.observe(el);
        });
    }

    // Number counter animation for stats
    const statValues = document.querySelectorAll('.stat-value[data-count], .proof-number[data-count], .hp-stat-num[data-count]');
    if (statValues.length > 0 && 'IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count, 10);
                    const duration = 1500;
                    const startTime = performance.now();
                    
                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const easeOut = 1 - Math.pow(1 - progress, 3);
                        const current = Math.floor(easeOut * target);
                        el.textContent = current;
                        
                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            el.textContent = target;
                        }
                    }
                    
                    requestAnimationFrame(updateCounter);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        statValues.forEach(el => counterObserver.observe(el));
    }

    // Package accordion toggle functionality
    const packageToggles = document.querySelectorAll('.hp-package-toggle');
    packageToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const details = this.nextElementSibling;
            
            if (details && details.classList.contains('hp-package-details')) {
                this.setAttribute('aria-expanded', !isExpanded);
                details.classList.toggle('open', !isExpanded);
            }
        });
    });

})();
