# 🦙 Ollama Setup Guide for Context-Generator MCP

This guide will help you set up Ollama to work with the context-generator MCP server for local AI-powered documentation processing.

## 🚀 Quick Start

1. **Install Ollama**
   - Download from: https://ollama.com/download
   - Available for Windows, macOS, and Linux

2. **Pull a Model**
   ```bash
   ollama pull llama3.1
   # or try other models like:
   # ollama pull llama3
   # ollama pull codellama
   # ollama pull mistral
   # ollama pull phi3
   ```

3. **Configure Environment**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and uncomment/set:
   OLLAMA_MODEL=llama3.1
   ```

4. **Start the MCP Server**
   ```bash
   npm run build
   npm start
   ```

## 📋 Detailed Setup

### Prerequisites

- Node.js 18+ installed
- Context-generator MCP server cloned and dependencies installed

### Step 1: Install Ollama

#### Windows
1. Download the installer from https://ollama.com/download
2. Run the installer and follow the setup wizard
3. Ollama will start automatically as a service

#### macOS
```bash
# Using Homebrew (recommended)
brew install ollama

# Or download from https://ollama.com/download
```

#### Linux
```bash
# Install using the official script
curl -fsSL https://ollama.com/install.sh | sh

# Or using package managers:
# Ubuntu/Debian: apt install ollama
# Fedora: dnf install ollama
```

### Step 2: Pull and Test Models

#### Available Models

| Model | Size | Best For | Command |
|-------|------|----------|---------|
| `llama3.1` | ~4.7GB | General purpose, balanced performance | `ollama pull llama3.1` |
| `llama3.1:8b` | ~4.7GB | Standard 8B parameter model | `ollama pull llama3.1:8b` |
| `llama3.1:70b` | ~40GB | Larger model, better quality (requires 64GB+ RAM) | `ollama pull llama3.1:70b` |
| `codellama` | ~3.8GB | Code-focused tasks | `ollama pull codellama` |
| `mistral` | ~4.1GB | Fast, efficient alternative | `ollama pull mistral` |
| `phi3` | ~2.3GB | Smaller, faster model | `ollama pull phi3` |

#### Pull a Model
```bash
# Recommended for most users
ollama pull llama3.1

# List available models
ollama list

# Test the model
ollama run llama3.1
>>> Hello! How are you?
>>> /bye
```

### Step 3: Configure the MCP Server

#### Environment Configuration
Copy `.env.example` to `.env` and configure:

```bash
# Required: Set the model you downloaded
OLLAMA_MODEL=llama3.1

# Optional: Custom Ollama server URL (default: http://localhost:11434)
# OLLAMA_BASE_URL=http://localhost:11434

# Optional: API key (only needed for hosted instances)
# OLLAMA_API_KEY=your_api_key_here
```

#### Common Configuration Examples

**Local Default Setup:**
```bash
OLLAMA_MODEL=llama3.1
```

**Custom Port:**
```bash
OLLAMA_MODEL=llama3.1
OLLAMA_BASE_URL=http://localhost:9999
```

**Remote Server:**
```bash
OLLAMA_MODEL=llama3.1
OLLAMA_BASE_URL=http://your-server:11434
OLLAMA_API_KEY=your_api_key_here
```

### Step 4: Start and Test

1. **Build and Start the MCP Server:**
   ```bash
   npm run build
   npm start
   ```

2. **Check for Successful Initialization:**
   Look for these log messages:
   ```
   🦙 [OLLAMA] Initializing with model: llama3.1
   🦙 [OLLAMA] Using default local URL (http://localhost:11434)
   ✅ Ollama crawler initialized successfully
   ✅ Documentation crawler service initialized successfully
   ```

## 🛠️ Advanced Configuration

### Performance Tuning

#### System Requirements by Model
- **llama3.1 (8B)**: 8GB RAM minimum, 16GB recommended
- **llama3.1 (70B)**: 64GB RAM minimum, 128GB recommended
- **codellama**: 6GB RAM minimum, 12GB recommended
- **mistral**: 6GB RAM minimum, 12GB recommended
- **phi3**: 4GB RAM minimum, 8GB recommended

#### Ollama Server Configuration
Create `~/.ollama/config.yaml` (Linux/macOS) or `%APPDATA%/ollama/config.yaml` (Windows):

```yaml
# Limit GPU memory usage (if using GPU)
gpu_memory_fraction: 0.8

# Set number of threads for CPU inference
num_threads: 8

# Enable/disable GPU acceleration
use_gpu: true
```

### Custom Model Parameters

You can customize model behavior by creating a Modelfile:

```bash
# Create a custom model with specific parameters
cat > Modelfile << EOF
FROM llama3.1

# Set temperature (creativity level: 0.0-1.0)
PARAMETER temperature 0.7

# Set context window size
PARAMETER num_ctx 4096

# Custom system prompt for documentation tasks
SYSTEM You are an expert at analyzing and extracting information from documentation websites.
EOF

# Create the custom model
ollama create docs-llama3.1 -f Modelfile

# Use the custom model
OLLAMA_MODEL=docs-llama3.1
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Connection refused" Error
```bash
# Check if Ollama is running
ollama list

# Start Ollama manually if needed
ollama serve

# Check the port (default: 11434)
netstat -an | grep 11434
```

#### 2. Model Not Found
```bash
# List installed models
ollama list

# Pull the model if missing
ollama pull llama3.1
```

#### 3. Out of Memory Errors
- Try a smaller model like `phi3`
- Reduce context window size
- Close other memory-intensive applications
- Consider using GPU acceleration

#### 4. Slow Performance
```bash
# Check system resources
top
htop

# Try a smaller, faster model
ollama pull phi3
```

#### 5. MCP Server Can't Connect to Ollama
```bash
# Check if Ollama API is accessible
curl http://localhost:11434/api/version

# Check your environment configuration
echo $OLLAMA_MODEL
echo $OLLAMA_BASE_URL
```

### Debug Mode

Enable debug logging in your `.env` file:
```bash
DEBUG_AI=true
DEBUG_CRAWLER=true
```

### Logs and Diagnostics

#### Ollama Logs
```bash
# Linux/macOS
journalctl -u ollama -f

# Or check the service directly
ollama logs
```

#### MCP Server Logs
The server outputs detailed logging to stderr, including:
- Ollama initialization status
- Model loading progress
- AI processing results
- Error details

## 🔧 Integration Examples

### Basic Usage with Ollama

Once configured, the MCP server will automatically use Ollama for AI-enhanced features:

1. **Content Analysis**: Ollama helps analyze and structure documentation content
2. **Smart Extraction**: AI-powered content extraction from complex documentation sites
3. **Context Generation**: Intelligent formatting and summarization for LLM consumption

### x-crawl Integration

The server uses the x-crawl library's Ollama integration:

```typescript
// Automatic initialization based on environment
if (process.env.OLLAMA_MODEL) {
  this.crawlOllamaApp = createCrawlOllama({
    model: process.env.OLLAMA_MODEL,
    clientOptions: {
      host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    }
  });
}
```

## 📚 Additional Resources

- [Ollama Official Documentation](https://ollama.com/docs)
- [Available Models](https://ollama.com/library)
- [x-crawl Documentation](https://github.com/coder-hxl/x-crawl)
- [Model Comparison Guide](https://ollama.com/blog/ollama-models)

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting) above
2. Review the server logs for error details
3. Verify your Ollama installation: `ollama --version`
4. Test your model directly: `ollama run your-model`
5. Check the [GitHub issues](https://github.com/your-repo/issues) for similar problems

---

**Happy crawling with Ollama! 🦙✨**
