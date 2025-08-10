/**
 * Crawler Service - Based on proven x-crawl patterns
 * Handles web scraping with documentation-specific enhancements
 */

import { createCrawl, createCrawlOpenAI, createCrawlOllama } from 'x-crawl';
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
      this.crawlApp = createCrawl({
        maxRetry: 3,
        intervalTime: 2000,
      });

      // Initialize OpenAI crawler if API key is available
      if (process.env.OPENAI_API_KEY) {
        try {
          this.crawlOpenAIApp = createCrawlOpenAI({
            clientOptions: {
              apiKey: process.env.OPENAI_API_KEY,
            },
            defaultModel: {
              chatModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            },
          });
          console.error('✅ OpenAI crawler initialized with API key');
        } catch (error) {
          console.error('⚠️ Failed to initialize OpenAI crawler:', error);
        }
      } else {
        console.error('ℹ️ OpenAI API key not found, x-crawl initialized without OpenAI support');
      }

      // Initialize Ollama crawler if available
      if (process.env.OLLAMA_API_KEY || process.env.OLLAMA_BASE_URL) {
        try {
          const ollamaOptions: any = {};

          if (process.env.OLLAMA_API_KEY) {
            ollamaOptions.apiKey = process.env.OLLAMA_API_KEY;
          }

          if (process.env.OLLAMA_BASE_URL) {
            ollamaOptions.baseURL = process.env.OLLAMA_BASE_URL;
          }

          // Note: createCrawlOllama might need different configuration
          // This is a placeholder - adjust based on x-crawl's actual Ollama API
          console.error('ℹ️ Ollama configuration detected but not implemented yet');
          console.error(`   Base URL: ${process.env.OLLAMA_BASE_URL || 'default'}`);
          console.error(`   Model: ${process.env.OLLAMA_MODEL || 'default'}`);
        } catch (error) {
          console.error('⚠️ Failed to initialize Ollama crawler:', error);
        }
      } else {
        console.error('ℹ️ Ollama configuration not found, x-crawl initialized without Ollama support');
      }

      this.initialized = true;
      console.error('✅ Documentation crawler service initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize x-crawl for documentation:', error);
      throw error;
    }
  }

  /**
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

    const { maxPages = 50, maxDepth = 3, delayMs = 1000 } = options;

    console.error(`🕷️ [DOC-CRAWL] Starting documentation crawl: ${url}`);
    console.error(`📋 [DOC-CRAWL] Parameters: maxPages=${maxPages}, maxDepth=${maxDepth}, delay=${delayMs}ms`);

    try {
      // If maxDepth is 0 or 1, just crawl the single page
      if (maxDepth <= 1) {
        console.error(`🔍 [DOC-CRAWL] Single page mode (maxDepth=${maxDepth})`);
        const baseResult = await this.crawlSinglePage(url);
        if (baseResult.success) {
          return [baseResult];
        } else {
          throw new Error('Single page crawl failed');
        }
      }

      // For recursive crawling, discover URLs first
      console.error(`🔍 [DOC-CRAWL] Recursive mode (maxDepth=${maxDepth}), discovering URLs...`);
      const urlsToCrawl = await this.discoverDocumentationUrls(url, options);

      if (urlsToCrawl.length === 0) {
        console.error('⚠️ [DOC-CRAWL] No URLs discovered via sitemap/navigation, falling back to base URL');
        // Fallback: just crawl the base URL if discovery fails
        const baseResult = await this.crawlSinglePage(url);
        if (baseResult.success) {
          return [baseResult];
        } else {
          throw new Error('No documentation URLs discovered and base URL crawl failed');
        }
      }

      console.error(`📋 [DOC-CRAWL] Found ${urlsToCrawl.length} URLs, crawling up to ${maxPages}...`);
      
      // Step 2: Crawl all discovered URLs using your proven x-crawl patterns
      const crawlResults = await this.crawlMultiplePages(urlsToCrawl.slice(0, maxPages), delayMs);

      console.error('🎉 [DOC-CRAWL] Documentation crawl completed successfully!');
      console.error(`📊 [DOC-CRAWL] Results: ${crawlResults.length} pages processed`);

      return crawlResults;

    } catch (error) {
      console.error(`❌ [DOC-CRAWL] Documentation crawl failed for: ${url}`, error);
      throw error;
    }
  }

  /**
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
        intervalTime: delayMs,
        fingerprint: {
          mobile: false,
          platform: 'win32',
          acceptLanguage: 'en-US,en;q=0.9',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 context-generator/1.0',
        },
      });

      console.error(`📊 [X-CRAWL] Crawl completed. Processing ${crawlResults.length} results...`);

      const results: CrawlResult[] = [];
      
      for (let index = 0; index < crawlResults.length; index++) {
        const result = crawlResults[index];
        const url = urls[index];

        if (result.isSuccess && result.data) {
          const { title, content, html } = await this.extractDocumentationData(result.data, url);
          const contentLength = content.length;

          console.error(`✅ [X-CRAWL] Success: ${title} (${contentLength} chars)`);

          results.push({
            url,
            success: true,
            title,
            content,
            markdown: content, // Will be processed by content extractor
            timestamp: new Date().toISOString(),
            error: undefined,
          });
        } else {
          const errorMsg = result.data?.message || result.message || 'Unknown crawl error';
          console.error(`❌ [X-CRAWL] Failed: ${url} - ${errorMsg}`);

          results.push({
            url,
            success: false,
            title: undefined,
            content: undefined,
            timestamp: new Date().toISOString(),
            error: errorMsg,
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      console.error(`🎯 [X-CRAWL] Results: ${successCount} successful, ${failCount} failed`);

      return results;
    } catch (error) {
      console.error('❌ [X-CRAWL] Crawl operation failed:', error);
      throw error;
    }
  }

  /**
   * Extract documentation-specific data from crawl results
   */
  private async extractDocumentationData(data: any, url: string): Promise<{ title: string; content: string; html: string }> {
    if (!data) return { title: 'Unknown', content: '', html: '' };

    let html = '';
    let title = 'Unknown Page';

    // Use the enhanced extraction method to get content from x-crawl structure
    const extractedContent = await this.extractContent(data);
    if (extractedContent) {
      html = extractedContent;
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
      '.post-content',
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
  }

  /**
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
        `${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
      ];

      for (const sitemapUrl of sitemapUrls) {
        try {
          console.error(`🗺️ [SITEMAP] Checking: ${sitemapUrl}`);
          const result = await this.crawlApp.crawlPage({
            targets: sitemapUrl,
            maxRetry: 1,
            timeout: 10000,
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
      console.error('❌ [SITEMAP] Sitemap discovery failed:', error);
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
            timeout: 15000,
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
  }

  /**
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
        '[role="navigation"] a',
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
        /tel:/,
      ];

      if (skipPatterns.some(pattern => pattern.test(url))) {
        return false;
      }

      // Prefer documentation-like patterns
      const docPatterns = [
        /\/(docs|documentation|guide|tutorial|help|manual|wiki)/i,
        /\/(getting-started|quickstart|setup|install)/i,
        /\/(api|reference|examples)/i,
      ];

      return docPatterns.some(pattern => pattern.test(url)) || url.startsWith(baseUrl);

    } catch {
      return false;
    }
  }

  /**
   * Simple crawl page method (similar to working CourseCrafter implementation)
   */
  async crawlPage(url: string, options: any = {}): Promise<CrawlResult> {
    if (!this.initialized) {
      throw new Error('CrawlerService not initialized. Call initialize() first.');
    }

    try {
      console.error(`🕷️ Crawling page: ${url}`);

      const result = await this.crawlApp.crawlPage({
        targets: url,
        ...options,
      });

      console.error('🔍 Raw crawl result structure:', {
        hasResult: !!result,
        isArray: Array.isArray(result),
        resultKeys: result ? Object.keys(result) : [],
        firstItemKeys: result && result[0] ? Object.keys(result[0]) : [],
      });

      // Handle x-crawl result format (similar to working CourseCrafter implementation)
      let crawlData = null;

      if (Array.isArray(result) && result.length > 0) {
        // x-crawl returns array of results for multiple targets
        const firstResult = result[0];
        if (firstResult && firstResult.data) {
          crawlData = firstResult.data;
        }
      } else if (result && result.data) {
        // Single result format
        crawlData = result.data;
      }

      if (crawlData) {
        console.error(`✅ Successfully crawled: ${url}`);

        // Debug: Log the actual data structure
        console.error('🔍 Data object keys:', Object.keys(crawlData));
        console.error('🔍 Data object type:', typeof crawlData);
        if (typeof crawlData === 'object') {
          console.error('🔍 First few keys and their types:');
          Object.keys(crawlData).slice(0, 10).forEach(key => {
            const value = crawlData[key];
            console.error(`  ${key}: ${typeof value} (length: ${typeof value === 'string' ? value.length : 'N/A'})`);
          });
        }

        // Extract content using the working approach
        const content = await this.extractContent(crawlData);

        return {
          success: true,
          content: content,
          url: url,
          title: this.extractTitle(crawlData),
          timestamp: new Date().toISOString(),
        };
      } else {
        console.error(`❌ No valid data in crawl result for ${url}`);
        throw new Error('No data returned from crawl');
      }

    } catch (error) {
      console.error(`❌ Failed to crawl ${url}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        url: url,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Extract content using proven CourseCrafter approach
   */
  private async extractContent(data: any): Promise<string> {
    if (!data) return '';

    console.error('🔍 [EXTRACT] Data object keys:', Object.keys(data));
    console.error('🔍 [EXTRACT] Data structure:', {
      hasPage: !!data.page,
      hasResponse: !!data.response,
      hasBrowser: !!data.browser,
      hasHtml: !!data.html,
      hasText: !!data.text,
      hasContent: !!data.content,
    });

    // Handle different x-crawl response formats (exactly like CourseCrafter)
    if (typeof data === 'string') {
      console.error('📝 [EXTRACT] Using string data directly');
      return data;
    }

    // If data has a text property
    if (data.text && typeof data.text === 'string') {
      console.error('📝 [EXTRACT] Using data.text');
      return data.text;
    }

    // If data has content property
    if (data.content && typeof data.content === 'string') {
      console.error('📝 [EXTRACT] Using data.content');
      return data.content;
    }

    // If data has html property, extract text from it
    if (data.html && typeof data.html === 'string') {
      console.error('📝 [EXTRACT] Using data.html and converting to text');
      // Basic HTML to text conversion (exactly like CourseCrafter)
      return data.html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    }

    // If data has a body or main content area
    if (data.body) {
      console.error('📝 [EXTRACT] Recursively extracting from data.body');
      return this.extractContent(data.body);
    }

    // If it's an object, try to extract meaningful text
    if (typeof data === 'object') {
      console.error('📝 [EXTRACT] Trying common content properties...');
      // Look for common content properties (exactly like CourseCrafter)
      const contentProps = ['innerText', 'textContent', 'text', 'content', 'body'];
      for (const prop of contentProps) {
        if (data[prop] && typeof data[prop] === 'string') {
          console.error(`📝 [EXTRACT] Using data.${prop}`);
          return data[prop];
        }
      }

      // Special handling for x-crawl page responses
      // x-crawl returns structure with page, response, browser objects
      if (data.page) {
        console.error('📝 [EXTRACT] Found data.page object, exploring...');
        
        // Log page object keys for debugging
        if (typeof data.page === 'object') {
          console.error('📝 [EXTRACT] Page object keys:', Object.keys(data.page));
          
          // Common x-crawl page properties to check
          const pageProps = ['html', 'content', 'text', '$', 'evaluate', 'title'];
          for (const prop of pageProps) {
            if (data.page[prop]) {
              console.error(`📝 [EXTRACT] Page has ${prop}: ${typeof data.page[prop]}`);
              
              if (typeof data.page[prop] === 'string') {
                console.error(`📝 [EXTRACT] Using data.page.${prop}`);
                return data.page[prop];
              }
            }
          }
          
          // Try to call page.html() if it's a function (some x-crawl versions)
          if (typeof data.page.html === 'function') {
            try {
              console.error('📝 [EXTRACT] Calling data.page.html() method');
              const htmlContent = await data.page.html();
              if (typeof htmlContent === 'string') {
                return htmlContent;
              }
            } catch (error) {
              console.error('⚠️ [EXTRACT] Failed to call page.html():', error);
            }
          }
          
          // Try to call page.content() if it's a function (some x-crawl versions)
          if (typeof data.page.content === 'function') {
            try {
              console.error('📝 [EXTRACT] Calling data.page.content() method');
              const textContent = await data.page.content();
              if (typeof textContent === 'string') {
                return textContent;
              }
            } catch (error) {
              console.error('⚠️ [EXTRACT] Failed to call page.content():', error);
            }
          }
          
          // Recursively extract from page object
          const pageContent = await this.extractContent(data.page);
          if (pageContent) {
            return pageContent;
          }
        }
      }

      if (data.response) {
        console.error('📝 [EXTRACT] Found data.response object, exploring...');
        
        if (typeof data.response === 'object' && data.response.data) {
          console.error('📝 [EXTRACT] Using data.response.data');
          return this.extractContent(data.response.data);
        }
        
        // Check for other response properties
        const responseProps = ['html', 'content', 'text', 'body'];
        for (const prop of responseProps) {
          if (data.response[prop] && typeof data.response[prop] === 'string') {
            console.error(`📝 [EXTRACT] Using data.response.${prop}`);
            return data.response[prop];
          }
        }
      }

      // If no direct content found, stringify the object but with better formatting
      console.error('⚠️ [EXTRACT] No content found, stringifying object (might be debugging data)');
      try {
        const stringified = JSON.stringify(data, null, 2);
        // If it's a very short object (likely just debugging info), return empty
        if (stringified.length < 200) {
          console.error('⚠️ [EXTRACT] Object too small, likely debugging info - returning empty');
          return '';
        }
        return stringified;
      } catch {
        return String(data);
      }
    }

    // Fallback to string conversion
    console.error('⚠️ [EXTRACT] Fallback to string conversion');
    return String(data);
  }

  /**
   * Extract title from crawl data
   */
  private extractTitle(data: any): string | undefined {
    if (!data) return undefined;

    if (data.title) return data.title;
    if (data.pageTitle) return data.pageTitle;

    // Try to extract from HTML
    if (data.html) {
      const $ = load(data.html);
      const title = $('title').text().trim() || $('h1').first().text().trim();
      if (title) return title;
    }

    return undefined;
  }

  /**
   * Crawl a single page for preview purposes
   */
  async crawlSinglePage(url: string): Promise<CrawlResult> {
    await this.ensureInitialized();

    console.error(`🔍 [PREVIEW] Crawling single page: ${url}`);

    try {
      // Use the simple crawlPage method
      const result = await this.crawlPage(url, {
        maxRetry: 2,
        timeout: 15000,
      });

      if (result.success && result.content) {
        console.error(`✅ [PREVIEW] Successfully crawled: ${result.title || 'Untitled'}`);

        return {
          url,
          success: true,
          title: result.title,
          content: result.content,
          markdown: result.content,
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error(result.error || 'Failed to crawl page');
      }

    } catch (error) {
      console.error(`❌ [PREVIEW] Failed to crawl ${url}:`, error);

      return {
        url,
        success: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
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
