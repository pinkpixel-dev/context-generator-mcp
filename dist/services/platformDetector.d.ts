/**
 * Platform Detector Service
 * Detects documentation platform types and their specific characteristics
 * Optimizes crawling strategies for each platform
 */
import type { DocumentationPlatform } from '../types/index.js';
export declare class PlatformDetectorService {
    /**
     * Detect documentation platform from URL and content
     */
    detectPlatform(url: string, htmlContent?: string): Promise<DocumentationPlatform>;
    /**
     * Detect platform from URL patterns
     */
    private detectFromUrl;
    /**
     * Detect platform from HTML content analysis
     */
    private detectFromContent;
    /**
     * Advanced heuristic detection based on multiple signals
     */
    private detectFromHeuristics;
    /**
     * Get platform-specific configuration
     */
    getPlatformConfig(platformName: string): DocumentationPlatform;
    /**
     * Get all supported platforms
     */
    getSupportedPlatforms(): string[];
    /**
     * Quick platform detection from URL only (fast)
     */
    quickDetect(url: string): DocumentationPlatform;
    /**
     * Analyze platform capabilities and suggest crawling strategy
     */
    analyzePlatform(platform: DocumentationPlatform): {
        recommendedStrategy: string;
        contentSelectors: string[];
        navigationSelectors: string[];
        crawlHints: string[];
    };
}
