/**
 * Initializes the functionalities for the resume website
 * once the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {

    /**
     * Updates the copyright year in the footer.
     */
    function initCopyrightYear() {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        } else {
            console.warn('Copyright year span (#current-year) not found.');
        }
    }

    /**
     * Initializes a staggered fade-in animation for sections on scroll.
     */
    function initScrollReveal() {
        const sections = document.querySelectorAll('.resume-section');
        if (sections.length === 0) {
            console.warn('No sections with class ".resume-section" found for scroll reveal.');
            return; // No sections to observe
        }

        const observerOptions = {
            root: null, // relative to the viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger when 10% of the element is visible
        };

        const observerCallback = (entries, observer) => {
            let delayCounter = 0; // Use a counter for staggered delay within the visible batch
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (!entry.target.classList.contains('is-visible')) {
                         // Apply delay only when becoming visible for the first time (or again)
                        entry.target.style.transitionDelay = `${delayCounter * 0.1}s`;
                        entry.target.classList.add('is-visible');
                        delayCounter++;
                    }
                    // Optional: Unobserve after animation if it should only run once
                    // observer.unobserve(entry.target);
                }
                // Optional: Logic to remove class if you want fade-out on scroll up
                // else {
                //     if (entry.target.classList.contains('is-visible')) {
                //         entry.target.classList.remove('is-visible');
                //         entry.target.style.transitionDelay = '0s'; // Reset delay immediately
                //     }
                // }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }


    /**
     * Handles the contact form submission using Fetch API (AJAX).
     */
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) {
            console.warn('Contact form (#contact-form) not found.');
            return;
        }

        const statusElement = document.getElementById('form-status');
        if (!statusElement) {
             console.error('Form status element (#form-status) not found. Cannot display messages.');
             return;
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default page reload

            const formData = new FormData(form);
            const submitButton = form.querySelector('.submit-button');
            const originalButtonText = submitButton.textContent;

            // Provide User Feedback
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            statusElement.textContent = ''; // Clear previous status
            statusElement.className = 'is-visible'; // Make status visible (removes success/error classes)

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Important for Formspree
                    }
                });

                statusElement.classList.remove('success', 'error'); // Clear previous status classes

                if (response.ok) {
                    // Success
                    statusElement.textContent = "Message sent successfully!";
                    statusElement.classList.add('success');
                    form.reset(); // Clear the form fields
                    console.log('Form submitted successfully');
                } else {
                    // Server-side Error
                    const responseData = await response.json().catch(() => ({})); // Default if JSON parsing fails
                    statusElement.textContent = responseData.errors ? responseData.errors.map(err => err.message || 'Unknown error').join(', ') : "Oops! Problem submitting the form.";
                    statusElement.classList.add('error');
                    console.error('Form submission error:', responseData, 'Status:', response.status);
                }

            } catch (error) {
                // Network Error
                statusElement.classList.remove('success', 'error');
                statusElement.textContent = "Network error. Please check connection & try again.";
                statusElement.classList.add('error');
                console.error('Network error during form submission:', error);

            } finally {
                // Reset Button
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                // Hide status message after a delay
                setTimeout(() => {
                     if (statusElement.classList.contains('is-visible')) {
                        statusElement.classList.remove('is-visible');
                        setTimeout(() => { statusElement.textContent = ''; }, 500); // Clear text after fade
                     }
                }, 5000); // Start fade out after 5 seconds
            }
        });
    }


    /**
     * Highlights the current navigation link based on scroll position.
     */
    function initActiveNavHighlighting() {
        const sections = document.querySelectorAll('.resume-section[id]');
        const navLinks = document.querySelectorAll('#navbar .nav-list li a');
        const navElement = document.getElementById('navbar'); // Get the navbar element itself

        if (sections.length === 0 || navLinks.length === 0 || !navElement) {
            console.warn('Sections, nav links, or navbar not found for active highlighting.');
            return;
        }

        // Debounce function to limit scroll event firing rate
        function debounce(func, wait = 15, immediate = false) {
            let timeout;
            return function() {
                const context = this, args = arguments;
                const later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        };

        const onScroll = () => {
            const navHeight = navElement.offsetHeight; // Recalculate height in case it changes
            let currentSectionId = '';
            const scrollPosition = window.pageYOffset;

            sections.forEach(section => {
                // Calculate bounds more accurately
                const sectionTop = section.offsetTop - navHeight - 20; // Add a small buffer
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            // Handle reaching the very bottom of the page
            if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 5) {
                 const lastSection = sections[sections.length - 1];
                 if (lastSection) currentSectionId = lastSection.getAttribute('id');
            }
             // Handle being at the very top of the page
            else if (scrollPosition < sections[0].offsetTop - navHeight - 20) {
                currentSectionId = ''; // No section is active if above the first one
            }


            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        };

        // Add debounced scroll listener
        window.addEventListener('scroll', debounce(onScroll, 50)); // Check scroll roughly every 50ms
        // Initial check on load
        onScroll();
    }


    // --- Initialize all functionalities within a try...catch block ---
    try {
        initCopyrightYear();
        initScrollReveal();
        initContactForm();
        initActiveNavHighlighting();

        console.log("Cyberpunk Resume Initialized Successfully.");

    } catch (error) {
        console.error("Error during resume initialization:", error);
    }

}); // End DOMContentLoaded