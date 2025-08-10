/**
 * Context Formatter Service
 * Formats extracted content into proper context format
 */
import type { CrawlResult, ContextOptions, GeneratedContext } from '../types/index.js';
export declare class ContextFormatterService {
    /**
     * Main method to format crawl results into context format
     */
    formatToContext(results: CrawlResult[], options?: ContextOptions): Promise<GeneratedContext>;
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
     * Convert document hierarchy to ContextSection format
     */
    private convertToSections;
    /**
     * Convert a single document and its children to ContextSection
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
     * Generate final context content string from sections
     */
    private generateContextContent;
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
    formatToSummary(results: CrawlResult[], options?: Partial<ContextOptions>): Promise<GeneratedContext>;
    /**
     * Validate that the generated content meets context standards
     */
    validateContextContent(content: string): {
        valid: boolean;
        issues: string[];
    };
    /**
     * Save generated context content to files in the specified directory
     * Based on robust file writing patterns from deep research MCP server
     */
    saveToFile(content: string, baseUrl: string, format?: string, options?: {
        directory?: string;
        filename?: string;
        fileFormat?: 'txt' | 'md';
    }): Promise<{
        filePath: string;
        fileName: string;
    }>;
    /**
     * Save both summary and full formats to separate files
     */
    saveBothFormats(results: CrawlResult[], baseUrl: string): Promise<{
        summaryFile: string;
        fullFile: string;
    }>;
    /**
     * Extract domain name from URL for filename
     */
    private getDomainFromUrl;
    /**
     * Get output directory path
     */
    getOutputDirectory(): string;
    /**
     * List all saved context files in output directory
     */
    listSavedFiles(): Promise<string[]>;
}
