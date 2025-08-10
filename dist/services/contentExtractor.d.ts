/**
 * Content Extractor Service
 * Extracts clean content while preserving formatting
 * Works with platform detection for optimal extraction
 */
import type { ExtractedContent, DocumentationPlatform } from '../types/index.js';
export declare class ContentExtractorService {
    private turndownService;
    constructor();
    /**
     * Extract content from HTML with platform-specific optimizations
     */
    extractContent(html: string, url: string, platform?: DocumentationPlatform): Promise<ExtractedContent>;
    /**
     * Setup custom Turndown rules for better documentation conversion
     */
    private setupTurndownRules;
    /**
     * Clean up HTML by removing unwanted elements
     */
    private cleanupHtml;
    /**
     * Extract title using multiple strategies with platform awareness
     */
    private extractTitle;
    /**
     * Extract main content using platform-specific selectors
     */
    private extractMainContent;
    /**
     * Convert HTML content to clean markdown
     */
    private convertToMarkdown;
    /**
     * Clean up markdown formatting
     */
    private cleanMarkdown;
    /**
     * Extract links from the page
     */
    private extractLinks;
    /**
     * Extract heading structure from the page
     */
    private extractHeadings;
    /**
     * Extract code blocks from markdown content
     */
    private extractCodeBlocks;
    /**
     * Generate clean text content from markdown
     */
    private generateCleanTextContent;
    /**
     * Extract title from URL as fallback
     */
    private extractTitleFromUrl;
    /**
     * Check if content is likely to be meaningful documentation
     */
    isValidContent(content: ExtractedContent): boolean;
}
