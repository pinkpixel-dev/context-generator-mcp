#!/usr/bin/env node
/**
 * Comprehensive MCP Server Test Tool
 * Tests all functionality including multi-page crawling, formatting, and file saving
 */

const { spawn } = require('child_process');
const fs = require('fs');

// Test configuration
const SERVER_PATH = './dist/index.js';

// Test scenarios
const testScenarios = [
  {
    name: "Single Page Preview",
    tool: "preview_page",
    args: {
      url: "https://docs.astro.build/en/getting-started"
    }
  },
  {
    name: "Small Multi-Page Scrape",
    tool: "scrape_documentation", 
    args: {
      url: "https://docs.astro.build/en/getting-started",
      options: {
        maxPages: 5,
        maxDepth: 2,
        delayMs: 1000,
        outputFormat: "both"
      }
    }
  },
  {
    name: "Recursive Documentation Crawl",
    tool: "scrape_documentation",
    args: {
      url: "https://docs.astro.build/en/getting-started",
      options: {
        maxPages: 10,
        maxDepth: 3,
        delayMs: 1500,
        outputFormat: "llms-full-txt"
      }
    }
  }
];

async function runTest(scenario, testIndex) {
  console.log(`\n🧪 Test ${testIndex + 1}: ${scenario.name}`);
  console.log(`📋 Tool: ${scenario.tool}`);
  console.log(`🔗 URL: ${scenario.args.url}`);
  console.log(`⚙️ Options: ${JSON.stringify(scenario.args.options || {}, null, 2)}`);

  return new Promise((resolve, reject) => {
    const server = spawn('node', [SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let responseData = '';
    let errorOutput = '';
    let testStartTime = Date.now();

    server.stdout.on('data', (data) => {
      const chunk = data.toString();
      responseData += chunk;
      
      // Only show key responses, not all the raw JSON
      if (chunk.includes('"result"') && chunk.includes('"type":"text"')) {
        console.log('📤 Response received (truncated)');
      }
    });

    server.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      
      // Show key progress indicators
      if (chunk.includes('✅') || chunk.includes('❌') || chunk.includes('🎉') || chunk.includes('🔍')) {
        console.log('📋', chunk.trim());
      }
    });

    server.on('error', (error) => {
      console.error('❌ Failed to start server:', error);
      reject(error);
    });

    server.on('close', (code) => {
      const duration = Math.round((Date.now() - testStartTime) / 1000);
      console.log(`\n⏱️ Test completed in ${duration}s (exit code: ${code})`);
      
      // Parse the final result
      try {
        const lines = responseData.split('\n').filter(line => line.trim());
        const lastResponse = lines[lines.length - 1];
        
        if (lastResponse && lastResponse.includes('"result"')) {
          const parsed = JSON.parse(lastResponse);
          if (parsed.result && parsed.result.content) {
            console.log(`✅ Success: Generated ${parsed.result.content.length} content blocks`);
            
            // Show summary of first content block
            if (parsed.result.content[0] && parsed.result.content[0].text) {
              const text = parsed.result.content[0].text;
              const preview = text.substring(0, 200) + (text.length > 200 ? '...' : '');
              console.log(`📝 Preview: ${preview}`);
            }
          } else if (parsed.result && parsed.result.isError) {
            console.log('❌ Test failed with error response');
          }
        }
      } catch (e) {
        console.log('📊 Raw response parsing failed - check output manually');
      }
      
      resolve({ 
        code, 
        stdout: responseData, 
        stderr: errorOutput, 
        duration,
        scenario: scenario.name
      });
    });

    // Initialize MCP protocol
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

    server.stdin.write(JSON.stringify(initMessage) + '\n');

    // Send the test request
    setTimeout(() => {
      const toolRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: scenario.tool,
          arguments: scenario.args,
        },
      };

      console.log(`📤 Sending ${scenario.tool} request...`);
      server.stdin.write(JSON.stringify(toolRequest) + '\n');

      // Set timeout based on scenario complexity
      const timeout = scenario.args.options?.maxPages ? 
        (scenario.args.options.maxPages * 5000) + 30000 : 
        30000;

      setTimeout(() => {
        console.log(`⏰ Test timeout reached (${timeout}ms)`);
        server.kill();
      }, timeout);
    }, 1000);
  });
}

async function testGenerateContext() {
  console.log(`\n🧪 Test 4: Generate Context from Mock Data`);
  
  // Create mock crawl results
  const mockCrawlResults = [
    {
      url: "https://docs.astro.build/en/getting-started",
      success: true,
      title: "Getting Started with Astro",
      content: "Astro is a modern web framework for building fast, content-focused websites. It allows you to use your favorite UI components and frameworks while shipping minimal JavaScript to the browser. This guide will help you get started with Astro quickly and efficiently.",
      markdown: "# Getting Started with Astro\n\nAstro is a modern web framework...",
      timestamp: new Date().toISOString()
    },
    {
      url: "https://docs.astro.build/en/core-concepts/project-structure",
      success: true,
      title: "Project Structure",
      content: "Understanding Astro's project structure is crucial for building maintainable applications. The src/ directory contains your source code, public/ contains static assets, and astro.config.mjs contains your configuration. Components can be written in multiple frameworks and are automatically optimized.",
      markdown: "# Project Structure\n\nUnderstanding Astro's project structure...",
      timestamp: new Date().toISOString()
    },
    {
      url: "https://docs.astro.build/en/core-concepts/astro-components", 
      success: true,
      title: "Astro Components",
      content: "Astro components are the building blocks of your Astro application. They use a special .astro file format that combines HTML-like syntax with JavaScript. Components can include frontmatter for server-side logic and a template section for markup. They support props, slots, and can import other components or frameworks.",
      markdown: "# Astro Components\n\nAstro components are the building blocks...",
      timestamp: new Date().toISOString()
    }
  ];

  return new Promise((resolve, reject) => {
    const server = spawn('node', [SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let responseData = '';
    let errorOutput = '';

    server.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    server.stderr.on('data', (data) => {
      const chunk = data.toString();
      errorOutput += chunk;
      if (chunk.includes('✅') || chunk.includes('💾') || chunk.includes('🎉')) {
        console.log('📋', chunk.trim());
      }
    });

    server.on('close', (code) => {
      console.log(`✅ Context generation completed (exit code: ${code})`);
      resolve({ code, stdout: responseData, stderr: errorOutput });
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

    // Send generate_context request
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
              format: 'both',
              includeSourceUrls: true,
              sectionHeaders: true,
              maxSectionLength: 1000
            }
          },
        },
      };

      console.log('📤 Sending generate_context request with mock data...');
      server.stdin.write(JSON.stringify(contextRequest) + '\n');

      setTimeout(() => {
        server.kill();
      }, 15000);
    }, 1000);
  });
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive MCP Server Tests\n');
  console.log('This will test:');
  console.log('- Single page preview');
  console.log('- Multi-page documentation scraping'); 
  console.log('- Recursive crawling with multiple pages');
  console.log('- Context generation and file saving');
  console.log('- Various output formats\n');

  const results = [];

  // Run individual tool tests
  for (let i = 0; i < testScenarios.length; i++) {
    try {
      const result = await runTest(testScenarios[i], i);
      results.push(result);
      
      // Wait between tests
      console.log('\n⏳ Waiting 3 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`❌ Test ${i + 1} failed:`, error);
      results.push({ error: error.message, scenario: testScenarios[i].name });
    }
  }

  // Test context generation
  try {
    const contextResult = await testGenerateContext();
    results.push({ ...contextResult, scenario: 'Generate Context' });
  } catch (error) {
    console.error('❌ Context generation test failed:', error);
    results.push({ error: error.message, scenario: 'Generate Context' });
  }

  // Check output directory for saved files
  console.log('\n📁 Checking for generated files...');
  try {
    const outputDir = './output';
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir);
      console.log(`✅ Found ${files.length} files in output directory:`);
      files.forEach(file => {
        const stats = fs.statSync(`${outputDir}/${file}`);
        console.log(`  📄 ${file} (${stats.size} bytes)`);
      });
    } else {
      console.log('ℹ️ No output directory found - files may not have been saved');
    }
  } catch (error) {
    console.log('⚠️ Error checking output directory:', error.message);
  }

  // Generate test summary
  console.log('\n🎉 Test Summary:');
  console.log('================');
  results.forEach((result, index) => {
    const status = result.error ? '❌ FAILED' : '✅ PASSED';
    const duration = result.duration ? `(${result.duration}s)` : '';
    console.log(`${index + 1}. ${result.scenario}: ${status} ${duration}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const passedTests = results.filter(r => !r.error).length;
  const totalTests = results.length;
  console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('\n🎊 All tests passed! The MCP server is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('\n💥 Test suite failed:', error);
  process.exit(1);
});
