# Context-Generator MCP Server Improvements

## Summary
This document outlines the comprehensive improvements made to the context-generator MCP server to enhance its documentation scraping and context generation capabilities, particularly focusing on file saving options, recursive crawling fixes, and improved user experience.

## Major Improvements

### 1. Enhanced Tool Input Schemas

#### `scrape_documentation` Tool
- **Enhanced Description**: Added detailed documentation about file saving, formats, and recursive crawling
- **New Parameters**:
  - `saveToFile` (boolean): Enable/disable file saving (default: true)
  - `saveDirectory` (string): Custom output directory (default: ./output)
  - `saveFormat` (string): File format - 'txt' or 'md' (default: txt)
  - `filename` (string): Custom base filename
- **Improved Options**: Better descriptions for all existing parameters

#### `generate_context` Tool
- **Enhanced Description**: Comprehensive documentation about context generation and file saving
- **Extended Parameters**:
  - `format` (string): Now supports 'summary', 'full', or 'both' (previously only 'summary' and 'full')
  - `sectionHeaders` (boolean): Include section headers for structure
  - `maxSectionLength` (number): Control content section length
  - All file saving parameters from `scrape_documentation`
- **Improved Input Validation**: Better crawlResults schema with required properties

### 2. TypeScript Type System Updates

#### Updated `CrawlOptions` Interface
```typescript
export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  outputFormat?: 'llms-txt' | 'llms-full-txt' | 'both';
  delayMs?: number;
  // New file saving options
  saveToFile?: boolean;
  saveDirectory?: string;
  saveFormat?: 'txt' | 'md';
  filename?: string;
}
```

#### Updated `ContextOptions` Interface
```typescript
export interface ContextOptions {
  format?: 'summary' | 'full' | 'both';
  includeSourceUrls?: boolean;
  sectionHeaders?: boolean;
  maxSectionLength?: number;
  // New file saving options
  saveToFile?: boolean;
  saveDirectory?: string;
  saveFormat?: 'txt' | 'md';
  filename?: string;
}
```

### 3. Enhanced Context Formatter Service

#### Improved `saveToFile` Method
- **Flexible Options**: Accepts directory, filename, and format options
- **Smart Defaults**: Generates meaningful filenames from URLs when not specified
- **Directory Resolution**: Properly handles custom directories with fallback to default
- **Format Support**: Supports both .txt and .md file extensions
- **Better Error Handling**: More robust file system operations

#### Method Signature Update
```typescript
async saveToFile(
  content: string, 
  baseUrl: string, 
  type: 'summary' | 'full',
  options?: {
    directory?: string;
    filename?: string;
    fileFormat?: 'txt' | 'md';
  }
): Promise<{ fileName: string; fullPath: string; success: boolean }>
```

### 4. Fixed Crawler Service Recursive Logic

#### Single Page vs Recursive Crawling
- **Fixed Logic**: `maxDepth <= 1` now properly handles single page crawling
- **Recursive Discovery**: `maxDepth > 1` enables full recursive link discovery
- **Improved Performance**: Better handling of page limits and crawling depth

#### Method Improvements
```typescript
async crawlDocumentation(baseUrl: string, options: CrawlOptions = {}): Promise<CrawlResult[]>
```
- Now correctly interprets maxDepth parameter
- Better error handling and logging
- Improved concurrent crawling with proper delays

### 5. Enhanced MCP Server Handlers

#### `scrape_documentation` Handler Updates
- **File Saving Integration**: Fully integrated with new file saving options
- **Better Response Format**: Shows saved filenames and output directory
- **Truncated Previews**: Large content is truncated in responses with file saving info
- **Comprehensive Error Reporting**: Better error messages with context

#### `generate_context` Handler Updates
- **Input Validation**: Robust validation of crawl results format
- **Format Support**: Handles 'summary', 'full', and 'both' format options
- **File Management**: Integrated file saving with custom options
- **Result Presentation**: Clear presentation of generated content and saved files

### 6. User Experience Improvements

#### Enhanced Response Formatting
- **Visual Indicators**: Rich emoji-based status indicators
- **File Information**: Clear indication of saved files and locations
- **Preview Content**: Truncated content previews for large files
- **Progress Reporting**: Step-by-step progress indicators during operations

#### Better Error Messages
- **Detailed Context**: Error messages include input parameters and expected formats
- **Helpful Examples**: Provides examples of correct input formats
- **Recovery Suggestions**: Clear guidance on how to fix common issues

### 7. Configuration and Defaults

#### Smart Defaults
- `saveToFile`: true (automatically save results)
- `saveDirectory`: './output' (organized output location)
- `saveFormat`: 'txt' (universal text format)
- `maxDepth`: 3 (reasonable recursive depth)
- `maxPages`: 50 (balanced between completeness and performance)

#### Flexible Configuration
- All defaults can be overridden via tool parameters
- Absolute paths supported for reliable file operations
- Custom filenames with automatic domain-based generation fallback

## Technical Implementation Details

### File Saving Architecture
1. **Options Processing**: Tool parameters are processed and merged with defaults
2. **Directory Resolution**: Output directories are resolved and created as needed
3. **Filename Generation**: Smart filename generation based on URLs and content type
4. **Content Writing**: Atomic file operations with proper error handling
5. **Response Integration**: File information is integrated into tool responses

### Error Handling Strategy
1. **Input Validation**: Comprehensive validation of all input parameters
2. **Service Health Checks**: Crawler service health verification before operations
3. **Graceful Degradation**: Operations continue with warnings when possible
4. **Detailed Reporting**: Rich error reporting with context and recovery suggestions

### Performance Optimizations
1. **Concurrent Operations**: Multiple file operations can be performed simultaneously
2. **Content Truncation**: Large content is truncated in responses to improve performance
3. **Smart Caching**: Reuses validated and processed content where possible
4. **Memory Management**: Proper cleanup of resources and temporary data

## Usage Examples

### Basic Documentation Scraping
```json
{
  "name": "scrape_documentation",
  "arguments": {
    "url": "https://docs.example.com",
    "options": {
      "maxDepth": 2,
      "outputFormat": "both"
    }
  }
}
```

### Custom File Saving
```json
{
  "name": "scrape_documentation",
  "arguments": {
    "url": "https://api-docs.example.com",
    "options": {
      "saveDirectory": "/path/to/custom/output",
      "saveFormat": "md",
      "filename": "api-documentation"
    }
  }
}
```

### Context Generation with Options
```json
{
  "name": "generate_context",
  "arguments": {
    "crawlResults": [
      {
        "url": "https://example.com/page1",
        "title": "Page 1",
        "content": "Content here...",
        "success": true
      }
    ],
    "options": {
      "format": "both",
      "saveDirectory": "./custom-output",
      "saveFormat": "md"
    }
  }
}
```

## Benefits

1. **Improved Usability**: Users can now easily save results to files with custom options
2. **Better Organization**: Structured output directories and meaningful filenames
3. **Enhanced Flexibility**: Support for different file formats and directory structures
4. **Robust Operation**: Better error handling and validation throughout the pipeline
5. **Rich Feedback**: Comprehensive progress reporting and result summaries
6. **Professional Polish**: Consistent branding and user experience across all tools

## Future Considerations

1. **Format Extensions**: Could add support for JSON, YAML, or custom formats
2. **Compression**: Option to compress large output files
3. **Batch Operations**: Support for processing multiple URLs in a single operation
4. **Template System**: Customizable output templates for different use cases
5. **Integration APIs**: Webhook or API endpoints for automated workflows

---

*Made with ❤️ by Pink Pixel (https://pinkpixel.dev)*
