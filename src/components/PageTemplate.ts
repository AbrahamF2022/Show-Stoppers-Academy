// Page Template System for Show-Stoppers Academy

import { LayoutManager, HeroSectionBuilder, SectionBuilder } from './Layout';
import { GalleryItem, Program, FAQItem } from '@/types';

export class PageTemplate {
  private layoutManager: LayoutManager;
  private pageTitle: string = '';
  private pageDescription: string = '';
  private currentPage: string = '';

  constructor(pageName: string) {
    this.layoutManager = LayoutManager.getInstance();
    this.currentPage = pageName;
    this.layoutManager.setCurrentPage(pageName);
  }

  public setPageMeta(title: string, description: string): void {
    this.pageTitle = title;
    this.pageDescription = description;
  }

  public generatePageHTML(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${this.pageDescription}">
    <meta name="keywords" content="Show-Stoppers Academy, youth development, sports academy, community, education, leadership">
    
    <title>${this.pageTitle} - Show-Stoppers Academy</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/assets/favicon.ico">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
                            400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
                            800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a'
                        },
                        secondary: {
                            50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
                            400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
                            800: '#92400e', 900: '#78350f', 950: '#451a03'
                        }
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                        display: ['Poppins', 'system-ui', 'sans-serif']
                    }
                }
            }
        }
    </script>
    
    <!-- Alpine.js -->
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    
    <!-- Custom Styles -->
    <style>
        .hero-bg {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        }
        .text-gradient {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .animate-float {
            animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
    </style>
</head>
<body class="font-sans text-gray-900 bg-white">
    ${this.generateNavigation()}
    ${content}
    ${this.layoutManager.generateFooterHTML()}
    ${this.layoutManager.generateScrollToTopHTML()}
    ${this.generateScripts()}
</body>
</html>
    `;
  }

  private generateNavigation(): string {
    return `
    <!-- Navigation -->
    <nav id="main-nav" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" x-data="{ mobileMenuOpen: false, scrolled: false }" x-init="
        window.addEventListener('scroll', () => {
            scrolled = window.scrollY > 100;
        });
    " :class="scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo -->
                <div class="flex-shrink-0">
                    <a href="/index.html" class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                        </div>
                        <span class="font-display font-bold text-xl text-gray-900">Show-Stoppers Academy</span>
                    </a>
                </div>
                
                ${this.layoutManager.generateNavigationHTML()}
                
                <!-- Mobile menu button -->
                <div class="md:hidden">
                    <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-gray-900 hover:text-primary-600 p-2">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        
        ${this.layoutManager.generateMobileNavigationHTML()}
    </nav>
    `;
  }

  private generateScripts(): string {
    return `
    <!-- TypeScript Components -->
    <script type="module">
        import { Navigation } from './src/components/Navigation.js';
        import { AnimationController, CounterAnimation } from './src/components/Animations.js';
        import { ContactFormHandler } from './src/components/ContactForm.js';
        import { throttle, showNotification } from './src/utils/index.js';

        // Initialize components
        const navigation = new Navigation();
        const animations = new AnimationController();
        const counters = new CounterAnimation();

        // Initialize forms if present
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            new ContactFormHandler('contact-form', 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec');
        }

        const registrationForm = document.getElementById('registration-form');
        if (registrationForm) {
            new ContactFormHandler('registration-form', 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec');
        }

        // Scroll to top functionality
        const scrollToTopBtn = document.getElementById('scroll-to-top');
        const handleScroll = throttle(() => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.remove('opacity-0', 'invisible');
                scrollToTopBtn.classList.add('opacity-100', 'visible');
            } else {
                scrollToTopBtn.classList.add('opacity-0', 'invisible');
                scrollToTopBtn.classList.remove('opacity-100', 'visible');
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);
        
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        console.log('${this.currentPage} page loaded successfully! 🚀');
    </script>
    `;
  }
}

// Gallery Component
export class GalleryComponent {
  public static generateGallery(galleryItems: GalleryItem[], title: string = 'Gallery', subtitle: string = 'Capturing moments of growth, achievement, and community spirit.'): string {
    const galleryHTML = galleryItems.map((item, index) => `
      <div class="group cursor-pointer" data-stagger-item data-animate="fade" onclick="openLightbox('${item.src}', '${item.alt}')">
        <div class="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
          <img src="${item.src}" alt="${item.alt}" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div class="p-6 text-white">
              <h3 class="font-semibold text-lg mb-2">${item.title}</h3>
              <p class="text-sm">${item.category}</p>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    return SectionBuilder.generateSection(`
      ${SectionBuilder.generateSectionHeader(title, subtitle)}
      
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6" data-stagger data-stagger-delay="100">
        ${galleryHTML}
      </div>
      
      <div class="text-center mt-12">
        <a href="/contact.html" class="bg-primary-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-700 transition-colors">
          Contact Us for More Photos
        </a>
      </div>
    `, 'py-20', 'bg-gray-50');
  }

  public static generateLightboxScript(): string {
    return `
    <script>
        function openLightbox(src, alt) {
            const lightbox = document.createElement('div');
            lightbox.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4';
            lightbox.innerHTML = \`
                <div class="relative max-w-4xl max-h-full">
                    <img src="\${src}" alt="\${alt}" class="max-w-full max-h-full object-contain rounded-lg">
                    <button class="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors" onclick="this.closest('.fixed').remove()">×</button>
                </div>
            \`;
            document.body.appendChild(lightbox);
            
            // Close on escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    lightbox.remove();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
            
            // Close on backdrop click
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    lightbox.remove();
                }
            });
        }
    </script>
    `;
  }
}

// FAQ Component
export class FAQComponent {
  public static generateFAQ(faqItems: FAQItem[], title: string = 'Frequently Asked Questions', subtitle: string = 'Quick answers to common questions about our programs and services.'): string {
    const faqHTML = faqItems.map((item, index) => `
      <div class="bg-gray-50 rounded-2xl overflow-hidden" data-animate="fade" data-delay="${300 + (index * 100)}">
        <button @click="openFaq = openFaq === ${index + 1} ? null : ${index + 1}" 
                class="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gray-100 transition-colors">
          <h3 class="font-semibold text-lg text-gray-900">${item.question}</h3>
          <svg class="w-5 h-5 text-gray-500 transition-transform" :class="{ 'rotate-180': openFaq === ${index + 1} }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div x-show="openFaq === ${index + 1}" x-transition class="px-8 pb-6">
          <p class="text-gray-600">${item.answer}</p>
        </div>
      </div>
    `).join('');

    return SectionBuilder.generateSection(`
      <div class="max-w-4xl mx-auto">
        ${SectionBuilder.generateSectionHeader(title, subtitle)}
        
        <div class="space-y-6" x-data="{ openFaq: null }">
          ${faqHTML}
        </div>
      </div>
    `);
  }
}

// Programs Component
export class ProgramsComponent {
  public static generatePrograms(programs: Program[], title: string = 'Our Programs', subtitle: string = 'Comprehensive development programs designed to nurture young minds and bodies.'): string {
    const programsHTML = programs.map((program, index) => `
      <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2" data-stagger-item data-animate="fade">
        <div class="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mb-6">
          <i class="fas ${program.icon} text-white text-2xl"></i>
        </div>
        <h3 class="font-display font-bold text-xl text-gray-900 mb-4">${program.title}</h3>
        <p class="text-gray-600 mb-6">${program.description}</p>
        <a href="${program.href}" class="text-primary-600 font-semibold hover:text-primary-700 transition-colors">Learn More →</a>
      </div>
    `).join('');

    return SectionBuilder.generateSection(`
      ${SectionBuilder.generateSectionHeader(title, subtitle)}
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-stagger data-stagger-delay="100">
        ${programsHTML}
      </div>
    `);
  }
}
