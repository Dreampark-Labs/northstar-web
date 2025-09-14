# Sanity Content Management Setup

This application now uses Sanity CMS to manage dynamic content including application branding, footer information, and other configurable settings. This allows you to update content without code changes.

## What Can You Manage?

### 1. Application Settings
- **Application Name**: Change "Northstar" to your preferred app name
- **Application Description**: Update the description used in metadata and footers
- **Favicon**: Upload your custom favicon (32x32 or 16x16 pixels recommended)
- **Apple Touch Icon**: Upload Apple touch icon (180x180 pixels recommended)
- **Meta Title**: Custom title for browser tabs (optional)
- **Meta Keywords**: SEO keywords (optional)

### 2. Footer Settings
- **Company Name**: Company name for copyright notices
- **Copyright Text**: Additional copyright text
- **App Description**: Description shown in the footer
- **Version Number**: Current app version (e.g., "1.0.0")
- **Support Email**: General support email address
- **Privacy Email**: Privacy-related questions email
- **Legal Links**: Configurable legal page links (Privacy Policy, Terms, etc.)
- **Social Links**: Social media links (Twitter, LinkedIn, GitHub, etc.)
- **Security Badge**: Toggle the "Secured with HTTPS" badge

### 3. Logo Management (Existing)
- Multiple logo variants for different themes and collapsed states
- Automatic theme switching based on user preferences

## How to Access Sanity Studio

1. **Development**: Visit `http://localhost:3000/studio` when running locally
2. **Production**: Visit your domain followed by `/studio` (e.g., `https://yourapp.com/studio`)

## How to Update Content

### First Time Setup
1. Access Sanity Studio
2. Create your first "Application Settings" document:
   - Set your app name (replaces "Northstar")
   - Upload your favicon
   - Add description and other metadata
   - Mark as "Active"

3. Create your first "Footer Settings" document:
   - Set company name for copyright
   - Configure support/privacy emails
   - Add legal links
   - Set version number
   - Mark as "Active"

### Making Changes
1. Go to Sanity Studio
2. Edit the "Application Settings" or "Footer Settings" documents
3. Changes will be reflected on your website immediately (with some caching)

## Technical Details

### Where Content is Used

**Application Name** is used in:
- Browser tab titles
- Meta tags
- Footer copyright
- Logo fallback text
- Sidebar footer
- Legal page content

**Footer Settings** control:
- Main footer component
- Sidebar mini-footer
- Email contact links
- Legal page links
- Version display

### Fallback Behavior
If Sanity is unavailable or no content is found, the application falls back to:
- App Name: "Northstar"
- Description: "Academic productivity made simple. Plan terms, track courses & assignments, manage files."
- Default legal links and support emails

### Schema Structure
- `appSettings.ts`: Application-wide settings
- `footerSettings.ts`: Footer and legal information
- `logo.ts`: Logo variants (existing)

## Development Notes

### Adding New Configurable Content
1. Update the appropriate schema in `sanity/schemas/`
2. Add TypeScript interfaces in `lib/sanity.ts`
3. Create fetch functions in `lib/sanity.ts`
4. Update components to use the new content
5. Update fallback defaults

### File Locations
- Schemas: `sanity/schemas/`
- Client utilities: `lib/sanity.ts`
- Metadata helpers: `lib/metadata.ts`
- React hooks: `hooks/useAppSettings.ts`
- Components using dynamic content:
  - `app/layout.tsx` (static fallback metadata)
  - `components/layout/Footer/Footer.tsx`
  - `components/layout/Sidebar/Sidebar.tsx`
  - `components/ui/Logo/Logo.tsx`
  - `components/ui/DynamicHead/DynamicHead.tsx` (for dynamic page metadata)
  - Legal pages (`app/privacy/page.tsx`, `app/cookies/page.tsx`)

### Dynamic Metadata Implementation
The application uses a hybrid approach for metadata:
- **Static fallback**: `app/layout.tsx` provides fallback metadata for SEO
- **Dynamic updates**: Components use React hooks to update content client-side
- **Page-specific metadata**: Use `DynamicHead` component for custom page titles and descriptions
- **Legal pages**: Use `generateMetadata` functions for server-side generation

## Best Practices

1. **Always mark one document as "Active"** - Only one Application Settings and one Footer Settings document should be active at a time
2. **Test changes in development first** - Use the Sanity Studio in development to test content changes
3. **Optimize images** - Upload appropriately sized images for favicons and logos
4. **Keep descriptions concise** - Especially for metadata descriptions (under 160 characters is recommended)
5. **Update version numbers** - Remember to update the version number in Footer Settings when releasing updates

## Troubleshooting

- **Content not updating**: Check that documents are marked as "Active"
- **Images not loading**: Ensure images are properly uploaded to Sanity
- **Fallback content showing**: Check Sanity connection and document structure
- **Studio not accessible**: Ensure Sanity is properly configured and the studio route is set up
