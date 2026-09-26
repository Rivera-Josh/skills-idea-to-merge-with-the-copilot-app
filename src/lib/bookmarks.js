const slugAlphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const bookmarkSlugPattern = /^mona-[0-9a-zA-Z]{4,8}$/;

export function normalizeUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError('Enter a URL to save.');
  }

  const input = value.trim();
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(input);
  const hasHostPort = /^[^/?#]+:\d+(?:[/?#]|$)/.test(input);
  if (hasScheme && !hasHostPort && !/^https?:/i.test(input)) {
    throw new TypeError('Only HTTP and HTTPS links can be saved.');
  }

  const normalizedInput = input.startsWith('//')
    ? `https:${input}`
    : hasScheme && !hasHostPort
      ? input
      : `https://${input}`;
  const url = new URL(normalizedInput);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError('Only HTTP and HTTPS links can be saved.');
  }
  if (!url.hostname) {
    throw new TypeError('Enter a valid URL to save.');
  }

  return url.href;
}

export function generateSlug() {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(6));
  const suffix = Array.from(bytes, (byte) => slugAlphabet[byte % slugAlphabet.length]).join('');
  return `mona-${suffix}`;
}

export function loadBookmarks(value) {
  try {
    const parsed = JSON.parse(value ?? 'null');
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry) => {
      if (
        entry === null ||
        typeof entry !== 'object' ||
        Array.isArray(entry) ||
        typeof entry.url !== 'string' ||
        typeof entry.slug !== 'string' ||
        !bookmarkSlugPattern.test(entry.slug)
      ) {
        return [];
      }

      try {
        return [{ url: normalizeUrl(entry.url), slug: entry.slug }];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

export function formatBookmark(bookmark) {
  return `${bookmark.url} :: ${bookmark.slug}`;
}
