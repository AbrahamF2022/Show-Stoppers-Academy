// Layout Components for Show-Stoppers Academy

import { NavItem, SocialLink } from '@/types';

export class LayoutManager {
  private static instance: LayoutManager;
  private currentPage: string = '';
  private navigationItems: NavItem[] = [];
  private socialLinks: SocialLink[] = [];

  constructor() {
    this.initializeNavigation();
    this.initializeSocialLinks();
  }

  public static getInstance(): LayoutManager {
    if (!LayoutManager.instance) {
      LayoutManager.instance = new LayoutManager();
    }
    return LayoutManager.instance;
  }

  private initializeNavigation(): void {
    this.navigationItems = [
      { label: 'Home', href: '/index.html', icon: 'home' },
      { label: 'About', href: '/about.html', icon: 'info-circle' },
      { 
        label: 'Programs', 
        href: '/index.html#programs', 
        icon: 'graduation-cap',
        children: [
          { label: 'Rise & Grind Development', href: '/registration.html' },
          { label: 'Holiday Showcase', href: '/portfolio-overview.html' },
          { label: 'Educational Workshops', href: '/faq.html' }
        ]
      },
      { label: 'Gallery', href: '/portfolio-item.html', icon: 'images' },
      { label: 'Contact', href: '/contact.html', icon: 'envelope' },
      { label: 'Donate', href: '/pricing.html', icon: 'heart', className: 'btn-primary' }
    ];
  }

  private initializeSocialLinks(): void {
    this.socialLinks = [
      { platform: 'facebook', url: 'https://facebook.com/showstoppersacademy', icon: 'fab fa-facebook-f' },
      { platform: 'instagram', url: 'https://instagram.com/showstoppersacademy', icon: 'fab fa-instagram' },
      { platform: 'twitter', url: 'https://twitter.com/showstoppersacademy', icon: 'fab fa-twitter' },
      { platform: 'youtube', url: 'https://youtube.com/showstoppersacademy', icon: 'fab fa-youtube' }
    ];
  }

  public setCurrentPage(page: string): void {
    this.currentPage = page;
  }

  public getCurrentPage(): string {
    return this.currentPage;
  }

  public getNavigationItems(): NavItem[] {
    return this.navigationItems;
  }

  public getSocialLinks(): SocialLink[] {
    return this.socialLinks;
  }

  public generateNavigationHTML(): string {
    const currentPage = this.getCurrentPage();
    
    const desktopNav = this.navigationItems.map(item => {
      if (item.children) {
        return this.generateDropdownNav(item, currentPage);
      } else {
        const isActive = item.href.includes(currentPage) || 
                        (currentPage === 'index' && item.href === '/index.html');
        const activeClass = isActive ? 'text-primary-600' : 'text-gray-900 hover:text-primary-600';
        const buttonClass = item.className || '';
        
        return `
          <li class="nav-item">
            <a href="${item.href}" class="nav-link ${activeClass} px-3 py-2 text-sm font-medium transition-colors ${buttonClass}">
              ${item.label}
            </a>
          </li>
        `;
      }
    }).join('');

    return `
      <!-- Desktop Navigation -->
      <div class="hidden md:block">
        <div class="ml-10 flex items-baseline space-x-8">
          ${desktopNav}
        </div>
      </div>
    `;
  }

  private generateDropdownNav(item: NavItem, currentPage: string): string {
    const isActive = item.href.includes(currentPage);
    const activeClass = isActive ? 'text-primary-600' : 'text-gray-900 hover:text-primary-600';
    
    const dropdownItems = item.children!.map(child => 
      `<a href="${child.href}" class="dropdown-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors">${child.label}</a>`
    ).join('');

    return `
      <div class="relative" x-data="{ dropdownOpen: false }">
        <button @click="dropdownOpen = !dropdownOpen" 
                class="nav-link ${activeClass} px-3 py-2 text-sm font-medium transition-colors flex items-center">
          ${item.label}
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div x-show="dropdownOpen" 
             @click.away="dropdownOpen = false"
             x-transition
             class="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          ${dropdownItems}
        </div>
      </div>
    `;
  }

  public generateMobileNavigationHTML(): string {
    const currentPage = this.getCurrentPage();
    
    const mobileNav = this.navigationItems.map(item => {
      if (item.children) {
        return item.children.map(child => 
          `<a href="${child.href}" class="block px-3 py-2 text-gray-900 hover:text-primary-600">${child.label}</a>`
        ).join('');
      } else {
        const isActive = item.href.includes(currentPage) || 
                        (currentPage === 'index' && item.href === '/index.html');
        const activeClass = isActive ? 'text-primary-600' : 'text-gray-900 hover:text-primary-600';
        const buttonClass = item.className ? 'bg-primary-600 text-white rounded-lg mx-3 text-center' : '';
        
        return `
          <a href="${item.href}" class="block px-3 py-2 ${activeClass} ${buttonClass}">
            ${item.label}
          </a>
        `;
      }
    }).join('');

    return `
      <!-- Mobile Navigation -->
      <div x-show="mobileMenuOpen" x-transition class="md:hidden bg-white shadow-lg">
        <div class="px-2 pt-2 pb-3 space-y-1">
          ${mobileNav}
        </div>
      </div>
    `;
  }

  public generateFooterHTML(): string {
    const socialLinksHTML = this.socialLinks.map(link => 
      `<a href="${link.url}" class="text-gray-400 hover:text-white transition-colors" aria-label="${link.platform}">
        <i class="${link.icon} fa-lg"></i>
      </a>`
    ).join('');

    return `
      <footer class="bg-gray-900 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Brand -->
            <div>
              <div class="flex items-center space-x-2 mb-4">
                <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span class="font-display font-bold text-xl">Show-Stoppers Academy</span>
              </div>
              <p class="text-gray-400 mb-4">Empowering youth for a brighter tomorrow through sports and education.</p>
              <div class="flex space-x-4">
                ${socialLinksHTML}
              </div>
            </div>
            
            <!-- Quick Links -->
            <div>
              <h3 class="font-semibold text-lg mb-4">Quick Links</h3>
              <ul class="space-y-2">
                <li><a href="/index.html" class="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="/about.html" class="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="/index.html#programs" class="text-gray-400 hover:text-white transition-colors">Programs</a></li>
                <li><a href="/portfolio-item.html" class="text-gray-400 hover:text-white transition-colors">Gallery</a></li>
                <li><a href="/contact.html" class="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <!-- Programs -->
            <div>
              <h3 class="font-semibold text-lg mb-4">Programs</h3>
              <ul class="space-y-2">
                <li><a href="/registration.html" class="text-gray-400 hover:text-white transition-colors">Rise & Grind Development</a></li>
                <li><a href="/portfolio-overview.html" class="text-gray-400 hover:text-white transition-colors">Holiday Showcase</a></li>
                <li><a href="/faq.html" class="text-gray-400 hover:text-white transition-colors">Educational Workshops</a></li>
                <li><a href="/faq.html" class="text-gray-400 hover:text-white transition-colors">Community Events</a></li>
              </ul>
            </div>
            
            <!-- Get Involved -->
            <div>
              <h3 class="font-semibold text-lg mb-4">Get Involved</h3>
              <ul class="space-y-2">
                <li><a href="/pricing.html" class="text-gray-400 hover:text-white transition-colors">Donate</a></li>
                <li><a href="/contact.html" class="text-gray-400 hover:text-white transition-colors">Volunteer</a></li>
                <li><a href="/contact.html" class="text-gray-400 hover:text-white transition-colors">Sponsor</a></li>
                <li><a href="/registration.html" class="text-gray-400 hover:text-white transition-colors">Register</a></li>
              </ul>
            </div>
          </div>
          
          <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Show-Stoppers Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;
  }

  public generateScrollToTopHTML(): string {
    return `
      <!-- Scroll to Top Button -->
      <button id="scroll-to-top" class="fixed bottom-8 right-8 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 opacity-0 invisible">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
        </svg>
      </button>
    `;
  }
}

// Hero Section Builder
export class HeroSectionBuilder {
  public static generateHero(
    title: string,
    subtitle: string,
    backgroundClass: string = 'hero-bg',
    showScrollIndicator: boolean = true
  ): string {
    const scrollIndicator = showScrollIndicator ? `
      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
    ` : '';

    return `
      <section class="${backgroundClass} min-h-[60vh] flex items-center relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 class="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-6" data-animate="fade" data-delay="200">
            ${title}
          </h1>
          <p class="text-xl lg:text-2xl text-gray-100 max-w-3xl mx-auto" data-animate="fade" data-delay="300">
            ${subtitle}
          </p>
        </div>
        ${scrollIndicator}
      </section>
    `;
  }
}

// Section Builder
export class SectionBuilder {
  public static generateSection(
    content: string,
    className: string = 'py-20',
    backgroundClass: string = 'bg-white'
  ): string {
    return `
      <section class="${className} ${backgroundClass}">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          ${content}
        </div>
      </section>
    `;
  }

  public static generateSectionHeader(
    title: string,
    subtitle: string,
    className: string = 'text-center mb-16'
  ): string {
    return `
      <div class="${className}" data-animate="fade" data-delay="200">
        <h2 class="font-display font-bold text-3xl lg:text-4xl text-gray-900 mb-4">${title}</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">${subtitle}</p>
      </div>
    `;
  }
}
