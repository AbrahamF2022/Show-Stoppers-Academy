// Core Types for Show Stoppers Academy

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

export interface Program {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  features: string[];
  duration?: string;
  ageGroup?: string;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  description: string;
  image: string;
  location: string;
  price?: number;
  registrationUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image?: string;
  rating: number;
}

export interface Statistic {
  value: string;
  label: string;
  description?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  interest: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: string;
  thumbnail?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: Date;
  author: string;
  image: string;
  tags: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'linkedin';
  url: string;
  icon: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  logo: string;
  social: SocialLink[];
  contact: {
    email: string;
    phone: string;
    address: string;
  };
}

export interface AnimationConfig {
  duration: number;
  delay: number;
  easing: string;
}

export interface ScrollSpySection {
  id: string;
  label: string;
  offset: number;
}

// Utility Types
export type Theme = 'light' | 'dark';
export type AnimationType = 'fade' | 'slide' | 'scale' | 'bounce';
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ColorScheme = 'primary' | 'secondary' | 'neutral';

// Event Types
export interface CustomEvent extends Event {
  detail?: any;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
