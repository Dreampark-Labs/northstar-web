import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Type definitions for Sanity documents
export interface AppSettings {
  appName: string;
  appDescription: string;
  metaKeywords?: string[];
  metaTitle?: string;
  favicon?: any;
  appleTouchIcon?: any;
  isActive?: boolean;
}

export interface FooterSettings {
  companyName?: string;
  version?: string;
  supportEmail?: string;
  privacyEmail?: string;
  showSecurityBadge?: boolean;
  socialLinks?: Array<{
    platform: string;
    label?: string;
    url: string;
    icon?: string;
  }>;
  legalLinks?: Array<{
    title: string;
    url: string;
    isExternal?: boolean;
  }>;
}

interface Logo {
  name: string;
  variant: string;
  image: any;
  altText: string;
}

// Default app settings in case Sanity isn't configured
const defaultSettings: AppSettings = {
  appName: 'Northstar',
  appDescription: 'Academic productivity application for managing courses, assignments, calendar, and files.',
  metaKeywords: ['academic', 'productivity', 'student', 'courses', 'assignments', 'calendar'],
  metaTitle: 'Northstar - Academic Productivity App',
};

/**
 * Get app settings from Sanity with defaults fallback
 */
export async function getAppSettingsWithDefaults(): Promise<AppSettings> {
  try {
    // Query for active app settings
    const settings = await client.fetch<AppSettings | null>(
      `*[_type == "appSettings" && isActive == true][0]`
    );

    if (settings) {
      return {
        ...defaultSettings,
        ...settings,
      };
    }
  } catch (error) {
    console.warn('Could not fetch app settings from Sanity, using defaults:', error);
  }

  return defaultSettings;
}

/**
 * Get all logos from Sanity
 */
export async function getLogos(): Promise<Logo[]> {
  try {
    const logos = await client.fetch<Logo[]>(
      `*[_type == "logo"]{
        name,
        variant,
        image,
        altText
      }`
    );

    return logos || [];
  } catch (error) {
    console.warn('Could not fetch logos from Sanity:', error);
    return [];
  }
}

/**
 * Get logo by variant from Sanity
 */
export async function getLogoByVariant(variant: string): Promise<Logo | null> {
  try {
    const logo = await client.fetch<Logo | null>(
      `*[_type == "logo" && variant == $variant][0]{
        name,
        variant,
        image,
        altText
      }`,
      { variant }
    );

    return logo || null;
  } catch (error) {
    console.warn('Could not fetch logo by variant from Sanity:', error);
    return null;
  }
}