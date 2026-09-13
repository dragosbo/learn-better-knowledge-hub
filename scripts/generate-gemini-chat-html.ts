import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import { CHAT_HISTORY_ENTRIES, EFFICIENCY_SUGGESTIONS, ChatEntry } from '../src/data/geminiChatData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.resolve(rootDir, 'gemini_chat');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Custom marked renderer to inject pastel language badges and styling
const renderer = new marked.Renderer();

renderer.code = function({ text, lang }: { text: string; lang?: string }): string {
  const language = (lang || 'text').toLowerCase().trim();
  let langClass = 'lang-default';
  let langLabel = language.toUpperCase();
  let icon = '📄';

  if (language === 'python' || language === 'py') {
    langClass = 'lang-python';
    langLabel = 'Python';
    icon = '🐍';
  } else if (language === 'typescript' || language === 'ts' || language === 'tsx') {
    langClass = 'lang-typescript';
    langLabel = 'TypeScript';
    icon = '⚡';
  } else if (language === 'javascript' || language === 'js' || language === 'jsx') {
    langClass = 'lang-typescript';
    langLabel = 'JavaScript';
    icon = '⚡';
  } else if (language === 'bash' || language === 'sh' || language === 'shell' || language === 'zsh') {
    langClass = 'lang-bash';
    langLabel = 'Bash / Shell';
    icon = '💻';
  } else if (language === 'html' || language === 'xml') {
    langClass = 'lang-html';
    langLabel = 'HTML';
    icon = '🌐';
  } else if (language === 'css') {
    langClass = 'lang-html';
    langLabel = 'CSS';
    icon = '🎨';
  } else if (language === 'json') {
    langClass = 'lang-json';
    langLabel = 'JSON';
    icon = '{ }';
  } else if (language === 'sql') {
    langClass = 'lang-sql';
    langLabel = 'SQL';
    icon = '🗄️';
  }

  // Escape HTML in code text
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  return `
    <div class="code-block-wrapper ${langClass}">
      <div class="code-header">
        <span class="code-badge">${icon} ${langLabel}</span>
        <button class="copy-code-btn" onclick="copyCode(this)" title="Copy code snippet">Copy</button>
      </div>
      <pre><code>${escaped}</code></pre>
    </div>
  `;
};

marked.setOptions({
  renderer,
  gfm: true,
  breaks: true
});

function renderEntry(entry: ChatEntry): string {
  const assistantHtml = marked.parse(entry.assistantResponseMarkdown);
  
  // Custom code blocks if defined
  let extraCodeHtml = '';
  if (entry.codeBlocks && entry.codeBlocks.length > 0) {
    extraCodeHtml = entry.codeBlocks.map(cb => {
      return marked.parse(`\`\`\`${cb.language}\n${cb.code}\n\`\`\``);
    }).join('');
  }

  const quotaBadgeColor = 
    entry.quotaSignal.quotaStatus === 'safe' ? 'status-safe' :
    entry.quotaSignal.quotaStatus === 'moderate' ? 'status-moderate' :
    entry.quotaSignal.quotaStatus === 'near-limit' ? 'status-near-limit' : 'status-recovered';

  return `
    <article class="chat-card" id="${entry.id}" data-number="${entry.number}" data-session="${entry.session}">
      <!-- Card Header / Meta -->
      <div class="card-meta-bar">
        <div class="meta-left">
          <span class="prompt-number-pill">Prompt #${entry.number < 10 ? '0' + entry.number : entry.number}</span>
          <span class="meta-session">Session ${entry.session} &bull; ${entry.sessionDate}</span>
          <span class="meta-timestamp">${entry.timestamp}</span>
        </div>
        <div class="meta-right">
          <span class="quota-pill ${quotaBadgeColor}" title="${entry.quotaSignal.note}">
            Quota: ${entry.quotaSignal.quotaStatus.toUpperCase()} (${entry.quotaSignal.estimatedTokens})
          </span>
          <span class="capability-pill" title="Web App Capability Attribution">
            🎯 +${entry.capabilityPercent}% Impact (${entry.cumulativePercent}% Total)
          </span>
        </div>
      </div>

      <!-- Capability Summary Banner -->
      <div class="capability-summary-box">
        <div class="summary-title">
          <strong>Key Deliverable:</strong> ${entry.capabilitySummary}
        </div>
        <ul class="features-list">
          ${entry.featuresIntroduced.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>

      <!-- User Verbatim Prompt Section (Collapsible) -->
      <div class="dialogue-block user-prompt-block">
        <div class="dialogue-header" onclick="toggleSection(this)">
          <div class="dialogue-identity">
            <span class="avatar-pill user-avatar">👤 User</span>
            <span class="dialogue-title">Verbatim Prompt</span>
          </div>
          <div class="dialogue-toggle">
            <span class="toggle-text">Collapse</span>
            <span class="toggle-icon">▼</span>
          </div>
        </div>
        <div class="dialogue-content">
          <div class="prompt-text-verbatim">${entry.userPromptVerbatim.replace(/\n/g, '<br/>')}</div>
        </div>
      </div>

      <!-- Assistant Sidebar Exact Answer Section (Collapsible) -->
      <div class="dialogue-block assistant-answer-block">
        <div class="dialogue-header" onclick="toggleSection(this)">
          <div class="dialogue-identity">
            <span class="avatar-pill assistant-avatar">✨ Gemini</span>
            <span class="dialogue-title">Exact Sidebar Response</span>
          </div>
          <div class="dialogue-toggle">
            <span class="toggle-text">Collapse</span>
            <span class="toggle-icon">▼</span>
          </div>
        </div>
        <div class="dialogue-content">
          <div class="markdown-body">
            ${assistantHtml}
            ${extraCodeHtml}
          </div>
        </div>
      </div>
    </article>
  `;
}

// Group entries by session
const sessionsMap = new Map<number, ChatEntry[]>();
CHAT_HISTORY_ENTRIES.forEach(entry => {
  if (!sessionsMap.has(entry.session)) {
    sessionsMap.set(entry.session, []);
  }
  sessionsMap.get(entry.session)!.push(entry);
});

let sessionSectionsHtml = '';
sessionsMap.forEach((entries, sessionNum) => {
  const first = entries[0];
  const sessionTotalImpact = entries.reduce((acc, curr) => acc + curr.capabilityPercent, 0);

  sessionSectionsHtml += `
    <section class="session-group" id="session-${sessionNum}">
      <div class="session-divider">
        <div class="session-badge">
          <span class="session-name">SESSION ${sessionNum}</span>
          <span class="session-date">${first.sessionDate}</span>
        </div>
        <div class="session-desc">
          <span>${first.sessionTitle}</span>
          <span class="session-stat">${entries.length} Prompts &bull; +${sessionTotalImpact}% App Capability Added</span>
        </div>
      </div>
      <div class="session-entries">
        ${entries.map(renderEntry).join('')}
      </div>
    </section>
  `;
});

// Build Suggestions HTML
const suggestionsHtml = EFFICIENCY_SUGGESTIONS.map(sug => `
  <div class="suggestion-card">
    <div class="sug-header">
      <span class="sug-category">${sug.category}</span>
      <span class="sug-impact impact-${sug.impact.toLowerCase().replace(' ', '-')}">${sug.impact} Impact</span>
    </div>
    <h3 class="sug-title">${sug.title}</h3>
    <p class="sug-desc">${sug.description}</p>
    <div class="sug-example">
      <strong>Best Practice Example:</strong>
      <code>${sug.concreteExample}</code>
    </div>
    <div class="sug-antipattern">
      <strong>⚠️ Anti-Pattern to Avoid:</strong> ${sug.antiPatternToAvoid}
    </div>
  </div>
`).join('');

// Complete Standalone HTML Document
const completeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gemini Development Chat & Complete Audit Record - Learn Better Hub</title>
  <style>
    :root {
      /* Base & Typography */
      --font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      
      /* App Canvas */
      --bg-page: #F8FAFC;
      --bg-card: #FFFFFF;
      --text-main: #0F172A;
      --text-muted: #475569;
      --border-main: #E2E8F0;

      /* Pastel Palette for Dialogues */
      --pastel-prompt-bg: #FEF9C3; /* Soft warm butter / amber */
      --pastel-prompt-border: #FDE047;
      --pastel-prompt-text: #713F12;
      --pastel-prompt-badge: #CA8A04;

      --pastel-answer-bg: #F0FDF4; /* Soft calm mint / ice periwinkle */
      --pastel-answer-border: #BBF7D0;
      --pastel-answer-text: #14532D;
      --pastel-answer-badge: #16A34A;

      /* Language-Specific Pastel Backgrounds */
      --code-python-bg: #ECFDF5;      /* Soft emerald */
      --code-python-border: #A7F3D0;
      --code-python-text: #064E3B;
      --code-python-badge: #059669;

      --code-ts-bg: #F0F9FF;          /* Soft ice sky */
      --code-ts-border: #BAE6FD;
      --code-ts-text: #0C4A6E;
      --code-ts-badge: #0284C7;

      --code-bash-bg: #F8FAFC;        /* Soft cool slate */
      --code-bash-border: #CBD5E1;
      --code-bash-text: #0F172A;
      --code-bash-badge: #475569;

      --code-html-bg: #FFF1F2;        /* Soft pastel rose */
      --code-html-border: #FECDD3;
      --code-html-text: #881337;
      --code-html-badge: #E11D48;

      --code-json-bg: #FFFBEB;        /* Soft warm cream amber */
      --code-json-border: #FDE68A;
      --code-json-text: #78350F;
      --code-json-badge: #D97706;

      --code-sql-bg: #FAF5FF;         /* Soft lavender purple */
      --code-sql-border: #E9D5FF;
      --code-sql-text: #581C87;
      --code-sql-badge: #9333EA;

      /* Accents */
      --accent-indigo: #4F46E5;
      --accent-indigo-hover: #4338CA;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07);
    }

    /* Dark Mode Theme Overrides */
    [data-theme="dark"] {
      --bg-page: #0B0F19;
      --bg-card: #111827;
      --text-main: #F1F5F9;
      --text-muted: #94A3B8;
      --border-main: #1F2937;

      --pastel-prompt-bg: #292314;
      --pastel-prompt-border: #4D3C10;
      --pastel-prompt-text: #FEF08A;
      --pastel-prompt-badge: #FACC15;

      --pastel-answer-bg: #0F291E;
      --pastel-answer-border: #164E35;
      --pastel-answer-text: #DCFCE7;
      --pastel-answer-badge: #4ADE80;

      --code-python-bg: #062319;
      --code-python-border: #0B4A34;
      --code-python-text: #A7F3D0;

      --code-ts-bg: #082233;
      --code-ts-border: #0E4264;
      --code-ts-text: #BAE6FD;

      --code-bash-bg: #111827;
      --code-bash-border: #2B3545;
      --code-bash-text: #E2E8F0;

      --code-html-bg: #261118;
      --code-html-border: #521929;
      --code-html-text: #FECDD3;

      --code-json-bg: #291D11;
      --code-json-border: #5C3A18;
      --code-json-text: #FDE68A;

      --code-sql-bg: #221430;
      --code-sql-border: #47206E;
      --code-sql-text: #E9D5FF;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-main);
      background-color: var(--bg-page);
      color: var(--text-main);
      line-height: 1.6;
      padding-bottom: 80px;
      -webkit-font-smoothing: antialiased;
    }

    /* Top Sticky Navigation & Header */
    .top-header {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-main);
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: var(--shadow-sm);
    }
    .header-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 12px 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .brand-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-title h1 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 9999px;
      background: #EEF2FF;
      color: #4F46E5;
      border: 1px solid #C7D2FE;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .btn {
      font-family: var(--font-main);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-main);
      background: var(--bg-card);
      color: var(--text-main);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .btn:hover {
      background: #F1F5F9;
      border-color: #CBD5E1;
    }
    .btn-primary {
      background: var(--accent-indigo);
      color: #FFFFFF;
      border-color: var(--accent-indigo);
    }
    .btn-primary:hover {
      background: var(--accent-indigo-hover);
    }

    /* Sub Navigation Bar: Prompt Jumper & Search */
    .jumper-bar {
      background: var(--bg-page);
      border-bottom: 1px solid var(--border-main);
      padding: 10px 24px;
      position: sticky;
      top: 61px;
      z-index: 45;
    }
    .jumper-inner {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-card);
      border: 1px solid var(--border-main);
      border-radius: 8px;
      padding: 4px 10px;
      width: 280px;
    }
    .search-box input {
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--font-main);
      font-size: 0.82rem;
      color: var(--text-main);
      width: 100%;
    }
    .jumper-select {
      font-family: var(--font-main);
      font-size: 0.82rem;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-main);
      background: var(--bg-card);
      color: var(--text-main);
      outline: none;
      cursor: pointer;
    }
    .chips-container {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-wrap: wrap;
    }
    .chip {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--bg-card);
      border: 1px solid var(--border-main);
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .chip:hover {
      background: #EEF2FF;
      color: #4F46E5;
      border-color: #C7D2FE;
    }

    /* Main Container */
    .main-content {
      max-width: 1400px;
      margin: 24px auto;
      padding: 0 24px;
    }

    /* Overview Dashboard Card */
    .dashboard-hero {
      background: var(--bg-card);
      border: 1px solid var(--border-main);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 32px;
      box-shadow: var(--shadow-sm);
    }
    .hero-top {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
    }
    .hero-title h2 {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 6px;
    }
    .hero-title p {
      font-size: 0.88rem;
      color: var(--text-muted);
      max-width: 750px;
    }
    .quota-notice-box {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 0.8rem;
      color: #92400E;
      max-width: 480px;
      line-height: 1.5;
    }
    [data-theme="dark"] .quota-notice-box {
      background: #251B08;
      border-color: #593E10;
      color: #FDE68A;
    }

    /* Capability Progress Meter */
    .progress-section {
      background: var(--bg-page);
      border: 1px solid var(--border-main);
      border-radius: 12px;
      padding: 16px;
      margin-top: 16px;
    }
    .progress-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.82rem;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .progress-bar-track {
      width: 100%;
      height: 12px;
      background: #E2E8F0;
      border-radius: 9999px;
      overflow: hidden;
      display: flex;
    }
    [data-theme="dark"] .progress-bar-track {
      background: #1E293B;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4F46E5, #06B6D4, #10B981);
      width: 100%;
      border-radius: 9999px;
    }
    .attribution-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 12px;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    /* Session Grouping Dividers */
    .session-group {
      margin-bottom: 40px;
    }
    .session-divider {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: #EEF2FF;
      border: 1px solid #C7D2FE;
      border-radius: 12px;
      padding: 12px 18px;
      margin-bottom: 20px;
    }
    [data-theme="dark"] .session-divider {
      background: #161D33;
      border-color: #27345C;
    }
    .session-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .session-name {
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      background: #4F46E5;
      color: #FFFFFF;
      padding: 3px 10px;
      border-radius: 6px;
    }
    .session-date {
      font-size: 0.85rem;
      font-weight: 700;
      color: #3730A3;
    }
    [data-theme="dark"] .session-date {
      color: #A5B4FC;
    }
    .session-desc {
      font-size: 0.82rem;
      color: #4338CA;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
    }
    [data-theme="dark"] .session-desc {
      color: #C7D2FE;
    }
    .session-stat {
      font-size: 0.78rem;
      background: rgba(255, 255, 255, 0.6);
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    [data-theme="dark"] .session-stat {
      background: rgba(0, 0, 0, 0.4);
    }

    /* Chat Card */
    .chat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-main);
      border-radius: 14px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .chat-card:target {
      border-color: #4F46E5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }

    .card-meta-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 18px;
      background: var(--bg-page);
      border-bottom: 1px solid var(--border-main);
    }
    .meta-left, .meta-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .prompt-number-pill {
      font-size: 0.78rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
      background: #0F172A;
      color: #FFFFFF;
    }
    [data-theme="dark"] .prompt-number-pill {
      background: #F8FAFC;
      color: #0F172A;
    }
    .meta-session {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .meta-timestamp {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    .quota-pill {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      border: 1px solid;
    }
    .status-safe {
      background: #ECFDF5;
      color: #065F46;
      border-color: #A7F3D0;
    }
    .status-moderate {
      background: #EFF6FF;
      color: #1E40AF;
      border-color: #BFDBFE;
    }
    .status-near-limit {
      background: #FFFBEB;
      color: #92400E;
      border-color: #FDE68A;
    }
    .status-recovered {
      background: #F5F3FF;
      color: #6B21A8;
      border-color: #E9D5FF;
    }
    .capability-pill {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      background: #EEF2FF;
      color: #4338CA;
      border: 1px solid #C7D2FE;
    }

    /* Key Deliverable Summary Box */
    .capability-summary-box {
      padding: 12px 18px;
      border-bottom: 1px solid var(--border-main);
      background: var(--bg-card);
      font-size: 0.82rem;
    }
    .summary-title {
      color: var(--text-main);
      margin-bottom: 6px;
    }
    .features-list {
      margin-left: 20px;
      color: var(--text-muted);
      line-height: 1.5;
    }
    .features-list li {
      margin-bottom: 2px;
    }

    /* Dialogue Blocks */
    .dialogue-block {
      border-bottom: 1px solid var(--border-main);
    }
    .dialogue-block:last-child {
      border-bottom: none;
    }

    .dialogue-header {
      padding: 10px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.15s ease;
    }
    .dialogue-identity {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .avatar-pill {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .user-avatar {
      background: #FEF08A;
      color: #854D0E;
      border: 1px solid #FACC15;
    }
    .assistant-avatar {
      background: #DDD6FE;
      color: #5B21B6;
      border: 1px solid #C4B5FD;
    }
    .dialogue-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .dialogue-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .toggle-icon {
      font-size: 0.7rem;
      transition: transform 0.2s ease;
    }
    .collapsed .toggle-icon {
      transform: rotate(-90deg);
    }
    .dialogue-content {
      padding: 16px 18px;
      overflow: hidden;
      transition: max-height 0.25s ease;
    }
    .collapsed .dialogue-content {
      display: none;
    }

    /* Pastel Background 1: User Verbatim Prompt */
    .user-prompt-block {
      background-color: var(--pastel-prompt-bg);
      border-left: 4px solid var(--pastel-prompt-border);
    }
    .user-prompt-block .dialogue-header:hover {
      background-color: rgba(253, 230, 138, 0.4);
    }
    .prompt-text-verbatim {
      font-family: var(--font-mono);
      font-size: 0.88rem;
      line-height: 1.6;
      color: var(--pastel-prompt-text);
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Pastel Background 2: Assistant Sidebar Response */
    .assistant-answer-block {
      background-color: var(--pastel-answer-bg);
      border-left: 4px solid var(--pastel-answer-border);
    }
    .assistant-answer-block .dialogue-header:hover {
      background-color: rgba(187, 247, 208, 0.4);
    }

    /* Markdown Body Inside Assistant Response */
    .markdown-body {
      font-size: 0.9rem;
      line-height: 1.65;
      color: var(--text-main);
    }
    .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
      margin-top: 1.2em;
      margin-bottom: 0.5em;
      font-weight: 700;
      color: var(--text-main);
    }
    .markdown-body h4 {
      font-size: 0.95rem;
    }
    .markdown-body p {
      margin-bottom: 0.8em;
    }
    .markdown-body ul, .markdown-body ol {
      margin-left: 24px;
      margin-bottom: 0.8em;
    }
    .markdown-body li {
      margin-bottom: 4px;
    }
    .markdown-body blockquote {
      border-left: 4px solid #A5B4FC;
      padding-left: 14px;
      margin: 1em 0;
      color: var(--text-muted);
      font-style: italic;
    }
    .markdown-body code {
      font-family: var(--font-mono);
      font-size: 0.82rem;
      background: rgba(0, 0, 0, 0.05);
      padding: 2px 6px;
      border-radius: 4px;
      color: #4F46E5;
    }
    [data-theme="dark"] .markdown-body code {
      background: rgba(255, 255, 255, 0.1);
      color: #818CF8;
    }

    /* ========================================================================= */
    /* Language-Specific Pastel Backgrounds for Code Blocks */
    /* ========================================================================= */
    .code-block-wrapper {
      margin: 14px 0;
      border-radius: 10px;
      border: 1px solid;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 14px;
      border-bottom: 1px solid;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .code-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.03em;
    }
    .copy-code-btn {
      background: transparent;
      border: 1px solid currentColor;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 8px;
      cursor: pointer;
      opacity: 0.75;
      transition: opacity 0.15s ease;
    }
    .copy-code-btn:hover {
      opacity: 1;
    }
    .code-block-wrapper pre {
      padding: 12px 14px;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 0.82rem;
      line-height: 1.5;
    }
    .code-block-wrapper code {
      background: transparent !important;
      color: inherit !important;
      padding: 0 !important;
    }

    /* 1. Python Code: Soft Emerald Pastel */
    .lang-python {
      background-color: var(--code-python-bg);
      border-color: var(--code-python-border);
      color: var(--code-python-text);
    }
    .lang-python .code-header {
      background: rgba(167, 243, 208, 0.4);
      border-color: var(--code-python-border);
      color: var(--code-python-text);
    }

    /* 2. TypeScript / JavaScript Code: Soft Sky Pastel */
    .lang-typescript {
      background-color: var(--code-ts-bg);
      border-color: var(--code-ts-border);
      color: var(--code-ts-text);
    }
    .lang-typescript .code-header {
      background: rgba(186, 230, 253, 0.4);
      border-color: var(--code-ts-border);
      color: var(--code-ts-text);
    }

    /* 3. Bash / Shell Code: Soft Slate Pastel */
    .lang-bash {
      background-color: var(--code-bash-bg);
      border-color: var(--code-bash-border);
      color: var(--code-bash-text);
    }
    .lang-bash .code-header {
      background: rgba(203, 213, 225, 0.4);
      border-color: var(--code-bash-border);
      color: var(--code-bash-text);
    }

    /* 4. HTML / CSS Code: Soft Rose Pastel */
    .lang-html {
      background-color: var(--code-html-bg);
      border-color: var(--code-html-border);
      color: var(--code-html-text);
    }
    .lang-html .code-header {
      background: rgba(254, 205, 211, 0.4);
      border-color: var(--code-html-border);
      color: var(--code-html-text);
    }

    /* 5. JSON / Config Code: Soft Warm Amber Pastel */
    .lang-json {
      background-color: var(--code-json-bg);
      border-color: var(--code-json-border);
      color: var(--code-json-text);
    }
    .lang-json .code-header {
      background: rgba(253, 230, 138, 0.4);
      border-color: var(--code-json-border);
      color: var(--code-json-text);
    }

    /* 6. SQL Code: Soft Lavender Pastel */
    .lang-sql {
      background-color: var(--code-sql-bg);
      border-color: var(--code-sql-border);
      color: var(--code-sql-text);
    }
    .lang-sql .code-header {
      background: rgba(233, 213, 255, 0.4);
      border-color: var(--code-sql-border);
      color: var(--code-sql-text);
    }

    /* 7. Default / Text */
    .lang-default {
      background-color: #F8FAFC;
      border-color: #E2E8F0;
      color: #334155;
    }
    .lang-default .code-header {
      background: #F1F5F9;
      border-color: #E2E8F0;
      color: #475569;
    }

    /* Suggestions & Efficiency Playbook Section */
    .efficiency-section {
      background: var(--bg-card);
      border: 1px solid var(--border-main);
      border-radius: 16px;
      padding: 24px;
      margin-top: 40px;
      box-shadow: var(--shadow-sm);
    }
    .efficiency-section h2 {
      font-size: 1.3rem;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .efficiency-section > p {
      font-size: 0.88rem;
      color: var(--text-muted);
      margin-bottom: 20px;
    }
    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 18px;
    }
    .suggestion-card {
      background: var(--bg-page);
      border: 1px solid var(--border-main);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sug-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sug-category {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #4F46E5;
    }
    .sug-impact {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
    }
    .impact-critical { background: #FEE2E2; color: #991B1B; }
    .impact-very-high { background: #FEF3C7; color: #92400E; }
    .impact-high { background: #ECFDF5; color: #065F46; }
    .sug-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .sug-desc {
      font-size: 0.82rem;
      color: var(--text-muted);
      line-height: 1.5;
    }
    .sug-example {
      background: rgba(0, 0, 0, 0.03);
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 0.78rem;
    }
    [data-theme="dark"] .sug-example {
      background: rgba(255, 255, 255, 0.04);
    }
    .sug-example code {
      font-family: var(--font-mono);
      display: block;
      margin-top: 4px;
      color: #4F46E5;
    }
    .sug-antipattern {
      font-size: 0.78rem;
      color: #B91C1C;
    }
    [data-theme="dark"] .sug-antipattern {
      color: #F87171;
    }

    /* Print Styles */
    @media print {
      .top-header, .jumper-bar, .no-print { display: none !important; }
      body { background: #FFFFFF !important; color: #000000 !important; }
      .chat-card { page-break-inside: avoid; border: 1px solid #CBD5E1 !important; box-shadow: none !important; margin-bottom: 20px; }
      .dialogue-content { display: block !important; }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-inner, .jumper-inner { flex-direction: column; align-items: stretch; }
      .search-box { width: 100%; }
      .suggestions-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <!-- Top Sticky Header -->
  <header class="top-header no-print">
    <div class="header-inner">
      <div class="brand-title">
        <h1>
          <span>💬 Gemini Development Chat</span>
        </h1>
        <span class="brand-badge">Audit &amp; Chronicle</span>
      </div>

      <div class="header-actions">
        <button class="btn" onclick="toggleTheme()" id="theme-btn" title="Toggle Theme">
          🌓 <span id="theme-label">Dark Mode</span>
        </button>
        <button class="btn" onclick="expandAll()" title="Expand all prompts and answers">
          ▼ Expand All
        </button>
        <button class="btn" onclick="collapseAll()" title="Collapse all prompts and answers">
          ▲ Collapse All
        </button>
        <button class="btn" onclick="window.print()" title="Print / Save PDF">
          🖨️ Save as PDF
        </button>
        <a class="btn btn-primary" href="/" title="Return to Main Web App">
          &larr; Return to App
        </a>
      </div>
    </div>
  </header>

  <!-- Sticky Prompt Jumper & Search Bar -->
  <div class="jumper-bar no-print">
    <div class="jumper-inner">
      <div class="search-box">
        <span>🔍</span>
        <input type="text" id="search-input" placeholder="Search prompts, code, answers, topics..." oninput="filterChat(this.value)" />
      </div>

      <select class="jumper-select" id="prompt-select" onchange="jumpToPrompt(this.value)">
        <option value="">-- Jump to Prompt (1 to 15) --</option>
        ${CHAT_HISTORY_ENTRIES.map(e => `
          <option value="${e.id}">P#${e.number < 10 ? '0' + e.number : e.number}: ${e.capabilitySummary.slice(0, 50)}... (${e.sessionDate})</option>
        `).join('')}
      </select>

      <div class="chips-container">
        ${CHAT_HISTORY_ENTRIES.map(e => `
          <a href="#${e.id}" class="chip" title="Prompt ${e.number}: ${e.capabilitySummary}">P${e.number < 10 ? '0' + e.number : e.number}</a>
        `).join('')}
      </div>
    </div>
  </div>

  <!-- Main Container -->
  <main class="main-content">

    <!-- Top Dashboard & Capability Overview -->
    <section class="dashboard-hero">
      <div class="hero-top">
        <div class="hero-title">
          <h2>Learn Better: Complete Gemini Development Chronicle</h2>
          <p>
            Verbatim chronological record of all user prompts paired with the exact assistant answers from the sidebar. 
            Features language-specific pastel backgrounds, collapsible dialogues, prompt jumper navigation, daily interaction quota markers, 
            and quantified capability attribution accounting for <strong>100% of the active web app codebase</strong>.
          </p>
        </div>

        <div class="quota-notice-box">
          <strong>⚡ Daily Interaction Quota &amp; Rate-Limit Notice:</strong><br/>
          Free tier allows up to ~10,000 requests/day and 25M tokens/day across models. Bursts can trigger hourly rate limits. 
          Each session below signals prompt counts and token weight so you can pace development effectively.
        </div>
      </div>

      <!-- Capability Attribution Meter -->
      <div class="progress-section">
        <div class="progress-header">
          <span>Overall App Capability Completion: 100% Accounted For across 15 Prompts</span>
          <span style="color: #4F46E5;">15 Prompts &bull; 5 Sessions &bull; 486 Clips &bull; 28 Clusters</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-fill"></div>
        </div>
        <div class="attribution-legend">
          <div class="legend-item"><span class="legend-dot" style="background:#4F46E5;"></span> Core Architecture &amp; Scaffolding (20%)</div>
          <div class="legend-item"><span class="legend-dot" style="background:#0284C7;"></span> YouTube Scraping 70 Pl / 486 Clips (15%)</div>
          <div class="legend-item"><span class="legend-dot" style="background:#0D9488;"></span> 28-Cluster Restructuring Hub (12%)</div>
          <div class="legend-item"><span class="legend-dot" style="background:#10B981;"></span> 2-Col Python Code Visualizer (10%)</div>
          <div class="legend-item"><span class="legend-dot" style="background:#F59E0B;"></span> Chat Recorder &amp; Pastel Themes (7%)</div>
          <div class="legend-item"><span class="legend-dot" style="background:#6366F1;"></span> AirPods Speech Engine &amp; PDF Engines (18%)</div>
          <div class="legend-item"><span class="legend-dot" style="background:#8B5CF6;"></span> Resiliency, Pacing &amp; Verifications (18%)</div>
        </div>
      </div>
    </section>

    <!-- Chronological Session Groups & Chat Entries -->
    ${sessionSectionsHtml}

    <!-- Interaction Efficiency & Multi-AI Collaboration Guide -->
    <section class="efficiency-section" id="efficiency-guide">
      <h2>🚀 How to Make This Interaction More Effective</h2>
      <p>
        Currently, all development is conducted directly with Gemini. Below are key strategies to maximize output per daily prompt turn, 
        avoid rate-limits, and prepare the codebase for seamless future collaboration with other models (Claude, Cursor, Codex, local LLMs).
      </p>

      <div class="suggestions-grid">
        ${suggestionsHtml}
      </div>
    </section>

  </main>

  <!-- Embedded Vanilla JS for Search, Collapse, Jump, Copy, and Theme -->
  <script>
    // Collapsible dialogue toggle
    function toggleSection(headerEl) {
      const block = headerEl.closest('.dialogue-block');
      block.classList.toggle('collapsed');
      const toggleText = headerEl.querySelector('.toggle-text');
      if (toggleText) {
        toggleText.textContent = block.classList.contains('collapsed') ? 'Expand' : 'Collapse';
      }
    }

    // Expand All
    function expandAll() {
      document.querySelectorAll('.dialogue-block').forEach(b => {
        b.classList.remove('collapsed');
        const text = b.querySelector('.toggle-text');
        if (text) text.textContent = 'Collapse';
      });
    }

    // Collapse All
    function collapseAll() {
      document.querySelectorAll('.dialogue-block').forEach(b => {
        b.classList.add('collapsed');
        const text = b.querySelector('.toggle-text');
        if (text) text.textContent = 'Expand';
      });
    }

    // Jump to prompt dropdown
    function jumpToPrompt(id) {
      if (!id) return;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Expand dialogue blocks if collapsed
        el.querySelectorAll('.dialogue-block').forEach(b => {
          b.classList.remove('collapsed');
          const t = b.querySelector('.toggle-text');
          if (t) t.textContent = 'Collapse';
        });
      }
    }

    // Copy Code snippet
    function copyCode(btn) {
      const codeEl = btn.closest('.code-block-wrapper').querySelector('code');
      if (!codeEl) return;
      navigator.clipboard.writeText(codeEl.innerText).then(() => {
        const orig = btn.innerText;
        btn.innerText = 'Copied!';
        setTimeout(() => { btn.innerText = orig; }, 2000);
      });
    }

    // Filter Chat via Search input
    function filterChat(query) {
      const q = query.toLowerCase().trim();
      const cards = document.querySelectorAll('.chat-card');
      cards.forEach(card => {
        if (!q) {
          card.style.display = '';
          return;
        }
        const text = card.innerText.toLowerCase();
        if (text.includes(q)) {
          card.style.display = '';
          // Ensure matches are expanded
          card.querySelectorAll('.dialogue-block').forEach(b => b.classList.remove('collapsed'));
        } else {
          card.style.display = 'none';
        }
      });
    }

    // Theme Toggle
    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      document.getElementById('theme-label').textContent = next === 'dark' ? 'Light Mode' : 'Dark Mode';
      localStorage.setItem('gemini_chat_theme', next);
    }

    // Initialize saved theme
    (function() {
      const saved = localStorage.getItem('gemini_chat_theme');
      if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
        const label = document.getElementById('theme-label');
        if (label) label.textContent = saved === 'dark' ? 'Light Mode' : 'Dark Mode';
      }
    })();
  </script>
</body>
</html>`;

// Write to gemini_chat/chat_history.html and gemini_chat/index.html
const historyHtmlPath = path.join(outputDir, 'chat_history.html');
const indexHtmlPath = path.join(outputDir, 'index.html');

fs.writeFileSync(historyHtmlPath, completeHtml, 'utf-8');
fs.writeFileSync(indexHtmlPath, completeHtml, 'utf-8');

console.log('Successfully wrote:', historyHtmlPath);
console.log('Successfully wrote:', indexHtmlPath);
