# 🔧 MCP Client Configuration Guide

This guide shows you exactly how to configure the context-generator MCP server in your MCP client.

## 🎯 **Most Common Setup (Ollama Only)**

If you want to use **Ollama only** (recommended for privacy and cost), here's your configuration:

```json
{
  "mcpServers": {
    "context-generator": {
      "command": "node",
      "args": [
        "C:/Users/sizzlebop/Desktop/Projects/MCP/context-generator-mcp/dist/index.js"
      ],
      "env": {
        "OLLAMA_MODEL": "llama3.1"
      }
    }
  }
}
```

**Prerequisites:**
1. Install Ollama: https://ollama.com/download  
2. Pull your model: `ollama pull llama3.1`
3. Make sure Ollama is running: `ollama serve` (usually starts automatically)

## 📋 **Configuration Options**

### Option 1: 🦙 **Ollama Local (Default Port)**
```json
{
  "mcpServers": {
    "context-generator": {
      "command": "node",
      "args": ["C:/Users/sizzlebop/Desktop/Projects/MCP/context-generator-mcp/dist/index.js"],
      "env": {
        "OLLAMA_MODEL": "llama3.1"
      }
    }
  }
}
```
✅ **Use when:** Ollama is running on default port (11434)

### Option 2: 🦙 **Ollama Custom Port**
```json
{
  "mcpServers": {
    "context-generator": {
      "command": "node", 
      "args": ["C:/Users/sizzlebop/Desktop/Projects/MCP/context-generator-mcp/dist/index.js"],
      "env": {
        "OLLAMA_MODEL": "llama3.1",
        "OLLAMA_BASE_URL": "http://localhost:9999"
      }
    }
  }
}
```
✅ **Use when:** Ollama is running on a different port

### Option 3: 🦙 **Ollama Remote Server**
```json
{
  "mcpServers": {
    "context-generator": {
      "command": "node",
      "args": ["C:/Users/sizzlebop/Desktop/Projects/MCP/context-generator-mcp/dist/index.js"],
      "env": {
        "OLLAMA_MODEL": "llama3.1",
        "OLLAMA_BASE_URL": "http://your-server:11434",
        "OLLAMA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```
✅ **Use when:** Connecting to a remote Ollama server

### Option 4: 🔑 **OpenAI Only**
```json
{
  "mcpServers": {
    "context-generator": {
      "command": "node",
      "args": ["C:/Users/sizzlebop/Desktop/Projects/MCP/context-generator-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-your-openai-key-here",
        "OPENAI_MODEL": "gpt-4"
      }
    }
  }
}
```
✅ **Use when:** You prefer OpenAI and have an API key

### Option 5: 🔗 **Both OpenAI + Ollama**
```json
{
  "mcpServers": {
    "context-generator": {
      "command": "node",
      "args": ["C:/Users/sizzlebop/Desktop/Projects/MCP/context-generator-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-your-openai-key-here",
        "OPENAI_MODEL": "gpt-4",
        "OLLAMA_MODEL": "llama3.1"
      }
    }
  }
}
```
✅ **Use when:** You want both options available

### Option 6: 🚀 **No AI (Basic Crawling)**
```json
{
  "mcpServers": {
    "context-generator": {
      "command": "node",
      "args": ["C:/Users/sizzlebop/Desktop/Projects/MCP/context-generator-mcp/dist/index.js"]
    }
  }
}
```
✅ **Use when:** You only want basic crawling without AI features

## 🎯 **For Your Setup**

Based on your question, you want **Ollama only**, so:

### 1. **Remove OpenAI stuff** ❌
```json
// DELETE these lines:
"OPENAI_API_KEY": "sk-xxxxxx",
"OPENAI_MODEL": "gpt-4",
```

### 2. **Keep/Update Ollama config** ✅
```json
// KEEP and update these:
"OLLAMA_MODEL": "llama3.1"  // Change to your preferred model
```

### 3. **Optional: Remove OLLAMA_BASE_URL** (unless you need it)
```json
// REMOVE this line if using default port:
"OLLAMA_BASE_URL": "http://localhost:11434"
```

## 🛠️ **Your Final Configuration**

Copy this exact configuration for **Ollama-only setup**:

```json
{
  "mcpServers": {
    "context-generator": {
      "command": "node",
      "args": [
        "C:/Users/sizzlebop/Desktop/Projects/MCP/context-generator-mcp/dist/index.js"
      ],
      "env": {
        "OLLAMA_MODEL": "llama3.1"
      }
    }
  }
}
```

## 🧪 **Testing Your Configuration**

After configuring, test your setup:

```bash
# 1. Test Ollama integration
cd "C:/Users/sizzlebop/Desktop/Projects/MCP/context-generator-mcp"
npm run test:ollama

# 2. Start the MCP server manually to check logs
npm start

# 3. Look for this in the logs:
# 🦙 [OLLAMA] Initializing with model: llama3.1
# ✅ Ollama crawler initialized successfully
```

## 🔧 **Popular Model Options**

| Model | Size | RAM Needed | Best For |
|-------|------|------------|----------|
| `llama3.1` | ~4.7GB | 8GB+ | General purpose, balanced |
| `llama3.1:70b` | ~40GB | 64GB+ | Best quality (if you have the RAM) |
| `codellama` | ~3.8GB | 6GB+ | Code-focused documentation |
| `mistral` | ~4.1GB | 6GB+ | Fast, efficient alternative |
| `phi3` | ~2.3GB | 4GB+ | Smaller, faster (lower quality) |

## 🆘 **Troubleshooting**

### Problem: "Connection refused"
**Solution:** Make sure Ollama is running
```bash
ollama serve
# or check if it's already running:
ollama list
```

### Problem: "Model not found"  
**Solution:** Pull the model first
```bash
ollama pull llama3.1
```

### Problem: "Server won't start"
**Solution:** Check the file path in your config
```bash
# Make sure this file exists:
ls "C:/Users/sizzlebop/Desktop/Projects/MCP/context-generator-mcp/dist/index.js"
```

---

**🎉 You're all set! Your MCP client will now use Ollama for local AI-powered documentation processing.**
