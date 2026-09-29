import React, { useState } from 'react';
import { 
  Volume2, 
  Calendar, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  MessageSquare, 
  Copy, 
  Check, 
  FileDown, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  BrainCircuit,
  Trash2
} from 'lucide-react';
import { YouTubeClip, VoiceReflectionSession } from '../types';

interface VoiceReflectionsJournalProps {
  currentClip: YouTubeClip;
  onStartNewInterview: () => void;
  onAppendToNotes: (content: string) => void;
  onDeleteSession?: (clipId: string, sessionId: string) => void;
}

export const VoiceReflectionsJournal: React.FC<VoiceReflectionsJournalProps> = ({
  currentClip,
  onStartNewInterview,
  onAppendToNotes,
  onDeleteSession,
}) => {
  const [expandedTranscripts, setExpandedTranscripts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sessions = currentClip.voiceReflections || [];

  const toggleExpand = (id: string) => {
    setExpandedTranscripts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyTranscript = (session: VoiceReflectionSession) => {
    const text = `# Spoken Voice Reflection: ${session.clipTitle}\nDate: ${session.date}\n\n## Synthesis Summary\n${session.synthesis.oneLineSummary}\n\n### Why Good:\n${session.synthesis.whyGood}\n\n### Key Learnings:\n${session.synthesis.keyLearnings.map(l => `- ${l}`).join('\n')}\n\n### Applications:\n${session.synthesis.practicalApplications.map(a => `- ${a}`).join('\n')}\n\n## Full Dialogue Transcript:\n${session.turns.map((t, i) => `**Q${i+1} (${t.stage}):** ${t.question}\n**A:** ${t.transcript}`).join('\n\n')}\n`;

    navigator.clipboard.writeText(text);
    setCopiedId(session.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadMarkdown = (session: VoiceReflectionSession) => {
    const text = `# Spoken Voice Reflection: ${session.clipTitle}
Date: ${session.date}
Clip ID: ${session.clipId}

## Executive Synthesis
${session.synthesis.oneLineSummary}

### Why Valuable & Standout
${session.synthesis.whyGood}

### Key Learnings & Insights
${session.synthesis.keyLearnings.map(l => `- ${l}`).join('\n')}

### Practical Next Steps & Applications
${session.synthesis.practicalApplications.map(a => `- ${a}`).join('\n')}

---
## Dialogue Transcript
${session.turns.map((t, i) => `#### Question ${i+1}: ${t.question}\n> *Spoken Answer:* ${t.transcript}\n`).join('\n')}
`;

    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `voice_reflection_${session.clipId}_${session.id}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAppendDistillation = (session: VoiceReflectionSession) => {
    const formattedNotes = `\n\n### 🎙 Spoken Voice Reflection (${session.date})\n**Core Takeaway:** ${session.synthesis.oneLineSummary}\n\n**Why Standout:**\n${session.synthesis.whyGood}\n\n**Key Learnings:**\n${session.synthesis.keyLearnings.map(l => `- ${l}`).join('\n')}\n\n**Action Ideas:**\n${session.synthesis.practicalApplications.map(a => `- ${a}`).join('\n')}\n`;

    onAppendToNotes(formattedNotes);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-rose-400" />
            Spoken Voice Reflections Journal
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {sessions.length} recorded interview session{sessions.length === 1 ? '' : 's'} for this clip
          </p>
        </div>

        <button
          onClick={onStartNewInterview}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Start New Reflection Interview
        </button>
      </div>

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Volume2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-200">No voice reflections recorded yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Verbalizing your takeaways dramatically improves retention. Start an interactive Socratic interview to clarify why this clip is valuable, what you learned, and how you will use it.
            </p>
          </div>
          <button
            onClick={onStartNewInterview}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4" />
            Record Spoken Reflection Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, index) => {
            const isExpanded = Boolean(expandedTranscripts[session.id]);
            return (
              <div 
                key={session.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm hover:border-slate-700/80 transition-all"
              >
                {/* Session Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>Session #{sessions.length - index} · {session.date}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-300 font-mono">{session.turns.length} inquiry turns</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleAppendDistillation(session)}
                      className="px-2.5 py-1 text-[11px] font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800/60 rounded-md transition-colors"
                      title="Append this reflection to current clip notes"
                    >
                      Append to Notes
                    </button>
                    <button
                      onClick={() => handleCopyTranscript(session)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
                      title="Copy Markdown"
                    >
                      {copiedId === session.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDownloadMarkdown(session)}
                      className="p-1.5 text-slate-400 hover:text-sky-300 rounded-md transition-colors"
                      title="Download Markdown"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteSession && (
                      <button
                        onClick={() => onDeleteSession(currentClip.id, session.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-md transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Synthesis One-Liner */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3">
                  <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Distilled Core Synthesis
                  </div>
                  <p className="text-xs font-medium text-slate-200 italic leading-relaxed">
                    "{session.synthesis.oneLineSummary}"
                  </p>
                </div>

                {/* 3 Debrief Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Why Good */}
                  <div className="bg-slate-900/50 border border-slate-800/60 rounded-lg p-3 space-y-1">
                    <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Why It Stood Out:
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-4">
                      {session.synthesis.whyGood}
                    </p>
                  </div>

                  {/* Key Learnings */}
                  <div className="bg-slate-900/50 border border-slate-800/60 rounded-lg p-3 space-y-1">
                    <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      What You Learned:
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {session.synthesis.keyLearnings.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-indigo-400">•</span>
                          <span className="line-clamp-2">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Practical Applications */}
                  <div className="bg-slate-900/50 border border-slate-800/60 rounded-lg p-3 space-y-1">
                    <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Practical Plans:
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {session.synthesis.practicalApplications.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-emerald-400">→</span>
                          <span className="line-clamp-2">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Expandable full transcript */}
                <div className="pt-1">
                  <button
                    onClick={() => toggleExpand(session.id)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>{isExpanded ? 'Hide' : 'Show'} Full Spoken Dialogue ({session.turns.length} questions)</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 bg-slate-900/70 p-3.5 rounded-lg border border-slate-800 text-xs">
                      {session.turns.map((turn, tIdx) => (
                        <div key={tIdx} className="space-y-1 pb-2 border-b border-slate-800/60 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-indigo-300">
                              Socrates (Q{tIdx + 1} · {turn.stage}):
                            </span>
                            <span className="text-slate-500 font-mono text-[10px]">{turn.timestamp}</span>
                          </div>
                          <p className="text-slate-400 text-xs italic">
                            "{turn.question}"
                          </p>
                          <div className="mt-1 pl-3 border-l-2 border-rose-500/60 text-slate-200 text-xs">
                            <span className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold block mb-0.5">
                              Your Spoken Reflection:
                            </span>
                            {turn.transcript}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
