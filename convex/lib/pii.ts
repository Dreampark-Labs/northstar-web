/**
 * Minimal PII guards for server-side validation in mutations.
 * Use to reject writes on free-text fields like `notes` or `instructor`.
 */
export function containsObviousPII(s: string | undefined | null): boolean {
  if (!s) return false;
  const text = s.toLowerCase();
  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text);
  const hasPhone =
    /\b(\+?\d{1,2}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/.test(text);
  return hasEmail || hasPhone;
}