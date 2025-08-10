/**
 * Utility functions for the llmstxt-generator server
 */

/**
 * Normalize URLs for consistent handling
 */
export function normalizeUrl(url: string, baseUrl?: string): string {
  try {
    if (baseUrl) {
      return new URL(url, baseUrl).toString();
    }
    return new URL(url).toString();
  } catch {
    return url;
  }
}

/**
 * Clean text content by normalizing whitespace and removing excess characters
 */
export function cleanTextContent(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .trim();
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * Check if URL is likely a documentation URL based on patterns
 */
export function isLikelyDocumentationUrl(url: string): boolean {
  const docKeywords = [
    'docs', 'documentation', 'guide', 'tutorial', 'help',
    'manual', 'wiki', 'getting-started', 'quickstart',
    'setup', 'install', 'api', 'reference', 'examples'
  ];
  
  const lowercaseUrl = url.toLowerCase();
  return docKeywords.some(keyword => lowercaseUrl.includes(keyword));
}

/**
 * Sleep utility for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}