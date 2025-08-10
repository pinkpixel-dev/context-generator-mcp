/**
 * Platform Detection Test Cases
 * Real-world examples for validation
 */

export const PLATFORM_TEST_CASES = {
  gitbook: [
    'https://docs.gitbook.com/',
    'https://app.gitbook.com/docs/',
    'https://company.gitbook.io/docs',
    'https://docs.example.gitbook.com/',
  ],

  docusaurus: [
    'https://docusaurus.io/docs/',
    'https://react.dev/', // Uses Docusaurus
    'https://jestjs.io/docs/',
    'https://preset.io/docs/',
    'https://redwoodjs.com/docs/',
  ],

  vuepress: [
    'https://vuepress.vuejs.org/',
    'https://v2.vuepress.vuejs.org/',
    'https://vuepress-theme-hope.github.io/',
  ],

  mintlify: [
    'https://docs.mintlify.com/',
    'https://docs.openai.com/', // Uses Mintlify
    'https://docs.stripe.com/', // Uses Mintlify-like
    'https://docs.anthropic.com/',
  ],

  generic: [
    'https://developer.mozilla.org/docs/',
    'https://docs.python.org/',
    'https://golang.org/doc/',
    'https://nodejs.org/docs/',
  ],
};

/**
 * HTML signatures for testing content detection
 */
export const HTML_SIGNATURES = {
  gitbook: `
    <html>
      <head><meta name="generator" content="GitBook"></head>
      <body>
        <div class="gitbook-root">
          <div class="book-summary">
            <ul class="summary">Navigation</ul>
          </div>
          <div class="page-inner">Content</div>
        </div>
      </body>
    </html>
  `,

  docusaurus: `
    <html data-theme="light">
      <head><meta name="generator" content="Docusaurus"></head>
      <body>
        <nav class="navbar navbar__brand">Nav</nav>
        <main class="docMainContainer">
          <div class="markdown">Content</div>
        </main>
      </body>
    </html>
  `,

  vuepress: `
    <html>
      <head><meta name="generator" content="VuePress"></head>
      <body>
        <div class="theme-container">
          <aside class="sidebar">
            <ul class="sidebar-links">Nav</ul>
          </aside>
          <div class="theme-default-content">Content</div>
        </div>
      </body>
    </html>
  `,

  mintlify: `
    <html>
      <head><meta name="generator" content="Mintlify"></head>
      <body>
        <div class="mintlify-layout">
          <nav class="navigation-menu">Nav</nav>
          <main class="docs-content">Content</main>
        </div>
      </body>
    </html>
  `,
};
