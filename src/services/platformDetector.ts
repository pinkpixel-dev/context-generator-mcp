/**
 * Platform Detector Service
 * Detects documentation platform types and their specific characteristics
 * Optimizes crawling strategies for each platform
 */

import { load } from 'cheerio';
import type { DocumentationPlatform } from '../types/index.js';

// Platform configurations with specific selectors and features
const PLATFORM_CONFIGS: Record<string, DocumentationPlatform> = {
  gitbook: {
    name: 'gitbook',
    description: 'GitBook documentation platform with rich navigation and interactive features',
    confidence: 0.95,
    selectors: {
      content: '.page-inner, .markdown-section, [data-testid="content"]',
      navigation: '.book-summary, .navigation, [data-testid="sidebar"]',
      title: 'h1, .page-title, [data-testid="page-title"]',
      sidebar: '.book-summary ul, .sidebar-nav'
    },
    features: [
      'Rich navigation structure',
      'Interactive content blocks',
      'Search integration',
      'Version control integration'
    ],
    platformFeatures: {
      hasSitemap: true,
      hasNavigation: true,
      isStaticSite: false
    }
  },
  
  docusaurus: {
    name: 'docusaurus',
    description: 'React-based documentation platform optimized for developer docs',
    confidence: 0.90,
    selectors: {
      content: '.docMainContainer, .markdown, main[role="main"]',
      navigation: '.navbar, .menu, .sidebar',
      title: 'h1, .docTitle, header h1',
      sidebar: '.menu__list, .sidebar .menu'
    },
    features: [
      'React-based SPA',
      'Version management',
      'Plugin ecosystem',
      'Search functionality'
    ],
    platformFeatures: {
      hasSitemap: true,
      hasNavigation: true,
      isStaticSite: true
    }
  },
  
  vuepress: {
    name: 'vuepress',
    description: 'Vue.js powered static site generator for documentation',
    confidence: 0.85,
    selectors: {
      content: '.page, .content, .theme-default-content',
      navigation: '.navbar, .nav-links, .sidebar',
      title: 'h1, .page-title',
      sidebar: '.sidebar-links, .sidebar .sidebar-links'
    },
    features: [
      'Vue.js components',
      'Markdown extensions',
      'Theme customization',
      'Fast static generation'
    ],
    platformFeatures: {
      hasSitemap: true,
      hasNavigation: true,
      isStaticSite: true
    }
  },  
  mintlify: {
    name: 'mintlify',
    description: 'Modern API documentation platform with beautiful design',
    confidence: 0.80,
    selectors: {
      content: '.docs-content, .markdown, main',
      navigation: '.sidebar, .nav, .navigation-menu',
      title: 'h1, .docs-title',
      sidebar: '.sidebar-content, .navigation-menu'
    },
    features: [
      'API reference integration',
      'Modern UI components',
      'Interactive examples',
      'Analytics integration'
    ],
    platformFeatures: {
      hasSitemap: true,
      hasNavigation: true,
      isStaticSite: true
    }
  },
  
  generic: {
    name: 'generic',
    description: 'Generic documentation site with standard HTML structure',
    confidence: 0.50,
    selectors: {
      content: 'main, .content, #content, .main-content, article, .post-content',
      navigation: 'nav, .nav, .navigation, .menu, .sidebar',
      title: 'h1, title, .title, .page-title',
      sidebar: '.sidebar, .nav, .menu'
    },
    features: [
      'Standard HTML structure',
      'Basic navigation',
      'Simple content layout'
    ],
    platformFeatures: {
      hasSitemap: false,
      hasNavigation: true,
      isStaticSite: true
    }
  }
};

export class PlatformDetectorService {
  
  /**
   * Detect documentation platform from URL and content
   */
  async detectPlatform(url: string, htmlContent?: string): Promise<DocumentationPlatform> {
    console.error(`🔍 [PLATFORM-DETECT] Analyzing: ${url}`);
    
    // Step 1: URL-based detection (fastest)
    const urlPlatform = this.detectFromUrl(url);
    if (urlPlatform !== 'generic') {
      console.error(`✅ [PLATFORM-DETECT] Detected ${urlPlatform} from URL`);
      return PLATFORM_CONFIGS[urlPlatform];
    }
    
    // Step 2: Content-based detection (if HTML provided)
    if (htmlContent) {
      const contentPlatform = this.detectFromContent(htmlContent);
      if (contentPlatform !== 'generic') {
        console.error(`✅ [PLATFORM-DETECT] Detected ${contentPlatform} from content`);
        return PLATFORM_CONFIGS[contentPlatform];
      }
    }
    
    // Step 3: Advanced heuristics
    const heuristicPlatform = this.detectFromHeuristics(url, htmlContent);
    console.error(`✅ [PLATFORM-DETECT] Using ${heuristicPlatform} (${heuristicPlatform === 'generic' ? 'fallback' : 'heuristic'})`);
    
    return PLATFORM_CONFIGS[heuristicPlatform];
  }  
  /**
   * Detect platform from URL patterns
   */
  private detectFromUrl(url: string): string {
    const urlPatterns = {
      gitbook: [
        /\.gitbook\./,
        /gitbook\.com/,
        /gitbook\.io/,
        /app\.gitbook\.com/
      ],
      docusaurus: [
        /docusaurus/,
        /\.netlify\.app.*docs/,
        /\.vercel\.app.*docs/,
        /github\.io.*docs/
      ],
      vuepress: [
        /vuepress/,
        /\.vuepress/
      ],
      mintlify: [
        /mintlify/,
        /docs\.[^.]+\.com/,
        /[^.]+\.mintlify\./
      ]
    };
    
    for (const [platform, patterns] of Object.entries(urlPatterns)) {
      if (patterns.some(pattern => pattern.test(url))) {
        return platform;
      }
    }
    
    return 'generic';
  }
  
  /**
   * Detect platform from HTML content analysis
   */
  private detectFromContent(htmlContent: string): string {
    const $ = load(htmlContent);
    
    // GitBook signatures
    if ($('.gitbook-root').length > 0 || 
        $('[data-testid="sidebar"]').length > 0 ||
        $('.book-summary').length > 0 ||
        $('meta[name="generator"][content*="gitbook"]').length > 0) {
      return 'gitbook';
    }
    
    // Docusaurus signatures
    if ($('.docusaurus').length > 0 ||
        $('[data-theme]').length > 0 ||
        $('.navbar__brand').length > 0 ||
        $('meta[name="generator"][content*="docusaurus"]').length > 0 ||
        $('script').text().includes('docusaurus')) {
      return 'docusaurus';
    }
    
    // VuePress signatures
    if ($('.theme-default-content').length > 0 ||
        $('.sidebar-links').length > 0 ||
        $('meta[name="generator"][content*="vuepress"]').length > 0 ||
        $('script').text().includes('vuepress')) {
      return 'vuepress';
    }
    
    // Mintlify signatures
    if ($('.mintlify').length > 0 ||
        $('.docs-content').length > 0 ||
        $('meta[name="generator"][content*="mintlify"]').length > 0) {
      return 'mintlify';
    }
    
    return 'generic';
  }  
  /**
   * Advanced heuristic detection based on multiple signals
   */
  private detectFromHeuristics(url: string, htmlContent?: string): string {
    let scores = {
      gitbook: 0,
      docusaurus: 0,
      vuepress: 0,
      mintlify: 0,
      generic: 0
    };
    
    // URL path analysis
    if (url.includes('/docs/')) scores.docusaurus += 2;
    if (url.includes('/guide/')) scores.vuepress += 2;
    if (url.includes('.gitbook.')) scores.gitbook += 3;
    if (url.includes('mintlify')) scores.mintlify += 3;
    
    // Content analysis (if available)
    if (htmlContent) {
      const $ = load(htmlContent);
      
      // Check for common framework CSS classes
      const classes = $('*').get().map(el => $(el).attr('class')).join(' ');
      
      if (classes.includes('docusaurus')) scores.docusaurus += 5;
      if (classes.includes('gitbook')) scores.gitbook += 5;
      if (classes.includes('vuepress')) scores.vuepress += 5;
      if (classes.includes('mintlify')) scores.mintlify += 5;
      
      // Navigation structure hints
      if ($('.book-summary').length > 0) scores.gitbook += 3;
      if ($('.navbar__brand').length > 0) scores.docusaurus += 3;
      if ($('.sidebar-links').length > 0) scores.vuepress += 3;
      if ($('.docs-content').length > 0) scores.mintlify += 3;
      
      // React/Vue indicators
      const pageText = $('body').text() || '';
      if (pageText.includes('React') || $('script[src*="react"]').length > 0) {
        scores.docusaurus += 2;
      }
      if (pageText.includes('Vue') || $('script[src*="vue"]').length > 0) {
        scores.vuepress += 2;
      }
    }
    
    // Find the platform with the highest score
    const topPlatform = Object.entries(scores).reduce((a, b) => 
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
    )[0] as keyof typeof scores;
    
    // Only return specific platform if score is high enough
    return scores[topPlatform] >= 3 ? topPlatform : 'generic';
  }
  
  /**
   * Get platform-specific configuration
   */
  getPlatformConfig(platformName: string): DocumentationPlatform {
    return PLATFORM_CONFIGS[platformName] || PLATFORM_CONFIGS.generic;
  }  
  /**
   * Get all supported platforms
   */
  getSupportedPlatforms(): string[] {
    return Object.keys(PLATFORM_CONFIGS);
  }
  
  /**
   * Quick platform detection from URL only (fast)
   */
  quickDetect(url: string): DocumentationPlatform {
    const platform = this.detectFromUrl(url);
    return PLATFORM_CONFIGS[platform];
  }
  
  /**
   * Analyze platform capabilities and suggest crawling strategy
   */
  analyzePlatform(platform: DocumentationPlatform): {
    recommendedStrategy: string;
    contentSelectors: string[];
    navigationSelectors: string[];
    crawlHints: string[];
  } {
    const strategies = {
      gitbook: {
        recommendedStrategy: 'navigation-first',
        contentSelectors: [platform.selectors.content, '.page-inner', '.markdown-section'],
        navigationSelectors: [platform.selectors.navigation, '.book-summary a'],
        crawlHints: [
          'Follow sidebar navigation systematically',
          'Look for SUMMARY.md structure',
          'Check for nested sections in navigation'
        ]
      },
      docusaurus: {
        recommendedStrategy: 'sitemap-first',
        contentSelectors: [platform.selectors.content, '.markdown', '.docMainContainer'],
        navigationSelectors: [platform.selectors.sidebar, '.menu__list a'],
        crawlHints: [
          'Start with sitemap.xml for comprehensive coverage',
          'Follow category-based navigation',
          'Check for versioned documentation'
        ]
      },
      vuepress: {
        recommendedStrategy: 'hybrid',
        contentSelectors: [platform.selectors.content, '.theme-default-content'],
        navigationSelectors: [platform.selectors.sidebar, '.sidebar-links a'],
        crawlHints: [
          'Combine sitemap and navigation crawling',
          'Look for .vuepress/config.js patterns',
          'Check for guide vs API section separation'
        ]
      },
      mintlify: {
        recommendedStrategy: 'sitemap-first',
        contentSelectors: [platform.selectors.content, '.docs-content'],
        navigationSelectors: [platform.selectors.sidebar, '.navigation-menu a'],
        crawlHints: [
          'Prioritize sitemap.xml for API docs',
          'Follow structured navigation tree',
          'Look for OpenAPI integration'
        ]
      }
    };
    
    return strategies[platform.name] || {
      recommendedStrategy: 'navigation-first',
      contentSelectors: [platform.selectors.content],
      navigationSelectors: [platform.selectors.navigation],
      crawlHints: [
        'Use generic content extraction',
        'Follow basic link discovery',
        'Apply conservative crawling approach'
      ]
    };
  }
}