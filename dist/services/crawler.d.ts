/**
 * Crawler Service - Based on proven x-crawl patterns
 * Handles web scraping with documentation-specific enhancements
 */
import type { CrawlOptions, CrawlResult } from '../types/index.js';
export declare class CrawlerService {
    private crawlApp;
    private crawlOpenAIApp;
    private initialized;
    constructor();
    initialize(): Promise<void>;
    /**
     * Discover all documentation URLs from a base URL
     * Uses multiple strategies: sitemap, navigation analysis, and link following
     */
    discoverDocumentationUrls(baseUrl: string, options?: CrawlOptions): Promise<string[]>;
    /**
     * Main documentation crawling method - based on your proven patterns
     */
    crawlDocumentation(url: string, options?: CrawlOptions): Promise<CrawlResult[]>;
    /**
     * Crawl multiple pages using your proven x-crawl patterns
     */
    private crawlMultiplePages;
    /**
     * Extract documentation-specific data from crawl results
     */
    private extractDocumentationData;
    /**
     * Discover URLs from sitemap.xml
     */
    private discoverFromSitemap;
    /**
     * Discover URLs from navigation analysis
     */
    private discoverFromNavigation;
    /**
     * Extract documentation links from HTML content
     */
    private extractDocumentationLinks;
    /**
     * Check if URL is likely a documentation page
     */
    private isDocumentationUrl;
    /**
     * Simple crawl page method (similar to working CourseCrafter implementation)
     */
    crawlPage(url: string, options?: any): Promise<CrawlResult>;
    /**
     * Extract content using proven CourseCrafter approach
     */
    private extractContent;
    /**
     * Extract title from crawl data
     */
    private extractTitle;
    /**
     * Crawl a single page for preview purposes
     */
    crawlSinglePage(url: string): Promise<CrawlResult>;
    /**
     * Health check for the crawler service
     */
    healthCheck(): Promise<boolean>;
    /**
     * Ensure the service is initialized before use
     */
    private ensureInitialized;
    /**
     * Check if service is ready
     */
    isReady(): boolean;
}
