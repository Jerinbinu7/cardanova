/**
 * Utility helper to trigger Google Translate re-indexing
 * when dynamic React tabs/routes or async products finish rendering.
 */
export function triggerGoogleTranslateSync(delayMs = 350): void {
  try {
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    if (!match) return;
    const langCode = decodeURIComponent(match[1]);
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
