# 🚀 context-generator MCP Server

An MCP (Model Context Protocol) server that scrapes documentation websites and generates `context` files. Built with proven x-crawl patterns for reliable web scraping.

## ✨ Features

- 🕷️ **Smart Documentation Crawling** - Uses x-crawl with documentation-specific enhancements
- 🧠 **Platform Detection** - Automatically detects GitBook, Docusaurus, VuePress, and other platforms
- 📝 **Clean Content Extraction** - Removes navigation, ads, and preserves formatting
- 📋 **context Generation** - Creates both `llms.txt` and `llms-full.txt` formats
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
```

### `detect_platform`
Detect the documentation platform type for optimization.

```json
{
  "url": "https://docs.example.com"
}
```

### `generate_context`
Generate context format from crawled content.

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

### Basic Configuration

Add to your MCP client configuration:

```json
{
  "context-generator": {
    "command": "node",
    "args": ["/path/to/context-generator-server/dist/index.js"]
  }
}
```

### 🤖 AI Integration (Optional)

For enhanced crawling and content processing, you can configure AI providers:

```json
{
  "context-generator": {
    "command": "node",
    "args": ["/path/to/context-generator-server/dist/index.js"],
    "env": {
      "OPENAI_API_KEY": "sk-your-openai-key",
      "OPENAI_MODEL": "gpt-4",
      "OLLAMA_BASE_URL": "http://localhost:11434",
      "OLLAMA_MODEL": "llama2"
    }
  }
}
```

#### Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI-assisted crawling | - |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-3.5-turbo` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model name | `llama2` |

> **Note**: AI integration is optional. The server works without these variables, but some advanced features may not be available.
