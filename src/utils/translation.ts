/**
 * Utility helper to handle active language detection,
 * Google Translate re-indexing, and dynamic currency conversions.
 */

export function getActiveLangCode(): string {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return match ? decodeURIComponent(match[1]) : 'en';
}

export function triggerGoogleTranslateSync(delayMs = 350): void {
  try {
    const langCode = getActiveLangCode();
    if (!langCode || langCode === 'en') return;

    setTimeout(() => {
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
      }
    }, delayMs);
  } catch (err) {
    console.warn('[TranslationSync] Error syncing translation:', err);
  }
}

export interface FormattedPrice {
  amountStr: string;
  currencySymbol: string;
  currencyCode: 'INR' | 'AED' | 'USD';
  rawAmount: number;
}

/**
 * Format INR base price to AED when Arabic ('ar') is active,
 * or INR for English / default.
 */
export function formatDisplayPrice(priceInr: number, customLang?: string): FormattedPrice {
  const lang = customLang || getActiveLangCode();

  if (lang === 'ar') {
    // 1 USD = 83.5 INR = 3.67 AED
    const priceAed = Math.round((priceInr / 83.5) * 3.67);
    return {
      amountStr: `AED ${priceAed.toLocaleString('en-US')}`,
      currencySymbol: 'AED ',
      currencyCode: 'AED',
      rawAmount: priceAed,
    };
  }

  return {
    amountStr: `₹${priceInr.toLocaleString('en-IN')}`,
    currencySymbol: '₹',
    currencyCode: 'INR',
    rawAmount: priceInr,
  };
}
