import { containsObviousPII } from './pii';

export function validateNoPII(data: Record<string, any>): void {
  const fieldsToCheck = ['notes', 'instructor'];
  
  for (const field of fieldsToCheck) {
    if (data[field] && containsObviousPII(data[field])) {
      throw new Error(`PII detected in ${field}. Please remove personal information.`);
    }
  }
}

// Re-export for backward compatibility
export { containsObviousPII as containsPII };