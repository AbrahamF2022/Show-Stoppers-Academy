// Dynamic Effects for Show Stoppers Academy

// Particle System
class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.particleCount = 50;
        this.init();
    }

    init() {
        // Create particles
        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle();
        }
        
        // Start animation
        this.animate();
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random size
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.6 + 0.2;
        
        // Random animation duration
        const duration = Math.random() * 10 + 5;
        particle.style.animation = `float-${Math.floor(Math.random() * 5) + 1} ${duration}s ease-in-out infinite`;
        
        this.container.appendChild(particle);
        this.particles.push({
            element: particle,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: size
        });
    }

    animate() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
            if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;
            
            // Update position
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Magnetic Effect for Buttons
class MagneticEffect {
    constructor(element) {
        this.element = element;
        this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }

    handleMouseMove(e) {
        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        this.element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    }

    handleMouseLeave() {
        this.element.style.transform = 'translate(0, 0)';
    }
}

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.observerOptions);
        this.init();
    }

    init() {
        // Observe elements with data-animate attribute
        document.querySelectorAll('[data-animate]').forEach(el => {
            this.observer.observe(el);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animation = element.dataset.animate;
                const delay = element.dataset.delay || 0;
                
                setTimeout(() => {
                    element.classList.add('animate-' + animation);
                    element.style.opacity = '1';
                }, delay);
            }
        });
    }
}

// Parallax Effect
class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('.parallax');
        this.init();
    }

    init() {
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    handleScroll() {
        const scrolled = window.pageYOffset;
        
        this.elements.forEach(element => {
            const rate = scrolled * -0.5;
            element.style.transform = `translateY(${rate}px)`;
        });
    }
}

// Typing Effect
class TypingEffect {
    constructor(element, text, speed = 100) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.init();
    }

    init() {
        this.element.textContent = '';
        this.typeText();
    }

    typeText() {
        let i = 0;
        const timer = setInterval(() => {
            if (i < this.text.length) {
                this.element.textContent += this.text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
            }
        }, this.speed);
    }
}

// Glitch Effect
class GlitchEffect {
    constructor(element) {
        this.element = element;
        this.init();
    }

    init() {
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every interval
                this.triggerGlitch();
            }
        }, 2000);
    }

    triggerGlitch() {
        const originalText = this.element.textContent;
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        let glitchText = '';
        
        for (let i = 0; i < originalText.length; i++) {
            glitchText += Math.random() < 0.1 ? 
                glitchChars[Math.floor(Math.random() * glitchChars.length)] : 
                originalText[i];
        }
        
        this.element.textContent = glitchText;
        
        setTimeout(() => {
            this.element.textContent = originalText;
        }, 100);
    }
}

// Initialize all effects when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particle system
    const particleContainer = document.getElementById('particles-container');
    if (particleContainer) {
        new ParticleSystem(particleContainer);
    }
    
    // Initialize magnetic effects on buttons
    document.querySelectorAll('a, button').forEach(element => {
        new MagneticEffect(element);
    });
    
    // Initialize scroll animations
    new ScrollAnimations();
    
    // Initialize parallax effect
    new ParallaxEffect();
    
    // Add glitch effect to main title (subtle)
    const mainTitle = document.querySelector('h1');
    if (mainTitle) {
        new GlitchEffect(mainTitle);
    }
    
    // Add hover sound effects (optional)
    document.querySelectorAll('a, button').forEach(element => {
        element.addEventListener('mouseenter', () => {
            // Subtle hover effect
            element.style.filter = 'brightness(1.1)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.filter = 'brightness(1)';
        });
    });
    
    // Add loading animation
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
});

// Performance optimization for mobile
if (window.innerWidth < 768) {
    // Reduce particle count on mobile
    document.addEventListener('DOMContentLoaded', function() {
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            if (index > 20) { // Keep only first 20 particles
                particle.style.display = 'none';
            }
        });
    });
}

// Add smooth scrolling
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add dynamic background colors based on time of day
function updateBackgroundTheme() {
    const hour = new Date().getHours();
    const body = document.body;
    
    if (hour >= 6 && hour < 12) {
        // Morning theme
        body.style.setProperty('--theme-primary', '#f97316');
        body.style.setProperty('--theme-secondary', '#fb923c');
    } else if (hour >= 12 && hour < 18) {
        // Afternoon theme
        body.style.setProperty('--theme-primary', '#ef4444');
        body.style.setProperty('--theme-secondary', '#f97316');
    } else {
        // Evening theme
        body.style.setProperty('--theme-primary', '#dc2626');
        body.style.setProperty('--theme-secondary', '#ef4444');
    }
}

// Update theme on load and every hour
updateBackgroundTheme();
setInterval(updateBackgroundTheme, 3600000); // Update every hour
