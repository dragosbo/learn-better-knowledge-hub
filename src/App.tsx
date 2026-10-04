import React, { useState, useEffect, useMemo } from 'react';
import { Playlist, YouTubeClip, SummaryData, LessonItem, ActiveTab, VoiceReflectionSession } from './types';
import { INITIAL_PLAYLISTS } from './data/initialData';
import { fetchHealth, fetchSummaries, fetchLessons, fetchLogs, fetchPlaylists, syncYouTubePlaylists, savePlaylists, fetchPrerequisites } from './services/api';
import { Navbar } from './components/Navbar';
import { PlaylistManager } from './components/PlaylistManager';
import { KnowledgeHub } from './components/KnowledgeHub';
import { GeminiStudio } from './components/GeminiStudio';
import { AILearningAcademy } from './components/AILearningAcademy';
import { GitHubSyncGuide } from './components/GitHubSyncGuide';
import { LegacyAppsHub } from './components/LegacyAppsHub';
import { UserGuideViewer } from './components/UserGuideViewer';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { PlaylistWordCloudMindMap } from './components/PlaylistWordCloudMindMap';
import { PlaylistRestructureHub } from './components/PlaylistRestructureHub';
import { GeminiDevelopmentChat } from './components/GeminiDevelopmentChat';
import { RoadmapHub } from './components/RoadmapHub';
import { VideoCosmosGraph } from './components/VideoCosmosGraph';
import { AnalysisHub } from './components/AnalysisHub';
import { PrerequisitesModal } from './components/PrerequisitesModal';
import { IpadVsCloudAnalysisModal } from './components/IpadVsCloudAnalysisModal';
import { buildRestructuredPlaylists } from './data/playlistRestructureData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('playlists');
  const [isSyncingPlaylists, setIsSyncingPlaylists] = useState<boolean>(false);
  const [isRestructuredActive, setIsRestructuredActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('learn_better_is_restructured') === 'true';
    } catch {
      return false;
    }
  });

  // Core App State (Persisted in localStorage)
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('learn_better_playlists_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          // Verify Intelligence playlist is present
          const hasIntel = parsed.some((p: any) => p.id === 'PL_intelligence_proof_of_concept' || p.title.toLowerCase() === 'intelligence');
          if (hasIntel) return parsed;
          const intel = INITIAL_PLAYLISTS.find(p => p.id === 'PL_intelligence_proof_of_concept');
          if (intel) return [intel, ...parsed];
        }
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
  const [isPrerequisitesOpen, setIsPrerequisitesOpen] = useState<boolean>(false);
  const [prerequisitesContent, setPrerequisitesContent] = useState<string>('');
  const [isIpadAnalysisOpen, setIsIpadAnalysisOpen] = useState<boolean>(false);
  const [ipadAnalysisContent, setIpadAnalysisContent] = useState<string>('');

  // Cross-Tab Selected Context
  const [selectedClip, setSelectedClip] = useState<YouTubeClip | null>(null);
  const [geminiInitialContent, setGeminiInitialContent] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isFs);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

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

      const prereq = await fetchPrerequisites();
      if (prereq) setPrerequisitesContent(prereq);

      try {
        const ipadRes = await fetch('/analysis/04_IPAD_VS_CLOUD_PROCESSING_ANALYSIS.md');
        if (ipadRes.ok) {
          const txt = await ipadRes.text();
          setIpadAnalysisContent(txt);
        }
      } catch (err) {
        console.warn('Failed to load iPad analysis document', err);
      }

      // Load all 70 playlists from backend if local copy was stale or small
      try {
        const plRes = await fetchPlaylists();
        if (plRes && plRes.playlists && plRes.playlists.length >= 10) {
          setPlaylists((prev) => {
            const hasIntel = prev.some(p => p.id === 'PL_intelligence_proof_of_concept' || p.title.toLowerCase() === 'intelligence');
            if (prev.length < 10 || !hasIntel) return plRes.playlists;
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
    const prereq = await fetchPrerequisites();
    if (prereq) setPrerequisitesContent(prereq);
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

  // Helper counters & deduplicated clips library
  const allClips = useMemo(() => playlists.flatMap((pl) => pl.clips), [playlists]);
  const uniqueClips = useMemo(() => {
    const seen = new Set<string>();
    const list: YouTubeClip[] = [];
    for (const pl of playlists) {
      for (const clip of pl.clips) {
        if (!seen.has(clip.id)) {
          seen.add(clip.id);
          list.push(clip);
        }
      }
    }
    return list;
  }, [playlists]);

  const totalNotesCount = useMemo(() => {
    return uniqueClips.filter((c) => c.notes && c.notes.trim().length > 0).length;
  }, [uniqueClips]);

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

  const handleSaveVoiceReflection = (clipId: string, session: VoiceReflectionSession, appendToNotes: boolean) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) => ({
        ...pl,
        clips: pl.clips.map((c) => {
          if (c.id === clipId) {
            const currentReflections = c.voiceReflections || [];
            let updatedNotes = c.notes;
            if (appendToNotes) {
              const formatted = `\n\n### 🎙 Spoken Voice Reflection (${session.date})\n**Core Takeaway:** ${session.synthesis.oneLineSummary}\n\n**Why Standout:**\n${session.synthesis.whyGood}\n\n**Key Learnings:**\n${session.synthesis.keyLearnings.map(l => `- ${l}`).join('\n')}\n\n**Action Ideas:**\n${session.synthesis.practicalApplications.map(a => `- ${a}`).join('\n')}\n`;
              updatedNotes = (c.notes || '') + formatted;
            }
            return {
              ...c,
              voiceReflections: [session, ...currentReflections],
              notes: updatedNotes,
            };
          }
          return c;
        }),
      }));
      try {
        localStorage.setItem('learn_better_playlists_v3', JSON.stringify(updated));
        fetch('/api/content/save-playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlists: updated }),
        }).catch((e) => console.warn('Save playlists sync failed', e));
      } catch (e) {}
      return updated;
    });

    if (selectedClip?.id === clipId) {
      setSelectedClip((prev) => {
        if (!prev) return null;
        const currentReflections = prev.voiceReflections || [];
        let updatedNotes = prev.notes;
        if (appendToNotes) {
          const formatted = `\n\n### 🎙 Spoken Voice Reflection (${session.date})\n**Core Takeaway:** ${session.synthesis.oneLineSummary}\n\n**Why Standout:**\n${session.synthesis.whyGood}\n\n**Key Learnings:**\n${session.synthesis.keyLearnings.map(l => `- ${l}`).join('\n')}\n\n**Action Ideas:**\n${session.synthesis.practicalApplications.map(a => `- ${a}`).join('\n')}\n`;
          updatedNotes = (prev.notes || '') + formatted;
        }
        return {
          ...prev,
          voiceReflections: [session, ...currentReflections],
          notes: updatedNotes,
        };
      });
    }
  };

  const handleDeleteVoiceReflection = (clipId: string, sessionId: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((pl) => ({
        ...pl,
        clips: pl.clips.map((c) => {
          if (c.id === clipId && c.voiceReflections) {
            return {
              ...c,
              voiceReflections: c.voiceReflections.filter((s) => s.id !== sessionId),
            };
          }
          return c;
        }),
      }));
      try {
        localStorage.setItem('learn_better_playlists_v3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (selectedClip?.id === clipId && selectedClip.voiceReflections) {
      setSelectedClip((prev) =>
        prev
          ? {
              ...prev,
              voiceReflections: prev.voiceReflections?.filter((s) => s.id !== sessionId),
            }
          : null
      );
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

  const handleApplyRestructuredPlaylists = (restructured: Playlist[]) => {
    setIsRestructuredActive(true);
    setPlaylists(restructured);
    try {
      localStorage.setItem('learn_better_is_restructured', 'true');
      localStorage.setItem('learn_better_playlists_v3', JSON.stringify(restructured));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestoreOriginalPlaylists = () => {
    setIsRestructuredActive(false);
    setPlaylists(INITIAL_PLAYLISTS);
    try {
      localStorage.setItem('learn_better_is_restructured', 'false');
      localStorage.setItem('learn_better_playlists_v3', JSON.stringify(INITIAL_PLAYLISTS));
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportGitHubData = (newClips: YouTubeClip[], newSummaries: SummaryData[]) => {
    // 1. Update or create the GitHub Knowledge Base playlist
    setPlaylists((prev) => {
      let ghPlaylist = prev.find((p) => p.id === 'PL_github_knowledge_imported');
      if (!ghPlaylist) {
        ghPlaylist = {
          id: 'PL_github_knowledge_imported',
          title: 'GitHub Knowledge Base',
          category: 'GitHub Imported Lessons & Repositories',
          description: 'Markdown lessons, dossiers, and engineering guides imported dynamically from GitHub.',
          clipCount: 0,
          clips: [],
        };
        prev = [ghPlaylist, ...prev];
      }

      const existingClipIds = new Set(ghPlaylist.clips.map((c) => c.id));
      const freshClips = newClips.filter((c) => !existingClipIds.has(c.id));
      const updatedClips = [...freshClips, ...ghPlaylist.clips];

      const updatedPlaylists = prev.map((pl) =>
        pl.id === 'PL_github_knowledge_imported'
          ? { ...pl, clips: updatedClips, clipCount: updatedClips.length }
          : pl
      );

      try {
        localStorage.setItem('learn_better_playlists_v3', JSON.stringify(updatedPlaylists));
        savePlaylists(updatedPlaylists).catch((err) => console.warn('Failed to persist imported playlists', err));
      } catch (err) {
        console.warn('Storage error', err);
      }
      return updatedPlaylists;
    });

    // 2. Update summaries
    setSummaries((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const fresh = newSummaries.filter((s) => !existingIds.has(s.id));
      return [...fresh, ...prev];
    });

    // 3. Focus on first imported clip
    if (newClips.length > 0) {
      setSelectedClip(newClips[0]);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto w-screen h-screen' : ''}`}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasGeminiKey={hasGeminiKey}
        totalClips={allClips.length}
        totalNotes={totalNotesCount}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenPrerequisites={() => setIsPrerequisitesOpen(true)}
        onOpenIpadAnalysis={() => setIsIpadAnalysisOpen(true)}
      />

      {/* Main Tab Views */}
      <main className={activeTab === 'video-cosmos' ? 'flex-1 w-full mx-auto p-0 overflow-hidden' : 'flex-1 w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 py-6'}>
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
            onNavigateToWordCloud={() => setActiveTab('wordcloud-mindmap')}
            isRestructuredActive={isRestructuredActive}
            onNavigateToRestructure={() => setActiveTab('restructure')}
            onToggleRestructure={
              isRestructuredActive
                ? handleRestoreOriginalPlaylists
                : () => handleApplyRestructuredPlaylists(buildRestructuredPlaylists(INITIAL_PLAYLISTS))
            }
            onNavigateToAnalysis={() => setActiveTab('analysis')}
          />
        )}

        {activeTab === 'restructure' && (
          <PlaylistRestructureHub
            playlists={playlists}
            onApplyRestructuredPlaylists={handleApplyRestructuredPlaylists}
            onRestoreOriginalPlaylists={handleRestoreOriginalPlaylists}
            isRestructuredActive={isRestructuredActive}
            onSelectClipForStudy={handleSelectClipForStudy}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'video-cosmos' && (
          <VideoCosmosGraph
            playlists={playlists}
            onSelectClipForGemini={(clipId, title, cluster) => {
              const matchedClip = uniqueClips.find(c => c.id === clipId);
              if (matchedClip) {
                handleNavigateToGemini(matchedClip, `Deconstruct and synthesize key principles from "${title}" in the "${cluster}" cluster.`);
              } else {
                setGeminiInitialContent(`Deconstruct and synthesize key principles from "${title}" (${clipId}) in the "${cluster}" cluster.`);
                setActiveTab('gemini');
              }
            }}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'wordcloud-mindmap' && (
          <PlaylistWordCloudMindMap
            playlists={playlists}
            onSelectClip={handleSelectClipForStudy}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeHub
            clips={uniqueClips}
            summaries={summaries}
            selectedClip={selectedClip}
            playlists={playlists}
            onSelectClip={(clip) => setSelectedClip(clip)}
            onUpdateClipNotes={handleUpdateClipNotes}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onAddIdea={handleAddIdea}
            onDeleteIdea={handleDeleteIdea}
            onNavigateToGemini={handleNavigateToGemini}
            onSaveVoiceReflection={handleSaveVoiceReflection}
            onDeleteVoiceReflection={handleDeleteVoiceReflection}
            onImportGitHubData={handleImportGitHubData}
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

        {activeTab === 'gemini-chat' && (
          <GeminiDevelopmentChat />
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
            onOpenPrerequisites={() => setIsPrerequisitesOpen(true)}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapHub />
        )}

        {activeTab === 'analysis' && (
          <AnalysisHub />
        )}
      </main>

      {/* Prerequisites & Technical Evaluation Modal */}
      <PrerequisitesModal
        isOpen={isPrerequisitesOpen}
        onClose={() => setIsPrerequisitesOpen(false)}
        markdownContent={prerequisitesContent}
      />

      {/* iPad Client vs Cloud Processing Modal */}
      <IpadVsCloudAnalysisModal
        isOpen={isIpadAnalysisOpen}
        onClose={() => setIsIpadAnalysisOpen(false)}
        markdownContent={ipadAnalysisContent}
      />

      {/* Footer */}
      {activeTab !== 'video-cosmos' && (
        <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
          <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>
              learn-better &bull; Personal Knowledge Hub &amp; Multi-AI Vibe Coding Platform
            </span>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setIsIpadAnalysisOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer flex items-center gap-1"
                title="View iPad vs. Cloud Compute Breakdown: FLOPs, 95% dev vs 68% runtime"
              >
                <span>⚡ iPad vs Cloud %</span>
              </button>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <button
                onClick={() => setIsPrerequisitesOpen(true)}
                className="text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer flex items-center gap-1"
                title="View Technical Prerequisites, 10-Tier Expertise Matrix & Polyglot Architecture"
              >
                <span>📚 Prerequisites (L1–L10)</span>
              </button>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <button
                onClick={() => setActiveTab('analysis')}
                className="text-sky-400 hover:text-sky-300 underline font-semibold cursor-pointer flex items-center gap-1"
              >
                <span>⚙️ System Analysis (Phase 1)</span>
              </button>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <button
                onClick={() => setActiveTab('video-cosmos')}
                className="text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer flex items-center gap-1"
              >
                <span>🌌 Video Cosmos Graph</span>
              </button>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <button
                onClick={() => setActiveTab('roadmap')}
                className="text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer flex items-center gap-1"
              >
                <span>🧭 Ecosystem Roadmap &amp; Multi-AI Guide</span>
              </button>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <button
                onClick={() => setActiveTab('gemini-chat')}
                className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer flex items-center gap-1"
              >
                <span>💬 Gemini_development_chat</span>
              </button>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <button
                onClick={() => setActiveTab('guide')}
                className="text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer flex items-center gap-1"
              >
                <span>📖 Complete User Guide</span>
              </button>
              <span className="text-slate-600 hidden md:inline">&bull;</span>
              <span className="hidden md:inline">
                All new files safely isolated in dedicated web modules
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
