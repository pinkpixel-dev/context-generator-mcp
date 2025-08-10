#!/usr/bin/env node
/**
 * Multi-page crawling test - try different documentation sites
 */

const { spawn } = require('child_process');

const testSites = [
  {
    name: "Vue.js Docs",
    url: "https://vuejs.org/guide/introduction.html",
    options: { maxPages: 3, maxDepth: 2, delayMs: 2000, outputFormat: "both" }
  },
  {
    name: "Vite Docs", 
    url: "https://vitejs.dev/guide/",
    options: { maxPages: 4, maxDepth: 2, delayMs: 2000, outputFormat: "llms-full-txt" }
  }
];

async function testSite(site) {
  console.log(`\n🌐 Testing: ${site.name}`);
  console.log(`🔗 URL: ${site.url}`);
  console.log(`⚙️ Options: ${JSON.stringify(site.options, null, 2)}`);

  return new Promise((resolve) => {
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
      
      // Show key progress
      if (chunk.includes('✅') || chunk.includes('📊') || chunk.includes('🎉')) {
        console.log('📋', chunk.trim());
      }
    });

    server.on('close', (code) => {
      if (!completed) {
        completed = true;
        
        // Parse result
        try {
          const lines = responseData.split('\n').filter(line => line.trim());
          const lastResponse = lines[lines.length - 1];
          
          if (lastResponse && lastResponse.includes('"result"')) {
            const parsed = JSON.parse(lastResponse);
            if (parsed.result && parsed.result.content && !parsed.result.isError) {
              console.log(`✅ ${site.name}: SUCCESS - Generated ${parsed.result.content.length} content blocks`);
            } else {
              console.log(`❌ ${site.name}: FAILED - Error in response`);
            }
          } else {
            console.log(`❓ ${site.name}: UNCLEAR - Could not parse response`);
          }
        } catch (e) {
          console.log(`❓ ${site.name}: UNCLEAR - Parse error`);
        }
        
        resolve({ site: site.name, code });
      }
    });

    // Initialize and send request
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
      const toolRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'scrape_documentation',
          arguments: {
            url: site.url,
            options: site.options
          },
        },
      };

      server.stdin.write(JSON.stringify(toolRequest) + '\n');

      // Timeout based on maxPages
      const timeout = (site.options.maxPages * 8000) + 30000;
      setTimeout(() => {
        if (!completed) {
          completed = true;
          console.log(`⏰ ${site.name}: TIMEOUT`);
          server.kill();
          resolve({ site: site.name, timeout: true });
        }
      }, timeout);
    }, 1000);
  });
}

async function runMultiPageTests() {
  console.log('🚀 Multi-Page Documentation Crawling Tests');
  console.log('Testing different documentation sites to see multi-page discovery\n');

  const results = [];
  
  for (const site of testSites) {
    try {
      const result = await testSite(site);
      results.push(result);
      
      // Wait between tests  
      console.log('\n⏳ Waiting 5 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`💥 ${site.name} test failed:`, error);
      results.push({ site: site.name, error: error.message });
    }
  }

  // Check output files
  console.log('\n📁 Checking generated files...');
  const fs = require('fs');
  try {
    const files = fs.readdirSync('./output');
    console.log(`Found ${files.length} total files in output:`);
    files.forEach(file => {
      const stats = fs.statSync(`./output/${file}`);
      const time = stats.mtime.toLocaleTimeString();
      console.log(`  📄 ${file} (${stats.size} bytes, ${time})`);
    });
  } catch (error) {
    console.log('⚠️ Could not read output directory');
  }

  console.log('\n📊 Multi-Page Test Summary:');
  results.forEach((result, i) => {
    const status = result.timeout ? '⏰ TIMEOUT' : 
                  result.error ? '❌ ERROR' : '✅ SUCCESS';
    console.log(`${i + 1}. ${result.site}: ${status}`);
  });
}

runMultiPageTests().catch(console.error);
