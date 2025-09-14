# DPL - Digital Product Launch

A modern, high-converting marketing website template designed for showcasing digital products and SaaS applications. Built with Next.js 15, TypeScript, and Sanity CMS.

## 🚀 Features

- **Modern Design**: Apple/Notion-inspired clean and minimal design
- **Fully Responsive**: Mobile-first design with smooth animations
- **Content Management**: Sanity CMS integration for easy content updates
- **Performance Optimized**: Fast loading with optimized images and CSS
- **SEO Ready**: Proper meta tags, structured data, and semantic HTML
- **Dark/Light Theme**: Automatic theme switching support
- **Type Safe**: Full TypeScript implementation

## 📄 Pages Included

- **Homepage** - Hero, features, product showcase, testimonials
- **Product** - Detailed feature showcase and product information
- **About** - Company story, team, and values
- **Pricing** - Pricing plans and FAQ
- **Changelog** - Feature updates and release notes
- **Demo** - Interactive product demonstration

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: CSS Modules with design tokens
- **CMS**: Sanity for content management
- **Deployment**: Vercel/Netlify ready

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd dpl
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update the environment variables in `.env.local`:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`: Your Sanity project ID
   - `NEXT_PUBLIC_SANITY_DATASET`: Your Sanity dataset (usually 'production')
   - `NEXT_PUBLIC_APP_URL`: URL to your main application

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
dpl/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── product/           # Product page
│   ├── about/             # About page
│   ├── pricing/           # Pricing page
│   ├── changelog/         # Changelog page
│   └── demo/              # Demo page
├── components/            # React components
│   ├── marketing/        # Marketing-specific components
│   └── ui/               # Shared UI components
├── lib/                  # Utilities and helpers
├── providers/           # React context providers
├── styles/             # Global styles and design tokens
├── hooks/              # Custom React hooks
├── config/             # Configuration files
└── public/             # Static assets
```

## 🎨 Customization

### Design System
All design tokens are defined in `styles/tokens.css`:
- Colors, spacing, typography, shadows
- Easy to customize for your brand
- Automatic dark mode support

### Content Management
Use Sanity Studio to manage:
- Page content and copy
- Feature descriptions
- Testimonials and social proof
- Pricing plans and FAQ

### Components
Each component is self-contained with:
- TypeScript interfaces
- CSS Modules for styling
- Responsive design
- Accessibility features

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Deploy the `.next` folder
3. Set environment variables in Netlify dashboard

### Custom Server
1. Build: `npm run build`
2. Start: `npm start`
3. Configure reverse proxy (nginx/Apache)

## 📊 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Core Web Vitals**: Optimized for excellent UX
- **Bundle Size**: Minimal JavaScript, CSS-first approach
- **Loading Speed**: Optimized images and lazy loading

## 🔧 Configuration

### Environment Variables
```env
# Required
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_APP_URL=https://your-app.com

# Optional
NEXT_PUBLIC_GA_ID=your_google_analytics_id
SANITY_API_TOKEN=your_sanity_token
```

### Site Configuration
Update `config/site.ts` to customize:
- Site name and description
- Social media links
- Company information
- Feature flags

## 📈 Analytics & Tracking

Ready for:
- Google Analytics 4
- PostHog (product analytics)
- Custom event tracking
- Conversion optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

---

**Built with ❤️ for modern product launches**