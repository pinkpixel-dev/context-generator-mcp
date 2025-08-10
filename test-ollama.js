#!/usr/bin/env node

/**
 * Quick test script to validate Ollama integration
 * Run this to check if Ollama is properly configured
 */

import { createCrawlOllama } from 'x-crawl';

async function testOllamaConnection() {
  console.log('🦙 Testing Ollama Integration...\n');
  
  // Check environment variables
  const ollamaModel = process.env.OLLAMA_MODEL;
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const ollamaApiKey = process.env.OLLAMA_API_KEY;
  
  console.log('📋 Configuration:');
  console.log(`   Model: ${ollamaModel || 'NOT SET'}`);
  console.log(`   Base URL: ${ollamaBaseUrl}`);
  console.log(`   API Key: ${ollamaApiKey ? 'SET' : 'NOT SET'}\n`);
  
  if (!ollamaModel) {
    console.log('❌ OLLAMA_MODEL not set in environment');
    console.log('   Set it with: export OLLAMA_MODEL=llama3.1');
    console.log('   Or add it to your .env file\n');
    process.exit(1);
  }
  
  // Test Ollama server connectivity first
  console.log('🔍 Testing Ollama server connectivity...');
  try {
    const response = await fetch(`${ollamaBaseUrl}/api/version`);
    if (response.ok) {
      const version = await response.json();
      console.log(`✅ Ollama server is running (version: ${version.version})\n`);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Cannot connect to Ollama server at ${ollamaBaseUrl}`);
    console.log(`   Error: ${error.message}`);
    console.log('   Make sure Ollama is running: ollama serve\n');
    process.exit(1);
  }
  
  // Test model availability
  console.log(`🔍 Checking if model '${ollamaModel}' is available...`);
  try {
    const response = await fetch(`${ollamaBaseUrl}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      const modelExists = data.models.some(m => m.name === ollamaModel || m.name.startsWith(ollamaModel + ':'));
      
      if (modelExists) {
        console.log(`✅ Model '${ollamaModel}' is available\n`);
      } else {
        console.log(`❌ Model '${ollamaModel}' not found`);
        console.log('   Available models:');
        data.models.forEach(m => console.log(`     - ${m.name}`));
        console.log(`   Install with: ollama pull ${ollamaModel}\n`);
        process.exit(1);
      }
    }
  } catch (error) {
    console.log(`⚠️ Could not verify model availability: ${error.message}\n`);
  }
  
  // Test x-crawl Ollama integration
  console.log('🔍 Testing x-crawl Ollama integration...');
  try {
    const clientOptions = {};
    if (ollamaBaseUrl !== 'http://localhost:11434') {
      clientOptions.host = ollamaBaseUrl;
    }
    if (ollamaApiKey) {
      clientOptions.headers = {
        'Authorization': `Bearer ${ollamaApiKey}`
      };
    }
    
    const crawlOllamaApp = createCrawlOllama({
      model: ollamaModel,
      clientOptions: clientOptions
    });
    
    console.log('✅ x-crawl Ollama app created successfully');
    console.log('✅ Integration test passed!\n');
    
    // Optional: Test a simple query if user wants
    console.log('🎯 Integration is ready!');
    console.log('   Your context-generator MCP server can now use Ollama for AI-powered features.');
    console.log('   Start the server with: npm start\n');
    
  } catch (error) {
    console.log(`❌ x-crawl Ollama integration failed: ${error.message}`);
    console.log('   This might be a configuration or compatibility issue\n');
    process.exit(1);
  }
}

// Run the test
testOllamaConnection().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
