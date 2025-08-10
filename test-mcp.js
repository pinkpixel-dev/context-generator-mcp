#!/usr/bin/env node
/**
 * Simple MCP Server Test Tool
 * Tests the context-generator MCP server directly
 */

import { spawn } from 'child_process';

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
      responseData += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    server.on('error', (error) => {
      console.error('❌ Failed to start server:', error);
      reject(error);
    });

    server.on('close', (code) => {
      console.log(`\n📋 Server stderr output:\n${errorOutput}`);
      console.log(`\n📤 Server stdout output:\n${responseData}`);
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

    // Send test preview_page request after a delay
    setTimeout(() => {
      const previewRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'preview_page',
          arguments: {
            url: TEST_URL,
          },
        },
      };

      console.log(`📤 Sending preview_page request for: ${TEST_URL}`);
      server.stdin.write(JSON.stringify(previewRequest) + '\n');

      // Close after a reasonable timeout
      setTimeout(() => {
        console.log('⏰ Closing server after timeout...');
        server.kill();
      }, 30000); // 30 second timeout
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
