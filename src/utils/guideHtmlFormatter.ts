import { marked } from 'marked';

export function generateStyledGuideHtml(markdownContent: string, title = 'Learn Better — Complete User Guide & Manual'): string {
  // Configure marked options
  const parsedBody = marked.parse(markdownContent) as string;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  :root {
    --bg-primary: #0b0f19;
    --bg-surface: #111827;
    --bg-code: #030712;
    --border-color: #1f2937;
    --text-primary: #f3f4f6;
    --text-secondary: #9ca3af;
    --accent-blue: #38bdf8;
    --accent-indigo: #818cf8;
    --accent-emerald: #34d399;
    --table-stripe: #131d31;
  }

  @media (prefers-color-scheme: light) {
    :root.auto-theme {
      --bg-primary: #ffffff;
      --bg-surface: #f8fafc;
      --bg-code: #f1f5f9;
      --border-color: #e2e8f0;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --accent-blue: #0284c7;
      --accent-indigo: #4f46e5;
      --accent-emerald: #059669;
      --table-stripe: #f8fafc;
    }
  }

  body.light-theme {
    --bg-primary: #ffffff;
    --bg-surface: #f8fafc;
    --bg-code: #f1f5f9;
    --border-color: #e2e8f0;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --accent-blue: #0284c7;
    --accent-indigo: #4f46e5;
    --accent-emerald: #059669;
    --table-stripe: #f8fafc;
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.7;
    font-size: 15px;
    margin: 0;
    padding: 0;
    transition: background-color 0.2s, color 0.2s;
  }

  .container {
    max-width: 960px;
    margin: 0 auto;
    padding: 40px 24px 80px 24px;
  }

  /* Screen toolbar */
  .doc-toolbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border-color);
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    backdrop-filter: blur(8px);
  }

  .toolbar-brand {
    font-weight: 700;
    font-size: 14px;
    color: var(--accent-blue);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toolbar-actions {
    display: flex;
    gap: 10px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-primary);
    text-decoration: none;
    transition: all 0.15s ease;
  }

  .btn:hover {
    filter: brightness(1.15);
    border-color: var(--accent-blue);
  }

  .btn-primary {
    background: #0284c7;
    color: #ffffff;
    border-color: #0369a1;
  }

  .btn-primary:hover {
    background: #0369a1;
  }

  /* Document Content Styling */
  .doc-header {
    margin-bottom: 36px;
    padding-bottom: 24px;
    border-bottom: 2px solid var(--border-color);
  }

  .doc-badge {
    display: inline-block;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 9999px;
    background: #064e3b;
    color: #6ee7b7;
    border: 1px solid #059669;
    margin-bottom: 12px;
  }

  h1 {
    font-size: 28px;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1.3;
    margin: 0 0 12px 0;
  }

  h2 {
    font-size: 20px;
    font-weight: 700;
    color: var(--accent-blue);
    margin: 36px 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--accent-indigo);
    margin: 24px 0 12px 0;
  }

  p {
    margin: 0 0 16px 0;
    color: var(--text-primary);
  }

  blockquote {
    margin: 20px 0;
    padding: 14px 18px;
    background: var(--bg-surface);
    border-left: 4px solid var(--accent-blue);
    border-radius: 0 8px 8px 0;
    color: var(--text-secondary);
    font-style: italic;
  }

  blockquote p:last-child {
    margin-bottom: 0;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 24px 0;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
    font-size: 14px;
  }

  thead th {
    background-color: var(--bg-surface);
    color: var(--text-primary);
    font-weight: 600;
    text-align: left;
    padding: 10px 14px;
    border-bottom: 2px solid var(--border-color);
  }

  tbody td {
    padding: 10px 14px;
    border-bottom: 1px solid var(--border-color);
    vertical-align: top;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:nth-child(even) {
    background-color: var(--table-stripe);
  }

  /* Code */
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.9em;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: var(--bg-code);
    color: var(--accent-emerald);
    border: 1px solid var(--border-color);
  }

  pre {
    background-color: var(--bg-code);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    margin: 20px 0;
    line-height: 1.5;
  }

  pre code {
    background: transparent;
    padding: 0;
    border: none;
    color: #e2e8f0;
    font-size: 13px;
  }

  /* Lists */
  ul, ol {
    margin: 0 0 18px 0;
    padding-left: 24px;
  }

  li {
    margin-bottom: 6px;
  }

  hr {
    border: none;
    border-top: 1px solid var(--border-color);
    margin: 32px 0;
  }

  strong {
    color: var(--text-primary);
    font-weight: 600;
  }

  /* Print Stylesheet for Pristine PDF Output */
  @media print {
    body {
      background: #ffffff !important;
      color: #0f172a !important;
      font-size: 11pt !important;
      line-height: 1.5 !important;
    }

    .no-print, .doc-toolbar {
      display: none !important;
    }

    .container {
      max-width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    @page {
      size: A4 portrait;
      margin: 15mm 15mm 18mm 15mm;
    }

    h1 {
      font-size: 20pt !important;
      color: #0f172a !important;
    }

    h2 {
      font-size: 14pt !important;
      color: #0369a1 !important;
      border-bottom: 1px solid #cbd5e1 !important;
      page-break-after: avoid;
      break-after: avoid;
      margin-top: 18pt !important;
    }

    h3 {
      font-size: 12pt !important;
      color: #312e81 !important;
      page-break-after: avoid;
      break-after: avoid;
    }

    table {
      border: 1px solid #94a3b8 !important;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    thead th {
      background: #f1f5f9 !important;
      color: #0f172a !important;
      border-bottom: 2px solid #94a3b8 !important;
    }

    tbody td {
      border-bottom: 1px solid #e2e8f0 !important;
      color: #1e293b !important;
    }

    tbody tr:nth-child(even) {
      background: #f8fafc !important;
    }

    pre {
      background: #f8fafc !important;
      border: 1px solid #cbd5e1 !important;
      page-break-inside: avoid;
      break-inside: avoid;
      padding: 10pt !important;
    }

    pre code {
      color: #0f172a !important;
      font-size: 9.5pt !important;
    }

    code {
      background: #f1f5f9 !important;
      color: #047857 !important;
      border: 1px solid #e2e8f0 !important;
    }

    blockquote {
      background: #f8fafc !important;
      border-left: 3pt solid #0284c7 !important;
      color: #334155 !important;
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }
</style>
</head>
<body>

<div class="doc-toolbar no-print">
  <div class="toolbar-brand">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    <span>Learn Better Documentation</span>
  </div>
  <div class="toolbar-actions">
    <button class="btn" onclick="toggleTheme()" id="themeBtn">🌓 Theme</button>
    <button class="btn btn-primary" onclick="window.print()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
      Print / Save as PDF
    </button>
  </div>
</div>

<div class="container">
  <div class="doc-header no-print">
    <div class="doc-badge">&#x2713; Offline-Ready &bull; Printable &bull; Formatted</div>
    <p style="color: var(--text-secondary); font-size: 13px; margin: 0;">
      Generated for Learn Better Knowledge Hub &bull; Use <strong>Print / Save as PDF</strong> in your browser to generate a high-resolution PDF with table pagination.
    </p>
  </div>

  <article class="doc-body">
    ${parsedBody}
  </article>
</div>

<script>
  function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('doc-theme', isLight ? 'light' : 'dark');
  }
  if (localStorage.getItem('doc-theme') === 'light') {
    document.body.classList.add('light-theme');
  }
</script>

</body>
</html>`;
}
