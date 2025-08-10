declare module 'x-crawl' {
  export interface CrawlConfig {
    mode?: 'async' | 'sync';
    crawlPage?: {
      puppeteerLaunch?: {
        headless?: boolean;
        args?: string[];
        [key: string]: any;
      };
    };
    intervalTime?: number;
    maxRetry?: number;
  }

  export interface CrawlPageOptions {
    targets: string | string[];
    timeout?: number;
    maxRetry?: number;
    intervalTime?: number | { max: number; min: number };
    device?: string;
    fingerprint?: {
      mobile?: boolean;
      platform?: string;
      acceptLanguage?: string;
      userAgent?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export interface CrawlDataOptions {
    timeout?: number;
    [key: string]: any;
  }

  export interface CrawlResult {
    isSuccess: boolean;
    data?: {
      html?: string;
      text?: string;
      content?: string;
      [key: string]: any;
    };
    id?: string;
    statusCode?: number;
    message?: string;
    res?: any;
  }

  export class XCrawl {
    constructor(config?: CrawlConfig);
    crawlPage(options: CrawlPageOptions): Promise<CrawlResult[]>;
    crawlData(options: string | CrawlDataOptions | Array<string | CrawlDataOptions>): Promise<CrawlResult | CrawlResult[]>;
  }

  export function createCrawl(config?: CrawlConfig): XCrawl;
  export function createCrawlOpenAI(config?: any): any;
  export function createCrawlOllama(config?: any): any;
}
