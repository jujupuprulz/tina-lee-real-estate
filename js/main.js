/**
 * Tina Lee Real Estate - Main JavaScript
 * Handles common functionality across the website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference or use user's system preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }

    // Header scroll effect
    const header = document.querySelector('header');
    const scrollThreshold = 50;

    function handleScroll() {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Initial check for scroll position
    handleScroll();

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);

    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Dark mode toggle
    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');

            // Save preference to localStorage
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

            // Update icon
            updateThemeIcon(isDarkMode);
        });
    }

    function updateThemeIcon(isDarkMode) {
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            if (isDarkMode) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Create menu overlay element
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';
    document.body.appendChild(menuOverlay);

    // Add a close button to the mobile menu
    if (navLinks) {
        const closeButton = document.createElement('button');
        closeButton.className = 'mobile-menu-close';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.setAttribute('aria-label', 'Close menu');
        navLinks.prepend(closeButton);

        closeButton.addEventListener('click', function() {
            navLinks.classList.remove('show');
            menuOverlay.classList.remove('show');
            document.body.classList.remove('menu-open');

            // Update the menu button icon
            const icon = mobileMenuBtn.querySelector('i');
            if (icon.classList.contains('fa-times')) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    if (mobileMenuBtn) {
        // Function to toggle mobile menu
        function toggleMobileMenu() {
            navLinks.classList.toggle('show');
            menuOverlay.classList.toggle('show');
            document.body.classList.toggle('menu-open');

            // Toggle icon between bars and X
            const icon = mobileMenuBtn.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }

        // Toggle menu when button is clicked
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        // Close menu when overlay is clicked
        menuOverlay.addEventListener('click', toggleMobileMenu);

        // Close menu when a nav link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                toggleMobileMenu();
            });
        });

        // Close menu when ESC key is pressed
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('show')) {
                toggleMobileMenu();
            }
        });
    }

    // Testimonial slider
    const testimonialSlider = document.getElementById('testimonial-slider');
    const prevTestimonialBtn = document.getElementById('prev-testimonial');
    const nextTestimonialBtn = document.getElementById('next-testimonial');

    if (testimonialSlider && prevTestimonialBtn && nextTestimonialBtn) {
        const testimonials = testimonialSlider.querySelectorAll('.testimonial');
        let currentTestimonial = 0;

        // Hide all testimonials except the first one
        testimonials.forEach((testimonial, index) => {
            if (index !== 0) {
                testimonial.style.display = 'none';
            }
        });

        // Function to show a specific testimonial
        function showTestimonial(index) {
            testimonials.forEach(testimonial => {
                testimonial.style.display = 'none';
            });

            testimonials[index].style.display = 'block';
            testimonials[index].style.opacity = 0;

            // Fade in animation
            let opacity = 0;
            const fadeIn = setInterval(() => {
                if (opacity >= 1) {
                    clearInterval(fadeIn);
                }
                testimonials[index].style.opacity = opacity;
                opacity += 0.1;
            }, 30);
        }

        // Event listeners for testimonial navigation
        prevTestimonialBtn.addEventListener('click', function() {
            currentTestimonial--;
            if (currentTestimonial < 0) {
                currentTestimonial = testimonials.length - 1;
            }
            showTestimonial(currentTestimonial);
        });

        nextTestimonialBtn.addEventListener('click', function() {
            currentTestimonial++;
            if (currentTestimonial >= testimonials.length) {
                currentTestimonial = 0;
            }
            showTestimonial(currentTestimonial);
        });

        // Auto-rotate testimonials every 5 seconds
        setInterval(() => {
            currentTestimonial++;
            if (currentTestimonial >= testimonials.length) {
                currentTestimonial = 0;
            }
            showTestimonial(currentTestimonial);
        }, 5000);
    }

    // Newsletter form submission
    const newsletterForm = document.getElementById('newsletter-form');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (email) {
                // In a real implementation, you would send this to a server
                // For this demo, we'll just show a success message

                alert('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            }
        });
    }

    // Property search form
    const propertySearchForm = document.getElementById('property-search');

    if (propertySearchForm) {
        propertySearchForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const propertyType = document.getElementById('property-type').value;
            const location = document.getElementById('location').value;
            const priceRange = document.getElementById('price-range').value;

            // In a real implementation, you would use these values to filter properties
            // For this demo, we'll redirect to the properties page with query parameters

            window.location.href = `properties.html?type=${propertyType}&location=${location}&price=${priceRange}`;
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            e.preventDefault();

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animate elements on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');

        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementPosition < windowHeight - 100) {
                element.classList.add('animated');
            }
        });
    };

    // Add animate-on-scroll class to elements that should animate
    document.querySelectorAll('.property-card, .service-card, .about-image, .about-text').forEach(element => {
        element.classList.add('animate-on-scroll');
    });

    // Initial check for elements in view
    animateOnScroll();

    // Check for elements on scroll
    window.addEventListener('scroll', animateOnScroll);
});
