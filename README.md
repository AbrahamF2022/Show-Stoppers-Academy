# Show-Stoppers Academy Website

A modern, responsive website built with TypeScript and Tailwind CSS for Show-Stoppers Academy - empowering youth through sports and education.

## 🚀 Features

- **Modern Design**: Clean, professional design with cohesive branding
- **TypeScript**: Type-safe development with modern JavaScript features
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Responsive**: Perfect on all devices - mobile, tablet, and desktop
- **Interactive**: Smooth animations and engaging user interactions
- **Form Integration**: Custom forms that connect to Google Sheets
- **Performance Optimized**: Fast loading with optimized assets
- **SEO Ready**: Meta tags, structured data, and accessibility features

## 📁 Project Structure

```
Show-Stoppers-Academy/
├── index.html              # Homepage
├── about.html              # About page
├── contact.html            # Contact page
├── registration.html       # Program registration
├── pricing.html            # Donation page
├── faq.html               # FAQ page
├── src/
│   ├── components/        # TypeScript components
│   │   ├── Navigation.ts
│   │   ├── Animations.ts
│   │   └── ContactForm.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── utils/            # Utility functions
│       └── index.ts
├── assets/               # Images and media files
├── google-apps-script.js # Google Sheets integration
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
└── package.json          # Dependencies and scripts
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google account (for form submissions)

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Sheets Integration Setup

#### Step 1: Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Show-Stoppers Academy Submissions"
4. Copy the Sheet ID from the URL

#### Step 2: Create Google Apps Script
1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Copy the contents of `google-apps-script.js` into the script editor
4. Replace `YOUR_GOOGLE_SHEET_ID` with your actual Sheet ID
5. Replace `your-email@showstoppersacademy.com` with your email
6. Save the project

#### Step 3: Deploy the Script
1. Click "Deploy" > "New Deployment"
2. Choose "Web app" as the type
3. Set execute as "Me"
4. Set access to "Anyone"
5. Click "Deploy"
6. Copy the web app URL

#### Step 4: Update Form URLs
1. Open `src/components/ContactForm.ts`
2. Replace `YOUR_SCRIPT_ID` with your actual script ID from the URL
3. Update the Google Sheets URL in your forms

### 3. Development Server

```bash
npm run dev
```

This will start the development server at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

## 🎨 Customization

### Colors and Branding

Edit `tailwind.config.js` to customize colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your brand colors
      },
      secondary: {
        // Your accent colors
      }
    }
  }
}
```

### Content Updates

- **Homepage**: Edit `index.html`
- **About Page**: Edit `about.html`
- **Contact Info**: Update contact details in all pages
- **Programs**: Modify program information in relevant sections

### Images

Replace placeholder images in the `assets/` folder:
- Logo and branding images
- Gallery photos
- Hero section images

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔧 Form Functionality

### Contact Form
- Real-time validation
- Email notifications
- Google Sheets integration
- Spam protection

### Registration Form
- Multi-step validation
- Program selection
- Medical information capture
- Terms and conditions

## 🚀 Performance Features

- **Lazy Loading**: Images load as needed
- **Code Splitting**: Optimized bundle sizes
- **Caching**: Browser caching for faster loads
- **Compression**: Minified CSS and JavaScript
- **CDN Ready**: Can be deployed to any CDN

## 📊 Analytics Integration

The website is ready for analytics integration:
- Google Analytics 4
- Facebook Pixel
- Custom event tracking

## 🔒 Security Features

- Form validation and sanitization
- CSRF protection
- Secure data transmission
- Privacy policy compliance

## 📈 SEO Optimization

- Meta tags and descriptions
- Structured data (JSON-LD)
- Open Graph tags
- Twitter Cards
- Sitemap ready
- Fast loading times

## 🎯 Accessibility

- WCAG 2.1 compliant
- Keyboard navigation
- Screen reader friendly
- High contrast ratios
- Alt text for images

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 📞 Support

For technical support or questions:
- Email: tech@showstoppersacademy.com
- Phone: (555) 123-4567

## 📄 License

This project is proprietary to Show-Stoppers Academy. All rights reserved.

## 🔄 Updates and Maintenance

### Regular Updates
- Content updates as needed
- Security patches
- Performance optimizations
- New feature additions

### Backup Strategy
- Regular Google Sheets backups
- Website code version control
- Image and asset backups

---

**Built with ❤️ for Show-Stoppers Academy**

*Empowering youth for a brighter tomorrow through sports and education.*
