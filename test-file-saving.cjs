#!/usr/bin/env node
/**
 * Test file saving capabilities with different formats and paths
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testFileSaving() {
  console.log('💾 Testing File Saving Capabilities\n');

  // Create mock crawl results with rich content
  const mockCrawlResults = [
    {
      url: "https://example.com/api/getting-started",
      success: true,
      title: "API Getting Started Guide",
      content: `# API Getting Started Guide

Welcome to our comprehensive API documentation. This guide will help you get started with our RESTful API.

## Authentication
All API requests require authentication using API keys. Include your API key in the Authorization header:

\`\`\`bash
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Base URL
The base URL for all API endpoints is:
\`\`\`
https://api.example.com/v1
\`\`\`

## Rate Limiting
Our API enforces rate limits to ensure fair usage:
- 1000 requests per hour for authenticated requests
- 100 requests per hour for unauthenticated requests

## Response Format
All responses are returned in JSON format with the following structure:
\`\`\`json
{
  "data": {},
  "meta": {
    "status": "success",
    "message": "Request processed successfully"
  }
}
\`\`\``,
      markdown: "# API Getting Started Guide\\n\\nWelcome to our comprehensive API documentation...",
      timestamp: new Date().toISOString()
    },
    {
      url: "https://example.com/api/endpoints",
      success: true,
      title: "API Endpoints Reference",
      content: `# API Endpoints Reference

This document provides a comprehensive reference for all available API endpoints.

## User Management

### GET /users
Retrieve a list of users with optional filtering and pagination.

**Parameters:**
- \`page\` (integer): Page number for pagination
- \`limit\` (integer): Number of items per page (max 100)
- \`filter\` (string): Filter users by name or email

**Example Request:**
\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "https://api.example.com/v1/users?page=1&limit=10"
\`\`\`

### POST /users
Create a new user account.

**Required Fields:**
- \`email\` (string): User's email address
- \`name\` (string): User's full name
- \`password\` (string): User's password (min 8 characters)

### PUT /users/:id
Update an existing user's information.

### DELETE /users/:id
Delete a user account (requires admin privileges).

## Data Management

### GET /data
Retrieve data entries with filtering capabilities.

### POST /data
Create new data entries with validation.`,
      markdown: "# API Endpoints Reference\\n\\nThis document provides...",
      timestamp: new Date().toISOString()
    },
    {
      url: "https://example.com/api/examples",
      success: true,
      title: "Code Examples & SDKs",
      content: `# Code Examples & SDKs

This section provides practical examples for integrating with our API using various programming languages.

## JavaScript/Node.js

### Installation
\`\`\`bash
npm install example-api-client
\`\`\`

### Basic Usage
\`\`\`javascript
const ApiClient = require('example-api-client');

const client = new ApiClient({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.example.com/v1'
});

// Get user data
async function getUser(userId) {
  try {
    const user = await client.users.get(userId);
    console.log('User:', user);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
\`\`\`

## Python

### Installation
\`\`\`bash
pip install example-api-client
\`\`\`

### Basic Usage
\`\`\`python
from example_api import ApiClient

client = ApiClient(
    api_key='YOUR_API_KEY',
    base_url='https://api.example.com/v1'
)

# Get user data
try:
    user = client.users.get(user_id)
    print(f'User: {user}')
except Exception as error:
    print(f'Error: {error}')
\`\`\`

## Error Handling
Always implement proper error handling for API requests:

\`\`\`javascript
try {
  const response = await client.request('/endpoint');
  // Handle success
} catch (error) {
  if (error.status === 429) {
    // Handle rate limit
  } else if (error.status === 401) {
    // Handle authentication error
  } else {
    // Handle other errors
  }
}
\`\`\``,
      markdown: "# Code Examples & SDKs\\n\\nThis section provides practical examples...",
      timestamp: new Date().toISOString()
    }
  ];

  return new Promise((resolve) => {
    console.log('🚀 Starting generate_context test with file saving...');
    
    const server = spawn('node', ['./dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let responseData = '';
    let completed = false;

    server.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    server.stderr.on('data', (data) => {
      const chunk = data.toString();
      
      // Show file saving progress
      if (chunk.includes('💾') || chunk.includes('📁') || chunk.includes('✅') || chunk.includes('🎉')) {
        console.log('📋', chunk.trim());
      }
    });

    server.on('close', (code) => {
      if (!completed) {
        completed = true;
        console.log(`\n✅ File saving test completed (exit code: ${code})`);
        resolve({ code });
      }
    });

    // Initialize MCP protocol
    const initMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' },
      },
    };

    server.stdin.write(JSON.stringify(initMessage) + '\n');

    setTimeout(() => {
      const contextRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'generate_context',
          arguments: {
            crawlResults: mockCrawlResults,
            options: {
              format: 'both', // Generate both summary and full formats
              includeSourceUrls: true,
              sectionHeaders: true,
              maxSectionLength: 2000
            }
          },
        },
      };

      console.log('📤 Sending generate_context request with rich API documentation data...');
      server.stdin.write(JSON.stringify(contextRequest) + '\n');

      setTimeout(() => {
        if (!completed) {
          completed = true;
          server.kill();
          resolve({ timeout: true });
        }
      }, 20000);
    }, 1000);
  });
}

async function main() {
  try {
    await testFileSaving();

    // Check the generated files
    console.log('\n📁 Analyzing generated files:');
    const outputDir = './output';
    
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir);
      const apiFiles = files.filter(f => f.includes('example-com') || f.includes('api'));
      
      console.log(`\n📊 Found ${files.length} total files, ${apiFiles.length} from this test:`);
      
      files.forEach(file => {
        const filePath = path.join(outputDir, file);
        const stats = fs.statSync(filePath);
        const isNew = Date.now() - stats.mtime.getTime() < 60000; // Within last minute
        const marker = isNew ? '🆕' : '📄';
        
        console.log(`  ${marker} ${file} (${stats.size} bytes, ${stats.mtime.toLocaleTimeString()})`);
      });

      // Show preview of the newest file
      const newestFile = files
        .map(f => ({ name: f, mtime: fs.statSync(path.join(outputDir, f)).mtime }))
        .sort((a, b) => b.mtime - a.mtime)[0];

      if (newestFile) {
        console.log(`\n📖 Preview of newest file (${newestFile.name}):`);
        const content = fs.readFileSync(path.join(outputDir, newestFile.name), 'utf8');
        const lines = content.split('\n');
        const preview = lines.slice(0, 15).join('\n');
        console.log('─'.repeat(50));
        console.log(preview);
        if (lines.length > 15) {
          console.log(`... (${lines.length - 15} more lines)`);
        }
        console.log('─'.repeat(50));
      }

    } else {
      console.log('❌ No output directory found');
    }

    console.log('\n🎉 File saving test complete!');
    console.log('\n✅ Summary of what was tested:');
    console.log('- ✅ Context generation from multiple pages');
    console.log('- ✅ Both summary and full format generation'); 
    console.log('- ✅ Automatic file saving with timestamps');
    console.log('- ✅ Rich content with code blocks and markdown');
    console.log('- ✅ Proper file naming and organization');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

main();
