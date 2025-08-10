/**
 * Crawler Service - Based on proven x-crawl patterns
 * Handles web scraping with documentation-specific enhancements
 */

import xCrawl from 'x-crawl';
import { load } from 'cheerio';
import type { CrawlOptions, CrawlResult, DocumentationSite } from '../types/index.js';

// Define types for x-crawl results (based on your proven implementation)
interface XCrawlPageResult {
  isSuccess: boolean;
  data?: any;
  message?: string;
}

export class CrawlerService {
  private crawlApp: any;
  private crawlOpenAIApp: any;
  private initialized = false;

  constructor() {
    // Initialize will be called asynchronously
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.error('🔧 Initializing x-crawl service with documentation enhancements...');
      
      // Create crawler application with configuration (based on your proven patterns)
      this.crawlApp = xCrawl({
        maxRetry: 3,
        intervalTime: 2000,
        crawlPage: {
          puppeteerLaunch: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          }
        }
      });

      // Create OpenAI crawler application (optional, for AI-assisted crawling)
      if (process.env.OPENAI_API_KEY) {
        console.error('ℹ️ OpenAI support would be available (not implemented yet)');
      } else {
        console.error('ℹ️ OpenAI API key not found, x-crawl initialized without AI support');
      }

      this.initialized = true;
      console.error('✅ Documentation crawler service initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize x-crawl for documentation:', error);
      throw error;
    }
  }  /**
   * Discover all documentation URLs from a base URL
   * Uses multiple strategies: sitemap, navigation analysis, and link following
   */
  async discoverDocumentationUrls(baseUrl: string, options: CrawlOptions = {}): Promise<string[]> {
    await this.ensureInitialized();
    
    const { maxPages = 50, maxDepth = 3 } = options;
    const discoveredUrls = new Set<string>();
    const baseUrlObj = new URL(baseUrl);
    
    console.error(`🔍 [DOC-DISCOVERY] Starting URL discovery for: ${baseUrl}`);
    
    // Strategy 1: Try to find and parse sitemap.xml
    const sitemapUrls = await this.discoverFromSitemap(baseUrl);
    sitemapUrls.forEach(url => discoveredUrls.add(url));
    console.error(`📋 [DOC-DISCOVERY] Found ${sitemapUrls.length} URLs from sitemap`);
    
    // Strategy 2: Crawl the base page and analyze navigation
    const navigationUrls = await this.discoverFromNavigation(baseUrl, maxDepth);
    navigationUrls.forEach(url => discoveredUrls.add(url));
    console.error(`🧭 [DOC-DISCOVERY] Found ${navigationUrls.length} URLs from navigation`);
    
    // Filter and limit results
    const filteredUrls = Array.from(discoveredUrls)
      .filter(url => {
        try {
          const urlObj = new URL(url);
          // Only include URLs from the same domain
          return urlObj.hostname === baseUrlObj.hostname;
        } catch {
          return false;
        }
      })
      .slice(0, maxPages);
    
    console.error(`✅ [DOC-DISCOVERY] Discovery complete: ${filteredUrls.length} URLs ready for crawling`);
    return filteredUrls;
  }

  /**
   * Main documentation crawling method - based on your proven patterns
   */
  async crawlDocumentation(url: string, options: CrawlOptions = {}): Promise<CrawlResult[]> {
    await this.ensureInitialized();
    
    const { maxPages = 50, delayMs = 1000 } = options;
    
    console.error(`🕷️ [DOC-CRAWL] Starting documentation crawl: ${url}`);
    console.error(`📋 [DOC-CRAWL] Parameters: maxPages=${maxPages}, delay=${delayMs}ms`);
    
    try {
      // Step 1: Discover all documentation URLs
      const urlsToCrawl = await this.discoverDocumentationUrls(url, options);
      
      if (urlsToCrawl.length === 0) {
        throw new Error('No documentation URLs discovered');
      }
      
      // Step 2: Crawl all discovered URLs using your proven x-crawl patterns
      const crawlResults = await this.crawlMultiplePages(urlsToCrawl, delayMs);
      
      console.error(`🎉 [DOC-CRAWL] Documentation crawl completed successfully!`);
      console.error(`📊 [DOC-CRAWL] Results: ${crawlResults.length} pages processed`);
      
      return crawlResults;
      
    } catch (error) {
      console.error(`❌ [DOC-CRAWL] Documentation crawl failed for: ${url}`, error);
      throw error;
    }
  }  /**
   * Crawl multiple pages using your proven x-crawl patterns
   */
  private async crawlMultiplePages(urls: string[], delayMs: number): Promise<CrawlResult[]> {
    if (!this.crawlApp) {
      throw new Error('X-Crawl not initialized. Call initialize() first.');
    }

    console.error(`🕷️ [X-CRAWL] Starting crawl of ${urls.length} documentation pages`);
    urls.forEach((url, index) => {
      console.error(`   ${index + 1}. ${url}`);
    });

    try {
      const crawlResults = await this.crawlApp.crawlPage({
        targets: urls,
        maxRetry: 2,
        intervalTime: { max: delayMs + 500, min: delayMs },
        fingerprint: {
          mobile: false,
          platform: 'win32',
          acceptLanguage: 'en-US,en;q=0.9',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 llmstxt-generator/1.0'
        }
      });

      console.error(`📊 [X-CRAWL] Crawl completed. Processing ${crawlResults.length} results...`);

      const results: CrawlResult[] = crawlResults.map((result: XCrawlPageResult, index: number) => {
        const url = urls[index];
        
        if (result.isSuccess && result.data) {
          const { title, content, html } = this.extractDocumentationData(result.data, url);
          const contentLength = content.length;
          
          console.error(`✅ [X-CRAWL] Success: ${title} (${contentLength} chars)`);
          
          return {
            url,
            success: true,
            title,
            content,
            markdown: content, // Will be processed by content extractor
            timestamp: new Date().toISOString(),
            error: undefined
          };
        } else {
          const errorMsg = result.data?.message || result.message || 'Unknown crawl error';
          console.error(`❌ [X-CRAWL] Failed: ${url} - ${errorMsg}`);
          
          return {
            url,
            success: false,
            title: undefined,
            content: undefined,
            timestamp: new Date().toISOString(),
            error: errorMsg
          };
        }
      });

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      console.error(`🎯 [X-CRAWL] Results: ${successCount} successful, ${failCount} failed`);
      
      return results;
    } catch (error) {
      console.error('❌ [X-CRAWL] Crawl operation failed:', error);
      throw error;
    }
  }  /**
   * Extract documentation-specific data from crawl results
   */
  private extractDocumentationData(data: any, url: string): { title: string; content: string; html: string } {
    if (!data) return { title: 'Unknown', content: '', html: '' };
    
    let html = '';
    let title = 'Unknown Page';
    
    // Handle different x-crawl response formats (based on your proven patterns)
    if (typeof data === 'string') {
      html = data;
    } else if (data.html && typeof data.html === 'string') {
      html = data.html;
    } else if (data.content && typeof data.content === 'string') {
      html = data.content;
    } else if (data.text && typeof data.text === 'string') {
      html = data.text;
    }
    
    // Use cheerio for better HTML parsing (documentation-specific)
    const $ = load(html);
    
    // Extract title using multiple strategies
    title = $('h1').first().text().trim() || 
            $('title').text().trim() || 
            $('.title').first().text().trim() ||
            $('[class*="title"]').first().text().trim() ||
            'Untitled Page';
    
    // Remove script and style tags
    $('script').remove();
    $('style').remove();
    $('noscript').remove();
    
    // Remove common navigation elements (documentation-specific)
    $('nav').remove();
    $('.navigation').remove();
    $('.nav').remove();
    $('.sidebar').remove();
    $('.header').remove();
    $('.footer').remove();
    $('[class*="nav"]').remove();
    $('[class*="menu"]').remove();
    $('[role="navigation"]').remove();
    
    // Extract main content - prioritize documentation content areas
    let content = '';
    const contentSelectors = [
      'main',
      '.content',
      '#content',
      '.main-content',
      '.documentation',
      '.docs',
      '.markdown-body',
      'article',
      '.article',
      '.post-content'
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        if (content.length > 100) { // Only use if substantial content
          break;
        }
      }
    }
    
    // Fallback to body content if no main content found
    if (!content) {
      content = $('body').text().trim();
    }
    
    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();
    
    return { title, content, html };
  }  /**
   * Discover URLs from sitemap.xml
   */
  private async discoverFromSitemap(baseUrl: string): Promise<string[]> {
    const urls: string[] = [];
    
    try {
      const baseUrlObj = new URL(baseUrl);
      const sitemapUrls = [
        `${baseUrlObj.origin}/sitemap.xml`,
        `${baseUrlObj.origin}/sitemap_index.xml`,
        `${baseUrl}/sitemap.xml`,
        `${baseUrl.replace(/\/$/, '')}/sitemap.xml`
      ];
      
      for (const sitemapUrl of sitemapUrls) {
        try {
          console.error(`🗺️ [SITEMAP] Checking: ${sitemapUrl}`);
          const result = await this.crawlApp.crawlPage({
            targets: sitemapUrl,
            maxRetry: 1,
            timeout: 10000
          });
          
          if (result && result[0]?.isSuccess && result[0]?.data) {
            const $ = load(result[0].data.html || result[0].data.content || result[0].data);
            
            $('url loc, loc').each((_, element) => {
              const url = $(element).text().trim();
              if (url && this.isDocumentationUrl(url, baseUrl)) {
                urls.push(url);
              }
            });
            
            if (urls.length > 0) {
              console.error(`✅ [SITEMAP] Found ${urls.length} URLs in sitemap`);
              break; // Found a working sitemap
            }
          }
        } catch (error) {
          console.error(`⚠️ [SITEMAP] Failed to fetch ${sitemapUrl}:`, error);
        }
      }
    } catch (error) {
      console.error(`❌ [SITEMAP] Sitemap discovery failed:`, error);
    }
    
    return urls;
  }

  /**
   * Discover URLs from navigation analysis
   */
  private async discoverFromNavigation(baseUrl: string, maxDepth: number): Promise<string[]> {
    const urls = new Set<string>([baseUrl]);
    const visited = new Set<string>();
    let currentDepth = 0;
    
    console.error(`🧭 [NAVIGATION] Starting navigation discovery from: ${baseUrl}`);
    
    const toVisit = [{ url: baseUrl, depth: 0 }];
    
    while (toVisit.length > 0 && currentDepth <= maxDepth) {
      const batch = toVisit.splice(0, 10); // Process in batches of 10
      
      for (const { url, depth } of batch) {
        if (visited.has(url) || depth > maxDepth) continue;
        
        visited.add(url);
        currentDepth = Math.max(currentDepth, depth);
        
        try {
          const result = await this.crawlApp.crawlPage({
            targets: url,
            maxRetry: 1,
            timeout: 15000
          });
          
          if (result && result[0]?.isSuccess && result[0]?.data) {
            const links = this.extractDocumentationLinks(result[0].data, baseUrl);
            
            links.forEach(link => {
              if (!visited.has(link) && this.isDocumentationUrl(link, baseUrl)) {
                urls.add(link);
                if (depth < maxDepth) {
                  toVisit.push({ url: link, depth: depth + 1 });
                }
              }
            });
          }
        } catch (error) {
          console.error(`⚠️ [NAVIGATION] Failed to crawl ${url}:`, error);
        }
      }
    }
    
    console.error(`🧭 [NAVIGATION] Discovered ${urls.size} URLs via navigation (depth: ${currentDepth})`);
    return Array.from(urls);
  }  /**
   * Extract documentation links from HTML content
   */
  private extractDocumentationLinks(data: any, baseUrl: string): string[] {
    const links: string[] = [];
    
    try {
      const html = data.html || data.content || data.text || data;
      const $ = load(html);
      const baseUrlObj = new URL(baseUrl);
      
      // Look for links in documentation-specific areas
      const linkSelectors = [
        'nav a',
        '.navigation a',
        '.sidebar a',
        '.menu a',
        '.docs-nav a',
        '.toc a',
        '.table-of-contents a',
        'main a',
        '.content a',
        'article a',
        '[class*="nav"] a',
        '[role="navigation"] a'
      ];
      
      linkSelectors.forEach(selector => {
        $(selector).each((_, element) => {
          const href = $(element).attr('href');
          if (href) {
            try {
              const absoluteUrl = new URL(href, baseUrl).toString();
              if (this.isDocumentationUrl(absoluteUrl, baseUrl)) {
                links.push(absoluteUrl);
              }
            } catch {
              // Invalid URL, skip
            }
          }
        });
      });
      
    } catch (error) {
      console.error('⚠️ [LINK-EXTRACTION] Failed to extract links:', error);
    }
    
    return [...new Set(links)]; // Remove duplicates
  }

  /**
   * Check if URL is likely a documentation page
   */
  private isDocumentationUrl(url: string, baseUrl: string): boolean {
    try {
      const urlObj = new URL(url);
      const baseUrlObj = new URL(baseUrl);
      
      // Must be same domain
      if (urlObj.hostname !== baseUrlObj.hostname) return false;
      
      // Skip common non-documentation patterns
      const skipPatterns = [
        /\.(css|js|json|xml|txt|pdf|zip|tar|gz)$/i,
        /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i,
        /\/(api|login|register|auth|admin)/i,
        /#/,
        /mailto:/,
        /tel:/
      ];
      
      if (skipPatterns.some(pattern => pattern.test(url))) {
        return false;
      }
      
      // Prefer documentation-like patterns
      const docPatterns = [
        /\/(docs|documentation|guide|tutorial|help|manual|wiki)/i,
        /\/(getting-started|quickstart|setup|install)/i,
        /\/(api|reference|examples)/i
      ];
      
      return docPatterns.some(pattern => pattern.test(url)) || url.startsWith(baseUrl);
      
    } catch {
      return false;
    }
  }  /**
   * Crawl a single page for preview purposes
   */
  async crawlSinglePage(url: string): Promise<CrawlResult> {
    await this.ensureInitialized();
    
    console.error(`🔍 [PREVIEW] Crawling single page: ${url}`);
    
    try {
      const result = await this.crawlApp.crawlPage({
        targets: url,
        maxRetry: 2,
        timeout: 15000
      });
      
      if (result && result[0]?.isSuccess && result[0]?.data) {
        const { title, content, html } = this.extractDocumentationData(result[0].data, url);
        
        console.error(`✅ [PREVIEW] Successfully crawled: ${title}`);
        
        return {
          url,
          success: true,
          title,
          content,
          markdown: content,
          timestamp: new Date().toISOString()
        };
      } else {
        const errorMsg = result[0]?.message || 'Failed to crawl page';
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      console.error(`❌ [PREVIEW] Failed to crawl ${url}:`, error);
      
      return {
        url,
        success: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Health check for the crawler service
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      return this.initialized && !!this.crawlApp;
    } catch (error) {
      console.error('❌ Crawler health check failed:', error);
      return false;
    }
  }

  /**
   * Ensure the service is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.initialized && !!this.crawlApp;
  }
}