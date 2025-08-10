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
    timeout?: number;
    device?: string;
    fingerprint?: any;
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
      [key: string]: any;
    };
    id?: string;
    statusCode?: number;
    res?: any;
  }

  export class XCrawl {
    constructor(config?: CrawlConfig);
    crawlPage(options: string | CrawlPageOptions | Array<string | CrawlPageOptions>): Promise<CrawlResult | CrawlResult[]>;
    crawlData(options: string | CrawlDataOptions | Array<string | CrawlDataOptions>): Promise<CrawlResult | CrawlResult[]>;
  }

  export default function xCrawl(config?: CrawlConfig): XCrawl;
}