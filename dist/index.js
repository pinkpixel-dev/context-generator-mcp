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
const noOp = () => { };
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
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
// Import our services
import { CrawlerService } from './services/crawler.js';
import { PlatformDetectorService } from './services/platformDetector.js';
import { ContentExtractorService } from './services/contentExtractor.js';
import { ContextFormatterService } from './services/contextFormatter.js';
class ContextGeneratorServer {
    server;
    crawler;
    detector;
    extractor;
    formatter;
    constructor() {
        this.server = new Server({
            name: 'context-generator',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        // Initialize services
        this.crawler = new CrawlerService();
        this.detector = new PlatformDetectorService();
        this.extractor = new ContentExtractorService();
        this.formatter = new ContextFormatterService();
        this.setupToolHandlers();
    }
    setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'scrape_documentation',
                        description: 'Scrape a documentation website and extract content for context generation',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                url: {
                                    type: 'string',
                                    description: 'The base URL of the documentation site to scrape',
                                },
                                options: {
                                    type: 'object',
                                    description: 'Crawling options',
                                    properties: {
                                        maxPages: {
                                            type: 'number',
                                            description: 'Maximum number of pages to crawl (default: 50)',
                                        },
                                        maxDepth: {
                                            type: 'number',
                                            description: 'Maximum crawl depth (default: 3)',
                                        }, outputFormat: {
                                            type: 'string',
                                            enum: ['llms-txt', 'llms-full-txt', 'both'],
                                            description: 'Output format (default: both)',
                                        },
                                        delayMs: {
                                            type: 'number',
                                            description: 'Delay between requests in milliseconds (default: 1000)',
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
                    }, {
                        name: 'generate_context',
                        description: 'Generate context format from crawled content',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                crawlResults: {
                                    type: 'array',
                                    description: 'Array of crawl results to format',
                                    items: {
                                        type: 'object',
                                    },
                                },
                                options: {
                                    type: 'object',
                                    description: 'Formatting options',
                                    properties: {
                                        format: {
                                            type: 'string',
                                            enum: ['summary', 'full'],
                                            description: 'Format type (default: full)',
                                        },
                                        includeSourceUrls: {
                                            type: 'boolean',
                                            description: 'Include source URLs (default: true)',
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
                        return await this.handleScrapeDocumentation(args);
                    case 'preview_page':
                        return await this.handlePreviewPage(args);
                    case 'detect_platform':
                        return await this.handleDetectPlatform(args);
                    case 'generate_context':
                        return await this.handleGenerateContext(args);
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`);
                }
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error occurred';
                throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${message}`);
            }
        });
    }
    // Tool handler methods
    async handleScrapeDocumentation(args) {
        try {
            console.error(`🚀 [SCRAPE-DOC] Starting documentation scraping for: ${args.url}`);
            console.error(`📋 [SCRAPE-DOC] Options: ${JSON.stringify(args.options || {}, null, 2)}`);
            const startTime = Date.now();
            const options = {
                maxPages: 50,
                maxDepth: 3,
                outputFormat: 'both',
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
                        const extractedContent = await this.extractor.extractContent(result.content, result.url, platform);
                        if (this.extractor.isValidContent(extractedContent)) {
                            // Update the crawl result with cleaned content
                            result.content = extractedContent.content;
                            result.title = extractedContent.title;
                            result.markdown = extractedContent.markdown;
                            processedResults.push(result);
                        }
                    }
                }
                catch (error) {
                    console.error(`⚠️ [SCRAPE-DOC] Failed to process ${result.url}: ${error}`);
                    // Still include the original result if extraction fails
                    if (result.content) {
                        processedResults.push(result);
                    }
                }
            }
            console.error(`✅ [SCRAPE-DOC] Processed ${processedResults.length} pages`);
            // Step 4: Format to context
            console.error(`📝 [SCRAPE-DOC] Step 4: Generating context format...`);
            const results = [];
            // Generate both formats if requested
            if (options.outputFormat === 'both' || options.outputFormat === 'llms-txt') {
                const summaryContext = await this.formatter.formatToSummary(processedResults, {
                    includeSourceUrls: false,
                    sectionHeaders: false,
                    maxSectionLength: 300
                });
                results.push({
                    type: 'text',
                    text: `# 📄 Summary Format (llms.txt)\n\n${summaryContext.content}`
                });
            }
            if (options.outputFormat === 'both' || options.outputFormat === 'llms-full-txt') {
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
                results.push({
                    type: 'text',
                    text: `# 📚 Full Format (llms-full.txt)\n\n${fullContext.content}`
                });
            }
            // Step 5: Generate summary report
            const endTime = Date.now();
            const duration = Math.round((endTime - startTime) / 1000);
            const failedCount = crawlResults.length - successfulResults.length;
            const summaryReport = {
                type: 'text',
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
                    `**✨ Generated context files are ready for use with LLMs!**\n\n` +
                    `*Made with ❤️ by Pink Pixel (https://pinkpixel.dev)*`
            };
            console.error(`🎉 [SCRAPE-DOC] Documentation scraping completed in ${duration}s!`);
            return {
                content: [summaryReport, ...results]
            };
        }
        catch (error) {
            console.error(`❌ [SCRAPE-DOC] Documentation scraping failed:`, error);
            return {
                content: [{
                        type: 'text',
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
    async handlePreviewPage(args) {
        try {
            console.error(`🔍 [PREVIEW] Starting page preview for: ${args.url}`);
            const startTime = Date.now();
            // Step 1: Detect platform
            const platform = await this.detector.detectPlatform(args.url);
            // Step 2: Crawl single page
            const crawlResult = await this.crawler.crawlSinglePage(args.url);
            if (!crawlResult.success || !crawlResult.content) {
                throw new Error(`Failed to crawl page: ${crawlResult.error || 'Unknown error'}`);
            }
            // Step 3: Extract content
            const extractedContent = await this.extractor.extractContent(crawlResult.content, crawlResult.url, platform);
            // Step 4: Validate content
            const isValid = this.extractor.isValidContent(extractedContent);
            const endTime = Date.now();
            const duration = Math.round((endTime - startTime) / 1000);
            return {
                content: [{
                        type: 'text',
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
        }
        catch (error) {
            console.error(`❌ [PREVIEW] Page preview failed:`, error);
            return {
                content: [{
                        type: 'text',
                        text: `❌ **Page Preview Failed**\n\n` +
                            `**Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
                            `**URL:** ${args.url}\n\n` +
                            `Please verify the URL is accessible and contains valid content.`
                    }],
                isError: true
            };
        }
    }
    async handleDetectPlatform(args) {
        try {
            console.error(`🔍 [DETECT] Starting platform detection for: ${args.url}`);
            const startTime = Date.now();
            // Detect the platform
            const platform = await this.detector.detectPlatform(args.url);
            const endTime = Date.now();
            const duration = endTime - startTime;
            return {
                content: [{
                        type: 'text',
                        text: `# 🔍 Platform Detection Results\n\n` +
                            `**🌐 URL:** ${args.url}\n` +
                            `**🏷️ Platform:** ${platform.name}\n` +
                            `**📋 Description:** ${platform.description}\n` +
                            `**🎯 Confidence:** ${Math.round(platform.confidence * 100)}%\n` +
                            `**⚙️ Features:**\n` +
                            (platform.features.length > 0
                                ? platform.features.map(f => `  - ${f}`).join('\n')
                                : '  - None detected') + '\n\n' +
                            `**⏱️ Detection Time:** ${duration}ms\n\n` +
                            `**💡 Tips:**\n` +
                            `- This platform detection helps optimize crawling strategies\n` +
                            `- Higher confidence means better targeted content extraction\n` +
                            `- Custom selectors may be applied based on detected platform\n\n` +
                            `*Platform detection completed successfully!*`
                    }]
            };
        }
        catch (error) {
            console.error(`❌ [DETECT] Platform detection failed:`, error);
            return {
                content: [{
                        type: 'text',
                        text: `❌ **Platform Detection Failed**\n\n` +
                            `**Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
                            `**URL:** ${args.url}\n\n` +
                            `Please verify the URL is accessible and try again.`
                    }],
                isError: true
            };
        }
    }
    async handleGenerateContext(args) {
        try {
            console.error(`📝 [GENERATE] Starting context generation for ${args.crawlResults.length} crawl results`);
            const startTime = Date.now();
            // Validate input
            if (!args.crawlResults || args.crawlResults.length === 0) {
                throw new Error('No crawl results provided for formatting');
            }
            const options = {
                format: 'full',
                includeSourceUrls: true,
                sectionHeaders: true,
                maxSectionLength: 1000,
                ...args.options
            };
            console.error(`📝 [GENERATE] Options: ${JSON.stringify(options, null, 2)}`);
            const results = [];
            const savedFiles = [];
            // Get base URL for file saving
            const baseUrl = args.crawlResults.find(r => r.url)?.url || 'unknown';
            // Generate summary format
            if (options.format === 'summary' || options.format === 'both') {
                console.error(`📝 [GENERATE] Generating summary format...`);
                const summaryResult = await this.formatter.formatToSummary(args.crawlResults, {
                    includeSourceUrls: options.includeSourceUrls,
                    sectionHeaders: options.sectionHeaders,
                    maxSectionLength: Math.min(options.maxSectionLength, 500)
                });
                // Save summary file
                const summaryFileInfo = await this.formatter.saveToFile(summaryResult.content, baseUrl, 'summary');
                savedFiles.push(summaryFileInfo.fileName);
                results.push({
                    type: 'text',
                    text: `# 📄 Summary Format (llms.txt)\n\n**💾 Saved as:** \`${summaryFileInfo.fileName}\`\n\n${summaryResult.content}`
                });
            }
            // Generate full format
            if (options.format === 'full' || options.format === 'both') {
                console.error(`📝 [GENERATE] Generating full format...`);
                const fullResult = await this.formatter.formatToContext(args.crawlResults, {
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
                // Save full format file
                const fullFileInfo = await this.formatter.saveToFile(fullResult.content, baseUrl, 'full');
                savedFiles.push(fullFileInfo.fileName);
                results.push({
                    type: 'text',
                    text: `# 📂 Full Format (llms-full.txt)\n\n**💾 Saved as:** \`${fullFileInfo.fileName}\`\n\n${fullResult.content}`
                });
                // Add validation report if there are issues
                if (!validation.valid) {
                    results.push({
                        type: 'text',
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
            const outputDir = this.formatter.getOutputDirectory();
            const summaryReport = {
                type: 'text',
                text: `## 🎉 context Generation Complete!\n\n` +
                    `**📅 Generation Summary:**\n` +
                    `- **Source Results:** ${args.crawlResults.length}\n` +
                    `- **Format:** ${options.format}\n` +
                    `- **Include URLs:** ${options.includeSourceUrls ? '✅ Yes' : '❌ No'}\n` +
                    `- **Section Headers:** ${options.sectionHeaders ? '✅ Yes' : '❌ No'}\n` +
                    `- **Max Section Length:** ${options.maxSectionLength} chars\n` +
                    `- **Generation Time:** ${duration}s\n\n` +
                    `**💾 Files Saved:**\n` +
                    savedFiles.map(file => `  - \`${file}\``).join('\n') + '\n\n' +
                    `**📁 Output Directory:** \`${outputDir}\`\n\n` +
                    `**✨ Your context files are saved and ready for use with LLMs!**\n\n` +
                    `*Made with ❤️ by Pink Pixel (https://pinkpixel.dev)*`
            };
            console.error(`🎉 [GENERATE] context generation completed in ${duration}s!`);
            return {
                content: [summaryReport, ...results]
            };
        }
        catch (error) {
            console.error(`❌ [GENERATE] context generation failed:`, error);
            return {
                content: [{
                        type: 'text',
                        text: `❌ **context Generation Failed**\n\n` +
                            `**Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
                            `**Input:** ${args.crawlResults?.length || 0} crawl results\n` +
                            `**Options:** ${JSON.stringify(args.options || {}, null, 2)}\n\n` +
                            `Please check your input data and options, then try again.`
                    }],
                isError: true
            };
        }
    }
    async run() {
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
