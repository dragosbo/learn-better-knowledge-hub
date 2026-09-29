import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Layers, 
  Check, 
  GraduationCap, 
  BookOpen, 
  HelpCircle, 
  Lightbulb, 
  ListChecks, 
  Loader2 
} from 'lucide-react';
import { YouTubeClip, SummaryData, Playlist } from '../types';
import { generateAcademicNotebookPdf, PdfExportOptions } from '../utils/academicPdfGenerator';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClip: YouTubeClip | null;
  clips: YouTubeClip[];
  summaries: SummaryData[];
  playlists?: Playlist[];
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  currentClip,
  clips,
  summaries,
  playlists = [],
}) => {
  const [scope, setScope] = useState<'current' | 'playlist'>('current');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(
    currentClip?.playlistId || (playlists[0]?.id || '')
  );
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeQuestions, setIncludeQuestions] = useState(true);
  const [includeIdeas, setIncludeIdeas] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);

  if (!isOpen) return null;

  // Resolve target clips
  const activePlaylist = playlists.find(p => p.id === selectedPlaylistId);
  const targetClips: YouTubeClip[] = scope === 'current'
    ? (currentClip ? [currentClip] : (clips.slice(0, 1)))
    : (activePlaylist && activePlaylist.clips.length > 0 
        ? activePlaylist.clips 
        : clips);

  const playlistTitle = activePlaylist ? activePlaylist.title : 'Study Knowledge Collection';

  const handleDownload = () => {
    setIsGenerating(true);
    // Slight tick to allow UI loader to render smoothly
    setTimeout(() => {
      try {
        const options: PdfExportOptions = {
          scope,
          playlistTitle: scope === 'playlist' ? playlistTitle : undefined,
          includeSummary,
          includeNotes,
          includeQuestions,
          includeIdeas,
        };

        generateAcademicNotebookPdf(targetClips, summaries, options);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        console.error('PDF generation error:', err);
      } finally {
        setIsGenerating(false);
        onClose();
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-export-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 id="pdf-export-title" className="text-base font-semibold text-white">
                Export Academic Study Notebook
              </h2>
              <p className="text-xs text-slate-400">
                Lined margins layout · printable briefing & Cornell notes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Scope Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2.5">
              1. Export Scope
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScope('current')}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  scope === 'current'
                    ? 'bg-rose-950/30 border-rose-500/80 text-white shadow-sm ring-1 ring-rose-500/40'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-rose-400" />
                    Current Clip Brief
                  </span>
                  {scope === 'current' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                </div>
                <span className="text-[11px] text-slate-400 line-clamp-1">
                  {currentClip?.title || 'Selected video note'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('playlist')}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  scope === 'playlist'
                    ? 'bg-rose-950/30 border-rose-500/80 text-white shadow-sm ring-1 ring-rose-500/40'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-rose-400" />
                    Full Playlist Digest
                  </span>
                  {scope === 'playlist' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                </div>
                <span className="text-[11px] text-slate-400">
                  {playlists.length > 0 ? `${playlists.length} playlists available` : `${clips.length} clips digest`}
                </span>
              </button>
            </div>

            {/* Playlist dropdown when scope is 'playlist' */}
            {scope === 'playlist' && playlists.length > 0 && (
              <div className="mt-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1.5">
                  Select Playlist to Compile ({playlists.length} available):
                </label>
                <select
                  value={selectedPlaylistId}
                  onChange={(e) => setSelectedPlaylistId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  {playlists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.title} ({pl.clips.length} clips)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Section Selection Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Included Content Sections
              </label>
              <span className="text-[11px] text-slate-400">Full Briefing Spec</span>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 w-4 h-4 bg-slate-900"
                />
                <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-slate-200">Video Summary & Key Takeaways</div>
                  <div className="text-[11px] text-slate-400">Core thesis callout and structured topic takeaways</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 w-4 h-4 bg-slate-900"
                />
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-slate-200">Personal Notes & Reflections</div>
                  <div className="text-[11px] text-slate-400">Your study notes plus lined margin space for handwriting</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeQuestions}
                  onChange={(e) => setIncludeQuestions(e.target.checked)}
                  className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 w-4 h-4 bg-slate-900"
                />
                <ListChecks className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-slate-200">Questions & Inquiries Checklist</div>
                  <div className="text-[11px] text-slate-400">Interactive checkbox items for verification and research</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeIdeas}
                  onChange={(e) => setIncludeIdeas(e.target.checked)}
                  className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 w-4 h-4 bg-slate-900"
                />
                <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-slate-200">AI Prompts & Project Ideas</div>
                  <div className="text-[11px] text-slate-400">Vibe coding prompts and architectural concepts</div>
                </div>
              </label>
            </div>
          </div>

          {/* Academic Style Preview Badge */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Styling: Classic Cornell / Academic Ruled Margins</span>
            </div>
            <span className="text-slate-300 font-mono text-[11px]">
              {targetClips.length} {targetClips.length === 1 ? 'clip' : 'clips'} · A4 vector
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isGenerating || (!includeSummary && !includeNotes && !includeQuestions && !includeIdeas)}
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md hover:shadow-rose-600/20 active:scale-95"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Rendering PDF Notebook...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF Notebook
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
