document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // PERFORMANCE: device check + throttled scroll dispatcher
    // ==========================================================================
    // Disable mouse-driven / GPU-heavy effects on touch & small screens.
    const isLite = window.matchMedia('(max-width: 900px)').matches
        || window.matchMedia('(hover: none)').matches
        || ('ontouchstart' in window);

    // Run all scroll handlers in ONE rAF-batched listener to avoid layout thrash / jitter.
    const scrollHandlers = [];
    const onScroll = (fn) => scrollHandlers.push(fn);
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
            for (const fn of scrollHandlers) fn();
            scrollTicking = false;
        });
    }, { passive: true });

    // ==========================================================================
    // MOBILE NAVIGATION TOGGLE
    // ==========================================================================
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Toggle hamburger icon animation
            const icon = mobileToggle.querySelector('svg');
            if (navMenu.classList.contains('active')) {
                icon.innerHTML = '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
            } else {
                icon.innerHTML = '<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
            }
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('svg');
                icon.innerHTML = '<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
            });
        });
    }

    // ==========================================================================
    // NAVBAR SCROLL EFFECT
    // ==========================================================================
    const navbar = document.getElementById('navbar');
    onScroll(() => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ==========================================================================
    // SCROLL SPY (ACTIVE NAVIGATION LINK)
    // ==========================================================================
    const sections = document.querySelectorAll('section[id]');
    
    function scrollSpy() {
        const scrollY = window.scrollY;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href*=${sectionId}]`);

            if (correspondingLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    correspondingLink.classList.add('active');
                } else {
                    correspondingLink.classList.remove('active');
                }
            }
        });
    }
    onScroll(scrollSpy);

    // ==========================================================================
    // INTERSECTION OBSERVER FOR FADE-IN
    // ==========================================================================
    const fadeElements = document.querySelectorAll('.fade-in');
    const fadeObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, fadeObserverOptions);

    fadeElements.forEach(el => fadeObserver.observe(el));

    // ==========================================================================
    // STAGGERED TIMELINE ITEM OBSERVER
    // ==========================================================================
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const idx = Array.from(timelineItems).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('appear');
                }, idx * 150);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    timelineItems.forEach(item => timelineObserver.observe(item));

    // ==========================================================================
    // SKILLS ANIMATION (CASCADING)
    // ==========================================================================
    const skillsSection = document.getElementById('skills');
    const skillProgresses = document.querySelectorAll('.skill-progress');

    if (skillsSection && skillProgresses.length > 0) {
        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    skillProgresses.forEach((bar, index) => {
                        const targetPercent = bar.getAttribute('data-percent');
                        setTimeout(() => {
                            bar.style.width = `${targetPercent}%`;
                        }, index * 200);
                    });
                    skillsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        skillsObserver.observe(skillsSection);
    }

    // ==========================================================================
    // CV MODAL VIEWER
    // ==========================================================================
    const openCvBtn = document.getElementById('openCvBtn');
    const cvPreviewBox = document.getElementById('cvPreviewBox');
    const cvModal = document.getElementById('cvModal');
    const cvModalClose = document.getElementById('cvModalClose');

    function openModal() {
        if (cvModal) {
            cvModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (cvModal) {
            cvModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    if (openCvBtn) openCvBtn.addEventListener('click', openModal);
    if (cvPreviewBox) cvPreviewBox.addEventListener('click', openModal);
    if (cvModalClose) cvModalClose.addEventListener('click', closeModal);

    if (cvModal) {
        cvModal.addEventListener('click', (e) => {
            if (e.target === cvModal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // ==========================================================================
    // FORM SUBMISSION (MOCK)
    // ==========================================================================
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            if (!nameInput.value || !emailInput.value || !messageInput.value) {
                alert('Please fill in all required fields.');
                return;
            }

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending Message...';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.innerHTML = 'Message Sent Successfully!';
                submitBtn.style.backgroundColor = '#2e7d32';
                submitBtn.style.borderColor = '#2e7d32';
                submitBtn.style.color = '#ffffff';

                contactForm.reset();

                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.borderColor = '';
                    submitBtn.style.color = '';
                }, 3000);
            }, 1500);
        });
    }

    // ==========================================================================
    // HERO IMAGE PARALLAX TILT EFFECT
    // ==========================================================================
    const heroCard = document.querySelector('.hero-image-container');
    if (heroCard && !isLite) {
        heroCard.addEventListener('mousemove', (e) => {
            const rect = heroCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            heroCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        heroCard.addEventListener('mouseleave', () => {
            heroCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    }

    // ==========================================================================
    // SPOTLIGHT GLOW EFFECT FOR PRACTICE CARDS
    // ==========================================================================
    if (!isLite) {
        document.querySelectorAll('.practice-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--x', `${e.clientX - rect.left}px`);
                card.style.setProperty('--y', `${e.clientY - rect.top}px`);
            });
        });
    }

    // ==========================================================================
    // TIMELINE PROGRESS LINE DRAWING ANIMATION
    // ==========================================================================
    const timeline = document.querySelector('.timeline');
    const timelineProgress = document.getElementById('timelineProgress');
    if (timeline && timelineProgress) {
        onScroll(() => {
            const rect = timeline.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            if (rect.top < viewHeight && rect.bottom > 0) {
                const scrolled = viewHeight - rect.top;
                const percentage = Math.min(Math.max(scrolled / rect.height, 0), 1) * 100;
                timelineProgress.style.height = `${percentage}%`;
            }
        });
    }

    // ==========================================================================
    // MAGNETIC BUTTON HOVER EFFECT
    // ==========================================================================
    if (!isLite) {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0px, 0px)';
            });
        });
    }

    // ==========================================================================
    // CUSTOM CURSOR GLOW TRACKER
    // ==========================================================================
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow && !isLite) {
        let cursorX = 0, cursorY = 0;
        let glowX = 0, glowY = 0;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
        });

        // Smooth follow with requestAnimationFrame
        function updateCursorGlow() {
            glowX += (cursorX - glowX) * 0.08;
            glowY += (cursorY - glowY) * 0.08;
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
            requestAnimationFrame(updateCursorGlow);
        }
        updateCursorGlow();
    }

    // ==========================================================================
    // TYPEWRITER EFFECT FOR HERO TITLE
    // ==========================================================================
    const heroTypewriter = document.getElementById('heroTypewriter');
    if (heroTypewriter) {
        const fullText = heroTypewriter.textContent;
        heroTypewriter.textContent = '';
        let charIndex = 0;

        function typeNextChar() {
            if (charIndex < fullText.length) {
                heroTypewriter.textContent += fullText[charIndex];
                charIndex++;
                setTimeout(typeNextChar, 55 + Math.random() * 50);
            } else {
                setTimeout(() => heroTypewriter.classList.add('done'), 2500);
            }
        }
        setTimeout(typeNextChar, 900);
    }

    // ==========================================================================
    // RIPPLE EFFECT ON BUTTON CLICK
    // ==========================================================================
    document.querySelectorAll('.btn').forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(197, 168, 128, 0.35);
                transform: scale(0);
                animation: rippleExpand 0.6s linear;
                pointer-events: none;
            `;
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 2;
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Inject ripple keyframes
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes rippleExpand {
            to { transform: scale(1); opacity: 0; }
        }
    `;
    document.head.appendChild(rippleStyle);

    // ==========================================================================
    // TOP SCROLL PROGRESS BAR
    // ==========================================================================
    const scrollProgressBar = document.getElementById('scrollProgressBar');
    if (scrollProgressBar) {
        const updateScrollProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            scrollProgressBar.style.width = `${percent}%`;
        };
        onScroll(updateScrollProgress);
        updateScrollProgress();
    }

    // ==========================================================================
    // GENERIC REVEAL-ON-SCROLL (cards) WITH STAGGER
    // ==========================================================================
    const revealCandidates = document.querySelectorAll(
        '.practice-card, .competency-card, .contact-method-item, .lang-badge'
    );
    revealCandidates.forEach(el => el.classList.add('reveal-up'));

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Stagger items sharing the same parent
                const siblings = Array.from(entry.target.parentElement.children)
                    .filter(c => c.classList.contains('reveal-up'));
                const idx = siblings.indexOf(entry.target);
                setTimeout(() => entry.target.classList.add('revealed'), Math.max(idx, 0) * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealCandidates.forEach(el => revealObserver.observe(el));

    // ==========================================================================
    // SUBTLE 3D TILT FOR GLASS CARDS (futuristic parallax)
    // ==========================================================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && !isLite) {
        document.querySelectorAll('.competency-card, .timeline-panel').forEach(card => {
            card.style.transformStyle = 'preserve-3d';
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ==========================================================================
    // SKILL PERCENTAGE COUNT-UP (synced with bar fill)
    // ==========================================================================
    const skillItems = document.querySelectorAll('.skill-item');
    if (skillItems.length > 0) {
        const countObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const item = entry.target;
                const bar = item.querySelector('.skill-progress');
                const label = item.querySelector('.skill-percent');
                if (bar && label) {
                    const target = parseInt(bar.getAttribute('data-percent') || label.textContent, 10) || 0;
                    const duration = 1500;
                    let startTime = null;
                    const step = (ts) => {
                        if (startTime === null) startTime = ts;
                        const progress = Math.min((ts - startTime) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        label.textContent = `${Math.round(eased * target)}%`;
                        if (progress < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                }
                observer.unobserve(item);
            });
        }, { threshold: 0.3 });
        skillItems.forEach(item => countObserver.observe(item));
    }

    // ==========================================================================
    // PARTICLE CONSTELLATION CANVAS
    // ==========================================================================
    const canvas = document.getElementById('particleCanvas');
    if (canvas && !isLite) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null };
        const PARTICLE_COUNT = 55;
        const CONNECT_DISTANCE = 140;
        const MOUSE_RADIUS = 200;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.35;
                this.vy = (Math.random() - 0.5) * 0.35;
                this.radius = Math.random() * 1.5 + 0.5;
                this.baseAlpha = Math.random() * 0.25 + 0.08;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Mouse attraction
                if (mouse.x !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MOUSE_RADIUS) {
                        this.x += dx * 0.006;
                        this.y += dy * 0.006;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(197, 168, 128, ${this.baseAlpha})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }

        function connectParticles() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECT_DISTANCE) {
                        const alpha = (1 - dist / CONNECT_DISTANCE) * 0.1;
                        ctx.strokeStyle = `rgba(197, 168, 128, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Connect mouse to nearby particles
            if (mouse.x !== null) {
                particles.forEach(p => {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MOUSE_RADIUS) {
                        const alpha = (1 - dist / MOUSE_RADIUS) * 0.2;
                        ctx.strokeStyle = `rgba(197, 168, 128, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(mouse.x, mouse.y);
                        ctx.lineTo(p.x, p.y);
                        ctx.stroke();
                    }
                });
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connectParticles();
            requestAnimationFrame(animateParticles);
        }

        animateParticles();
    }
});
