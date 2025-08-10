# 🚀 context-generator MCP Server

An MCP (Model Context Protocol) server that scrapes documentation websites and generates `context` files. Built with proven x-crawl patterns for reliable web scraping.

## ✨ Features

- 🕷️ **Smart Documentation Crawling** - Uses x-crawl with documentation-specific enhancements
- 🧠 **Platform Detection** - Automatically detects GitBook, Docusaurus, VuePress, and other platforms
- 📝 **Clean Content Extraction** - Removes navigation, ads, and preserves formatting
- 📋 **context Generation** - Creates both `llms.txt` and `llms-full.txt` formats
- ⚡ **MCP Integration** - Works seamlessly with any MCP client
- 🦙 **Local AI Processing** - Full Ollama integration for privacy-focused AI features
- 💾 **Robust File Operations** - Enterprise-grade file writing with comprehensive error handling
- 🔧 **Enhanced Tool Descriptions** - LLM-optimized tool schemas with detailed usage guidance

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

For enhanced crawling and content processing, you can configure AI providers.

#### 🦙 Ollama (Recommended for Local Use)

**Benefits:**
- 🔒 **Privacy**: All data stays on your machine
- 💰 **Cost-effective**: No API fees
- ⚡ **Fast**: Local processing
- 🌐 **Offline**: Works without internet

**Quick Setup:**
```bash
# 1. Install Ollama: https://ollama.com/download
# 2. Pull a model
ollama pull llama3.1

# 3. Configure environment
echo "OLLAMA_MODEL=llama3.1" >> .env

# 4. Test the integration
npm run test:ollama
```

**MCP Configuration:**
```json
{
  "context-generator": {
    "command": "node",
    "args": ["/path/to/context-generator-server/dist/index.js"],
    "env": {
      "OLLAMA_MODEL": "llama3.1"
    }
  }
}
```

#### 🔑 OpenAI (Cloud-based)

**Benefits:**
- 🚀 **Powerful**: Latest GPT models
- ☁️ **No setup**: Cloud-based processing
- 🔧 **Maintenance-free**: Always updated

**Setup:**
```json
{
  "context-generator": {
    "command": "node",
    "args": ["/path/to/context-generator-server/dist/index.js"],
    "env": {
      "OPENAI_API_KEY": "sk-your-openai-key",
      "OPENAI_MODEL": "gpt-4"
    }
  }
}
```

#### 🔗 Mixed Configuration

```json
{
  "context-generator": {
    "command": "node",
    "args": ["/path/to/context-generator-server/dist/index.js"],
    "env": {
      "OPENAI_API_KEY": "sk-your-openai-key",
      "OPENAI_MODEL": "gpt-4",
      "OLLAMA_MODEL": "llama3.1",
      "OLLAMA_BASE_URL": "http://localhost:11434"
    }
  }
}
```

#### Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| **OpenAI** |
| `OPENAI_API_KEY` | OpenAI API key for AI-assisted crawling | - | ✅ (for OpenAI) |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-3.5-turbo` | ❌ |
| **Ollama** |
| `OLLAMA_MODEL` | Ollama model name (e.g., `llama3.1`, `codellama`) | `llama3.1` | ✅ (for Ollama) |
| `OLLAMA_BASE_URL` | Custom Ollama server URL | `http://localhost:11434` | ❌ |
| `OLLAMA_API_KEY` | API key for hosted Ollama instances | - | ❌ |

> **📖 Detailed Setup:** See [OLLAMA_SETUP.md](./OLLAMA_SETUP.md) for complete installation and configuration instructions.

> **🧪 Testing:** Use `npm run test:ollama` to validate your Ollama setup.

> **⚠️ Note:** AI integration is optional. The server works without these variables, but AI-enhanced features won't be available.
