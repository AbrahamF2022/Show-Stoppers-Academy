// Contact Form Component for Show-Stoppers Academy

import { ContactForm, FormField, showNotification } from '@/types';
import { validateEmail, validatePhone, validateFormField } from '@/utils';

export class ContactFormHandler {
  private form: HTMLFormElement;
  private submitButton: HTMLButtonElement;
  private fields: Map<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  private googleSheetsUrl: string;

  constructor(formId: string, googleSheetsUrl: string) {
    this.form = document.getElementById(formId) as HTMLFormElement;
    this.submitButton = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;
    this.fields = new Map();
    this.googleSheetsUrl = googleSheetsUrl;

    if (!this.form) {
      throw new Error(`Form with id "${formId}" not found`);
    }

    this.init();
  }

  private init(): void {
    this.setupFields();
    this.setupEventListeners();
    this.setupValidation();
  }

  private setupFields(): void {
    const fieldElements = this.form.querySelectorAll('input, textarea, select');
    fieldElements.forEach((field) => {
      const element = field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      this.fields.set(element.name, element);
    });
  }

  private setupEventListeners(): void {
    // Form submission
    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    // Real-time validation
    this.fields.forEach((field) => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => this.clearFieldError(field));
    });

    // Prevent form submission on Enter key in textarea
    const textareas = this.form.querySelectorAll('textarea');
    textareas.forEach((textarea) => {
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.form.dispatchEvent(new Event('submit'));
        }
      });
    });
  }

  private setupValidation(): void {
    // Add validation attributes to fields
    this.fields.forEach((field) => {
      if (field.hasAttribute('required')) {
        field.setAttribute('aria-required', 'true');
      }
    });
  }

  private validateField(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
    const value = field.value.trim();
    const fieldType = field.getAttribute('type') || field.tagName.toLowerCase();
    const required = field.hasAttribute('required');

    // Clear previous errors
    this.clearFieldError(field);

    // Required field validation
    if (required && !value) {
      this.showFieldError(field, `${this.getFieldLabel(field)} is required`);
      return false;
    }

    // Type-specific validation
    if (value && !validateFormField(value, fieldType, required)) {
      let errorMessage = '';
      
      switch (fieldType) {
        case 'email':
          errorMessage = 'Please enter a valid email address';
          break;
        case 'tel':
          errorMessage = 'Please enter a valid phone number';
          break;
        default:
          errorMessage = 'Please enter a valid value';
      }
      
      this.showFieldError(field, errorMessage);
      return false;
    }

    return true;
  }

  private validateForm(): boolean {
    let isValid = true;
    
    this.fields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  private showFieldError(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, message: string): void {
    field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
    
    // Remove existing error message
    const existingError = field.parentElement?.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    field.parentElement?.appendChild(errorDiv);
  }

  private clearFieldError(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): void {
    field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
    
    const errorMessage = field.parentElement?.querySelector('.field-error');
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  private getFieldLabel(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
    const label = field.parentElement?.querySelector('label');
    return label?.textContent?.replace('*', '').trim() || field.name;
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.validateForm()) {
      showNotification('Please fix the errors in the form', { type: 'error' });
      return;
    }

    this.setLoadingState(true);

    try {
      const formData = this.getFormData();
      await this.submitToGoogleSheets(formData);
      
      showNotification('Thank you! Your message has been sent successfully.', { type: 'success' });
      this.resetForm();
    } catch (error) {
      console.error('Form submission error:', error);
      showNotification('Sorry, there was an error sending your message. Please try again.', { type: 'error' });
    } finally {
      this.setLoadingState(false);
    }
  }

  private getFormData(): Record<string, string> {
    const data: Record<string, string> = {};
    
    this.fields.forEach((field, name) => {
      if (field.type === 'checkbox') {
        data[name] = (field as HTMLInputElement).checked ? 'Yes' : 'No';
      } else {
        data[name] = field.value.trim();
      }
    });

    // Add timestamp
    data.timestamp = new Date().toISOString();
    data.source = 'Show-Stoppers Academy Website';

    return data;
  }

  private async submitToGoogleSheets(data: Record<string, string>): Promise<void> {
    const formData = new FormData();
    
    // Convert data to FormData format for Google Sheets
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(this.googleSheetsUrl, {
      method: 'POST',
      body: formData,
      mode: 'no-cors' // Required for Google Sheets
    });

    if (!response.ok) {
      throw new Error('Failed to submit form data');
    }
  }

  private setLoadingState(loading: boolean): void {
    const originalText = this.submitButton.textContent;
    
    if (loading) {
      this.submitButton.disabled = true;
      this.submitButton.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Sending...
      `;
    } else {
      this.submitButton.disabled = false;
      this.submitButton.textContent = originalText;
    }
  }

  private resetForm(): void {
    this.form.reset();
    this.fields.forEach((field) => {
      this.clearFieldError(field);
    });
  }

  // Public method to manually validate form
  public validate(): boolean {
    return this.validateForm();
  }

  // Public method to reset form
  public reset(): void {
    this.resetForm();
  }

  // Public method to set field value
  public setFieldValue(name: string, value: string): void {
    const field = this.fields.get(name);
    if (field) {
      field.value = value;
    }
  }

  // Public method to get field value
  public getFieldValue(name: string): string {
    const field = this.fields.get(name);
    return field ? field.value : '';
  }
}

// Google Sheets Integration Helper
export class GoogleSheetsIntegration {
  private static readonly GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

  static async submitContactForm(data: Record<string, string>): Promise<boolean> {
    try {
      const response = await fetch(this.GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submitContactForm',
          data: data
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Google Sheets submission error:', error);
      return false;
    }
  }

  static async submitRegistrationForm(data: Record<string, string>): Promise<boolean> {
    try {
      const response = await fetch(this.GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submitRegistrationForm',
          data: data
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Google Sheets submission error:', error);
      return false;
    }
  }
}

// Form Field Builder for dynamic form creation
export class FormFieldBuilder {
  static createInput(field: FormField): HTMLInputElement {
    const input = document.createElement('input');
    input.type = field.type;
    input.name = field.name;
    input.id = field.name;
    input.placeholder = field.placeholder || '';
    input.required = field.required;
    
    if (field.validation) {
      if (field.validation.pattern) {
        input.pattern = field.validation.pattern;
      }
      if (field.validation.minLength) {
        input.minLength = field.validation.minLength;
      }
      if (field.validation.maxLength) {
        input.maxLength = field.validation.maxLength;
      }
    }

    return input;
  }

  static createTextarea(field: FormField): HTMLTextAreaElement {
    const textarea = document.createElement('textarea');
    textarea.name = field.name;
    textarea.id = field.name;
    textarea.placeholder = field.placeholder || '';
    textarea.required = field.required;
    textarea.rows = 4;
    
    if (field.validation) {
      if (field.validation.minLength) {
        textarea.minLength = field.validation.minLength;
      }
      if (field.validation.maxLength) {
        textarea.maxLength = field.validation.maxLength;
      }
    }

    return textarea;
  }

  static createSelect(field: FormField): HTMLSelectElement {
    const select = document.createElement('select');
    select.name = field.name;
    select.id = field.name;
    select.required = field.required;

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `Select ${field.label}`;
    select.appendChild(defaultOption);

    // Add options
    if (field.options) {
      field.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        select.appendChild(optionElement);
      });
    }

    return select;
  }
}
