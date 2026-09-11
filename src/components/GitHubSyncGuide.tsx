import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  GitBranch, 
  Terminal, 
  Copy, 
  Check, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Download, 
  RefreshCw,
  Plus,
  Headphones,
  Lightbulb,
  FileDown,
  Printer,
  Eye,
  Code2
} from 'lucide-react';
import { appendPromptLog } from '../services/api';
import { AudioLessonPlayer } from './AudioLessonPlayer';
import { generateStyledGuideHtml } from '../utils/guideHtmlFormatter';

interface GitHubSyncGuideProps {
  promptsLog: string;
  feedbackLog: string;
  suggestionsLog?: string;
  onRefreshLogs: () => void;
}

export const GitHubSyncGuide: React.FC<GitHubSyncGuideProps> = ({
  promptsLog,
  feedbackLog,
  suggestionsLog = '',
  onRefreshLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'prompts' | 'feedback' | 'suggestions'>('sync');
  const [copiedSync, setCopiedSync] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [newManualPrompt, setNewManualPrompt] = useState('');
  const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false);
  const [docViewMode, setDocViewMode] = useState<'formatted' | 'raw'>('formatted');

  const gitBashCommands = `# 1. In your local clone of learn-better, create a clean feature branch
git checkout -b feature/gemini-knowledge-hub

# 2. Copy the newly generated web application into a new folder called "webapp"
# (All existing files in code/, lib/, notebooks/ remain 100% untouched)
mkdir -p webapp
cp -r /path/to/generated/* webapp/

# 3. Copy the prompt audit log, feedback playbook, suggestions, and user guide
cp gemini_prompts.md .
cp gemini_feedback.md .
cp suggestions.md .
cp USER_GUIDE.md .

# 4. Verify that existing code was NOT modified:
git status

# 5. Stage only the new folders and docs:
git add webapp/ gemini_prompts.md gemini_feedback.md suggestions.md USER_GUIDE.md

# 6. Commit and push safely:
git commit -m "feat: add Learn Better Knowledge Hub webapp & multi-AI vibe coding guide"
git push -u origin feature/gemini-knowledge-hub

# 7. Open a Pull Request on GitHub to review and merge into main
`;

  const handleCopyGitCommands = () => {
    navigator.clipboard.writeText(gitBashCommands);
    setCopiedSync(true);
    setTimeout(() => setCopiedSync(false), 2000);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const handleDownloadMarkdown = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = (filename: string, content: string, title: string) => {
    const styledHtml = generateStyledGuideHtml(content, title);
    const blob = new Blob([styledHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintOrPdf = (content: string, title: string) => {
    const styledHtml = generateStyledGuideHtml(content, title);
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(styledHtml);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        try {
          printWin.print();
        } catch {
          // Handled if user cancels
        }
      }, 400);
    } else {
      // Hidden iframe fallback
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);

      const doc = printFrame.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(styledHtml);
        doc.close();
        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
          }, 4000);
        }, 500);
      }
    }
  };

  const handleManualPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManualPrompt.trim()) return;
    setIsSubmittingPrompt(true);
    await appendPromptLog(newManualPrompt.trim(), 'Manual Entry');
    setNewManualPrompt('');
    setIsSubmittingPrompt(false);
    onRefreshLogs();
  };

  const renderFormattedMarkdown = (content: string) => (
    <div className="prose prose-invert max-w-none px-1 sm:px-2 py-2 text-slate-200 text-sm sm:text-base leading-relaxed">
      <Markdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 mb-5 pb-3 border-b border-slate-800 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-bold text-sky-400 mt-8 mb-3 pb-2 border-b border-slate-800/80 flex items-center gap-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-indigo-300 mt-6 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-emerald-300 mt-4 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-slate-300 leading-relaxed text-sm sm:text-base">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1.5 text-slate-300 ml-1 sm:ml-3 text-sm sm:text-base">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1.5 text-slate-300 ml-1 sm:ml-3 text-sm sm:text-base">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-500 bg-slate-950/80 p-4 rounded-r-xl my-4 text-slate-300 italic text-sm">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-slate-800 shadow-sm bg-slate-950/40">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-800/90 text-slate-200 border-b border-slate-700">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-800/70">
              {children}
            </tbody>
          ),
          th: ({ children }) => (
            <th className="p-3 font-semibold text-emerald-300 tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-3 text-slate-300">
              {children}
            </td>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-800 font-medium">
                {children}
              </code>
            ) : (
              <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl my-4 overflow-x-auto text-xs sm:text-sm font-mono border border-slate-800 leading-relaxed shadow-inner">
                <code>{children}</code>
              </pre>
            );
          },
          hr: () => <hr className="border-slate-800 my-8" />
        }}
      >
        {content}
      </Markdown>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">GitHub Sync, Playbooks &amp; Audit Logs</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              AirPods Audio Ready
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              PDF &amp; HTML Formatted
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-4xl">
            Review your verbatim prompts paired with assistant sidebar answers, multi-AI collaborative playbook, future roadmap, and safe git sync instructions.
          </p>
        </div>

        {/* Subtab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs flex-wrap">
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'sync' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Safe Git Sync
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'prompts' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            Prompts Log
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'feedback' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            Vibe Playbook
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'suggestions' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Suggestions.md
          </button>
        </div>
      </div>

      {/* Tab 1: Safe Git Sync Guide */}
      {activeTab === 'sync' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rules & Checkpoints */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              The Safe Update Protocol
            </h3>
            
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-sky-400 block mb-1">1. Non-Destructive Isolation</strong>
                All generated code lives exclusively in a new subfolder (e.g. <code className="text-amber-300">webapp/</code>). Existing Python tools, bat files, and configs remain untouched.
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-sky-400 block mb-1">2. Dedicated Feature Branch</strong>
                Never commit directly to <code className="text-amber-300">main</code>. Use <code className="text-emerald-400">feature/gemini-knowledge-hub</code> so you can review a diff before merging.
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-sky-400 block mb-1">3. Verifiable State</strong>
                Run <code className="text-sky-300">git status</code> before committing to prove that 0 lines in <code className="text-amber-300">code/</code> or <code className="text-amber-300">lib/</code> were touched.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-900/60 text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Remember: The AI Studio export option (Settings &rarr; Export to GitHub or ZIP) allows you to download the entire workspace cleanly!
              </span>
            </div>
          </div>

          {/* Terminal Commands */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                Step-by-Step Shell Instructions
              </h3>
              <button
                onClick={handleCopyGitCommands}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700"
              >
                {copiedSync ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSync ? 'Copied Commands' : 'Copy Commands'}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">
              {gitBashCommands}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Verbatim Prompts Log (gemini_prompts.md) */}
      {activeTab === 'prompts' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  Verbatim Chronological Prompt &amp; Response Log (gemini_prompts.md)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full dialogue history containing all your verbatim prompts paired with assistant answers. Download as .md or print-ready PDF.
                </p>
              </div>

              {/* Action Buttons for Export & PDF */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleCopyText(promptsLog)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
                  title="Copy full markdown log to clipboard"
                >
                  {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDoc ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => handleDownloadMarkdown('gemini_prompts.md', promptsLog)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  title="Download raw Markdown file (gemini_prompts.md)"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Download .md</span>
                </button>

                <button
                  onClick={() => handleDownloadHtml('gemini_prompts.html', promptsLog, 'Learn Better — Gemini Prompts & Responses Log')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  title="Download styled offline HTML document"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download .html</span>
                </button>

                <button
                  onClick={() => handlePrintOrPdf(promptsLog, 'Learn Better — Gemini Prompts & Responses Log')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-950/50 transition-colors"
                  title="Save or print prompts log directly as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Save as PDF</span>
                </button>

                <button
                  onClick={onRefreshLogs}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-800"
                  title="Refresh prompts log from disk"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Audio Playback Bar */}
            <AudioLessonPlayer
              title="Verbatim Prompt & Response History Log"
              series="gemini_prompts.md"
              content={promptsLog}
              compact={false}
            />

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Document: <strong className="text-white font-mono">gemini_prompts.md</strong></span>
                <span className="text-slate-600">&bull;</span>
                <span>{promptsLog.length.toLocaleString()} characters</span>
              </div>

              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setDocViewMode('formatted')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
                    docViewMode === 'formatted'
                      ? 'bg-slate-800 text-emerald-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Formatted View</span>
                </button>
                <button
                  onClick={() => setDocViewMode('raw')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
                    docViewMode === 'raw'
                      ? 'bg-slate-800 text-sky-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  <span>Raw Markdown</span>
                </button>
              </div>
            </div>

            {/* Document Content */}
            {docViewMode === 'formatted' ? (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 sm:p-6 max-h-[600px] overflow-y-auto">
                {renderFormattedMarkdown(promptsLog)}
              </div>
            ) : (
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed max-h-[520px] overflow-y-auto whitespace-pre-wrap">
                {promptsLog || '# Loading prompts log...'}
              </pre>
            )}

            {/* Quick Append Manual Prompt */}
            <form onSubmit={handleManualPromptSubmit} className="pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Manually append an instruction or prompt to gemini_prompts.md..."
                value={newManualPrompt}
                onChange={(e) => setNewManualPrompt(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={isSubmittingPrompt}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Append
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Multi-AI Vibe Playbook (gemini_feedback.md) */}
      {activeTab === 'feedback' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Collaborative Vibe Coding &amp; Anti-Pattern Playbook (gemini_feedback.md)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-AI collaboration guidelines, anti-patterns, audio architectures, and token optimization.
              </p>
            </div>

            {/* Export & PDF controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleCopyText(feedbackLog)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
                title="Copy full playbook to clipboard"
              >
                {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDoc ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => handleDownloadMarkdown('gemini_feedback.md', feedbackLog)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                title="Download raw Markdown (gemini_feedback.md)"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Download .md</span>
              </button>

              <button
                onClick={() => handleDownloadHtml('gemini_feedback.html', feedbackLog, 'Learn Better — Collaborative Vibe Coding Playbook')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
                title="Download styled offline HTML document"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download .html</span>
              </button>

              <button
                onClick={() => handlePrintOrPdf(feedbackLog, 'Learn Better — Collaborative Vibe Coding Playbook')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-950/50 transition-colors"
                title="Save or print playbook directly as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Save as PDF</span>
              </button>

              <button
                onClick={onRefreshLogs}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-800"
                title="Refresh from disk"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Audio Playback Bar */}
          <AudioLessonPlayer
            title="Multi-AI Collaboration & Vibe Coding Playbook"
            series="gemini_feedback.md"
            content={feedbackLog}
            compact={false}
          />

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 sm:p-6 max-h-[600px] overflow-y-auto">
            {renderFormattedMarkdown(feedbackLog)}
          </div>
        </div>
      )}

      {/* Tab 4: Future Capabilities & Suggestions (suggestions.md) */}
      {activeTab === 'suggestions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Architectural Roadmap &amp; New Capabilities (suggestions.md)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Explore proposed features including Obsidian sync, Anki deck generator, auto-podcasts, and YouTube channel integration.
              </p>
            </div>

            {/* Export & PDF controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleCopyText(suggestionsLog)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
                title="Copy suggestions to clipboard"
              >
                {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDoc ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => handleDownloadMarkdown('suggestions.md', suggestionsLog)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                title="Download raw Markdown (suggestions.md)"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Download .md</span>
              </button>

              <button
                onClick={() => handleDownloadHtml('suggestions.html', suggestionsLog, 'Learn Better — Future Architectural Roadmap')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
                title="Download styled offline HTML document"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download .html</span>
              </button>

              <button
                onClick={() => handlePrintOrPdf(suggestionsLog, 'Learn Better — Future Architectural Roadmap')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-950/50 transition-colors"
                title="Save or print suggestions directly as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Save as PDF</span>
              </button>

              <button
                onClick={onRefreshLogs}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-800"
                title="Refresh from disk"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Audio Playback Bar */}
          <AudioLessonPlayer
            title="Future Architectural Roadmap & Capabilities"
            series="suggestions.md"
            content={suggestionsLog}
            compact={false}
          />

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 sm:p-6 max-h-[600px] overflow-y-auto">
            {renderFormattedMarkdown(suggestionsLog)}
          </div>
        </div>
      )}
    </div>
  );
};
