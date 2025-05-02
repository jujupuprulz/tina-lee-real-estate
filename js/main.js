/**
 * Tina Lee Real Estate - Main JavaScript
 * Handles common functionality across the website
 */

document.addEventListener('DOMContentLoaded', function() {

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



    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Create menu overlay element
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';
    document.body.appendChild(menuOverlay);



    if (mobileMenuBtn) {
        // Function to toggle mobile menu
        function toggleMobileMenu() {
            navLinks.classList.toggle('show');
            menuOverlay.classList.toggle('show');
            document.body.classList.toggle('menu-open');
        }

        // Function to close mobile menu
        function closeMenu() {
            navLinks.classList.remove('show');
            menuOverlay.classList.remove('show');
            document.body.classList.remove('menu-open');
        }

        // Toggle menu when button is clicked
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        // Close menu when overlay is clicked
        menuOverlay.addEventListener('click', closeMenu);

        // Close menu when a nav link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu when ESC key is pressed
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('show')) {
                closeMenu();
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

        // Function to navigate to previous testimonial
        function showPrevTestimonial() {
            currentTestimonial--;
            if (currentTestimonial < 0) {
                currentTestimonial = testimonials.length - 1;
            }
            showTestimonial(currentTestimonial);
        }

        // Function to navigate to next testimonial
        function showNextTestimonial() {
            currentTestimonial++;
            if (currentTestimonial >= testimonials.length) {
                currentTestimonial = 0;
            }
            showTestimonial(currentTestimonial);
        }

        // Event listeners for testimonial navigation
        prevTestimonialBtn.addEventListener('click', showPrevTestimonial);
        nextTestimonialBtn.addEventListener('click', showNextTestimonial);

        // Add touch events for mobile
        prevTestimonialBtn.addEventListener('touchend', function(e) {
            e.preventDefault(); // Prevent default touch behavior
            showPrevTestimonial();
        });

        nextTestimonialBtn.addEventListener('touchend', function(e) {
            e.preventDefault(); // Prevent default touch behavior
            showNextTestimonial();
        });

        // Add swipe functionality for mobile
        const testimonialSlider = document.getElementById('testimonial-slider');
        let touchStartX = 0;
        let touchEndX = 0;

        testimonialSlider.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        testimonialSlider.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);

        function handleSwipe() {
            const swipeThreshold = 50; // Minimum distance for a swipe
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left - show next
                showNextTestimonial();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right - show previous
                showPrevTestimonial();
            }
        }

        // Auto-rotate testimonials every 7 seconds (increased from 5 for better user experience)
        let autoRotateInterval = setInterval(() => {
            showNextTestimonial();
        }, 7000);

        // Pause auto-rotation when user interacts with testimonials
        [prevTestimonialBtn, nextTestimonialBtn, testimonialSlider].forEach(element => {
            element.addEventListener('mouseenter', () => {
                clearInterval(autoRotateInterval);
            });

            element.addEventListener('mouseleave', () => {
                autoRotateInterval = setInterval(() => {
                    showNextTestimonial();
                }, 7000);
            });

            element.addEventListener('touchstart', () => {
                clearInterval(autoRotateInterval);
            }, { passive: true });
        });
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
