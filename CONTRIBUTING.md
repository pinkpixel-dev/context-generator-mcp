# 🤝 Contributing to Context Generator MCP Server

Thank you for your interest in contributing to the Context Generator MCP Server! This document provides guidelines and information for contributors.

## 🌟 Welcome Contributors!

We're excited to have you join our community! Whether you're fixing bugs, adding features, improving documentation, or sharing ideas, your contributions are valued and appreciated.

**Made with ❤️ by Pink Pixel** - We believe in collaborative, community-driven development while maintaining high quality standards.

## 📋 Table of Contents

- [Getting Started](#-getting-started)
- [Development Setup](#-development-setup)
- [Project Structure](#-project-structure)
- [Contribution Types](#-contribution-types)
- [Development Workflow](#-development-workflow)
- [Code Standards](#-code-standards)
- [Testing Guidelines](#-testing-guidelines)
- [Documentation Guidelines](#-documentation-guidelines)
- [Submitting Changes](#-submitting-changes)
- [Community Guidelines](#-community-guidelines)
- [Pink Pixel Standards](#-pink-pixel-standards)

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 18+**: Latest LTS version recommended
- **Git**: For version control
- **TypeScript Knowledge**: Project is built with TypeScript
- **MCP Understanding**: Familiarity with Model Context Protocol concepts

### Quick Start

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/context-generator-mcp.git
   cd context-generator-mcp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run Development Mode**
   ```bash
   npm run dev
   ```

5. **Test Your Setup**
   ```bash
   npm test
   npm run test:ollama  # If you have Ollama installed
   ```

## 🛠️ Development Setup

### Environment Configuration

1. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Configure AI Integration (Optional)**
   ```bash
   # For Ollama (recommended for development)
   echo "OLLAMA_MODEL=llama3.1" >> .env
   
   # For OpenAI (optional)
   echo "OPENAI_API_KEY=your-api-key" >> .env
   ```

3. **Verify Setup**
   ```bash
   # Test MCP tools
   node test-mcp.js
   
   # Test Ollama integration
   npm run test:ollama
   ```

### IDE Configuration

**Recommended: VS Code with Extensions**
- TypeScript Importer
- ESLint
- Prettier
- Error Lens

## 🏗️ Project Structure

Understanding the codebase structure:

```
context-generator-mcp/
├── src/
│   ├── index.ts                    # Main MCP server entry point
│   ├── services/                   # Core business logic
│   │   ├── crawler.ts              # Web crawling with x-crawl
│   │   ├── platformDetector.ts     # Documentation platform detection
│   │   ├── contentExtractor.ts     # Content extraction & cleaning
│   │   └── contextFormatter.ts     # Context format generation
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── utils/
│   │   ├── index.ts                # Utility functions
│   │   └── platformTests.ts        # Platform detection utilities
│   └── @types/
│       └── x-crawl.d.ts            # Third-party type definitions
├── dist/                           # Compiled JavaScript (git ignored)
├── output/                         # Generated context files
├── test-files/                     # Test resources
└── docs/                           # Documentation files
    ├── README.md
    ├── OVERVIEW.md
    ├── CHANGELOG.md
    └── ...
```

## 🎯 Contribution Types

We welcome various types of contributions:

### 🐛 Bug Fixes
- Fix existing issues
- Improve error handling
- Resolve performance problems
- Address compatibility issues

### ✨ New Features
- Add new MCP tools
- Enhance AI integration
- Implement new output formats
- Add platform support

### 📚 Documentation
- Improve existing docs
- Add usage examples
- Create tutorials
- Fix typos and clarity

### 🔧 Infrastructure
- Improve build processes
- Enhance testing
- Add CI/CD improvements
- Update dependencies

### 🎨 UI/UX Improvements
- Better error messages
- Enhanced logging output
- Improved user experience
- Modern styling updates

## 🔄 Development Workflow

### Branch Strategy

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   # or 
   git checkout -b docs/documentation-update
   ```

2. **Make Changes**
   - Follow code standards
   - Write tests
   - Update documentation
   - Test thoroughly

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "✨ Add new platform detection for Gitiles"
   ```

### Commit Message Format

Use clear, descriptive commit messages:

```
<emoji> <type>: <description>

Examples:
✨ feat: Add support for Notion documentation platforms
🐛 fix: Resolve memory leak in crawler service  
📚 docs: Update installation instructions
🔧 refactor: Improve error handling in content extractor
🧪 test: Add comprehensive tests for platform detection
```

### Emoji Guide
- ✨ `:sparkles:` - New features
- 🐛 `:bug:` - Bug fixes
- 📚 `:books:` - Documentation
- 🔧 `:wrench:` - Refactoring/maintenance
- 🧪 `:test_tube:` - Tests
- 🚀 `:rocket:` - Performance improvements
- 🎨 `:art:` - UI/styling improvements

## 📏 Code Standards

### TypeScript Guidelines

1. **Type Safety**
   ```typescript
   // Good: Explicit types
   interface CrawlOptions {
     maxPages: number;
     maxDepth: number;
     outputFormat: 'llms-txt' | 'llms-full-txt' | 'both';
   }
   
   // Avoid: Any types
   function processData(data: any): any { }
   ```

2. **Naming Conventions**
   ```typescript
   // PascalCase for classes and interfaces
   class CrawlerService { }
   interface PlatformInfo { }
   
   // camelCase for functions and variables
   const maxRetryCount = 3;
   function extractContent() { }
   
   // SCREAMING_SNAKE_CASE for constants
   const DEFAULT_DELAY_MS = 1000;
   ```

3. **Function Documentation**
   ```typescript
   /**
    * Extracts clean content from HTML using platform-specific strategies
    * @param htmlContent - Raw HTML content to process
    * @param url - Source URL for context
    * @param platform - Detected platform information
    * @returns Cleaned and structured content
    */
   async function extractContent(
     htmlContent: string,
     url: string,
     platform: PlatformInfo
   ): Promise<ExtractedContent> {
     // Implementation
   }
   ```

### Code Quality

1. **Use ESLint**
   ```bash
   npm run lint
   ```

2. **Follow Prettier Formatting**
   - 2-space indentation
   - Single quotes for strings
   - Trailing commas
   - Semicolons required

3. **Error Handling**
   ```typescript
   // Good: Specific error handling
   try {
     const result = await crawlPage(url);
     return result;
   } catch (error) {
     console.error(`Failed to crawl ${url}: ${error.message}`);
     throw new Error(`Crawling failed: ${error.message}`);
   }
   
   // Avoid: Silent failures
   try {
     await crawlPage(url);
   } catch {
     return null;
   }
   ```

## 🧪 Testing Guidelines

### Test Structure

1. **Unit Tests**
   ```bash
   # Run existing tests
   npm test
   
   # Test specific functionality
   node test-mcp.js
   node test-ollama.js
   ```

2. **Integration Tests**
   ```bash
   # Test with real websites (use carefully)
   node test-comprehensive.cjs
   ```

3. **Manual Testing**
   ```bash
   # Test MCP tools
   npm run dev
   # Use MCP inspector to test tools
   ```

### Test Requirements

- **Cover New Features**: All new functionality must include tests
- **Maintain Coverage**: Don't decrease existing test coverage
- **Test Error Cases**: Include negative test cases
- **Performance Tests**: For performance-critical changes

### Test Examples

```typescript
// Example test structure
describe('PlatformDetector', () => {
  it('should detect GitBook platform correctly', async () => {
    const detector = new PlatformDetectorService();
    const result = await detector.detectPlatform('https://example.gitbook.io');
    
    expect(result.name).toBe('gitbook');
    expect(result.confidence).toBeGreaterThan(0.8);
  });
  
  it('should handle invalid URLs gracefully', async () => {
    const detector = new PlatformDetectorService();
    
    await expect(
      detector.detectPlatform('invalid-url')
    ).rejects.toThrow('Invalid URL');
  });
});
```

## 📖 Documentation Guidelines

### Documentation Standards

1. **Update Documentation**
   - README.md for user-facing changes
   - OVERVIEW.md for architectural changes
   - CHANGELOG.md for all changes
   - Code comments for complex logic

2. **Documentation Style**
   - Use clear, concise language
   - Include examples and code snippets
   - Add emojis for visual appeal
   - Maintain consistent formatting

3. **Example Documentation**
   ```markdown
   ## 🚀 New Feature: Platform Detection
   
   The platform detection feature automatically identifies documentation platforms:
   
   ```typescript
   const platform = await detector.detectPlatform('https://docs.example.com');
   console.log(platform.name); // 'gitbook'
   ```
   
   **Supported Platforms:**
   - GitBook
   - Docusaurus  
   - VitePress
   - Generic HTML
   ```

## 📤 Submitting Changes

### Pull Request Process

1. **Pre-submission Checklist**
   - [ ] Code builds successfully
   - [ ] All tests pass
   - [ ] Linting passes
   - [ ] Documentation updated
   - [ ] CHANGELOG.md updated

2. **Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   # Then create PR on GitHub
   ```

3. **PR Description Template**
   ```markdown
   ## 📋 Description
   Brief description of changes
   
   ## 🎯 Type of Change
   - [ ] 🐛 Bug fix
   - [ ] ✨ New feature
   - [ ] 📚 Documentation update
   - [ ] 🔧 Refactoring
   
   ## 🧪 Testing
   - [ ] Unit tests added/updated
   - [ ] Manual testing completed
   - [ ] All tests pass
   
   ## 📚 Documentation
   - [ ] README updated
   - [ ] Code comments added
   - [ ] CHANGELOG updated
   
   ## ✅ Checklist
   - [ ] Code follows project standards
   - [ ] Self-review completed
   - [ ] Functionality tested
   ```

### Review Process

1. **Automated Checks**: CI/CD will run tests and linting
2. **Code Review**: Maintainers will review code quality
3. **Testing**: Changes will be tested in various environments
4. **Documentation**: Documentation completeness will be verified
5. **Approval**: Changes will be merged after approval

## 👥 Community Guidelines

### Code of Conduct

We are committed to creating a welcoming, inclusive environment:

1. **Be Respectful**: Treat all community members with respect
2. **Be Constructive**: Provide helpful feedback and suggestions
3. **Be Patient**: Remember that everyone has different skill levels
4. **Be Collaborative**: Work together towards common goals

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Request Comments**: Code review discussions

### Getting Help

If you need help:

1. **Check Documentation**: README, OVERVIEW, and other docs
2. **Search Issues**: Someone might have had the same question
3. **Create Discussion**: For general questions
4. **Create Issue**: For specific bugs or feature requests

## 🎨 Pink Pixel Standards

As a Pink Pixel project, we maintain specific standards:

### Quality Standards

1. **Modern Approach**: Use contemporary best practices
2. **Elegant Solutions**: Prefer simple, clean implementations
3. **User-Focused**: Prioritize user experience
4. **Well-Documented**: Comprehensive documentation

### Branding Guidelines

1. **Attribution**: Include Pink Pixel attribution in outputs
2. **Consistency**: Maintain consistent styling and messaging
3. **Quality**: Reflect Pink Pixel's quality standards
4. **Innovation**: Embrace modern development practices

### Project Philosophy

- **"Dream it, Pixel it"**: Turn ideas into reality
- **Community-Driven**: Built by and for the community
- **Open Source**: Transparent and collaborative development
- **Quality-First**: Never compromise on quality

## 🙏 Recognition

Contributors will be recognized:

- **Contributors List**: Added to project contributors
- **Changelog**: Major contributions noted in changelog
- **GitHub**: Contributions visible in GitHub history
- **Community**: Recognition in community discussions

## 📞 Questions?

Have questions about contributing? We're here to help!

- **Create a Discussion**: For general questions
- **Email**: admin@pinkpixel.dev
- **GitHub Issues**: For specific technical questions

---

**Thank you for contributing to Context Generator MCP Server!**

*Made with ❤️ by Pink Pixel - "Dream it, Pixel it"*

Every contribution, no matter how small, makes a difference. We appreciate your time and effort in making this project better for everyone! ✨
