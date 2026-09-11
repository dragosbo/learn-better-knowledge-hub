import React, { useState, useEffect } from 'react';
import { Playlist, YouTubeClip, SummaryData, LessonItem, ActiveTab } from './types';
import { INITIAL_PLAYLISTS } from './data/initialData';
import { fetchHealth, fetchSummaries, fetchLessons, fetchLogs, fetchPlaylists, syncYouTubePlaylists, savePlaylists } from './services/api';
import { Navbar } from './components/Navbar';
import { PlaylistManager } from './components/PlaylistManager';
import { KnowledgeHub } from './components/KnowledgeHub';
import { GeminiStudio } from './components/GeminiStudio';
import { AILearningAcademy } from './components/AILearningAcademy';
import { GitHubSyncGuide } from './components/GitHubSyncGuide';
import { LegacyAppsHub } from './components/LegacyAppsHub';
import { UserGuideViewer } from './components/UserGuideViewer';
import { PythonCodeViewer } from './components/PythonCodeViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('playlists');
  const [isSyncingPlaylists, setIsSyncingPlaylists] = useState<boolean>(false);

  // Core App State (Persisted in localStorage)
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('learn_better_playlists_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PLAYLISTS;
  });

  // Backend / Imported Data
  const [summaries, setSummaries] = useState<SummaryData[]>([]);
  const [claudeLessons, setClaudeLessons] = useState<LessonItem[]>([]);
  const [kiroLessons, setKiroLessons] = useState<LessonItem[]>([]);
  const [promptsLog, setPromptsLog] = useState<string>('');
  const [feedbackLog, setFeedbackLog] = useState<string>('');
  const [suggestionsLog, setSuggestionsLog] = useState<string>('');
  const [userGuideLog, setUserGuideLog] = useState<string>('');
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);

  // Cross-Tab Selected Context
  const [selectedClip, setSelectedClip] = useState<YouTubeClip | null>(null);
  const [geminiInitialContent, setGeminiInitialContent] = useState<string>('');

  // Persist playlists to localStorage and backend
  useEffect(() => {
    try {
      localStorage.setItem('learn_better_playlists_v3', JSON.stringify(playlists));
      // Save in background to server if needed
      savePlaylists(playlists).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  }, [playlists]);

  // Load backend data on mount
  useEffect(() => {
    async function loadData() {
      const health = await fetchHealth();
      setHasGeminiKey(health.hasGeminiKey);

      const fetchedSummaries = await fetchSummaries();
      setSummaries(fetchedSummaries);

      const lessons = await fetchLessons();
      setClaudeLessons(lessons.claude);
      setKiroLessons(lessons.kiro);

      const logs = await fetchLogs();
      setPromptsLog(logs.prompts);
      setFeedbackLog(logs.feedback);
      setSuggestionsLog(logs.suggestions || '');
      setUserGuideLog(logs.userGuide || '');

      // Load all 70 playlists from backend if local copy was stale or small
      try {
        const plRes = await fetchPlaylists();
        if (plRes && plRes.playlists && plRes.playlists.length >= 10) {
          setPlaylists((prev) => {
            if (prev.length < 10) return plRes.playlists;
            return prev;
          });
        }
      } catch (err) {
        console.warn('Failed to load server playlists', err);
      }
    }
    loadData();
  }, []);

  const refreshLogs = async () => {
    const logs = await fetchLogs();
    setPromptsLog(logs.prompts);
    setFeedbackLog(logs.feedback);
    setSuggestionsLog(logs.suggestions || '');
    setUserGuideLog(logs.userGuide || '');
  };

  const handleSyncYouTube = async () => {
    setIsSyncingPlaylists(true);
    try {
      const res = await syncYouTubePlaylists('@dragosborosgpt');
      if (res && res.playlists && res.playlists.length > 0) {
        setPlaylists(res.playlists);
        localStorage.setItem('learn_better_playlists_v3', JSON.stringify(res.playlists));
      }
    } catch (err: any) {
      console.error('YouTube sync failed:', err);
      throw err;
    } finally {
      setIsSyncingPlaylists(false);
    }
  };

  const handleResetToAllPlaylists = () => {
    setPlaylists(INITIAL_PLAYLISTS);
    localStorage.setItem('learn_better_playlists_v3', JSON.stringify(INITIAL_PLAYLISTS));
  };

  // Helper counters
  const allClips = playlists.flatMap((pl) => pl.clips);
  const totalNotesCount = allClips.filter((c) => c.notes && c.notes.trim().length > 0).length;

  // Actions
  const handleSelectClipForStudy = (clip: YouTubeClip) => {
    setSelectedClip(clip);
    setActiveTab('knowledge');
  };

  const handleNavigateToGemini = (clip: YouTubeClip, content: string) => {
    setSelectedClip(clip);
    setGeminiInitialContent(content);
    setActiveTab('gemini');
  };

  const handleAddClip = (newClipData: Omit<YouTubeClip, 'addedAt'>) => {
    const fullClip: YouTubeClip = {
      ...newClipData,
      addedAt: new Date().toISOString().split('T')[0],
    };

    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === fullClip.playlistId) {
          return {
            ...pl,
            clips: [fullClip, ...pl.clips],
          };
        }
        return pl;
      })
    );
  };

  const handleCreatePlaylist = (title: string, description: string, category: string) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      title,
      description,
      category,
      clips: [],
    };
    setPlaylists((prev) => [...prev, newPl]);
  };

  const handleUpdateClipStatus = (clipId: string, status: YouTubeClip['status']) => {
    setPlaylists((prev) =>
      prev.map((pl) => ({
        ...pl,
        clips: pl.clips.map((c) => (c.id === clipId ? { ...c, status } : c)),
      }))
    );
    if (selectedClip?.id === clipId) {
      setSelectedClip((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleUpdateClipNotes = (clipId: string, notes: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => ({
        ...pl,
        clips: pl.clips.map((c) => (c.id === clipId ? { ...c, notes } : c)),
      }))
    );
    if (selectedClip?.id === clipId) {
      setSelectedClip((prev) => (prev ? { ...prev, notes } : null));
    }
  };

  const handleAddQuestion = (clipId: string, question: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => ({
        ...pl,
        clips: pl.clips.map((c) => {
          if (c.id === clipId) {
            const currentQ = c.userQuestions || [];
            return { ...c, userQuestions: [...currentQ, question] };
          }
          return c;
        }),
      }))
    );
    if (selectedClip?.id === clipId) {
      setSelectedClip((prev) =>
        prev
          ? {
              ...prev,
              userQuestions: [...(prev.userQuestions || []), question],
            }
          : null
      );
    }
  };

  const handleDeleteQuestion = (clipId: string, index: number) => {
    setPlaylists((prev) =>
      prev.map((pl) => ({
        ...pl,
        clips: pl.clips.map((c) => {
          if (c.id === clipId && c.userQuestions) {
            const updated = [...c.userQuestions];
            updated.splice(index, 1);
            return { ...c, userQuestions: updated };
          }
          return c;
        }),
      }))
    );
    if (selectedClip?.id === clipId && selectedClip.userQuestions) {
      const updated = [...selectedClip.userQuestions];
      updated.splice(index, 1);
      setSelectedClip((prev) => (prev ? { ...prev, userQuestions: updated } : null));
    }
  };

  const handleAddIdea = (clipId: string, idea: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => ({
        ...pl,
        clips: pl.clips.map((c) => {
          if (c.id === clipId) {
            const currentI = c.userIdeas || [];
            return { ...c, userIdeas: [...currentI, idea] };
          }
          return c;
        }),
      }))
    );
    if (selectedClip?.id === clipId) {
      setSelectedClip((prev) =>
        prev
          ? {
              ...prev,
              userIdeas: [...(prev.userIdeas || []), idea],
            }
          : null
      );
    }
  };

  const handleDeleteIdea = (clipId: string, index: number) => {
    setPlaylists((prev) =>
      prev.map((pl) => ({
        ...pl,
        clips: pl.clips.map((c) => {
          if (c.id === clipId && c.userIdeas) {
            const updated = [...c.userIdeas];
            updated.splice(index, 1);
            return { ...c, userIdeas: updated };
          }
          return c;
        }),
      }))
    );
    if (selectedClip?.id === clipId && selectedClip.userIdeas) {
      const updated = [...selectedClip.userIdeas];
      updated.splice(index, 1);
      setSelectedClip((prev) => (prev ? { ...prev, userIdeas: updated } : null));
    }
  };

  const handleApplyInsightsToClip = (
    clipId: string,
    insights: string[],
    questions: string[],
    prompts: string[]
  ) => {
    setPlaylists((prev) =>
      prev.map((pl) => ({
        ...pl,
        clips: pl.clips.map((c) => {
          if (c.id === clipId) {
            const existingNotes = c.notes ? `${c.notes}\n\n` : '';
            const newInsightsText = insights.length
              ? `### Gemini Extracted Insights\n${insights.map((ins) => `- ${ins}`).join('\n')}`
              : '';
            const combinedNotes = `${existingNotes}${newInsightsText}`.trim();
            const combinedQ = [...(c.userQuestions || []), ...questions];
            const combinedI = [...(c.userIdeas || []), ...prompts];
            return {
              ...c,
              notes: combinedNotes,
              userQuestions: combinedQ,
              userIdeas: combinedI,
              status: 'synthesized',
            };
          }
          return c;
        }),
      }))
    );

    if (selectedClip?.id === clipId) {
      const existingNotes = selectedClip.notes ? `${selectedClip.notes}\n\n` : '';
      const newInsightsText = insights.length
        ? `### Gemini Extracted Insights\n${insights.map((ins) => `- ${ins}`).join('\n')}`
        : '';
      setSelectedClip((prev) =>
        prev
          ? {
              ...prev,
              notes: `${existingNotes}${newInsightsText}`.trim(),
              userQuestions: [...(prev.userQuestions || []), ...questions],
              userIdeas: [...(prev.userIdeas || []), ...prompts],
              status: 'synthesized',
            }
          : null
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasGeminiKey={hasGeminiKey}
        totalClips={allClips.length}
        totalNotes={totalNotesCount}
      />

      {/* Main Tab Views */}
      <main className="flex-1 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'playlists' && (
          <PlaylistManager
            playlists={playlists}
            summaries={summaries}
            onSelectClipForStudy={handleSelectClipForStudy}
            onAddClip={handleAddClip}
            onCreatePlaylist={handleCreatePlaylist}
            onUpdateClipStatus={handleUpdateClipStatus}
            onSyncYouTube={handleSyncYouTube}
            isSyncing={isSyncingPlaylists}
            onResetToAllPlaylists={handleResetToAllPlaylists}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeHub
            clips={allClips}
            summaries={summaries}
            selectedClip={selectedClip}
            onSelectClip={(clip) => setSelectedClip(clip)}
            onUpdateClipNotes={handleUpdateClipNotes}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onAddIdea={handleAddIdea}
            onDeleteIdea={handleDeleteIdea}
            onNavigateToGemini={handleNavigateToGemini}
          />
        )}

        {activeTab === 'gemini' && (
          <GeminiStudio
            initialClip={selectedClip}
            initialContent={geminiInitialContent}
            hasGeminiKey={hasGeminiKey}
            onApplyInsightsToClip={handleApplyInsightsToClip}
          />
        )}

        {activeTab === 'academy' && (
          <AILearningAcademy
            claudeLessons={claudeLessons}
            kiroLessons={kiroLessons}
          />
        )}

        {activeTab === 'legacy-apps' && (
          <LegacyAppsHub onNavigateToPython={() => setActiveTab('python-code')} />
        )}

        {activeTab === 'python-code' && (
          <PythonCodeViewer />
        )}

        {activeTab === 'github-sync' && (
          <GitHubSyncGuide
            promptsLog={promptsLog}
            feedbackLog={feedbackLog}
            suggestionsLog={suggestionsLog}
            onRefreshLogs={refreshLogs}
          />
        )}

        {activeTab === 'guide' && (
          <UserGuideViewer
            guideContent={userGuideLog}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            learn-better &bull; Personal Knowledge Hub &amp; Multi-AI Vibe Coding Platform
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('guide')}
              className="text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer flex items-center gap-1"
            >
              <span>📖 Open Complete User Guide &amp; Audio Manual</span>
            </button>
            <span className="text-slate-600 hidden md:inline">&bull;</span>
            <span className="hidden md:inline">
              All new files safely isolated in dedicated web modules
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
