/**
 * LlmsTxt Formatter Service
 * Formats extracted content into proper llmstxt format
 */
import type { CrawlResult, LlmsTxtOptions, GeneratedLlmsTxt } from '../types/index.js';
export declare class LlmsTxtFormatterService {
    /**
     * Main method to format crawl results into llmstxt format
     */
    formatToLlmsTxt(results: CrawlResult[], options?: LlmsTxtOptions): Promise<GeneratedLlmsTxt>;
    /**
     * Build a hierarchical document structure from crawl results
     */
    private buildDocumentHierarchy;
    /**
     * Determine the hierarchical level of a document based on its URL structure
     */
    private determineDocumentLevel;
    /**
     * Find the best parent for a document based on URL structure
     */
    private findBestParent;
    /**
     * Check if one URL is likely to be the parent of another
     */
    private isLikelyParent;
    /**
     * Calculate URL similarity score (0-1)
     */
    private calculateUrlSimilarity;
    /**
     * Sanitize and clean document title
     */
    private sanitizeTitle;
    /**
     * Clean document content for better formatting
     */
    private cleanDocumentContent;
    /**
     * Sort hierarchy by title alphabetically
     */
    private sortHierarchy;
    /**
     * Get priority score for document sorting (lower = higher priority)
     */
    private getDocumentPriority;
    /**
     * Log hierarchy structure for debugging
     */
    private logHierarchy;
    /**
     * Convert document hierarchy to LlmsTxtSection format
     */
    private convertToSections;
    /**
     * Convert a single document and its children to LlmsTxtSection
     */
    private convertDocumentToSection;
    /**
     * Create summary content from full content
     */
    private createSummaryContent;
    /**
     * Truncate content to specified length with ellipsis
     */
    private truncateContent;
    /**
     * Generate final llmstxt content string from sections
     */
    private generateLlmsTxtContent;
    /**
     * Generate table of contents from sections
     */
    private generateTableOfContents;
    /**
     * Generate content for a single section and its subsections
     */
    private generateSectionContent;
    /**
     * Convert text to URL-friendly slug
     */
    private slugify;
    /**
     * Generate a compact summary format (alternative to full format)
     */
    formatToSummary(results: CrawlResult[], options?: Partial<LlmsTxtOptions>): Promise<GeneratedLlmsTxt>;
    /**
     * Validate that the generated content meets llmstxt standards
     */
    validateLlmsTxtContent(content: string): {
        valid: boolean;
        issues: string[];
    };
}
