# llmstxt-generator MCP Server Usage Guide

## Overview

The llmstxt-generator is an MCP server that scrapes documentation websites and generates llmstxt files optimized for LLM consumption. It supports multiple documentation platforms and provides intelligent content extraction and formatting.

## Features

- **🚀 Multi-Platform Support**: GitBook, Docusaurus, VuePress, Mintlify, and generic sites
- **🔍 Platform Detection**: Automatic detection of documentation platforms for optimized crawling
- **📝 Content Extraction**: Clean content extraction with markdown support
- **🎯 Smart Formatting**: Hierarchical organization and multiple output formats
- **⚡ Efficient Crawling**: Respects rate limits and follows best practices

## Installation

```bash
npm install
npm run build
```

## MCP Tools

### 1. scrape_documentation

Scrapes an entire documentation website and generates formatted llmstxt content.

**Input Schema:**
```json
{
  "url": "https://docs.example.com",
  "options": {
    "maxPages": 50,
    "maxDepth": 3,
    "outputFormat": "both",
    "delayMs": 1000
  }
}
```

**Example Usage:**
```json
{
  "tool": "scrape_documentation",
  "arguments": {
    "url": "https://docs.python.org",
    "options": {
      "maxPages": 100,
      "outputFormat": "both"
    }
  }
}
```

**Options:**
- `maxPages` (number): Maximum pages to crawl (default: 50)
- `maxDepth` (number): Maximum crawl depth (default: 3)
- `outputFormat` ("llms-txt" | "llms-full-txt" | "both"): Output format (default: "both")
- `delayMs` (number): Delay between requests in milliseconds (default: 1000)

### 2. preview_page

Preview content extraction from a single page to test before full crawling.

**Input Schema:**
```json
{
  "url": "https://docs.example.com/getting-started"
}
```

**Example Usage:**
```json
{
  "tool": "preview_page",
  "arguments": {
    "url": "https://nextjs.org/docs/getting-started"
  }
}
```

### 3. detect_platform

Detect the documentation platform type for optimization strategies.

**Input Schema:**
```json
{
  "url": "https://docs.example.com"
}
```

**Example Usage:**
```json
{
  "tool": "detect_platform",
  "arguments": {
    "url": "https://docusaurus.io/docs"
  }
}
```

### 4. generate_llmstxt

Generate llmstxt format from existing crawl results.

**Input Schema:**
```json
{
  "crawlResults": [/* array of crawl results */],
  "options": {
    "format": "full",
    "includeSourceUrls": true,
    "sectionHeaders": true,
    "maxSectionLength": 1000
  }
}
```

## Output Formats

### Summary Format (llms.txt)
- Concise content summaries (300 chars max per section)
- No source URLs
- Minimal section headers
- Perfect for quick LLM context

### Full Format (llms-full.txt)
- Complete content with full text
- Source URLs included
- Full section hierarchy
- Detailed documentation for comprehensive LLM training

### Both Format
- Generates both summary and full formats
- Compare different approaches
- Flexible output options

## Supported Platforms

### GitBook
- **Detection**: `.gitbook.`, `app.gitbook.com`
- **Features**: Rich navigation, interactive blocks, search integration
- **Strategy**: Navigation-first crawling

### Docusaurus
- **Detection**: React-based, `docusaurus` in content
- **Features**: SPA structure, versioning, plugins
- **Strategy**: Sitemap-first crawling

### VuePress
- **Detection**: Vue.js components, `.vuepress`
- **Features**: Static generation, theme customization
- **Strategy**: Hybrid crawling approach

### Mintlify
- **Detection**: `mintlify` domain or classes
- **Features**: API integration, modern UI
- **Strategy**: Sitemap-first with API docs

### Generic
- **Detection**: Fallback for unknown platforms
- **Features**: Standard HTML structure parsing
- **Strategy**: Conservative navigation-based crawling

## Integration Examples

### Claude Desktop (MCP)

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "llmstxt-generator": {
      "command": "node",
      "args": ["path/to/llmstxt-generator-server/dist/index.js"],
      "env": {}
    }
  }
}
```

### Usage in Claude

1. **Preview a page first:**
   ```
   Use the preview_page tool to analyze https://docs.fastapi.tiangolo.com/
   ```

2. **Detect platform:**
   ```
   Use detect_platform to analyze the documentation platform for https://nextjs.org/docs
   ```

3. **Scrape documentation:**
   ```
   Use scrape_documentation to crawl https://docs.pydantic.dev with options: 
   maxPages: 75, outputFormat: "both"
   ```

## Best Practices

### Crawling Strategy
1. **Start Small**: Begin with `preview_page` to test content extraction
2. **Detect Platform**: Use `detect_platform` for optimization hints
3. **Incremental Crawling**: Start with low `maxPages` and increase gradually
4. **Rate Limiting**: Use appropriate `delayMs` values (1000ms recommended)

### Content Optimization
- **Summary Format**: Use for quick LLM context and previews
- **Full Format**: Use for comprehensive documentation training
- **Both Format**: Compare outputs and choose best for your use case

### Platform-Specific Tips

**GitBook:**
- Excellent navigation structure
- Rich content with interactive elements
- May have authentication requirements

**Docusaurus:**
- Check for sitemap.xml first
- Look for versioned docs
- React components may need special handling

**VuePress:**
- Often has clear guide/API separation
- Check for custom themes
- Static generation provides clean content

**Mintlify:**
- Great for API documentation
- Modern UI with interactive examples
- Check for OpenAPI integration

## Troubleshooting

### Common Issues

**Empty Results:**
- Check URL accessibility
- Verify platform detection is correct
- Try increasing `maxDepth` parameter
- Check for JavaScript-heavy sites (may need preprocessing)

**Rate Limiting:**
- Increase `delayMs` parameter
- Reduce `maxPages` for testing
- Check site's robots.txt

**Platform Detection:**
- Use `detect_platform` tool to verify detection
- Manual content analysis may be needed for custom sites
- Generic platform fallback should work for most sites

**Content Quality:**
- Use `preview_page` to check individual page extraction
- Adjust selectors for custom platforms
- Check for dynamic content loading

### Error Messages

**"No pages were successfully crawled":**
- URL might be inaccessible
- Site might require authentication
- Try a different starting URL

**"Content validation issues":**
- Non-critical warnings about content structure
- Content is still generated but may need review
- Check validation report in output

**"Platform detection failed":**
- Network connectivity issues
- Site might be down
- Fallback to generic platform will be used

## Performance Tips

1. **Optimize Crawl Parameters:**
   - Start with `maxPages: 10` for testing
   - Increase `delayMs` for slower sites
   - Adjust `maxDepth` based on site structure

2. **Choose Right Format:**
   - Use "summary" for quick overviews
   - Use "full" for comprehensive documentation
   - Use "both" only when comparing outputs

3. **Platform-Specific Optimization:**
   - GitBook: Follow sidebar navigation
   - Docusaurus: Use sitemap when available
   - Generic: Be conservative with crawling

## Contributing

The llmstxt-generator server is built with TypeScript and uses:
- **x-crawl**: For reliable web crawling
- **cheerio**: For HTML parsing and manipulation
- **turndown**: For HTML to Markdown conversion
- **MCP SDK**: For Model Context Protocol integration

Made with ❤️ by Pink Pixel (https://pinkpixel.dev)
