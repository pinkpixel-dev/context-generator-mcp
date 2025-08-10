# 📅 Changelog

All notable changes to the Context Generator MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🔄 In Development
- Enhanced platform detection algorithms
- Advanced AI integration features
- Performance optimization improvements
- Extended output format options
- Batch processing capabilities

---

## [1.0.0] - 2025-01-10

### 🎉 Initial Release

The first stable release of the Context Generator MCP Server, providing comprehensive documentation scraping and context generation capabilities.

### ✨ Added

#### Core Features
- **🕷️ Documentation Scraping**: Complete website crawling with x-crawl integration
- **📝 Context Generation**: LLM-optimized format creation (`llms.txt` and `llms-full.txt`)
- **🔍 Platform Detection**: Automatic detection of documentation platforms (GitBook, Docusaurus, VitePress, etc.)
- **👀 Page Preview**: Single page content analysis and preview
- **📊 Content Processing**: Clean content extraction and formatting

#### MCP Tools
- `scrape_documentation` - Crawl entire documentation sites
- `preview_page` - Analyze single pages before full crawling
- `detect_platform` - Identify documentation platform types
- `generate_context` - Format raw crawl data into context files

#### AI Integration
- **🦙 Ollama Support**: Full local AI processing integration
  - Privacy-focused local processing
  - Support for llama3.1, codellama, and other models
  - Zero-cost AI enhancement
- **🤖 OpenAI Integration**: Cloud-based AI processing
  - GPT-3.5-turbo and GPT-4 support
  - Advanced content enhancement
  - API-based processing

#### Service Architecture
- **CrawlerService**: Robust web crawling with x-crawl
- **PlatformDetectorService**: Intelligent platform detection
- **ContentExtractorService**: HTML content extraction and cleaning
- **ContextFormatterService**: Context format generation and validation

#### Output Formats
- **Summary Format**: Compact ~300 chars per section for token limits
- **Full Format**: Comprehensive documentation with all details
- **Both Formats**: Dual generation for maximum flexibility
- **File Formats**: Support for .txt and .md output formats

#### Developer Experience
- **TypeScript**: Full type safety and modern development
- **Comprehensive Logging**: Detailed debugging and monitoring
- **Error Handling**: Robust error management and recovery
- **Configuration**: Flexible environment variable configuration

### 🛠️ Technical Implementation

#### Dependencies
- `@modelcontextprotocol/sdk@1.17.2` - MCP protocol implementation
- `x-crawl@^10.1.0` - Advanced web crawling
- `cheerio@1.1.2` - HTML parsing and manipulation
- `turndown@^7.2.0` - HTML to Markdown conversion
- `node-html-markdown@^1.3.0` - Enhanced HTML to Markdown

#### Development Tools
- TypeScript 5.9.2 with strict type checking
- ESLint with TypeScript integration
- Modern ES module architecture
- Node.js 18+ compatibility

#### File Structure
```
context-generator-mcp/
├── src/
│   ├── index.ts                  # Main MCP server
│   ├── services/                 # Core services
│   ├── types/                    # Type definitions
│   └── utils/                    # Utility functions
├── dist/                         # Compiled output
└── output/                       # Generated context files
```

### 📚 Documentation

#### Complete Documentation Suite
- **README.md**: Comprehensive setup and usage guide
- **OVERVIEW.md**: Project architecture and design overview
- **USAGE.md**: Detailed usage examples and patterns
- **OLLAMA_SETUP.md**: Complete Ollama integration guide
- **MCP_CONFIG_GUIDE.md**: MCP client configuration instructions
- **IMPLEMENTATION_SUMMARY.md**: Technical implementation details
- **IMPROVEMENTS.md**: Performance enhancements and optimizations

#### Example Configurations
- MCP client configuration samples
- Environment variable templates
- Usage examples for common scenarios
- Troubleshooting guides

### 🚀 Performance Features

#### Optimized Crawling
- Respectful rate limiting (1s default delay)
- Configurable crawl depth and page limits
- Platform-specific optimization
- Efficient content extraction

#### File Operations
- Robust file saving with error handling
- Configurable output directories
- Automatic filename generation
- Multiple format support

#### Memory Management
- Efficient content processing
- Streaming data handling
- Garbage collection optimization
- Resource cleanup

### 🔒 Security & Privacy

#### Privacy Features
- Local AI processing with Ollama
- No data retention after processing
- Secure URL validation
- Rate limiting respect

#### Best Practices
- Robots.txt compliance
- Error sanitization
- Resource usage monitoring
- Secure file operations

### 🎨 Pink Pixel Branding

#### Brand Integration
- Pink Pixel attribution in all outputs
- "Made with ❤️ by Pink Pixel" signatures
- Website linking to [pinkpixel.dev](https://pinkpixel.dev)
- Modern, elegant styling throughout

### 🧪 Testing & Quality

#### Test Suite
- Comprehensive MCP tool testing
- Ollama integration validation
- File operation testing
- Error handling verification

#### Quality Assurance
- TypeScript strict mode
- ESLint code quality checks
- Comprehensive error handling
- Performance monitoring

---

## 📋 Version History Summary

| Version | Date | Key Features |
|---------|------|--------------|
| 1.0.0 | 2025-01-10 | Initial release with complete MCP server, AI integration, and documentation tools |

---

## 🔗 References

- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Pink Pixel](https://pinkpixel.dev)

---

*Made with ❤️ by Pink Pixel - "Dream it, Pixel it"*
