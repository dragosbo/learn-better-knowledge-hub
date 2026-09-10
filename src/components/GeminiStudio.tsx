import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  HelpCircle, 
  CheckCircle2, 
  Lightbulb, 
  Copy, 
  Check, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck,
  Brain,
  History
} from 'lucide-react';
import { YouTubeClip, GeminiInsightResult, VibePromptResult } from '../types';
import { extractInsightsWithGemini, getVibePilotAdvice, appendPromptLog } from '../services/api';

interface GeminiStudioProps {
  initialClip: YouTubeClip | null;
  initialContent: string;
  hasGeminiKey: boolean;
  onApplyInsightsToClip: (
    clipId: string, 
    insights: string[], 
    questions: string[], 
    prompts: string[]
  ) => void;
}

export const GeminiStudio: React.FC<GeminiStudioProps> = ({
  initialClip,
  initialContent,
  hasGeminiKey,
  onApplyInsightsToClip,
}) => {
  const [activeTab, setActiveTab] = useState<'distill' | 'vibepilot'>('distill');

  // Distill State
  const [inputText, setInputText] = useState(initialContent || '');
  const [videoTitle, setVideoTitle] = useState(initialClip?.title || '');
  const [customGoal, setCustomGoal] = useState('Extract actionable principles and research questions');
  const [isDistilling, setIsDistilling] = useState(false);
  const [distillResult, setDistillResult] = useState<GeminiInsightResult | null>(null);
  const [appliedNotification, setAppliedNotification] = useState(false);

  // Vibe Pilot State
  const [featureIdea, setFeatureIdea] = useState('');
  const [targetAssistant, setTargetAssistant] = useState('Claude & Gemini Multi-Agent');
  const [projectStage, setProjectStage] = useState('Feature Implementation');
  const [isPiloting, setIsPiloting] = useState(false);
  const [pilotResult, setPilotResult] = useState<VibePromptResult | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // When initial clip or content changes
  React.useEffect(() => {
    if (initialContent) setInputText(initialContent);
    if (initialClip) setVideoTitle(initialClip.title);
  }, [initialContent, initialClip?.id]);

  const handleRunDistill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsDistilling(true);
    try {
      const result = await extractInsightsWithGemini(inputText, videoTitle, customGoal);
      setDistillResult(result);
      
      // Auto-log prompt to gemini_prompts.md
      await appendPromptLog(
        `Gemini Distill Request:\nTitle: ${videoTitle}\nGoal: ${customGoal}\nContent Snippet: ${inputText.slice(0, 300)}...`,
        'Knowledge Distillation'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsDistilling(false);
    }
  };

  const handleRunVibePilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureIdea.trim()) return;

    setIsPiloting(true);
    try {
      const result = await getVibePilotAdvice(featureIdea, targetAssistant, projectStage);
      setPilotResult(result);

      // Auto-log prompt to gemini_prompts.md
      await appendPromptLog(
        `Vibe Coding Co-Pilot Request:\nIdea: ${featureIdea}\nTarget Assistant: ${targetAssistant}\nStage: ${projectStage}`,
        'Vibe Pilot Optimization'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsPiloting(false);
    }
  };

  const handleApplyToClip = () => {
    if (!initialClip || !distillResult) return;
    onApplyInsightsToClip(
      initialClip.id,
      distillResult.insights || [],
      distillResult.questions || [],
      distillResult.suggestedPrompts || []
    );
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 3000);
  };

  const handleCopyOptimizedPrompt = () => {
    if (!pilotResult) return;
    navigator.clipboard.writeText(pilotResult.optimizedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Gemini AI Intelligence Studio</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              gemini-3.8-flash
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Turn dense video transcripts into high-retention takeaways, formulate self-test questions, and craft anti-pattern-free prompts for multi-AI coding.
          </p>
        </div>

        {/* Studio Subtab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('distill')}
            className={`px-3.5 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'distill' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Knowledge Distiller
          </button>
          <button
            onClick={() => setActiveTab('vibepilot')}
            className={`px-3.5 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'vibepilot' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vibe Coding Co-Pilot
          </button>
        </div>
      </div>

      {/* Tab 1: Knowledge Distiller */}
      {activeTab === 'distill' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-sky-400" />
              Source Material & Synthesis Parameters
            </h3>

            <form onSubmit={handleRunDistill} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Video or Topic Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Git and GitHub Tutorial for Beginners"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Knowledge Extraction Goal
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extract key technical rules, common pitfalls, and study flashcards"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Summary / Transcript / Notes Content <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={9}
                  required
                  placeholder="Paste YouTube transcript, video notes, or summary text to analyze..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Auto-logged to gemini_prompts.md
                </span>

                <button
                  type="submit"
                  disabled={isDistilling}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs"
                >
                  {isDistilling ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Distilling Knowledge...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Distill with Gemini
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Distillation Results */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                Distilled Knowledge Output
              </h3>

              {distillResult && initialClip && (
                <button
                  onClick={handleApplyToClip}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    appliedNotification
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {appliedNotification ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  {appliedNotification ? 'Saved to Knowledge Hub!' : 'Save to Clip Hub'}
                </button>
              )}
            </div>

            {distillResult ? (
              <div className="space-y-4 text-xs overflow-y-auto max-h-[560px] pr-1">
                {distillResult.note && (
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/60 text-amber-300 text-[11px]">
                    {distillResult.note}
                  </div>
                )}

                {/* Insights */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sky-300 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
                    Key Architectural Insights
                  </h4>
                  <ul className="space-y-1.5">
                    {distillResult.insights?.map((ins, idx) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 leading-relaxed">
                        &bull; {ins}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Takeaways */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Golden Rules & Takeaways
                  </h4>
                  <ul className="space-y-1.5">
                    {distillResult.takeaways?.map((t, idx) => (
                      <li key={idx} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reflection Questions */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    Comprehension Questions & Inquiry Hooks
                  </h4>
                  <ul className="space-y-1.5">
                    {distillResult.questions?.map((q, idx) => (
                      <li key={idx} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300">
                        ❓ {q}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Prompts */}
                {distillResult.suggestedPrompts && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Suggested AI Coding Prompts
                    </h4>
                    <div className="space-y-2">
                      {distillResult.suggestedPrompts.map((p, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  Select or paste content on the left and click "Distill with Gemini" to extract structured knowledge.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Vibe Coding Co-Pilot */}
      {activeTab === 'vibepilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prompt Optimizer Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Prompt Architect & Anti-Pattern Checker
            </h3>
            <p className="text-xs text-slate-400">
              Formulate crisp, token-conserving instructions that prevent AI hallucinations, avoid breaking existing files, and provide concrete verification tests.
            </p>

            <form onSubmit={handleRunVibePilot} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  What feature or change do you want to build? <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Build a script that parses YouTube transcripts from data/transcripts and automatically creates Anki flashcards in data/flashcards.json"
                  value={featureIdea}
                  onChange={(e) => setFeatureIdea(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Assistant</label>
                  <select
                    value={targetAssistant}
                    onChange={(e) => setTargetAssistant(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
                  >
                    <option value="Claude & Gemini Multi-Agent">Claude & Gemini Multi-Agent</option>
                    <option value="Kiro (Terminal & CLI scripts)">Kiro (Terminal & CLI scripts)</option>
                    <option value="Claude (Deep architecture & lessons)">Claude (Deep architecture & lessons)</option>
                    <option value="Gemini (Web apps & synthesis)">Gemini (Web apps & synthesis)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Project Stage</label>
                  <select
                    value={projectStage}
                    onChange={(e) => setProjectStage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
                  >
                    <option value="Scaffolding new module">Scaffolding new module</option>
                    <option value="Feature Implementation">Feature Implementation</option>
                    <option value="Debugging & Verification">Debugging & Verification</option>
                    <option value="Refactoring & File Isolation">Refactoring & File Isolation</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isPiloting}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs"
                >
                  {isPiloting ? 'Optimizing Prompt...' : 'Generate High-Leverage Prompt'}
                </button>
              </div>
            </form>
          </div>

          {/* Optimized Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Optimized Prompt & Guardrails
            </h3>

            {pilotResult ? (
              <div className="space-y-4 text-xs">
                {/* Anti Pattern Warning */}
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 space-y-1">
                  <h4 className="font-semibold flex items-center gap-1.5 text-rose-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Anti-Pattern to Avoid:
                  </h4>
                  <p className="leading-relaxed text-[11px]">{pilotResult.antiPatternWarning}</p>
                </div>

                {/* Paste-Ready Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-300">Paste-Ready Prompt for your AI:</label>
                    <button
                      onClick={handleCopyOptimizedPrompt}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
                    >
                      {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedPrompt ? 'Copied' : 'Copy Prompt'}
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {pilotResult.optimizedPrompt}
                  </pre>
                </div>

                {/* Next Steps */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-300">Suggested Micro-Steps:</h4>
                  <ul className="space-y-1 text-slate-400 text-[11px]">
                    {pilotResult.suggestedNextSteps.map((step, idx) => (
                      <li key={idx}>&bull; {step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 space-y-2">
                <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  Enter your feature idea on the left to receive a hardened, token-efficient prompt and anti-pattern warnings.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
