import { Id } from '@/convex/_generated/dataModel';

export interface TermInfo {
  name: string;
  id: string;
  isAllTerms?: boolean;
}

export class TermSlugValidator {
  private static readonly SLUG_PATTERN = /^([a-zA-Z0-9-]+)-([a-zA-Z0-9-]+)$/;
  private static readonly ALL_TERMS_PREFIX = 'term-0';

  /**
   * Generate a URL slug from term information
   */
  static generateSlug(termName: string, termId: string | Id<'terms'>): string {
    // Sanitize term name to be URL-safe
    const sanitizedName = termName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    // Handle the "All Terms" case
    if (termId === 'all' || termName.toLowerCase().includes('all terms')) {
      return `${this.ALL_TERMS_PREFIX}-${this.generateUniqueId()}`;
    }

    // Extract just the ID part if it's a Convex ID
    const idPart = typeof termId === 'string' && termId.includes('|') 
      ? termId.split('|')[1] || termId 
      : termId;

    return `${sanitizedName}-${idPart}`;
  }

  /**
   * Parse a term slug back to term information
   */
  static parseSlug(slug: string): TermInfo | null {
    const match = slug.match(this.SLUG_PATTERN);
    if (!match) return null;

    const [, name, id] = match;

    // Handle "All Terms" case
    if (slug.startsWith(this.ALL_TERMS_PREFIX)) {
      return {
        name: 'All Terms',
        id: 'all',
        isAllTerms: true
      };
    }

    // Reconstruct the name (replace hyphens with spaces and title case)
    const reconstructedName = name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      name: reconstructedName,
      id: id,
      isAllTerms: false
    };
  }

  /**
   * Validate if a slug has the correct format
   */
  static isValidSlug(slug: string): boolean {
    return this.SLUG_PATTERN.test(slug);
  }

  /**
   * Generate a deterministic ID for cases where we need one
   * This ensures server and client generate the same slug
   */
  private static generateUniqueId(): string {
    // Use a fixed ID for "All Terms" to prevent hydration mismatches
    return 'u5urh3fps';
  }

  /**
   * Get the current term slug from a term object
   */
  static getSlugFromTerm(term: { name: string; _id: string } | null, fallbackToAll = true): string {
    if (!term && fallbackToAll) {
      return this.generateSlug('All Terms', 'all');
    }
    
    if (!term) {
      throw new Error('No term provided and fallback disabled');
    }

    return this.generateSlug(term.name, term._id);
  }
}

/**
 * Helper to get the default term slug for "All Terms"
 */
export function getAllTermsSlug(): string {
  return TermSlugValidator.generateSlug('All Terms', 'all');
}

/**
 * Helper to check if a slug represents "All Terms"
 */
export function isAllTermsSlug(slug: string): boolean {
  const parsed = TermSlugValidator.parseSlug(slug);
  return parsed?.isAllTerms === true;
}
