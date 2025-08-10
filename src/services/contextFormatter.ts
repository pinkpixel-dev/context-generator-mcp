/**
 * Context Formatter Service
 * Formats extracted content into proper context format
 */

import type { CrawlResult, ContextOptions, GeneratedContext, ContextSection } from '../types/index.js';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';

interface DocumentHierarchy {
  title: string;
  url: string;
  content: string;
  level: number;
  children: DocumentHierarchy[];
}

export class ContextFormatterService {
  /**
   * Main method to format crawl results into context format
   */
  async formatToContext(results: CrawlResult[], options: ContextOptions = {
    format: 'full',
    includeSourceUrls: true,
    sectionHeaders: true,
  }): Promise<GeneratedContext> {
    console.error(`📝 [LLMSTXT-FORMAT] Starting formatting of ${results.length} crawl results`);
    console.error(`📋 [LLMSTXT-FORMAT] Options: ${JSON.stringify(options, null, 2)}`);
    
    // Filter successful results
    const successfulResults = results.filter(result => result.success && result.content);
    
    if (successfulResults.length === 0) {
      console.error('❌ [LLMSTXT-FORMAT] No successful results to format');
      throw new Error('No successful crawl results to format');
    }
    
    console.error(`✅ [LLMSTXT-FORMAT] Processing ${successfulResults.length} successful results`);
    
    // Build document hierarchy
    const hierarchy = this.buildDocumentHierarchy(successfulResults);
    
    // Convert to sections
    const sections = this.convertToSections(hierarchy, options);
    
    // Generate the final context content
    const content = this.generateContextContent(sections, options, successfulResults[0]?.url);
    
    const metadata = {
      generatedAt: new Date().toISOString(),
      sourceCount: successfulResults.length,
      totalLength: content.length,
      format: options.format,
    };
    
    console.error(`🎉 [LLMSTXT-FORMAT] Formatting completed successfully!`);
    console.error(`📊 [LLMSTXT-FORMAT] Generated: ${content.length} chars, ${sections.length} sections`);
    
    return {
      content,
      sections,
      metadata,
    };
  }

  /**
   * Build a hierarchical document structure from crawl results
   */
  private buildDocumentHierarchy(results: CrawlResult[]): DocumentHierarchy[] {
    console.error(`🏗️ [HIERARCHY] Building document hierarchy from ${results.length} results`);
    
    const hierarchy: DocumentHierarchy[] = [];
    const urlMap = new Map<string, DocumentHierarchy>();
    
    // First pass: create document nodes and determine their levels
    for (const result of results) {
      if (!result.content || !result.title) continue;
      
      const level = this.determineDocumentLevel(result.url, results);
      const docNode: DocumentHierarchy = {
        title: this.sanitizeTitle(result.title),
        url: result.url,
        content: this.cleanDocumentContent(result.content),
        level,
        children: [],
      };
      
      urlMap.set(result.url, docNode);
      
      // Add to hierarchy based on level
      if (level === 1) {
        hierarchy.push(docNode);
      }
    }
    
    // Second pass: establish parent-child relationships
    for (const result of results) {
      const docNode = urlMap.get(result.url);
      if (!docNode || docNode.level === 1) continue;
      
      // Find the best parent for this document
      const parent = this.findBestParent(docNode, Array.from(urlMap.values()));
      if (parent) {
        parent.children.push(docNode);
      } else {
        // No suitable parent found, add to root level
        hierarchy.push(docNode);
      }
    }
    
    // Sort hierarchy by title for consistency
    this.sortHierarchy(hierarchy);
    
    console.error(`✅ [HIERARCHY] Built hierarchy with ${hierarchy.length} root documents`);
    this.logHierarchy(hierarchy, 0);
    
    return hierarchy;
  }

  /**
   * Determine the hierarchical level of a document based on its URL structure
   */
  private determineDocumentLevel(url: string, allResults: CrawlResult[]): number {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname
        .split('/')
        .filter(segment => segment.length > 0 && segment !== 'index.html');
      
      // Common patterns for determining document levels:
      
      // Root/landing pages (level 1)
      if (pathSegments.length <= 1 ||
          pathSegments.some(segment => ['index', 'home', 'introduction', 'overview'].includes(segment.toLowerCase()))) {
        return 1;
      }
      
      // Getting started pages (level 1)
      if (pathSegments.some(segment => ['getting-started', 'quickstart', 'setup', 'installation'].includes(segment.toLowerCase()))) {
        return 1;
      }
      
      // API reference pages tend to be deeper
      if (pathSegments.some(segment => ['api', 'reference', 'methods'].includes(segment.toLowerCase()))) {
        return Math.min(pathSegments.length, 4); // Cap at level 4
      }
      
      // General rule: path depth determines level (with reasonable limits)
      return Math.min(pathSegments.length, 3);
      
    } catch {
      return 2; // Default level for malformed URLs
    }
  }

  /**
   * Find the best parent for a document based on URL structure
   */
  private findBestParent(docNode: DocumentHierarchy, allNodes: DocumentHierarchy[]): DocumentHierarchy | null {
    const candidates = allNodes.filter(node => 
      node.level < docNode.level && 
      node.url !== docNode.url &&
      this.isLikelyParent(node.url, docNode.url)
    );
    
    if (candidates.length === 0) return null;
    
    // Sort by level (prefer immediate parent) and URL similarity
    candidates.sort((a, b) => {
      const levelDiff = Math.abs(a.level - (docNode.level - 1)) - Math.abs(b.level - (docNode.level - 1));
      if (levelDiff !== 0) return levelDiff;
      
      // Prefer parent with more similar URL path
      const aSimilarity = this.calculateUrlSimilarity(a.url, docNode.url);
      const bSimilarity = this.calculateUrlSimilarity(b.url, docNode.url);
      return bSimilarity - aSimilarity;
    });
    
    return candidates[0];
  }

  /**
   * Check if one URL is likely to be the parent of another
   */
  private isLikelyParent(parentUrl: string, childUrl: string): boolean {
    try {
      const parentPath = new URL(parentUrl).pathname;
      const childPath = new URL(childUrl).pathname;
      
      // Remove trailing slashes for comparison
      const normalizeParent = parentPath.replace(/\/$/, '');
      const normalizeChild = childPath.replace(/\/$/, '');
      
      // Child should start with parent path
      return normalizeChild.startsWith(normalizeParent + '/') || 
             normalizeChild.startsWith(normalizeParent);
    } catch {
      return false;
    }
  }

  /**
   * Calculate URL similarity score (0-1)
   */
  private calculateUrlSimilarity(url1: string, url2: string): number {
    try {
      const path1 = new URL(url1).pathname.split('/').filter(s => s.length > 0);
      const path2 = new URL(url2).pathname.split('/').filter(s => s.length > 0);
      
      let commonSegments = 0;
      const minLength = Math.min(path1.length, path2.length);
      
      for (let i = 0; i < minLength; i++) {
        if (path1[i] === path2[i]) {
          commonSegments++;
        } else {
          break;
        }
      }
      
      return commonSegments / Math.max(path1.length, path2.length, 1);
    } catch {
      return 0;
    }
  }

  /**
   * Sanitize and clean document title
   */
  private sanitizeTitle(title: string): string {
    return title
      .replace(/\s+/g, ' ')
      .replace(/[\r\n\t]/g, ' ')
      .trim()
      .substring(0, 200); // Limit title length
  }

  /**
   * Clean document content for better formatting
   */
  private cleanDocumentContent(content: string): string {
    return content
      .replace(/\s+/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .trim();
  }

  /**
   * Sort hierarchy by title alphabetically
   */
  private sortHierarchy(hierarchy: DocumentHierarchy[]): void {
    hierarchy.sort((a, b) => {
      // Prioritize certain document types
      const aPriority = this.getDocumentPriority(a.title, a.url);
      const bPriority = this.getDocumentPriority(b.title, b.url);
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return a.title.localeCompare(b.title);
    });
    
    // Recursively sort children
    hierarchy.forEach(doc => {
      if (doc.children.length > 0) {
        this.sortHierarchy(doc.children);
      }
    });
  }

  /**
   * Get priority score for document sorting (lower = higher priority)
   */
  private getDocumentPriority(title: string, url: string): number {
    const lowerTitle = title.toLowerCase();
    const lowerUrl = url.toLowerCase();
    
    // Highest priority documents
    if (lowerTitle.includes('introduction') || lowerTitle.includes('overview')) return 1;
    if (lowerTitle.includes('getting started') || lowerTitle.includes('quickstart')) return 2;
    if (lowerTitle.includes('installation') || lowerTitle.includes('setup')) return 3;
    if (lowerTitle.includes('tutorial') || lowerTitle.includes('guide')) return 4;
    
    // URL-based priorities
    if (lowerUrl.includes('getting-started') || lowerUrl.includes('quickstart')) return 2;
    if (lowerUrl.includes('installation') || lowerUrl.includes('setup')) return 3;
    
    // Default priority
    return 10;
  }

  /**
   * Log hierarchy structure for debugging
   */
  private logHierarchy(hierarchy: DocumentHierarchy[], indent: number): void {
    if (hierarchy.length === 0) return;
    
    const prefix = '  '.repeat(indent);
    hierarchy.forEach(doc => {
      console.error(`${prefix}📄 [L${doc.level}] ${doc.title}`);
      if (doc.children.length > 0) {
        this.logHierarchy(doc.children, indent + 1);
      }
    });
  }

  /**
   * Convert document hierarchy to ContextSection format
   */
  private convertToSections(hierarchy: DocumentHierarchy[], options: ContextOptions): ContextSection[] {
    console.error(`🔄 [SECTIONS] Converting ${hierarchy.length} hierarchy nodes to sections`);
    
    const sections: ContextSection[] = [];
    
    for (const doc of hierarchy) {
      const section = this.convertDocumentToSection(doc, options);
      if (section) {
        sections.push(section);
      }
    }
    
    console.error(`✅ [SECTIONS] Generated ${sections.length} sections`);
    return sections;
  }

  /**
   * Convert a single document and its children to ContextSection
   */
  private convertDocumentToSection(doc: DocumentHierarchy, options: ContextOptions): ContextSection | null {
    if (!doc.content || doc.content.trim().length === 0) {
      console.error(`⚠️ [SECTIONS] Skipping document with no content: ${doc.title}`);
      return null;
    }
    
    // Process content based on format option
    let processedContent = doc.content;
    
    if (options.format === 'summary') {
      processedContent = this.createSummaryContent(doc.content, options.maxSectionLength || 500);
    } else if (options.maxSectionLength && doc.content.length > options.maxSectionLength) {
      processedContent = this.truncateContent(doc.content, options.maxSectionLength);
    }
    
    // Create the main section
    const section: ContextSection = {
      title: doc.title,
      content: processedContent,
      sourceUrl: doc.url,
      subsections: [],
    };
    
    // Process children as subsections
    if (doc.children.length > 0) {
      for (const child of doc.children) {
        const childSection = this.convertDocumentToSection(child, options);
        if (childSection) {
          section.subsections!.push(childSection);
        }
      }
    }
    
    return section;
  }

  /**
   * Create summary content from full content
   */
  private createSummaryContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }
    
    // Try to find a good breaking point (sentence end)
    const sentences = content.split(/[.!?]+/);
    let summary = '';
    
    for (const sentence of sentences) {
      const potentialSummary = summary + sentence + '. ';
      if (potentialSummary.length > maxLength) {
        break;
      }
      summary = potentialSummary;
    }
    
    // Fallback: simple truncation
    if (summary.trim().length === 0) {
      summary = content.substring(0, maxLength - 3) + '...';
    }
    
    return summary.trim();
  }

  /**
   * Truncate content to specified length with ellipsis
   */
  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }
    
    // Find the last complete word within the limit
    const truncated = content.substring(0, maxLength - 3);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > maxLength * 0.8) { // Only cut at word boundary if it's not too far back
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  }

  /**
   * Generate final context content string from sections
   */
  private generateContextContent(sections: ContextSection[], options: ContextOptions, baseUrl?: string): string {
    console.error(`📝 [GENERATE] Creating context content from ${sections.length} sections`);
    
    const lines: string[] = [];
    
    // Add header with metadata
    lines.push('# Documentation');
    lines.push('');
    
    if (baseUrl) {
      try {
        const domain = new URL(baseUrl).hostname;
        lines.push(`Source: ${domain}`);
      } catch {
        lines.push(`Source: ${baseUrl}`);
      }
    }
    
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Format: ${options.format}`);
    lines.push(`Sections: ${sections.length}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    
    // Generate table of contents if there are multiple sections
    if (sections.length > 1 && options.sectionHeaders) {
      lines.push('## Table of Contents');
      lines.push('');
      this.generateTableOfContents(sections, lines, 1);
      lines.push('');
      lines.push('---');
      lines.push('');
    }
    
    // Generate content for each section
    for (const section of sections) {
      this.generateSectionContent(section, lines, options, 2);
      lines.push(''); // Add spacing between sections
    }
    
    // Add footer
    lines.push('---');
    lines.push('');
    lines.push('*This documentation was generated automatically from web content.*');
    if (options.includeSourceUrls) {
      lines.push('*Source URLs are preserved for reference and verification.*');
    }
    
    const content = lines.join('\n');
    console.error(`✅ [GENERATE] Generated ${content.length} characters of context content`);
    
    return content;
  }

  /**
   * Generate table of contents from sections
   */
  private generateTableOfContents(sections: ContextSection[], lines: string[], level: number): void {
    for (const section of sections) {
      const indent = '  '.repeat(level - 1);
      const bullet = level === 1 ? '-' : '*';
      lines.push(`${indent}${bullet} [${section.title}](#${this.slugify(section.title)})`);
      
      if (section.subsections && section.subsections.length > 0) {
        this.generateTableOfContents(section.subsections, lines, level + 1);
      }
    }
  }

  /**
   * Generate content for a single section and its subsections
   */
  private generateSectionContent(section: ContextSection, lines: string[], options: ContextOptions, level: number): void {
    // Add section header
    if (options.sectionHeaders) {
      const headerPrefix = '#'.repeat(level);
      lines.push(`${headerPrefix} ${section.title}`);
      lines.push('');
    }
    
    // Add source URL if requested
    if (options.includeSourceUrls && section.sourceUrl) {
      lines.push(`*Source: [${section.sourceUrl}](${section.sourceUrl})*`);
      lines.push('');
    }
    
    // Add main content
    if (section.content && section.content.trim().length > 0) {
      lines.push(section.content.trim());
      lines.push('');
    }
    
    // Add subsections
    if (section.subsections && section.subsections.length > 0) {
      for (const subsection of section.subsections) {
        this.generateSectionContent(subsection, lines, options, level + 1);
      }
    }
  }

  /**
   * Convert text to URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Generate a compact summary format (alternative to full format)
   */
  async formatToSummary(results: CrawlResult[], options: Partial<ContextOptions> = {}): Promise<GeneratedContext> {
    const summaryOptions: ContextOptions = {
      format: 'summary',
      includeSourceUrls: options.includeSourceUrls ?? false,
      sectionHeaders: options.sectionHeaders ?? false,
      maxSectionLength: options.maxSectionLength ?? 300,
    };
    
    return this.formatToContext(results, summaryOptions);
  }

  /**
   * Validate that the generated content meets context standards
   */
  validateContextContent(content: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for minimum content length
    if (content.length < 100) {
      issues.push('Content is too short (minimum 100 characters)');
    }
    
    // Check for proper header structure
    if (!content.startsWith('# ')) {
      issues.push('Missing main header (should start with # Documentation)');
    }
    
    // Check for excessive length (might be too much for context)
    if (content.length > 100000) {
      issues.push(`Content is very long (${content.length} chars, consider using summary format)`);
    }
    
    // Check for proper section structure
    const headerCount = (content.match(/^#{1,6}\s+/gm) || []).length;
    if (headerCount === 0) {
      issues.push('No section headers found');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Save generated context content to files in the output directory
   */
  async saveToFile(content: string, baseUrl: string, format: string = 'full'): Promise<{ filePath: string; fileName: string }> {
    try {
      // Ensure output directory exists
      const outputDir = resolve(process.cwd(), 'output');
      await fs.mkdir(outputDir, { recursive: true });
      
      // Generate filename based on domain and timestamp
      const domain = this.getDomainFromUrl(baseUrl);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const fileName = `${domain}-${format}-${timestamp}.txt`;
      const filePath = join(outputDir, fileName);
      
      // Write content to file
      await fs.writeFile(filePath, content, 'utf8');
      
      console.error(`💾 [SAVE] context file saved: ${filePath}`);
      console.error(`📁 [SAVE] File size: ${(content.length / 1024).toFixed(2)} KB`);
      
      return {
        filePath,
        fileName
      };
    } catch (error) {
      console.error('❌ [SAVE] Failed to save context file:', error);
      throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save both summary and full formats to separate files
   */
  async saveBothFormats(results: CrawlResult[], baseUrl: string): Promise<{ summaryFile: string; fullFile: string }> {
    try {
      // Generate both formats
      const [summaryResult, fullResult] = await Promise.all([
        this.formatToSummary(results, { includeSourceUrls: false }),
        this.formatToContext(results, { format: 'full', includeSourceUrls: true, sectionHeaders: true })
      ]);
      
      // Save both files
      const [summaryFileInfo, fullFileInfo] = await Promise.all([
        this.saveToFile(summaryResult.content, baseUrl, 'summary'),
        this.saveToFile(fullResult.content, baseUrl, 'full')
      ]);
      
      console.error(`🎉 [SAVE] Both formats saved successfully!`);
      console.error(`   📄 Summary: ${summaryFileInfo.fileName}`);
      console.error(`   📚 Full: ${fullFileInfo.fileName}`);
      
      return {
        summaryFile: summaryFileInfo.filePath,
        fullFile: fullFileInfo.filePath
      };
    } catch (error) {
      console.error('❌ [SAVE] Failed to save both formats:', error);
      throw error;
    }
  }

  /**
   * Extract domain name from URL for filename
   */
  private getDomainFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname;
      // Clean domain for filename (remove dots, etc.)
      return domain.replace(/\./g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    } catch {
      return 'unknown-site';
    }
  }

  /**
   * Get output directory path
   */
  getOutputDirectory(): string {
    return resolve(process.cwd(), 'output');
  }

  /**
   * List all saved context files in output directory
   */
  async listSavedFiles(): Promise<string[]> {
    try {
      const outputDir = this.getOutputDirectory();
      
      // Check if output directory exists
      try {
        await fs.access(outputDir);
      } catch {
        return []; // Directory doesn't exist yet
      }
      
      const files = await fs.readdir(outputDir);
      return files.filter(file => file.endsWith('.txt')).sort();
    } catch (error) {
      console.error('❌ [LIST] Failed to list saved files:', error);
      return [];
    }
  }
}
