const cache = new Map();

/**
 * Translates English text to Urdu using MyMemory Translation API with local caching.
 */
export async function translateTextToUrdu(text) {
  if (!text || typeof text !== 'string' || !text.trim()) return text;
  const trimmed = text.trim();
  if (cache.has(trimmed)) return cache.get(trimmed);

  try {
    const encoded = encodeURIComponent(trimmed.slice(0, 600));
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|ur`);
    const data = await res.json();
    if (data?.responseData?.translatedText && !data.responseData.translatedText.includes('MYMEMORY')) {
      const result = data.responseData.translatedText;
      cache.set(trimmed, result);
      return result;
    }
  } catch (err) {
    console.error('Post translation failed:', err);
  }
  return trimmed;
}
