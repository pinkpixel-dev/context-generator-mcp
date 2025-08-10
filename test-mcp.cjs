#!/usr/bin/env node
/**
 * Simple MCP Server Test Tool (CommonJS)
 * Tests the context-generator MCP server directly
 */

const { spawn } = require('child_process');

// Test configuration
const SERVER_PATH = './dist/index.js';
const TEST_URL = 'https://docs.astro.build/en/getting-started';

async function testMCPServer() {
  console.log('🧪 Starting MCP Server Test...\n');

  return new Promise((resolve, reject) => {
    // Spawn the MCP server process
    const server = spawn('node', [SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let responseData = '';
    let errorOutput = '';

    server.stdout.on('data', (data) => {
      const chunk = data.toString();
      responseData += chunk;
      console.log('📤 STDOUT:', chunk);
    });

    server.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      console.log('📋 STDERR:', chunk);
    });

    server.on('error', (error) => {
      console.error('❌ Failed to start server:', error);
      reject(error);
    });

    server.on('close', (code) => {
      console.log(`\n🏁 Server exited with code: ${code}`);
      resolve({ code, stdout: responseData, stderr: errorOutput });
    });

    // Send MCP initialization
    const initMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0',
        },
      },
    };

    console.log('📤 Sending initialization...');
    server.stdin.write(JSON.stringify(initMessage) + '\n');

    // Wait for initialization response, then send tools/list
    setTimeout(() => {
      const listToolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      };

      console.log('📤 Sending tools/list request...');
      server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

      // Send test preview_page request after another delay
      setTimeout(() => {
        const scrapeRequest = {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'scrape_documentation',
            arguments: {
              url: TEST_URL,
              options: {
                maxPages: 3, // Keep it small for testing
                maxDepth: 2,
                delayMs: 2000,
                outputFormat: 'llms-full-txt'
              }
            },
          },
        };

        console.log(`📤 Sending scrape_documentation request for: ${TEST_URL}`);
        server.stdin.write(JSON.stringify(scrapeRequest) + '\n');

        // Close after a reasonable timeout
        setTimeout(() => {
          console.log('⏰ Closing server after timeout...');
          server.kill();
        }, 30000); // 30 second timeout
      }, 2000);
    }, 1000);
  });
}

// Run the test
testMCPServer()
  .then((result) => {
    console.log('\n🎉 Test completed!');
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
