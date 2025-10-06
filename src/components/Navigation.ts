// Navigation Component for Show-Stoppers Academy

import { NavItem } from '@/types';

export class Navigation {
  private navElement: HTMLElement | null = null;
  private mobileMenuButton: HTMLElement | null = null;
  private mobileMenu: HTMLElement | null = null;
  private isScrolled = false;

  constructor() {
    this.init();
  }

  private init(): void {
    this.navElement = document.getElementById('main-nav');
    this.mobileMenuButton = document.getElementById('mobile-menu-button');
    this.mobileMenu = document.getElementById('mobile-menu');

    if (!this.navElement) return;

    this.setupEventListeners();
    this.updateActiveLink();
  }

  private setupEventListeners(): void {
    // Mobile menu toggle
    this.mobileMenuButton?.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.mobileMenu?.classList.contains('open') && 
          !this.mobileMenu.contains(e.target as Node) && 
          !this.mobileMenuButton?.contains(e.target as Node)) {
        this.closeMobileMenu();
      }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileMenu?.classList.contains('open')) {
        this.closeMobileMenu();
      }
    });

    // Scroll effects
    window.addEventListener('scroll', this.handleScroll.bind(this));

    // Smooth scroll for anchor links
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement;
      
      if (link && link.getAttribute('href') !== '#') {
        e.preventDefault();
        this.smoothScrollTo(link.getAttribute('href')!.substring(1));
        this.closeMobileMenu();
      }
    });

    // Update active link on scroll
    window.addEventListener('scroll', this.updateActiveLink.bind(this));
  }

  private handleScroll(): void {
    const scrollY = window.scrollY;
    
    if (scrollY > 100 && !this.isScrolled) {
      this.navElement?.classList.add('scrolled');
      this.isScrolled = true;
    } else if (scrollY <= 100 && this.isScrolled) {
      this.navElement?.classList.remove('scrolled');
      this.isScrolled = false;
    }
  }

  private toggleMobileMenu(): void {
    this.mobileMenu?.classList.toggle('open');
    this.mobileMenuButton?.classList.toggle('open');
    
    // Update aria-expanded
    const isOpen = this.mobileMenu?.classList.contains('open');
    this.mobileMenuButton?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  private closeMobileMenu(): void {
    this.mobileMenu?.classList.remove('open');
    this.mobileMenuButton?.classList.remove('open');
    this.mobileMenuButton?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  private smoothScrollTo(targetId: string): void {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    const headerHeight = this.navElement?.offsetHeight || 0;
    const targetPosition = targetElement.offsetTop - headerHeight - 20;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  private updateActiveLink(): void {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      const sectionHeight = section.getBoundingClientRect().height;
      
      if (sectionTop <= 100 && sectionTop + sectionHeight > 100) {
        currentSection = section.getAttribute('id') || '';
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${currentSection}` || (href === '#' && currentSection === 'home')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  public destroy(): void {
    // Clean up event listeners
    window.removeEventListener('scroll', this.handleScroll.bind(this));
    window.removeEventListener('scroll', this.updateActiveLink.bind(this));
  }
}
