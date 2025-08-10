/**
 * Utility functions for the llmstxt-generator server
 */
/**
 * Normalize URLs for consistent handling
 */
export declare function normalizeUrl(url: string, baseUrl?: string): string;
/**
 * Clean text content by normalizing whitespace and removing excess characters
 */
export declare function cleanTextContent(text: string): string;
/**
 * Extract domain from URL
 */
export declare function extractDomain(url: string): string;
/**
 * Check if URL is likely a documentation URL based on patterns
 */
export declare function isLikelyDocumentationUrl(url: string): boolean;
/**
 * Sleep utility for rate limiting
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Validate URL format
 */
export declare function isValidUrl(url: string): boolean;
