/**
 * Content Extractor Service
 * Extracts clean content while preserving formatting
 * Works with platform detection for optimal extraction
 */

import { load } from 'cheerio';
import TurndownService from 'turndown';
import type { ExtractedContent, DocumentationPlatform } from '../types/index.js';
import { cleanTextContent } from '../utils/index.js';

export class ContentExtractorService {
  private turndownService: TurndownService;

  constructor() {
    // Initialize markdown converter with documentation-optimized settings
    this.turndownService = new TurndownService({
      headingStyle: 'atx', // Use # headers
      codeBlockStyle: 'fenced', // Use ``` code blocks
      fence: '```', // Standard code fence
      bulletListMarker: '-', // Use - for lists
      strongDelimiter: '**', // Use ** for bold
      emDelimiter: '*', // Use * for italic
    });

    this.setupTurndownRules();
  }

  /**
   * Extract content from HTML with platform-specific optimizations
   */
  async extractContent(
    html: string,
    url: string,
    platform?: DocumentationPlatform,
  ): Promise<ExtractedContent> {
    console.error(`🔍 [CONTENT-EXTRACT] Processing: ${url}`);

    const $ = load(html);

    // Step 1: Clean up HTML (remove unwanted elements)
    this.cleanupHtml($);

    // Step 2: Extract title using multiple strategies
    const title = this.extractTitle($, platform);

    // Step 3: Extract main content using platform-specific selectors
    const contentHtml = this.extractMainContent($, platform);

    // Step 4: Convert to clean markdown
    const markdown = this.convertToMarkdown(contentHtml);

    // Step 5: Extract additional metadata
    const links = this.extractLinks($, url);
    const headings = this.extractHeadings($);
    const codeBlocks = this.extractCodeBlocks(markdown);

    // Step 6: Generate clean text content
    const content = this.generateCleanTextContent(markdown);

    console.error(`✅ [CONTENT-EXTRACT] Extracted: "${title}" (${content.length} chars, ${headings.length} headings, ${codeBlocks.length} code blocks)`);

    return {
      title,
      content,
      markdown,
      url,
      links,
      headings,
      codeBlocks,
    };
  }

  /**
   * Setup custom Turndown rules for better documentation conversion
   */
  private setupTurndownRules(): void {
    // Preserve code blocks with language detection
    this.turndownService.addRule('codeBlock', {
      filter: ['pre'],
      replacement: (content, node) => {
        const codeElement = node.querySelector('code');
        const language = codeElement?.className.match(/language-(\w+)/)?.[1] || '';
        const code = codeElement?.textContent || content;
        return `\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
      },
    });

    // Preserve inline code
    this.turndownService.addRule('inlineCode', {
      filter: ['code'],
      replacement: (content) => `\`${content}\``,
    });

    // Handle tables better
    this.turndownService.addRule('table', {
      filter: 'table',
      replacement: (content, node) => {
        const element = node as any;
        const $ = load(`<div>${element.outerHTML}</div>`);
        const rows = $('tr').map((_, row) => {
          const cells = $(row).find('td, th').map((_, cell) => {
            return $(cell).text().trim();
          }).get();
          return `| ${cells.join(' | ')} |`;
        }).get();

        if (rows.length > 0) {
          // Add header separator if first row contains th elements
          const hasHeader = $('tr:first th').length > 0;
          if (hasHeader && rows.length > 1) {
            const separator = `| ${$('tr:first th').map(() => '---').get().join(' | ')} |`;
            rows.splice(1, 0, separator);
          }
          return `\n\n${rows.join('\n')}\n\n`;
        }
        return content;
      },
    });

    // Handle blockquotes
    this.turndownService.addRule('blockquote', {
      filter: 'blockquote',
      replacement: (content) => {
        const lines = content.trim().split('\n');
        return `\n\n${lines.map(line => `> ${line}`).join('\n')}\n\n`;
      },
    });

    // Handle alerts/callouts (common in documentation)
    this.turndownService.addRule('alerts', {
      filter: (node) => {
        const element = node as any;
        const classList = element.classList || [];
        return ['alert', 'callout', 'admonition', 'note', 'warning', 'tip'].some(cls =>
          Array.from(classList).some((c: any) => c.includes && c.includes(cls)),
        );
      },
      replacement: (content, node) => {
        const element = node as any;
        const classList = Array.from(element.classList || []);
        const alertType = classList.find((cls: any) =>
          ['alert', 'callout', 'admonition', 'note', 'warning', 'tip', 'info'].some(type => cls && cls.includes && cls.includes(type)),
        ) || 'note';

        return `\n\n> **${(alertType as string).toUpperCase()}**: ${content.trim()}\n\n`;
      },
    });
  }
  /**
   * Clean up HTML by removing unwanted elements
   */
  private cleanupHtml($: any): void {
    // Remove scripts, styles, and other non-content elements
    $('script, style, noscript').remove();

    // Remove common navigation elements
    $('nav, header, footer').remove();
    $('.navigation, .nav, .navbar, .header, .footer').remove();
    $('.menu, .sidebar, .toc, .breadcrumb').remove();
    $('[role="navigation"], [role="banner"], [role="complementary"]').remove();

    // Remove ads and tracking elements
    $('.advertisement, .ads, .ad, .sponsored').remove();
    $('.tracking, .analytics, .social-share').remove();
    $('[class*="ad-"], [class*="ads-"], [id*="ad-"], [id*="ads-"]').remove();

    // Remove edit/contribution links common in documentation
    $('.edit-page, .edit-link, .edit-on-github').remove();
    $('.contribute, .feedback, .improve-page').remove();
    $('a[href*="edit"], a[href*="github.com"][href*="edit"]').remove();

    // Remove "back to top" and similar navigation aids
    $('.back-to-top, .scroll-to-top, .goto-top').remove();

    // Remove version/branch selectors common in docs
    $('.version-selector, .branch-selector').remove();

    // Remove search boxes and filters
    $('.search-box, .filter, .search-input').remove();
    $('input[type="search"], input[placeholder*="Search"]').remove();

    // Remove empty elements that might cause issues
    $(':empty').not('br, hr, img, input, textarea, area, base, col, embed, link, meta, param, source, track, wbr').remove();

    console.error('🧹 [CLEANUP] Removed navigation, ads, and unwanted elements');
  }

  /**
   * Extract title using multiple strategies with platform awareness
   */
  private extractTitle($: any, platform?: DocumentationPlatform): string {
    // Platform-specific title selectors
    const platformSelectors = platform ? [platform.selectors.title] : [];

    // Common title selectors (in order of preference)
    const titleSelectors = [
      ...platformSelectors,
      'h1:first',
      '.page-title',
      '.doc-title',
      '.title',
      '.article-title',
      'h1',
      'title',
      '[class*="title"]:first',
      '.content h1:first',
      'main h1:first',
    ];

    for (const selector of titleSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        const title = element.text().trim();
        if (title && title.length > 0 && title.length < 200) {
          console.error(`📋 [TITLE] Extracted via ${selector}: "${title}"`);
          return title;
        }
      }
    }

    // Fallback: try to extract from URL
    const urlTitle = this.extractTitleFromUrl($('base').attr('href') || '');
    return urlTitle || 'Untitled Page';
  }
  /**
   * Extract main content using platform-specific selectors
   */
  private extractMainContent($: any, platform?: DocumentationPlatform): string {
    // Platform-specific content selectors
    const platformSelectors = platform ? [platform.selectors.content] : [];

    // Common content selectors (in order of preference)
    const contentSelectors = [
      ...platformSelectors,
      'main',
      '[role="main"]',
      '.content',
      '.main-content',
      '.page-content',
      '.document',
      '.article',
      '.post',
      '.markdown',
      '.rst-content',
      '.wiki-content',
      '#content',
      '.container .row .col',
      'body',
    ];

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        const html = element.html();
        if (html && html.trim().length > 100) { // Minimum content threshold
          console.error(`🎯 [CONTENT] Extracted via ${selector} (${html.length} chars)`);
          return html;
        }
      }
    }

    // Fallback: try to find the largest text container
    let largestElement = null;
    let largestSize = 0;

    $('div, article, section, main').each((_, elem) => {
      const text = $(elem).text().trim();
      if (text.length > largestSize && text.length > 200) {
        largestSize = text.length;
        largestElement = elem;
      }
    });

    if (largestElement) {
      console.error(`🎯 [CONTENT] Extracted largest container (${largestSize} chars)`);
      return $(largestElement).html() || '';
    }

    console.error('⚠️ [CONTENT] No suitable content container found, using body');
    return $('body').html() || '';
  }
  /**
   * Convert HTML content to clean markdown
   */
  private convertToMarkdown(html: string): string {
    try {
      // Clean up HTML before conversion
      const $ = load(html);

      // Remove any remaining unwanted elements
      $('.sidebar, .navigation, .menu, .toc').remove();

      const cleanHtml = $.html();
      const markdown = this.turndownService.turndown(cleanHtml);

      // Post-process markdown to clean up formatting
      return this.cleanMarkdown(markdown);
    } catch (error) {
      console.error('❌ [MARKDOWN] Conversion failed:', error);
      // Fallback: extract text content
      const $ = load(html);
      return $('body').text()?.trim() || '';
    }
  }

  /**
   * Clean up markdown formatting
   */
  private cleanMarkdown(markdown: string): string {
    return markdown
      // Remove excessive whitespace
      .replace(/\n{4,}/g, '\n\n\n')
      // Clean up list formatting
      .replace(/^\s*-\s*$/gm, '')
      // Remove empty links
      .replace(/\[\]\([^)]*\)/g, '')
      // Clean up table formatting
      .replace(/\|\s*\|/g, '|')
      // Remove excessive spaces in headers
      .replace(/(#{1,6})\s+/g, '$1 ')
      .trim();
  }
  /**
   * Extract links from the page
   */
  private extractLinks($: any, baseUrl: string): string[] {
    const links: string[] = [];

    $('a[href]').each((_, elem) => {
      const href = $(elem).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          if (!links.includes(absoluteUrl)) {
            links.push(absoluteUrl);
          }
        } catch {
          // Invalid URL, skip
        }
      }
    });

    console.error(`🔗 [LINKS] Extracted ${links.length} unique links`);
    return links;
  }

  /**
   * Extract heading structure from the page
   */
  private extractHeadings($: any): Array<{ level: number; text: string; id?: string }> {
    const headings: Array<{ level: number; text: string; id?: string }> = [];

    $('h1, h2, h3, h4, h5, h6').each((_, elem) => {
      const tagName = elem.tagName.toLowerCase();
      const level = parseInt(tagName.charAt(1));
      const text = $(elem).text().trim();
      const id = $(elem).attr('id');

      if (text && text.length > 0) {
        headings.push({ level, text, id });
      }
    });

    console.error(`📑 [HEADINGS] Extracted ${headings.length} headings`);
    return headings;
  }
  /**
   * Extract code blocks from markdown content
   */
  private extractCodeBlocks(markdown: string): Array<{ language: string; code: string }> {
    const codeBlocks: Array<{ language: string; code: string }> = [];
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;

    let match;
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      const language = match[1] || 'text';
      const code = match[2].trim();
      if (code.length > 0) {
        codeBlocks.push({ language, code });
      }
    }

    console.error(`💻 [CODE] Extracted ${codeBlocks.length} code blocks`);
    return codeBlocks;
  }

  /**
   * Generate clean text content from markdown
   */
  private generateCleanTextContent(markdown: string): string {
    // Remove markdown formatting while preserving structure
    return markdown
      // Remove code blocks but keep a placeholder
      .replace(/```[\s\S]*?```/g, '[CODE_BLOCK]')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '[IMAGE: $1]')
      // Convert headers to plain text
      .replace(/^#{1,6}\s+(.+)$/gm, '$1')
      // Remove emphasis
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      // Clean up whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  /**
   * Extract title from URL as fallback
   */
  private extractTitleFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;

      // Extract the last meaningful segment
      const segments = pathname.split('/').filter(s => s.length > 0);
      const lastSegment = segments[segments.length - 1];

      if (lastSegment && lastSegment !== 'index' && lastSegment !== 'index.html') {
        // Convert kebab-case and snake_case to title case
        return lastSegment
          .replace(/[-_]/g, ' ')
          .replace(/\.html?$/, '')
          .replace(/\b\w/g, l => l.toUpperCase());
      }

      // Use the second-to-last segment if last is generic
      if (segments.length > 1) {
        const secondLast = segments[segments.length - 2];
        return secondLast
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
      }

      return parsedUrl.hostname.replace(/^www\./, '');
    } catch {
      return 'Unknown Page';
    }
  }

  /**
   * Check if content is likely to be meaningful documentation
   */
  isValidContent(content: ExtractedContent): boolean {
    // Basic quality checks
    if (!content.content || content.content.length < 50) {
      console.error('❌ [VALIDATION] Content too short');
      return false;
    }

    if (!content.title || content.title === 'Untitled Page') {
      console.error('⚠️ [VALIDATION] No meaningful title found');
    }

    // Check for common spam indicators
    const spamIndicators = [
      /error\s*404/i,
      /page\s*not\s*found/i,
      /access\s*denied/i,
      /forbidden/i,
      /under\s*construction/i,
    ];

    const hasSpam = spamIndicators.some(pattern =>
      pattern.test(content.content) || pattern.test(content.title),
    );

    if (hasSpam) {
      console.error('❌ [VALIDATION] Content appears to be error page or spam');
      return false;
    }

    console.error('✅ [VALIDATION] Content appears valid');
    return true;
  }
}
