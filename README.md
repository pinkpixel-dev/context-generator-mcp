# 🚀 llmstxt-generator MCP Server

An MCP (Model Context Protocol) server that scrapes documentation websites and generates `llmstxt` files. Built with proven x-crawl patterns for reliable web scraping.

## ✨ Features

- 🕷️ **Smart Documentation Crawling** - Uses x-crawl with documentation-specific enhancements
- 🧠 **Platform Detection** - Automatically detects GitBook, Docusaurus, VuePress, and other platforms
- 📝 **Clean Content Extraction** - Removes navigation, ads, and preserves formatting
- 📋 **llmstxt Generation** - Creates both `llms.txt` and `llms-full.txt` formats
- ⚡ **MCP Integration** - Works seamlessly with any MCP client

## 🛠️ MCP Tools

### `scrape_documentation`
Scrape an entire documentation website and extract content.

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

### `preview_page`
Preview content extraction from a single page.

```json
{
  "url": "https://docs.example.com/getting-started"
}
```### `detect_platform`
Detect the documentation platform type for optimization.

```json
{
  "url": "https://docs.example.com"
}
```

### `generate_llmstxt`
Generate llmstxt format from crawled content.

```json
{
  "crawlResults": [...],
  "options": {
    "format": "full",
    "includeSourceUrls": true
  }
}
```

## 🔧 Installation

```bash
npm install
npm run build
```

## 🏃‍♂️ Running

```bash
npm start
```

## 🧪 Development

```bash
npm run dev
```

## 📖 Usage with MCP Clients

Add to your MCP client configuration:

```json
{
  "llmstxt-generator": {
    "command": "node",
    "args": ["/path/to/llmstxt-generator-server/dist/index.js"]
  }
}
```