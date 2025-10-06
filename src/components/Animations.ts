// Animation Components for Show Stoppers Academy

import { AnimationConfig, AnimationType } from '@/types';

export class AnimationController {
  private observer: IntersectionObserver;
  private animatedElements: Set<Element> = new Set();

  constructor() {
    this.setupIntersectionObserver();
    this.init();
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateElement(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );
  }

  private init(): void {
    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach((element) => {
      this.observer.observe(element);
      this.animatedElements.add(element);
    });

    // Initialize staggered animations
    this.initStaggeredAnimations();
  }

  private animateElement(element: Element): void {
    const animationType = element.getAttribute('data-animate') as AnimationType;
    const delay = parseInt(element.getAttribute('data-delay') || '0');
    const duration = parseInt(element.getAttribute('data-duration') || '600');

    // Set initial state
    this.setInitialState(element, animationType);

    // Apply animation with delay
    setTimeout(() => {
      this.applyAnimation(element, animationType, duration);
    }, delay);
  }

  private setInitialState(element: Element, type: AnimationType): void {
    const htmlElement = element as HTMLElement;
    
    switch (type) {
      case 'fade':
        htmlElement.style.opacity = '0';
        break;
      case 'slide':
        htmlElement.style.transform = 'translateY(30px)';
        htmlElement.style.opacity = '0';
        break;
      case 'scale':
        htmlElement.style.transform = 'scale(0.9)';
        htmlElement.style.opacity = '0';
        break;
      case 'bounce':
        htmlElement.style.transform = 'scale(0.3)';
        htmlElement.style.opacity = '0';
        break;
    }

    // Set transition
    htmlElement.style.transition = `all ${600}ms cubic-bezier(0.4, 0, 0.2, 1)`;
  }

  private applyAnimation(element: Element, type: AnimationType, duration: number): void {
    const htmlElement = element as HTMLElement;
    
    htmlElement.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    htmlElement.style.opacity = '1';
    htmlElement.style.transform = 'translateY(0) scale(1)';

    // Add completion class
    htmlElement.classList.add('animated');
  }

  private initStaggeredAnimations(): void {
    const staggeredGroups = document.querySelectorAll('[data-stagger]');
    
    staggeredGroups.forEach((group) => {
      const items = group.querySelectorAll('[data-stagger-item]');
      const staggerDelay = parseInt(group.getAttribute('data-stagger-delay') || '100');
      
      items.forEach((item, index) => {
        const delay = index * staggerDelay;
        item.setAttribute('data-delay', delay.toString());
        this.observer.observe(item);
      });
    });
  }

  // Public methods for programmatic animations
  public animateElementById(id: string, type: AnimationType = 'fade', duration: number = 600): void {
    const element = document.getElementById(id);
    if (element && !this.animatedElements.has(element)) {
      this.animatedElements.add(element);
      this.animateElement(element);
    }
  }

  public animateElementsByClass(className: string, type: AnimationType = 'fade', duration: number = 600): void {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach((element) => {
      if (!this.animatedElements.has(element)) {
        this.animatedElements.add(element);
        this.animateElement(element);
      }
    });
  }

  public resetAnimations(): void {
    this.animatedElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.classList.remove('animated');
      htmlElement.style.opacity = '';
      htmlElement.style.transform = '';
      htmlElement.style.transition = '';
    });
    this.animatedElements.clear();
    
    // Re-observe elements
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach((element) => {
      this.observer.observe(element);
      this.animatedElements.add(element);
    });
  }

  public destroy(): void {
    this.observer.disconnect();
    this.animatedElements.clear();
  }
}

// Counter Animation for Statistics
export class CounterAnimation {
  private counters: Map<HTMLElement, number> = new Map();

  constructor() {
    this.init();
  }

  private init(): void {
    const counterElements = document.querySelectorAll('[data-counter]');
    counterElements.forEach((element) => {
      const target = parseInt(element.getAttribute('data-counter') || '0');
      this.counters.set(element as HTMLElement, target);
    });

    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    this.counters.forEach((_, element) => {
      observer.observe(element);
    });
  }

  private animateCounter(element: HTMLElement): void {
    const target = this.counters.get(element) || 0;
    const duration = 2000; // 2 seconds
    const start = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(target * easeOutCubic);
      
      element.textContent = currentValue.toString();
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toString();
      }
    };

    requestAnimationFrame(updateCounter);
  }
}

// Parallax Scroll Animation
export class ParallaxController {
  private elements: Map<HTMLElement, number> = new Map();

  constructor() {
    this.init();
  }

  private init(): void {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    parallaxElements.forEach((element) => {
      const speed = parseFloat(element.getAttribute('data-parallax') || '0.5');
      this.elements.set(element as HTMLElement, speed);
    });

    if (this.elements.size > 0) {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  private handleScroll(): void {
    const scrollY = window.scrollY;

    this.elements.forEach((speed, element) => {
      const rect = element.getBoundingClientRect();
      const yPos = -(scrollY * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }

  public destroy(): void {
    window.removeEventListener('scroll', this.handleScroll.bind(this));
    this.elements.clear();
  }
}

// Text Reveal Animation
export class TextRevealAnimation {
  private observer: IntersectionObserver;

  constructor() {
    this.setupIntersectionObserver();
    this.init();
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.revealText(entry.target as HTMLElement);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
  }

  private init(): void {
    const textElements = document.querySelectorAll('[data-text-reveal]');
    textElements.forEach((element) => {
      this.setupTextReveal(element as HTMLElement);
      this.observer.observe(element);
    });
  }

  private setupTextReveal(element: HTMLElement): void {
    const text = element.textContent || '';
    const words = text.split(' ');
    
    element.innerHTML = words
      .map((word, index) => `<span class="word" style="opacity: 0; transform: translateY(20px); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); transition-delay: ${index * 0.1}s">${word}</span>`)
      .join(' ');
  }

  private revealText(element: HTMLElement): void {
    const words = element.querySelectorAll('.word');
    words.forEach((word) => {
      (word as HTMLElement).style.opacity = '1';
      (word as HTMLElement).style.transform = 'translateY(0)';
    });
  }

  public destroy(): void {
    this.observer.disconnect();
  }
}
