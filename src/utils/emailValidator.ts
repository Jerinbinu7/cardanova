/**
 * Strict B2B Email Validation & Verification Utility.
 * - Syntax validation (RFC 5322 compliance)
 * - Disposable email domain blocking
 * - Common domain typo suggestion
 */

// Known disposable / temporary email domains to block for B2B inquiries
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', '10minutemail.com', 'tempmail.com', 'guerrillamail.com',
  'trashmail.com', 'yopmail.com', 'sharklasers.com', 'dispostable.com',
  'getnada.com', 'throwawaymail.com', 'temp-mail.org', 'maildrop.cc'
]);

// Common domain typos map: typo -> correct
const DOMAIN_TYPO_MAP: Record<string, string> = {
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'rediffmial.com': 'rediffmail.com',
};

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }

  // RFC 5322 compliant regex for email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. buyer@company.com).' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email format.' };
  }

  const [localPart, domain] = parts;

  if (localPart.length > 64) {
    return { isValid: false, error: 'Email username is too long.' };
  }

  // Check disposable email domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { isValid: false, error: 'Please use a business or company email. Temporary emails are not accepted.' };
  }

  // Check common typos
  let suggestion: string | undefined;
  if (DOMAIN_TYPO_MAP[domain]) {
    suggestion = `${localPart}@${DOMAIN_TYPO_MAP[domain]}`;
  }

  return {
    isValid: true,
    suggestion,
  };
}
