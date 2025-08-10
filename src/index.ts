#!/usr/bin/env node
/**
 * context-generator MCP Server
 * 
 * An MCP server that scrapes documentation websites and generates context files.
 * Based on proven x-crawl patterns for reliable web scraping.
 * 
 * Made with ❤️ by Pink Pixel (https://pinkpixel.dev)
 */

// Complete console logging suppression for MCP protocol compatibility
// This ensures no library logs interfere with the MCP communication protocol
const noOp = () => {};
console.log = noOp;
console.warn = noOp;
console.info = noOp;
console.debug = noOp;
console.trace = noOp;

// Environment variables to disable logging in various libraries
process.env.DEBUG = '';
process.env.NODE_DEBUG = '';
process.env.DEBUG_COLORS = 'no';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.LOG_LEVEL = 'silent';
process.env.SILENT = 'true';
process.env.QUIET = 'true';
process.env.NO_COLOR = 'true';
process.env.DISABLE_LOGGING = 'true';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Import our services
import { CrawlerService } from './services/crawler.js';
import { PlatformDetectorService } from './services/platformDetector.js';
import { ContentExtractorService } from './services/contentExtractor.js';
import { ContextFormatterService } from './services/contextFormatter.js';

// Import types
import type {
  ScrapeDocumentationInput,
  PreviewPageInput,
  DetectPlatformInput,
  GenerateContextInput,
  CrawlOptions,
} from './types/index.js';

class ContextGeneratorServer {
  private server: Server;
  private crawler: CrawlerService;
  private detector: PlatformDetectorService;
  private extractor: ContentExtractorService;
  private formatter: ContextFormatterService;

  constructor() {
    this.server = new Server(
      {
        name: 'context-generator',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize services
    this.crawler = new CrawlerService();
    this.detector = new PlatformDetectorService();
    this.extractor = new ContentExtractorService();
    this.formatter = new ContextFormatterService();

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'scrape_documentation',
            description: `Scrape a documentation website and extract content for context generation. 

This tool crawls documentation sites recursively, following internal links to gather complete documentation. It automatically saves results to files in the specified directory.

**File Saving:** Results are automatically saved to .txt or .md files (specify via saveFormat). You can specify the output directory via saveDirectory parameter.

**Formats:** 
- 'llms-txt': Compact summary format suitable for LLM context
- 'llms-full-txt': Full detailed format with complete content
- 'both': Saves both formats to separate files

**Recursive Crawling:** Uses maxDepth to follow links recursively through documentation hierarchy. Set maxDepth > 1 to crawl multiple linked pages.`,
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The base URL of the documentation site to scrape',
                },
                options: {
                  type: 'object',
                  description: 'Crawling and saving options',
                  properties: {
                    maxPages: {
                      type: 'number',
                      description: 'Maximum number of pages to crawl recursively (default: 50)',
                    },
                    maxDepth: {
                      type: 'number', 
                      description: 'Maximum crawl depth - how many levels deep to follow links (default: 3, set to 1 for single page)',
                    },
                    outputFormat: {
                      type: 'string',
                      enum: ['llms-txt', 'llms-full-txt', 'both'],
                      description: 'Content format to generate (default: both)',
                    },
                    delayMs: {
                      type: 'number',
                      description: 'Delay between requests in milliseconds (default: 1000)',
                    },
                    saveToFile: {
                      type: 'boolean',
                      description: 'Whether to save results to files (default: true)',
                    },
                    saveDirectory: {
                      type: 'string',
                      description: 'Directory to save files (default: ./output). Use absolute path for reliability.',
                    },
                    saveFormat: {
                      type: 'string',
                      enum: ['txt', 'md'],
                      description: 'File format for saved files: .txt or .md (default: txt)',
                    },
                    filename: {
                      type: 'string',
                      description: 'Base filename (without extension). If not specified, generates from site domain.',
                    },
                  },
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'preview_page',
            description: 'Preview content extraction from a single page',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL of the page to preview',
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'detect_platform',
            description: 'Detect the documentation platform type for a given URL',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL to analyze for platform detection',
                },
              },
              required: ['url'],
            },
          },          {
            name: 'generate_context',
            description: `Generate context format from crawled content and optionally save to files.

This tool formats crawl results into structured context files suitable for LLMs. It supports multiple output formats and automatic file saving with customizable options.

**File Saving:** Results are automatically saved to files (specify saveToFile: false to disable). You can customize the output directory, filename, and file format.

**Formats:**
- 'summary': Compact format optimized for LLM context windows
- 'full': Complete detailed format with all content
- 'both': Generates both summary and full formats`,
            inputSchema: {
              type: 'object',
              properties: {
                crawlResults: {
                  type: 'array',
                  description: 'Array of crawl results to format. Each result should have: url, title, content, success properties.',
                  items: {
                    type: 'object',
                    properties: {
                      url: { type: 'string' },
                      title: { type: 'string' },
                      content: { type: 'string' },
                      success: { type: 'boolean' },
                    },
                  },
                },
                options: {
                  type: 'object',
                  description: 'Formatting and file saving options',
                  properties: {
                    format: {
                      type: 'string',
                      enum: ['summary', 'full', 'both'],
                      description: 'Format type to generate (default: full)',
                    },
                    includeSourceUrls: {
                      type: 'boolean',
                      description: 'Include source URLs in generated content (default: true)',
                    },
                    sectionHeaders: {
                      type: 'boolean',
                      description: 'Include section headers for structure (default: true)',
                    },
                    maxSectionLength: {
                      type: 'number',
                      description: 'Maximum length for content sections (default: 1000)',
                    },
                    saveToFile: {
                      type: 'boolean',
                      description: 'Whether to save results to files (default: true)',
                    },
                    saveDirectory: {
                      type: 'string',
                      description: 'Directory to save files (default: ./output). Use absolute path for reliability.',
                    },
                    saveFormat: {
                      type: 'string',
                      enum: ['txt', 'md'],
                      description: 'File format for saved files: .txt or .md (default: txt)',
                    },
                    filename: {
                      type: 'string',
                      description: 'Base filename (without extension). If not specified, generates from first URL domain.',
                    },
                  },
                },
              },
              required: ['crawlResults'],
            },
          },
        ],
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'scrape_documentation':
            return await this.handleScrapeDocumentation(args as unknown as ScrapeDocumentationInput);
          
          case 'preview_page':
            return await this.handlePreviewPage(args as unknown as PreviewPageInput);
          
          case 'detect_platform':
            return await this.handleDetectPlatform(args as unknown as DetectPlatformInput);
          
          case 'generate_context':
            return await this.handleGenerateContext(args as unknown as GenerateContextInput);
          
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${message}`);
      }
    });
  }

  // Tool handler methods
  private async handleScrapeDocumentation(args: ScrapeDocumentationInput) {
    try {
      console.error(`🚀 [SCRAPE-DOC] Starting documentation scraping for: ${args.url}`);
      console.error(`📋 [SCRAPE-DOC] Options: ${JSON.stringify(args.options || {}, null, 2)}`);
      
      // Initialize crawler service if not already done
      console.error(`🔧 [SCRAPE-DOC] Ensuring crawler service is initialized...`);
      await this.crawler.initialize();
      
      // Check crawler health
      const isHealthy = await this.crawler.healthCheck();
      console.error(`💚 [SCRAPE-DOC] Crawler health check: ${isHealthy ? 'PASS' : 'FAIL'}`);
      
      if (!isHealthy) {
        throw new Error('Crawler service failed health check - x-crawl may not be properly initialized');
      }
      
      const startTime = Date.now();
      const options: CrawlOptions = {
        maxPages: 50,
        maxDepth: 3,
        outputFormat: 'both' as const,
        delayMs: 1000,
        ...args.options
      };
      
      // Step 1: Detect platform for optimization
      console.error(`🔍 [SCRAPE-DOC] Step 1: Detecting platform...`);
      const platform = await this.detector.detectPlatform(args.url);
      console.error(`✅ [SCRAPE-DOC] Detected platform: ${platform.name}`);
      
      // Step 2: Crawl the documentation
      console.error(`🕷️ [SCRAPE-DOC] Step 2: Crawling documentation...`);
      const crawlResults = await this.crawler.crawlDocumentation(args.url, options);
      const successfulResults = crawlResults.filter(r => r.success && r.content);
      
      if (successfulResults.length === 0) {
        throw new Error('No pages were successfully crawled');
      }
      
      console.error(`✅ [SCRAPE-DOC] Crawled ${successfulResults.length} pages successfully`);
      
      // Step 3: Extract and clean content from successful results
      console.error(`🔧 [SCRAPE-DOC] Step 3: Processing content...`);
      const processedResults = [];
      
      for (const result of successfulResults.slice(0, options.maxPages)) {
        try {
          if (result.content) {
            // Use content extractor to clean and structure the content
            const extractedContent = await this.extractor.extractContent(
              result.content, 
              result.url, 
              platform
            );
            
            if (this.extractor.isValidContent(extractedContent)) {
              // Update the crawl result with cleaned content
              result.content = extractedContent.content;
              result.title = extractedContent.title;
              result.markdown = extractedContent.markdown;
              processedResults.push(result);
            }
          }
        } catch (error) {
          console.error(`⚠️ [SCRAPE-DOC] Failed to process ${result.url}: ${error}`);
          // Still include the original result if extraction fails
          if (result.content) {
            processedResults.push(result);
          }
        }
      }
      
      console.error(`✅ [SCRAPE-DOC] Processed ${processedResults.length} pages`);
      
      // Step 4: Format to context and save files
      console.error(`📝 [SCRAPE-DOC] Step 4: Generating context format...`);
      
      const results = [];
      const savedFiles: string[] = [];
      
      // File saving options
      const fileOptions = {
        directory: options.saveDirectory,
        filename: options.filename,
        fileFormat: options.saveFormat
      };
      
      // Generate both formats if requested
      if (options.outputFormat === 'both' || options.outputFormat === 'llms-txt') {
        console.error(`📝 [SCRAPE-DOC] Generating summary format...`);
        
        const summaryContext = await this.formatter.formatToSummary(processedResults, {
          includeSourceUrls: false,
          sectionHeaders: false,
          maxSectionLength: 300
        });
        
        // Save summary file if saveToFile is enabled (default: true)
        if (options.saveToFile !== false) {
          const summaryFileInfo = await this.formatter.saveToFile(
            summaryContext.content,
            args.url,
            'summary',
            fileOptions
          );
          savedFiles.push(summaryFileInfo.fileName);
          
          results.push({
            type: 'text' as const,
            text: `# 📄 Summary Format\n\n**💾 Saved as:** \`${summaryFileInfo.fileName}\`\n\n${summaryContext.content.substring(0, 1500)}${summaryContext.content.length > 1500 ? '\n\n...(truncated in preview)' : ''}`
          });
        } else {
          results.push({
            type: 'text' as const,
            text: `# 📄 Summary Format\n\n${summaryContext.content}`
          });
        }
      }
      
      if (options.outputFormat === 'both' || options.outputFormat === 'llms-full-txt') {
        console.error(`📝 [SCRAPE-DOC] Generating full format...`);
        
        const fullContext = await this.formatter.formatToContext(processedResults, {
          format: 'full',
          includeSourceUrls: true,
          sectionHeaders: true
        });
        
        // Validate the generated content
        const validation = this.formatter.validateContextContent(fullContext.content);
        if (!validation.valid) {
          console.error(`⚠️ [SCRAPE-DOC] Content validation issues: ${validation.issues.join(', ')}`);
        }
        
        // Save full format file if saveToFile is enabled (default: true)
        if (options.saveToFile !== false) {
          const fullFileInfo = await this.formatter.saveToFile(
            fullContext.content,
            args.url,
            'full',
            fileOptions
          );
          savedFiles.push(fullFileInfo.fileName);
          
          results.push({
            type: 'text' as const,
            text: `# 📚 Full Format\n\n**💾 Saved as:** \`${fullFileInfo.fileName}\`\n\n${fullContext.content.substring(0, 2500)}${fullContext.content.length > 2500 ? '\n\n...(truncated in preview, full content saved to file)' : ''}`
          });
        } else {
          results.push({
            type: 'text' as const,
            text: `# 📚 Full Format\n\n${fullContext.content}`
          });
        }
        
        // Add validation report if there are issues
        if (!validation.valid) {
          results.push({
            type: 'text' as const,
            text: `## ⚠️ Content Validation Report\n\n` +
                  `**Issues Found:**\n` +
                  validation.issues.map(issue => `- ${issue}`).join('\n') + '\n\n' +
                  `*Note: These issues don't prevent generation but may affect LLM performance.*`
          });
        }
      }
      
      // Step 5: Generate summary report
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      const failedCount = crawlResults.length - successfulResults.length;
      
      const outputDir = options.saveDirectory || this.formatter.getOutputDirectory();
      const summaryReport = {
        type: 'text' as const,
        text: `## 🎉 Documentation Scraping Complete!\n\n` +
              `**📊 Results Summary:**\n` +
              `- **Source:** ${args.url}\n` +
              `- **Platform:** ${platform.name}\n` +
              `- **Pages Crawled:** ${crawlResults.length}\n` +
              `- **Successful:** ${successfulResults.length}\n` +
              `- **Processed:** ${processedResults.length}\n` +
              `- **Failed:** ${failedCount}\n` +
              `- **Duration:** ${duration}s\n` +
              `- **Output Format:** ${options.outputFormat}\n\n` +
              (savedFiles.length > 0 
                ? `**💾 Files Saved:**\n${savedFiles.map(file => `  - \`${file}\``).join('\n')}\n\n`
                : '') +
              (options.saveToFile !== false 
                ? `**📁 Output Directory:** \`${outputDir}\`\n\n`
                : '') +
              `**✨ Generated context files are ready for use with LLMs!**\n\n` +
              `*Made with ❤️ by Pink Pixel (https://pinkpixel.dev)*`
      };
      
      console.error(`🎉 [SCRAPE-DOC] Documentation scraping completed in ${duration}s!`);
      
      return {
        content: [summaryReport, ...results]
      };
      
    } catch (error) {
      console.error(`❌ [SCRAPE-DOC] Documentation scraping failed:`, error);
      
      return {
        content: [{
          type: 'text' as const,
          text: `❌ **Documentation Scraping Failed**\n\n` +
                `**Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
                `**URL:** ${args.url}\n` +
                `**Options:** ${JSON.stringify(args.options || {}, null, 2)}\n\n` +
                `Please check the URL and try again. Ensure the site is accessible and contains documentation content.`,
        }],
        isError: true
      };
    }
  }

  private async handlePreviewPage(args: PreviewPageInput) {
    try {
      console.error(`🔍 [PREVIEW] Starting page preview for: ${args.url}`);
      
      // Initialize crawler service if not already done
      console.error(`🔧 [PREVIEW] Ensuring crawler service is initialized...`);
      await this.crawler.initialize();
      
      // Check crawler health
      const isHealthy = await this.crawler.healthCheck();
      console.error(`💚 [PREVIEW] Crawler health check: ${isHealthy ? 'PASS' : 'FAIL'}`);
      
      if (!isHealthy) {
        throw new Error('Crawler service failed health check - x-crawl may not be properly initialized');
      }
      
      const startTime = Date.now();
      
      // Step 1: Detect platform
      const platform = await this.detector.detectPlatform(args.url);
      
      // Step 2: Crawl single page
      const crawlResult = await this.crawler.crawlSinglePage(args.url);
      
      if (!crawlResult.success || !crawlResult.content) {
        throw new Error(`Failed to crawl page: ${crawlResult.error || 'Unknown error'}`);
      }
      
      // Step 3: Extract content
      const extractedContent = await this.extractor.extractContent(
        crawlResult.content,
        crawlResult.url!,
        platform
      );
      
      // Step 4: Validate content
      const isValid = this.extractor.isValidContent(extractedContent);
      
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      
      return {
        content: [{
          type: 'text' as const,
          text: `# 🔍 Page Preview Results\n\n` +
                `**📄 Page Information:**\n` +
                `- **URL:** ${args.url}\n` +
                `- **Title:** ${extractedContent.title}\n` +
                `- **Platform:** ${platform.name}\n` +
                `- **Content Length:** ${extractedContent.content.length} characters\n` +
                `- **Headings:** ${extractedContent.headings.length}\n` +
                `- **Links:** ${extractedContent.links.length}\n` +
                `- **Code Blocks:** ${extractedContent.codeBlocks.length}\n` +
                `- **Valid Content:** ${isValid ? '✅ Yes' : '❌ No'}\n` +
                `- **Processing Time:** ${duration}s\n\n` +
                `**📝 Content Preview (first 500 chars):**\n` +
                `\`\`\`\n${extractedContent.content.substring(0, 500)}${extractedContent.content.length > 500 ? '...' : ''}\`\`\`\n\n` +
                `**🏗️ Document Structure:**\n` +
                extractedContent.headings.slice(0, 10).map(h => `${'  '.repeat(h.level - 1)}- ${h.text}`).join('\n') +
                (extractedContent.headings.length > 10 ? '\n... and more' : '') +
                `\n\n*This preview shows how the page would be processed during full documentation scraping.*`
        }]
      };
      
    } catch (error) {
      console.error(`❌ [PREVIEW] Page preview failed:`, error);
      
      return {
        content: [{
          type: 'text' as const,
          text: `❌ **Page Preview Failed**\n\n` +
                `**Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
                `**URL:** ${args.url}\n\n` +
                `Please verify the URL is accessible and contains valid content.`
        }],
        isError: true
      };
    }
  }

  private async handleDetectPlatform(args: DetectPlatformInput) {
    try {
      console.error(`🔍 [DETECT] Starting platform detection for: ${args.url}`);
      
      const startTime = Date.now();
      
      // Detect the platform
      const platform = await this.detector.detectPlatform(args.url);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      return {
        content: [{
          type: 'text' as const,
          text: `# 🔍 Platform Detection Results\n\n` +
                `**🌐 URL:** ${args.url}\n` +
                `**🏷️ Platform:** ${platform.name}\n` +
                `**📋 Description:** ${platform.description}\n` +
                `**🎯 Confidence:** ${Math.round(platform.confidence * 100)}%\n` +
                `**⚙️ Features:**\n` +
                (platform.features.length > 0 
                  ? platform.features.map(f => `  - ${f}`).join('\n')
                  : '  - None detected'
                ) + '\n\n' +
                `**⏱️ Detection Time:** ${duration}ms\n\n` +
                `**💡 Tips:**\n` +
                `- This platform detection helps optimize crawling strategies\n` +
                `- Higher confidence means better targeted content extraction\n` +
                `- Custom selectors may be applied based on detected platform\n\n` +
                `*Platform detection completed successfully!*`
        }]
      };
      
    } catch (error) {
      console.error(`❌ [DETECT] Platform detection failed:`, error);
      
      return {
        content: [{
          type: 'text' as const,
          text: `❌ **Platform Detection Failed**\n\n` +
                `**Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
                `**URL:** ${args.url}\n\n` +
                `Please verify the URL is accessible and try again.`
        }],
        isError: true
      };
    }
  }

  private async handleGenerateContext(args: GenerateContextInput) {
    try {
      console.error(`📝 [GENERATE] Starting context generation for ${args.crawlResults?.length || 0} crawl results`);
      
      const startTime = Date.now();
      
      // Validate input
      if (!args.crawlResults || args.crawlResults.length === 0) {
        throw new Error('No crawl results provided for formatting');
      }
      
      // Validate crawl results format and convert if needed
      const validatedResults = args.crawlResults.map((result, index) => {
        if (!result || typeof result !== 'object') {
          throw new Error(`Invalid crawl result at index ${index}: must be an object`);
        }
        
        // Ensure required fields exist
        return {
          url: result.url || `unknown-url-${index}`,
          title: result.title || 'Untitled',
          content: result.content || '',
          success: result.success ?? (result.content ? true : false),
          timestamp: result.timestamp || new Date().toISOString()
        };
      });
      
      const successfulResults = validatedResults.filter(r => r.success && r.content);
      
      if (successfulResults.length === 0) {
        throw new Error('No successful crawl results with content found');
      }
      
      console.error(`✅ [GENERATE] Processing ${successfulResults.length} successful results`);
      
      const options = {
        format: 'full' as const,
        includeSourceUrls: true,
        sectionHeaders: true,
        maxSectionLength: 1000,
        saveToFile: true,
        saveDirectory: undefined,
        saveFormat: 'txt' as const,
        filename: undefined,
        ...args.options
      };
      
      console.error(`📝 [GENERATE] Options: ${JSON.stringify(options, null, 2)}`);
      
      const results = [];
      const savedFiles: string[] = [];
      
      // Get base URL for file saving
      const baseUrl = successfulResults.find(r => r.url)?.url || 'unknown';
      
      // File saving options
      const fileOptions = {
        directory: options.saveDirectory,
        filename: options.filename,
        fileFormat: options.saveFormat
      };
      
      // Generate summary format
      if (options.format === 'summary' || options.format === 'both') {
        console.error(`📝 [GENERATE] Generating summary format...`);
        
        const summaryResult = await this.formatter.formatToSummary(successfulResults, {
          includeSourceUrls: options.includeSourceUrls,
          sectionHeaders: options.sectionHeaders,
          maxSectionLength: Math.min(options.maxSectionLength, 500)
        });
        
        // Save summary file if requested
        if (options.saveToFile) {
          const summaryFileInfo = await this.formatter.saveToFile(
            summaryResult.content, 
            baseUrl, 
            'summary',
            fileOptions
          );
          savedFiles.push(summaryFileInfo.fileName);
          
          results.push({
            type: 'text' as const,
            text: `# 📄 Summary Format\n\n**💾 Saved as:** \`${summaryFileInfo.fileName}\`\n\n${summaryResult.content.substring(0, 1000)}${summaryResult.content.length > 1000 ? '\n\n...(truncated in preview)' : ''}`
          });
        } else {
          results.push({
            type: 'text' as const,
            text: `# 📄 Summary Format\n\n${summaryResult.content}`
          });
        }
      }
      
      // Generate full format
      if (options.format === 'full' || options.format === 'both') {
        console.error(`📝 [GENERATE] Generating full format...`);
        
        const fullResult = await this.formatter.formatToContext(successfulResults, {
          format: 'full',
          includeSourceUrls: options.includeSourceUrls,
          sectionHeaders: options.sectionHeaders,
          maxSectionLength: options.maxSectionLength
        });
        
        // Validate the generated content
        const validation = this.formatter.validateContextContent(fullResult.content);
        
        if (!validation.valid) {
          console.error(`⚠️ [GENERATE] Content validation issues: ${validation.issues.join(', ')}`);
        }
        
        // Save full format file if requested
        if (options.saveToFile) {
          const fullFileInfo = await this.formatter.saveToFile(
            fullResult.content, 
            baseUrl, 
            'full',
            fileOptions
          );
          savedFiles.push(fullFileInfo.fileName);
          
          results.push({
            type: 'text' as const,
            text: `# 📚 Full Format\n\n**💾 Saved as:** \`${fullFileInfo.fileName}\`\n\n${fullResult.content.substring(0, 2000)}${fullResult.content.length > 2000 ? '\n\n...(truncated in preview, full content saved to file)' : ''}`
          });
        } else {
          results.push({
            type: 'text' as const,
            text: `# 📚 Full Format\n\n${fullResult.content}`
          });
        }
        
        // Add validation report if there are issues
        if (!validation.valid) {
          results.push({
            type: 'text' as const,
            text: `## ⚠️ Content Validation Report\n\n` +
                  `**Issues Found:**\n` +
                  validation.issues.map(issue => `- ${issue}`).join('\n') + '\n\n' +
                  `*Note: These issues don't prevent generation but may affect LLM performance.*`
          });
        }
      }
      
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      
      // Add generation summary
      const outputDir = options.saveDirectory || this.formatter.getOutputDirectory();
      const summaryReport = {
        type: 'text' as const,
        text: `## 🎉 Context Generation Complete!\n\n` +
              `**📊 Generation Summary:**\n` +
              `- **Source Results:** ${successfulResults.length}\n` +
              `- **Format:** ${options.format}\n` +
              `- **Include URLs:** ${options.includeSourceUrls ? '✅ Yes' : '❌ No'}\n` +
              `- **Section Headers:** ${options.sectionHeaders ? '✅ Yes' : '❌ No'}\n` +
              `- **Max Section Length:** ${options.maxSectionLength} chars\n` +
              `- **Generation Time:** ${duration}s\n\n` +
              (savedFiles.length > 0 
                ? `**💾 Files Saved:**\n${savedFiles.map(file => `  - \`${file}\``).join('\n')}\n\n`
                : '') +
              (options.saveToFile 
                ? `**📁 Output Directory:** \`${outputDir}\`\n\n`
                : '') +
              `**✨ Context generation completed successfully!**\n\n` +
              `*Made with ❤️ by Pink Pixel (https://pinkpixel.dev)*`
      };
      
      console.error(`🎉 [GENERATE] context generation completed in ${duration}s!`);
      
      return {
        content: [summaryReport, ...results]
      };
      
    } catch (error) {
      console.error(`❌ [GENERATE] context generation failed:`, error);
      
      return {
        content: [{
          type: 'text' as const,
          text: `❌ **Context Generation Failed**\n\n` +
                `**Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
                `**Input:** ${args.crawlResults?.length || 0} crawl results\n` +
                `**Options:** ${JSON.stringify(args.options || {}, null, 2)}\n\n` +
                `**Expected Format:** Array of objects with properties: url, title, content, success\n` +
                `Example: [{"url": "https://example.com", "title": "Page Title", "content": "Page content...", "success": true}]\n\n` +
                `Please check your input data format and try again.`
        }],
        isError: true
      };
    }
  }

  async run(): Promise<void> {
    console.error('🚀 Starting context-generator MCP server...');
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('✅ context-generator MCP server is running!');
    console.error('✨ Made with ❤️ by Pink Pixel (https://pinkpixel.dev)');
  }
}

// Start the server
const server = new ContextGeneratorServer();
server.run().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});