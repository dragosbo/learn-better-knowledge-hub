import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  HelpCircle, 
  Download, 
  Copy, 
  Check, 
  Headphones, 
  BookOpen, 
  FileDown,
  Printer,
  Eye,
  Code2,
  FileText,
  ExternalLink
} from 'lucide-react';
import { AudioLessonPlayer } from './AudioLessonPlayer';
import { generateStyledGuideHtml } from '../utils/guideHtmlFormatter';

interface UserGuideViewerProps {
  guideContent: string;
}

export const UserGuideViewer: React.FC<UserGuideViewerProps> = ({ guideContent }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  const handleCopy = () => {
    navigator.clipboard.writeText(guideContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([guideContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'USER_GUIDE.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const styledHtml = generateStyledGuideHtml(guideContent);
    const blob = new Blob([styledHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Learn_Better_User_Guide.html';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintOrPdf = () => {
    const styledHtml = generateStyledGuideHtml(guideContent);
    
    // Try opening in new window first for maximum print fidelity
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(styledHtml);
      printWin.document.close();
      printWin.focus();
      // Auto-prompt print to save as PDF after styles parse
      setTimeout(() => {
        try {
          printWin.print();
        } catch {
          // Ignored if user cancels
        }
      }, 400);
    } else {
      // Fallback to hidden iframe if popups are blocked in iframe environment
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Application Manual &amp; User Guide</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              AirPods Audio Ready
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              PDF &amp; HTML Formatted
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1.5 max-w-4xl leading-relaxed">
            Full comprehensive reference for playlists, deep knowledge extraction, AirPods stem gestures, safe GitHub syncing, and legacy tools. Read in-app, export nicely formatted HTML, or print/save as clean PDF.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
            title="Copy entire raw Markdown to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy MD'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Download raw Markdown file (USER_GUIDE.md)"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Download .md</span>
          </button>

          <button
            onClick={handleDownloadHtml}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
            title="Download beautifully styled offline HTML manual with theme switcher"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download .html</span>
          </button>

          <button
            onClick={handlePrintOrPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-950/50 transition-colors"
            title="Open browser print dialog formatted to save as PDF with page margins"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Audio Playback Controls for AirPods */}
      <AudioLessonPlayer
        title="Learn Better Platform Manual & Guide"
        series="User Documentation"
        content={guideContent}
        compact={false}
      />

      {/* Guide Content Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Document: <strong className="text-white font-mono">USER_GUIDE.md</strong></span>
            <span className="text-slate-600">&bull;</span>
            <span className="font-mono text-slate-400">
              {guideContent.length.toLocaleString()} chars &bull; ~{Math.round(guideContent.split(/\s+/).length / 150)} min read
            </span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('formatted')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === 'formatted'
                  ? 'bg-slate-800 text-emerald-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Formatted View</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === 'raw'
                  ? 'bg-slate-800 text-sky-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw Markdown</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {viewMode === 'formatted' ? (
          <div className="prose prose-invert max-w-none px-1 sm:px-2 py-2 text-slate-200 text-sm sm:text-base leading-relaxed">
            <Markdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 mb-5 pb-3 border-b border-slate-800 tracking-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg sm:text-xl font-bold text-emerald-400 mt-8 mb-3 pb-2 border-b border-slate-800/80 flex items-center gap-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-sky-300 mt-6 mb-2">
                    {children}
                  </h3>
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
              {guideContent}
            </Markdown>
          </div>
        ) : (
          <pre className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs leading-relaxed max-h-[700px] overflow-y-auto whitespace-pre-wrap">
            {guideContent || '# Loading user guide...'}
          </pre>
        )}
      </div>
    </div>
  );
};
