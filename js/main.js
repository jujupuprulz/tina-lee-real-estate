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

    // Testimonial slider with groups
    const testimonialSlider = document.getElementById('testimonial-slider');
    const prevTestimonialBtn = document.getElementById('prev-testimonial');
    const nextTestimonialBtn = document.getElementById('next-testimonial');
    const indicators = document.querySelectorAll('.indicator');

    if (testimonialSlider && prevTestimonialBtn && nextTestimonialBtn) {
        const testimonialGroups = testimonialSlider.querySelectorAll('.testimonial-group');
        let currentGroup = 0;
        const totalGroups = testimonialGroups.length;

        // Function to show a specific testimonial group with smooth transition
        function showTestimonialGroup(index) {
            // Get the current active group
            const activeGroup = testimonialSlider.querySelector('.testimonial-group.active');

            // If there's an active group, prepare it for transition out
            if (activeGroup) {
                // Set the exit direction based on navigation direction
                const exitDirection = index > parseInt(activeGroup.dataset.group) ? -20 : 20;

                // Start transition out
                activeGroup.style.opacity = '0';
                activeGroup.style.transform = `translateX(${exitDirection}px)`;

                // After transition completes, remove active class
                setTimeout(() => {
                    activeGroup.classList.remove('active');
                }, 300);
            }

            // Update indicators immediately
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });

            // Prepare the new group for entrance
            const newGroup = testimonialGroups[index];

            // Set initial position for entrance animation
            const entranceDirection = activeGroup && index > parseInt(activeGroup.dataset.group) ? 20 : -20;
            newGroup.style.transform = `translateX(${entranceDirection}px)`;
            newGroup.style.opacity = '0';

            // Add active class to make it visible
            setTimeout(() => {
                newGroup.classList.add('active');

                // Trigger animation to final position
                setTimeout(() => {
                    newGroup.style.opacity = '1';
                    newGroup.style.transform = 'translateX(0)';
                }, 50);
            }, 300);
        }

        // Function to navigate to previous testimonial group
        function showPrevGroup() {
            currentGroup--;
            if (currentGroup < 0) {
                currentGroup = totalGroups - 1;
            }
            showTestimonialGroup(currentGroup);
        }

        // Function to navigate to next testimonial group
        function showNextGroup() {
            currentGroup++;
            if (currentGroup >= totalGroups) {
                currentGroup = 0;
            }
            showTestimonialGroup(currentGroup);
        }

        // Event listeners for testimonial navigation
        prevTestimonialBtn.addEventListener('click', showPrevGroup);
        nextTestimonialBtn.addEventListener('click', showNextGroup);

        // Add touch events for mobile
        prevTestimonialBtn.addEventListener('touchend', function(e) {
            e.preventDefault(); // Prevent default touch behavior
            showPrevGroup();
        });

        nextTestimonialBtn.addEventListener('touchend', function(e) {
            e.preventDefault(); // Prevent default touch behavior
            showNextGroup();
        });

        // Add indicator click events
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentGroup = index;
                showTestimonialGroup(currentGroup);
            });
        });

        // Add swipe functionality for mobile
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
                showNextGroup();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right - show previous
                showPrevGroup();
            }
        }

        // Auto-rotate testimonials every 5 seconds (faster for better auto-scroll effect)
        let autoRotateInterval;

        function startAutoRotation() {
            // Clear any existing interval first to prevent multiple intervals
            clearInterval(autoRotateInterval);

            // Set new interval
            autoRotateInterval = setInterval(() => {
                showNextGroup();
            }, 5000);
        }

        // Start auto-rotation immediately
        startAutoRotation();

        // Pause auto-rotation when user interacts with testimonials
        [prevTestimonialBtn, nextTestimonialBtn, testimonialSlider, ...indicators].forEach(element => {
            element.addEventListener('mouseenter', () => {
                clearInterval(autoRotateInterval);
            });

            element.addEventListener('mouseleave', () => {
                startAutoRotation();
            });

            element.addEventListener('touchstart', () => {
                clearInterval(autoRotateInterval);
            }, { passive: true });

            element.addEventListener('touchend', () => {
                // Restart auto-rotation after a short delay
                setTimeout(startAutoRotation, 1000);
            });
        });

        // Restart auto-rotation when user clicks navigation buttons
        prevTestimonialBtn.addEventListener('click', () => {
            clearInterval(autoRotateInterval);
            setTimeout(startAutoRotation, 1000);
        });

        nextTestimonialBtn.addEventListener('click', () => {
            clearInterval(autoRotateInterval);
            setTimeout(startAutoRotation, 1000);
        });

        // Ensure auto-rotation continues when the page regains focus
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                startAutoRotation();
            } else {
                clearInterval(autoRotateInterval);
            }
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
