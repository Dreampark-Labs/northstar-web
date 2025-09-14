import type { Metadata } from 'next';
import { getAppSettingsWithDefaults } from './sanity';

/**
 * Generate dynamic metadata for pages using Sanity app settings
 */
export async function generatePageMetadata(
  title: string,
  description?: string,
  keywords?: string[]
): Promise<Metadata> {
  const appSettings = await getAppSettingsWithDefaults();
  
  const fullTitle = title.includes(appSettings.appName) 
    ? title 
    : `${title} - ${appSettings.appName}`;
  
  const finalDescription = description || appSettings.appDescription;
  
  const metadata: Metadata = {
    title: fullTitle,
    description: finalDescription,
  };

  // Add keywords if provided or from app settings
  const allKeywords = [
    ...(keywords || []),
    ...(appSettings.metaKeywords || [])
  ];
  
  if (allKeywords.length > 0) {
    metadata.keywords = [...new Set(allKeywords)]; // Remove duplicates
  }

  return metadata;
}

/**
 * Generate metadata specifically for legal pages
 */
export async function generateLegalPageMetadata(
  pageType: 'Privacy Policy' | 'Cookie Policy' | 'Terms of Service',
  customDescription?: string
): Promise<Metadata> {
  const appSettings = await getAppSettingsWithDefaults();
  
  const descriptions = {
    'Privacy Policy': `Learn how ${appSettings.appName} protects your privacy and handles your personal data.`,
    'Cookie Policy': `Learn about how ${appSettings.appName} uses cookies and similar technologies.`,
    'Terms of Service': `Read the terms of service for using ${appSettings.appName}.`
  };
  
  return generatePageMetadata(
    pageType,
    customDescription || descriptions[pageType],
    ['privacy', 'policy', 'legal', 'terms', 'cookies', 'data protection']
  );
}
