import React, { useState, useMemo } from 'react';
import { 
  Play, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Tv, 
  BrainCircuit, 
  GraduationCap, 
  HelpCircle, 
  FileSearch, 
  Milestone, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Sun, 
  Folder, 
  ListFilter, 
  ArrowRight, 
  RotateCcw,
  Presentation,
  Send,
  Copy,
  Check,
  Cpu,
  FileCode2,
  SlidersHorizontal,
  FolderTree,
  FileText
} from 'lucide-react';
import { Playlist, YouTubeClip, SummaryData, LessonItem } from '../types';
import { extractInsightsWithGemini } from '../services/api';

interface SimpleLightAppProps {
  playlists: Playlist[];
  summaries: SummaryData[];
  claudeLessons: LessonItem[];
  kiroLessons: LessonItem[];
  selectedClip: YouTubeClip | null;
  onSelectClip: (clip: YouTubeClip) => void;
  onUpdateClipNotes: (clipId: string, notes: string) => void;
  onUpdateClipStatus: (clipId: string, status: YouTubeClip['status']) => void;
  hasGeminiKey: boolean;
  onToggleUiMode: () => void;
  onOpenPrerequisites?: () => void;
  onOpenIpadAnalysis?: () => void;
  userGuideLog?: string;
  onApplyInsightsToClip?: (
    clipId: string,
    insights: string[],
    questions: string[],
    prompts: string[]
  ) => void;
}

type LightPage = 'study' | 'library' | 'assistant' | 'academy' | 'resources';

export const SimpleLightApp: React.FC<SimpleLightAppProps> = ({
  playlists,
  summaries,
  claudeLessons,
  kiroLessons,
  selectedClip,
  onSelectClip,
  onUpdateClipNotes,
  onUpdateClipStatus,
  hasGeminiKey,
  onToggleUiMode,
  onOpenPrerequisites,
  onOpenIpadAnalysis,
  userGuideLog,
  onApplyInsightsToClip,
}) => {
  const [currentPage, setCurrentPage] = useState<LightPage>('study');

  // Study page states
  const [activeNoteText, setActiveNoteText] = useState<string>('');
  const [isAiSummarizing, setIsAiSummarizing] = useState<boolean>(false);
  const [aiInsightResult, setAiInsightResult] = useState<string | null>(null);
  const [copiedNote, setCopiedNote] = useState<boolean>(false);

  // Sync activeNoteText when selectedClip changes
  React.useEffect(() => {
    if (selectedClip) {
      setActiveNoteText(selectedClip.notes || '');
      setAiInsightResult(null);
    }
  }, [selectedClip]);

  // Library page states
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [playlistPageNumber, setPlaylistPageNumber] = useState<number>(1);
  const [playlistsPerPage, setPlaylistsPerPage] = useState<number>(6);
  const [clipsPageNumber, setClipsPageNumber] = useState<number>(1);
  const [clipsPerPage, setClipsPerPage] = useState<number>(6);

  // Academy page states
  const [selectedLessonSeries, setSelectedLessonSeries] = useState<'all' | 'Claude' | 'Kiro'>('all');
  const [academyPageNumber, setAcademyPageNumber] = useState<number>(1);
  const [lessonsPerPage, setLessonsPerPage] = useState<number>(4);
  const [readingLesson, setReadingLesson] = useState<LessonItem | null>(null);

  // AI Assistant page states
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // All clips flattened
  const allClips = useMemo(() => playlists.flatMap((p) => p.clips), [playlists]);

  // Extract video ID safely
  const getVideoId = (clip: YouTubeClip): string => {
    const raw = clip.id || '';
    if (raw.length === 11 && !raw.includes('/')) return raw;
    const match = raw.match(/(?:v=|youtu\.be\/|embed\/|\/v\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : raw;
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    playlists.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [playlists]);

  // Filtered playlists
  const filteredPlaylists = useMemo(() => {
    return playlists.filter((pl) => {
      const matchCat = selectedCategory === 'all' || pl.category === selectedCategory;
      const matchSearch =
        !librarySearch ||
        pl.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
        pl.description.toLowerCase().includes(librarySearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [playlists, selectedCategory, librarySearch]);

  // Paginated playlists
  const totalPlaylistPages = Math.ceil(filteredPlaylists.length / playlistsPerPage) || 1;
  const paginatedPlaylists = useMemo(() => {
    const start = (playlistPageNumber - 1) * playlistsPerPage;
    return filteredPlaylists.slice(start, start + playlistsPerPage);
  }, [filteredPlaylists, playlistPageNumber, playlistsPerPage]);

  // Active playlist for clip view
  const activePlaylist = useMemo(() => {
    if (!activePlaylistId) return null;
    return playlists.find((p) => p.id === activePlaylistId) || null;
  }, [playlists, activePlaylistId]);

  // Paginated clips within active playlist
  const totalClipPages = Math.ceil((activePlaylist?.clips.length || 0) / clipsPerPage) || 1;
  const paginatedClips = useMemo(() => {
    if (!activePlaylist) return [];
    const start = (clipsPageNumber - 1) * clipsPerPage;
    return activePlaylist.clips.slice(start, start + clipsPerPage);
  }, [activePlaylist, clipsPageNumber, clipsPerPage]);

  // Filtered Lessons
  const filteredLessons = useMemo(() => {
    const combined = [...claudeLessons, ...kiroLessons];
    if (selectedLessonSeries === 'all') return combined;
    return combined.filter((l) => l.series === selectedLessonSeries);
  }, [claudeLessons, kiroLessons, selectedLessonSeries]);

  const totalLessonPages = Math.ceil(filteredLessons.length / lessonsPerPage) || 1;
  const paginatedLessons = useMemo(() => {
    const start = (academyPageNumber - 1) * lessonsPerPage;
    return filteredLessons.slice(start, start + lessonsPerPage);
  }, [filteredLessons, academyPageNumber, lessonsPerPage]);

  // Save note action
  const handleSaveNotes = () => {
    if (selectedClip) {
      onUpdateClipNotes(selectedClip.id, activeNoteText);
    }
  };

  // Quick AI insight for the current clip
  const handleRequestClipSummary = async () => {
    if (!selectedClip) return;
    setIsAiSummarizing(true);
    setAiInsightResult(null);
    try {
      const summaryObj = summaries.find((s) => s.videoId === selectedClip.id || s.title === selectedClip.title);
      const textToAnalyze = summaryObj ? summaryObj.content : `${selectedClip.title} by ${selectedClip.channel}. Tags: ${selectedClip.tags.join(', ')}`;

      const res = await extractInsightsWithGemini(
        textToAnalyze,
        selectedClip.title,
        'Summarize top 3 core takeaways and key actions in a clean, friendly format'
      );

      const generated = [
        `### Key Takeaways\n${(res.takeaways || []).map((t) => `• ${t}`).join('\n')}`,
        `### Core Insights\n${(res.insights || []).map((i) => `• ${i}`).join('\n')}`,
      ].join('\n\n');

      setAiInsightResult(generated);

      // Append to note
      const newNotes = activeNoteText
        ? `${activeNoteText}\n\n${generated}`
        : generated;
      setActiveNoteText(newNotes);
      onUpdateClipNotes(selectedClip.id, newNotes);

      if (onApplyInsightsToClip) {
        onApplyInsightsToClip(selectedClip.id, res.insights || [], res.questions || [], res.suggestedPrompts || []);
      }
    } catch (err: any) {
      setAiInsightResult('AI synthesis offline or completed in offline mode. Notes can be added manually.');
    } finally {
      setIsAiSummarizing(false);
    }
  };

  // Handle general AI question
  const handleAskAi = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiAnswer(null);
    try {
      const res = await extractInsightsWithGemini(
        aiQuestion,
        'User Query in Simple Mode',
        'Provide a clear, concise, actionable response with simple bullet points'
      );
      const formatted = [
        ...(res.takeaways || []),
        ...(res.insights || []),
        ...(res.suggestedPrompts || []),
      ].join('\n• ');
      setAiAnswer(formatted ? `• ${formatted}` : 'Response received. Key principles noted.');
    } catch (err) {
      setAiAnswer('Gemini is in free-quota friendly mode. Try selecting a clip to view cached summaries and curriculum lessons.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Clean Light Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">learn-better</span>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Simple &amp; Light View
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Calm, focused learning with clean pages &amp; zero clutter
                </p>
              </div>
            </div>

            {/* Top Right Controls & Toggle */}
            <div className="flex items-center gap-3">
              {/* Toggle to Pro / Studio Mode button */}
              <button
                onClick={onToggleUiMode}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                title="Switch back to the dark multi-tool studio with all 14 panels"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Switch to Studio Mode</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                  Pro
                </span>
              </button>
            </div>
          </div>

          {/* Simple Navigation Tabs */}
          <nav className="flex space-x-2 border-t border-slate-100 py-2.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setCurrentPage('study')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'study'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Tv className="w-4 h-4 text-indigo-600" />
              <span>Study Focus</span>
              {selectedClip && (
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              )}
            </button>

            <button
              onClick={() => setCurrentPage('library')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'library'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Folder className="w-4 h-4 text-indigo-600" />
              <span>Playlists &amp; Library</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                {playlists.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentPage('assistant')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'assistant'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Assistant</span>
            </button>

            <button
              onClick={() => setCurrentPage('academy')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'academy'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Coding Lessons</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                {claudeLessons.length + kiroLessons.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentPage('resources')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'resources'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Presentation className="w-4 h-4 text-sky-600" />
              <span>Guides &amp; Decks</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================= */}
        {/* PAGE 1: STUDY FOCUS */}
        {/* ========================================================= */}
        {currentPage === 'study' && (
          <div className="space-y-6">
            {selectedClip ? (
              <div className="space-y-6">
                {/* Back / Clear selection banner */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage('library')}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Back to Library
                    </button>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs text-slate-500">Currently studying</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Status:</span>
                    <select
                      value={selectedClip.status}
                      onChange={(e) => onUpdateClipStatus(selectedClip.id, e.target.value as any)}
                      className="text-xs font-semibold px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 focus:outline-hidden"
                    >
                      <option value="to-watch">To Watch</option>
                      <option value="in-progress">In Progress</option>
                      <option value="synthesized">Synthesized</option>
                      <option value="mastered">Mastered</option>
                    </select>
                  </div>
                </div>

                {/* Video & Notes Split View */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Video Embed & Meta */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="aspect-video w-full bg-slate-900">
                        <iframe
                          src={`https://www.youtube.com/embed/${getVideoId(selectedClip)}?rel=0`}
                          title={selectedClip.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      </div>
                      <div className="p-5 space-y-3">
                        <h1 className="text-xl font-bold text-slate-900 leading-snug">
                          {selectedClip.title}
                        </h1>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">{selectedClip.channel}</span>
                          {selectedClip.duration && <span>{selectedClip.duration}</span>}
                        </div>
                        {selectedClip.tags && selectedClip.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {selectedClip.tags.slice(0, 5).map((t, i) => (
                              <span
                                key={i}
                                className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Clean Notes & AI Synthesis */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <h2 className="font-bold text-slate-900 text-base">Personal Notes</h2>
                        </div>
                        <button
                          onClick={handleRequestClipSummary}
                          disabled={isAiSummarizing}
                          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          {isAiSummarizing ? 'Synthesizing...' : 'AI Key Insights'}
                        </button>
                      </div>

                      <textarea
                        value={activeNoteText}
                        onChange={(e) => setActiveNoteText(e.target.value)}
                        placeholder="Write your reflections, insights, or key takeaways from this video here..."
                        rows={12}
                        className="w-full p-3.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden font-sans text-slate-800 placeholder-slate-400 leading-relaxed resize-y"
                      />

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-400">
                          {activeNoteText ? `${activeNoteText.length} characters` : 'No notes yet'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSaveNotes}
                            className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
                          >
                            Save Notes
                          </button>
                        </div>
                      </div>

                      {aiInsightResult && (
                        <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2">
                          <div className="flex items-center justify-between font-bold text-amber-800">
                            <span>✨ Gemini Key Insights</span>
                            <button
                              onClick={() => setAiInsightResult(null)}
                              className="text-amber-600 hover:text-amber-800"
                            >
                              Dismiss
                            </button>
                          </div>
                          <p className="whitespace-pre-line leading-relaxed">{aiInsightResult}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* No clip selected: Welcome and Quick Picker */
              <div className="space-y-8 py-6">
                <div className="bg-gradient-to-br from-indigo-50 via-white to-slate-50 border border-indigo-100 rounded-3xl p-8 sm:p-10 text-center max-w-2xl mx-auto space-y-4 shadow-sm">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                    <Tv className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Ready to Study a Lesson?
                  </h2>
                  <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    Choose any video clip from your playlist collection to watch in a distraction-free player, write notes, and extract AI takeaways.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setCurrentPage('library')}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm inline-flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
                    >
                      <Folder className="w-4 h-4" />
                      <span>Browse All Playlists</span>
                    </button>
                  </div>
                </div>

                {/* Quick Recommended / Recent Clips */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Featured Learning Clips</h3>
                      <p className="text-xs text-slate-500">Pick one to start watching right away</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {allClips.slice(0, 6).map((clip) => (
                      <div
                        key={clip.id}
                        onClick={() => {
                          onSelectClip(clip);
                          setCurrentPage('study');
                        }}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-medium text-slate-700 truncate max-w-[150px]">{clip.channel}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                              {clip.status}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 line-clamp-2 transition-colors">
                            {clip.title}
                          </h4>
                        </div>
                        <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
                          <span className="text-xs text-indigo-600 font-semibold group-hover:underline flex items-center gap-1">
                            Study Clip <ArrowRight className="w-3 h-3" />
                          </span>
                          {clip.notes && (
                            <span className="text-[11px] text-emerald-600 font-medium">Has notes</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 2: PLAYLISTS & LIBRARY */}
        {/* ========================================================= */}
        {currentPage === 'library' && (
          <div className="space-y-6">
            {activePlaylist ? (
              /* Inside a specific playlist: Paginated Clips List */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setActivePlaylistId(null);
                        setClipsPageNumber(1);
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> All Playlists
                    </button>
                    <h2 className="text-xl font-bold text-slate-900">{activePlaylist.title}</h2>
                    <p className="text-xs text-slate-500 max-w-xl">{activePlaylist.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">Per page:</span>
                    <select
                      value={clipsPerPage}
                      onChange={(e) => {
                        setClipsPerPage(Number(e.target.value));
                        setClipsPageNumber(1);
                      }}
                      className="text-xs font-medium px-2 py-1 rounded bg-white border border-slate-300 text-slate-700"
                    >
                      <option value={4}>4</option>
                      <option value={6}>6</option>
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                    </select>
                  </div>
                </div>

                {/* Clips Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {paginatedClips.map((clip) => (
                    <div
                      key={clip.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">{clip.channel}</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                            {clip.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                          {clip.title}
                        </h4>
                        {clip.tags && clip.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {clip.tags.slice(0, 3).map((t, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
                        <button
                          onClick={() => {
                            onSelectClip(clip);
                            setCurrentPage('study');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Study Video</span>
                        </button>
                        <a
                          href={`https://www.youtube.com/watch?v=${getVideoId(clip)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-400 hover:text-slate-600 p-1"
                          title="Open on YouTube"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clips Pagination Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-500">
                    Showing {(clipsPageNumber - 1) * clipsPerPage + 1}–
                    {Math.min(clipsPageNumber * clipsPerPage, activePlaylist.clips.length)} of{' '}
                    {activePlaylist.clips.length} clips
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={clipsPageNumber <= 1}
                      onClick={() => setClipsPageNumber((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-slate-600 font-medium">
                      Page {clipsPageNumber} of {totalClipPages}
                    </span>
                    <button
                      disabled={clipsPageNumber >= totalClipPages}
                      onClick={() => setClipsPageNumber((p) => Math.min(totalClipPages, p + 1))}
                      className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* All Playlists: Paginated Grid */
              <div className="space-y-6">
                {/* Search & Category Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  {/* Search Input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={librarySearch}
                      onChange={(e) => {
                        setLibrarySearch(e.target.value);
                        setPlaylistPageNumber(1);
                      }}
                      placeholder="Search playlists..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-hidden text-slate-800"
                    />
                  </div>

                  {/* Category Selector */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs text-slate-500 whitespace-nowrap">Category:</span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setPlaylistPageNumber(1);
                      }}
                      className="text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-hidden"
                    >
                      <option value="all">All Categories ({playlists.length})</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <span className="text-xs text-slate-500 whitespace-nowrap ml-2">Per page:</span>
                    <select
                      value={playlistsPerPage}
                      onChange={(e) => {
                        setPlaylistsPerPage(Number(e.target.value));
                        setPlaylistPageNumber(1);
                      }}
                      className="text-xs font-medium px-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-hidden"
                    >
                      <option value={4}>4</option>
                      <option value={6}>6</option>
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                    </select>
                  </div>
                </div>

                {/* Playlists Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {paginatedPlaylists.map((pl) => (
                    <div
                      key={pl.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 text-[10px]">
                            {pl.category || 'Curriculum'}
                          </span>
                          <span className="font-semibold text-slate-500">
                            {pl.clips.length} {pl.clips.length === 1 ? 'clip' : 'clips'}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {pl.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {pl.description || 'Curated video learning track.'}
                        </p>
                      </div>

                      <div className="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setActivePlaylistId(pl.id);
                            setClipsPageNumber(1);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Explore Clips</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-slate-400 font-mono">
                          #{pl.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Playlists Pagination Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-500">
                    Showing {(playlistPageNumber - 1) * playlistsPerPage + 1}–
                    {Math.min(playlistPageNumber * playlistsPerPage, filteredPlaylists.length)} of{' '}
                    {filteredPlaylists.length} playlists
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={playlistPageNumber <= 1}
                      onClick={() => setPlaylistPageNumber((p) => Math.max(1, p - 1))}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-slate-600 font-medium">
                      Page {playlistPageNumber} of {totalPlaylistPages}
                    </span>
                    <button
                      disabled={playlistPageNumber >= totalPlaylistPages}
                      onClick={() => setPlaylistPageNumber((p) => Math.min(totalPlaylistPages, p + 1))}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 3: AI ASSISTANT */}
        {/* ========================================================= */}
        {currentPage === 'assistant' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Gemini Learning Assistant</h2>
                  <p className="text-xs text-slate-500">
                    Ask questions about your study topics, request summaries, or get code guidance.
                  </p>
                </div>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">Quick suggestions:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Explain active recall & spaced repetition in 3 points',
                    'How do I structure a TypeScript React app cleanly?',
                    'What are the core ideas of Vibe Coding?',
                    'Summarize the principles of autonomous AI agents',
                  ].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setAiQuestion(p)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors text-left cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question input */}
              <div className="space-y-3">
                <textarea
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Type your question or learning prompt here..."
                  rows={4}
                  className="w-full p-4 text-sm rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden text-slate-800 placeholder-slate-400 leading-relaxed"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAskAi}
                    disabled={aiLoading || !aiQuestion.trim()}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{aiLoading ? 'Thinking...' : 'Ask Assistant'}</span>
                  </button>
                </div>
              </div>

              {/* Answer display */}
              {aiAnswer && (
                <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Assistant Answer
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiAnswer);
                        setCopiedNote(true);
                        setTimeout(() => setCopiedNote(false), 2000);
                      }}
                      className="text-xs text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedNote ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                    {aiAnswer}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 4: CODING ACADEMY (LESSONS) */}
        {/* ========================================================= */}
        {currentPage === 'academy' && (
          <div className="space-y-6">
            {readingLesson ? (
              /* Reading specific lesson */
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <button
                      onClick={() => setReadingLesson(null)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Back to Lessons
                    </button>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                      {readingLesson.series} Series
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {readingLesson.title}
                  </h1>

                  <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-6 rounded-2xl border border-slate-100 font-mono">
                    {readingLesson.content}
                  </div>
                </div>
              </div>
            ) : (
              /* Paginated Lessons List */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">AI Coding Lessons</h2>
                    <p className="text-xs text-slate-500">
                      Curated vibe coding and prompt engineering guides from Claude and Kiro
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">Series:</span>
                    <select
                      value={selectedLessonSeries}
                      onChange={(e) => {
                        setSelectedLessonSeries(e.target.value as any);
                        setAcademyPageNumber(1);
                      }}
                      className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700"
                    >
                      <option value="all">All Lessons ({claudeLessons.length + kiroLessons.length})</option>
                      <option value="Claude">Claude Series ({claudeLessons.length})</option>
                      <option value="Kiro">Kiro Series ({kiroLessons.length})</option>
                    </select>

                    <span className="text-xs text-slate-500 ml-2">Per page:</span>
                    <select
                      value={lessonsPerPage}
                      onChange={(e) => {
                        setLessonsPerPage(Number(e.target.value));
                        setAcademyPageNumber(1);
                      }}
                      className="text-xs font-medium px-2 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700"
                    >
                      <option value={4}>4</option>
                      <option value={6}>6</option>
                      <option value={8}>8</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {paginatedLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                            lesson.series === 'Claude' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {lesson.series}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {lesson.filename}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {lesson.content.slice(0, 180)}...
                        </p>
                      </div>

                      <div className="pt-5 border-t border-slate-100 mt-5 flex items-center justify-between">
                        <button
                          onClick={() => setReadingLesson(lesson)}
                          className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Lesson</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lessons Pagination */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-500">
                    Showing {(academyPageNumber - 1) * lessonsPerPage + 1}–
                    {Math.min(academyPageNumber * lessonsPerPage, filteredLessons.length)} of{' '}
                    {filteredLessons.length} lessons
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={academyPageNumber <= 1}
                      onClick={() => setAcademyPageNumber((p) => Math.max(1, p - 1))}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-slate-600 font-medium">
                      Page {academyPageNumber} of {totalLessonPages}
                    </span>
                    <button
                      disabled={academyPageNumber >= totalLessonPages}
                      onClick={() => setAcademyPageNumber((p) => Math.min(totalLessonPages, p + 1))}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PAGE 5: RESOURCES & GUIDES */}
        {/* ========================================================= */}
        {currentPage === 'resources' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Curriculum Guides &amp; Artifacts</h2>
              <p className="text-xs text-slate-500">
                Direct access to companion slide decks, documentation, and technical evaluations
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Decks & Video Series */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Presentation className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    15-Capability Slide Decks &amp; Videos
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Interactive presentation slides and video studio hubs for all 15 curriculum capabilities across Chapters 1 to 5.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <a
                    href="/decks/00_SERIES_OVERVIEW_PLAYLIST.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Open Slide Decks Portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* User Guide */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    User Guide &amp; Audio Manual
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Step-by-step user runbook explaining workflows, voice reflection, playlist import, and keyboard shortcuts.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <a
                    href="/legacy/user_guide.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800"
                  >
                    View User Guide <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* iPad vs Cloud Processing Analysis */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-cyan-300 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    iPad vs. Cloud Compute Analysis
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Technical FLOP breakdown, comparing 95% client-side developer experience with 68% runtime cloud offload.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4">
                  {onOpenIpadAnalysis ? (
                    <button
                      onClick={onOpenIpadAnalysis}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-800 cursor-pointer"
                    >
                      Open Breakdown Modal <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Available in header</span>
                  )}
                </div>
              </div>

              {/* Prerequisites & Technical Evaluation */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Prerequisites &amp; Expertise (L1–L10)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Codebase polyglot architecture evaluation from Level 1 basic HTML to Level 10 multi-AI autonomous agents.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4">
                  {onOpenPrerequisites ? (
                    <button
                      onClick={onOpenPrerequisites}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Open Prerequisites <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Available in header</span>
                  )}
                </div>
              </div>

              {/* System Architecture & Analysis Hub */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-sky-300 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    <FileSearch className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    System Architecture (Phases 1–4)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Deep structural architecture documents, capabilities ledger, and autonomous agent protocol.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    onClick={onToggleUiMode}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
                  >
                    Open in Studio Mode <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Python Code Viewer */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <FileCode2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Python Code Files
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Examine the backend YouTube scraper, transcription scripts, and data pipeline in clean 2-column view.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    onClick={onToggleUiMode}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                  >
                    Open in Studio Mode <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Mode Toggle Pill for instant access from anywhere */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={onToggleUiMode}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 text-xs font-bold transition-all hover:scale-105 cursor-pointer border border-slate-700"
          title="Switch to full-featured Pro Studio Mode"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Switch to Studio Mode</span>
        </button>
      </div>

      {/* Clean Light Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            learn-better &bull; Clean, Simple Learning Interface
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleUiMode}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
            >
              Need all 14 panels? Switch to Studio Mode
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
