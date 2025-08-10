// Core types for the llmstxt generator MCP server

export interface DocumentationSite {
  url: string;
  title: string;
  platform: DocumentationPlatform;
  sitemapUrl?: string;
  baseUrl: string;
}

export interface DocumentationPlatform {
  name: 'gitbook' | 'docusaurus' | 'vuepress' | 'mintlify' | 'generic';
  description?: string;
  confidence?: number;
  selectors: {
    content: string;
    navigation: string;
    title: string;
    sidebar?: string;
  };
  features: string[];
  platformFeatures: {
    hasSitemap: boolean;
    hasNavigation: boolean;
    isStaticSite: boolean;
  };
}

export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  includeImages?: boolean;
  followExternalLinks?: boolean;
  respectRobotsTxt?: boolean;
  delayMs?: number;
  userAgent?: string;
  outputFormat?: 'llms-txt' | 'llms-full-txt' | 'both';
}

export interface CrawlResult {
  success: boolean;
  url: string;
  title?: string;
  content?: string;
  markdown?: string;
  platform?: DocumentationPlatform;
  error?: string;
  timestamp: string;
}

export interface ExtractedContent {
  title: string;
  content: string;
  markdown: string;
  url: string;
  links: string[];
  headings: Array<{ level: number; text: string; id?: string }>;
  codeBlocks: Array<{ language: string; code: string }>;
}
export interface LlmsTxtOptions {
  format: 'summary' | 'full' | 'both';
  includeSourceUrls: boolean;
  sectionHeaders: boolean;
  maxSectionLength?: number;
}

export interface LlmsTxtSection {
  title: string;
  content: string;
  sourceUrl: string;
  subsections?: LlmsTxtSection[];
}

export interface GeneratedLlmsTxt {
  content: string;
  sections: LlmsTxtSection[];
  metadata: {
    generatedAt: string;
    sourceCount: number;
    totalLength: number;
    format: 'summary' | 'full' | 'both';
  };
}

// MCP Tool input/output interfaces
export interface ScrapeDocumentationInput {
  url: string;
  options?: CrawlOptions;
}

export interface PreviewPageInput {
  url: string;
}

export interface DetectPlatformInput {
  url: string;
}

export interface GenerateLlmsTxtInput {
  crawlResults: CrawlResult[];
  options?: LlmsTxtOptions;
}