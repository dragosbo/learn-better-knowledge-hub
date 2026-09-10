import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import { appendPromptLog } from '../services/api';

interface GitHubSyncGuideProps {
  promptsLog: string;
  feedbackLog: string;
  onRefreshLogs: () => void;
}

export const GitHubSyncGuide: React.FC<GitHubSyncGuideProps> = ({
  promptsLog,
  feedbackLog,
  onRefreshLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'prompts' | 'feedback'>('sync');
  const [copiedSync, setCopiedSync] = useState(false);
  const [newManualPrompt, setNewManualPrompt] = useState('');
  const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false);

  const gitBashCommands = `# 1. In your local clone of learn-better, create a clean feature branch
git checkout -b feature/gemini-knowledge-hub

# 2. Copy the newly generated web application into a new folder called "webapp"
# (All existing files in code/, lib/, notebooks/ remain 100% untouched)
mkdir -p webapp
cp -r /path/to/generated/* webapp/

# 3. Copy the prompt audit log and feedback playbook
cp gemini_prompts.md .
cp gemini_feedback.md .

# 4. Verify that existing code was NOT modified:
git status

# 5. Stage only the new folders and docs:
git add webapp/ gemini_prompts.md gemini_feedback.md

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

  const handleManualPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManualPrompt.trim()) return;
    setIsSubmittingPrompt(true);
    await appendPromptLog(newManualPrompt.trim(), 'Manual Entry');
    setNewManualPrompt('');
    setIsSubmittingPrompt(false);
    onRefreshLogs();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">GitHub Sync & Audit Logs</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Safe Branch Isolation
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Safely update <code className="text-sky-400">dragosbo/learn-better</code> on GitHub with new code, and inspect all verbatim prompt audit logs.
          </p>
        </div>

        {/* Subtab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'sync' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Safe Git Sync Guide
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'prompts' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Verbatim Prompts Log
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'feedback' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Multi-AI Vibe Playbook
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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                Verbatim Chronological Prompt Log (gemini_prompts.md)
              </h3>
              <button
                onClick={onRefreshLogs}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed max-h-[480px] overflow-y-auto whitespace-pre-wrap">
              {promptsLog || '# Loading prompts log...'}
            </pre>

            {/* Quick Append Manual Prompt */}
            <form onSubmit={handleManualPromptSubmit} className="pt-2 border-t border-slate-800 flex gap-2">
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Collaborative Vibe Coding & Anti-Pattern Playbook (gemini_feedback.md)
            </h3>
            <button
              onClick={onRefreshLogs}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed max-h-[560px] overflow-y-auto whitespace-pre-wrap">
            {feedbackLog || '# Loading feedback playbook...'}
          </pre>
        </div>
      )}
    </div>
  );
};
