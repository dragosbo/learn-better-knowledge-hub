import React, { useState, useMemo, useEffect } from 'react';
import { 
  Cloud, 
  Network, 
  Terminal, 
  Search, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Filter, 
  BookOpen, 
  Clock, 
  Tag, 
  Eye, 
  Maximize2, 
  Minimize2,
  FileCode,
  Sliders,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Playlist, YouTubeClip, WordCloudWord, MindMapNode } from '../types';
import { 
  INTELLIGENCE_WORD_CLOUD, 
  INTELLIGENCE_MINDMAP, 
  computePlaylistWordCloud, 
  generatePlaylistMindMap 
} from '../data/wordcloudMindmapData';

interface Props {
  playlists: Playlist[];
  onSelectClip?: (clip: YouTubeClip) => void;
  onNavigateTab?: (tab: any) => void;
}

export const PlaylistWordCloudMindMap: React.FC<Props> = ({ 
  playlists, 
  onSelectClip, 
  onNavigateTab 
}) => {
  // Default to the proof-of-concept "Intelligence" playlist if present, else first playlist
  const defaultPlaylist = useMemo(() => {
    return playlists.find(p => p.title.toLowerCase() === 'intelligence' || p.id === 'PL_intelligence_proof_of_concept') || playlists[0];
  }, [playlists]);

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(defaultPlaylist?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'wordcloud' | 'mindmap' | 'pipeline-guide'>('wordcloud');
  
  // Word Cloud State
  const [selectedWord, setSelectedWord] = useState<WordCloudWord | null>(null);
  const [wordSearch, setWordSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewFormat, setViewFormat] = useState<'cloud' | 'table'>('cloud');
  const [copied, setCopied] = useState(false);

  // Mindmap State
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'root-intelligence': true,
    'branch-origins': true,
    'branch-neural-math': true,
    'branch-llm-agents': true,
    'branch-hardware': true,
    'branch-economics': true,
  });
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [mindmapSearch, setMindmapSearch] = useState('');
  const [mindmapDepth, setMindmapDepth] = useState<1 | 2 | 3>(3);

  // Sync selected playlist when playlists prop updates
  useEffect(() => {
    if (!selectedPlaylistId && defaultPlaylist) {
      setSelectedPlaylistId(defaultPlaylist.id);
    }
  }, [defaultPlaylist, selectedPlaylistId]);

  const currentPlaylist = useMemo(() => {
    return playlists.find(p => p.id === selectedPlaylistId) || defaultPlaylist || playlists[0];
  }, [playlists, selectedPlaylistId, defaultPlaylist]);

  const isIntelligencePoc = useMemo(() => {
    return currentPlaylist?.title.toLowerCase() === 'intelligence' || currentPlaylist?.id === 'PL_intelligence_proof_of_concept';
  }, [currentPlaylist]);

  // Compute Word Cloud data
  const wordCloudData = useMemo(() => {
    if (!currentPlaylist) return INTELLIGENCE_WORD_CLOUD;
    return computePlaylistWordCloud(currentPlaylist);
  }, [currentPlaylist]);

  // Compute Mind Map data
  const mindMapData = useMemo(() => {
    if (!currentPlaylist) return INTELLIGENCE_MINDMAP;
    return generatePlaylistMindMap(currentPlaylist);
  }, [currentPlaylist]);

  // Categories extracted from wordcloud
  const categories = useMemo(() => {
    const cats = new Set<string>();
    wordCloudData.words.forEach(w => {
      if (w.category) cats.add(w.category);
    });
    return Array.from(cats);
  }, [wordCloudData]);

  // Filtered words based on category and search
  const filteredWords = useMemo(() => {
    return wordCloudData.words.filter(w => {
      const matchesSearch = w.text.toLowerCase().includes(wordSearch.toLowerCase()) ||
        (w.context && w.context.toLowerCase().includes(wordSearch.toLowerCase()));
      const matchesCat = selectedCategory === 'all' || w.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [wordCloudData, wordSearch, selectedCategory]);

  // Max and min weights for proportional scaling
  const { minWeight, maxWeight } = useMemo(() => {
    const weights = wordCloudData.words.map(w => w.weight);
    return {
      minWeight: Math.min(...weights, 10),
      maxWeight: Math.max(...weights, 100)
    };
  }, [wordCloudData]);

  // Calculate font size for word in cloud
  const getFontSize = (weight: number) => {
    const minSize = 13;
    const maxSize = 38;
    if (maxWeight === minWeight) return 18;
    const size = minSize + ((weight - minWeight) / (maxWeight - minWeight)) * (maxSize - minSize);
    return Math.round(size);
  };

  // Thematic color generator
  const getWordColor = (category?: string, weight?: number) => {
    switch (category) {
      case 'Core Domain': return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800';
      case 'Architecture': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
      case 'Algorithms': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      case 'Hardware': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      case 'Cognition': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800';
      case 'Biology': return 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800';
      case 'Economics': return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
      case 'NLP & LLMs': return 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800';
      default: return 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  // Clips matching the selected word
  const matchingClips = useMemo(() => {
    if (!selectedWord || !currentPlaylist) return [];
    const term = selectedWord.text.toLowerCase();
    const seen = new Set<string>();
    return currentPlaylist.clips.filter(c => {
      if (seen.has(c.id)) return false;
      const corpus = `${c.title} ${c.notes || ''} ${c.tags.join(' ')} ${(c.userQuestions || []).join(' ')}`.toLowerCase();
      if (corpus.includes(term)) {
        seen.add(c.id);
        return true;
      }
      return false;
    });
  }, [selectedWord, currentPlaylist]);

  // Toggle mindmap node expansion
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    const traverse = (node: MindMapNode) => {
      allIds[node.id] = true;
      if (node.children) node.children.forEach(traverse);
    };
    traverse(mindMapData);
    setExpandedNodes(allIds);
    setMindmapDepth(3);
  };

  const collapseToLevel2 = () => {
    const levelIds: Record<string, boolean> = { [mindMapData.id]: true };
    if (mindMapData.children) {
      mindMapData.children.forEach(c => {
        levelIds[c.id] = false;
      });
    }
    setExpandedNodes(levelIds);
    setMindmapDepth(2);
  };

  const copyTopWords = () => {
    const list = wordCloudData.words.map((w, i) => `${i + 1}. ${w.text} (${w.weight}) - ${w.category || 'Keyword'}`).join('\n');
    navigator.clipboard.writeText(list);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(wordCloudData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${currentPlaylist?.title.toLowerCase().replace(/\s+/g, '_')}_wordcloud.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12" id="wordcloud-mindmap-view">
      {/* Top Banner & Playlist Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Multi-Clip NLP & Semantic Synthesis
              </span>
              {isIntelligencePoc && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Proof of Concept Active
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Playlist Word Cloud & 3-Level Mindmap
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Aggregated vocabulary extraction across all clips belonging to a playlist, paired with a hierarchical 3-level visual knowledge graph.
            </p>
          </div>

          {/* Playlist Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="playlist-select" className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Active Playlist:
            </label>
            <select
              id="playlist-select"
              value={selectedPlaylistId}
              onChange={(e) => {
                setSelectedPlaylistId(e.target.value);
                setSelectedWord(null);
                setSelectedNode(null);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden min-w-[240px] max-w-xs"
            >
              {playlists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.title} ({pl.clips?.length || 0} clips) {pl.title.toLowerCase() === 'intelligence' ? '★ Proof of Concept' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-5 pt-4 gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setActiveSubTab('wordcloud')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === 'wordcloud'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              Word Cloud (Top 50)
            </button>

            <button
              onClick={() => setActiveSubTab('mindmap')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === 'mindmap'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              3-Level Mindmap
            </button>

            <button
              onClick={() => setActiveSubTab('pipeline-guide')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === 'pipeline-guide'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              CLI & Automation Guide
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <strong>{currentPlaylist.clips.length}</strong> Clips Merged
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <strong>{wordCloudData.totalTokens.toLocaleString()}</strong> Tokens Analyzed
            </span>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: WORD CLOUD */}
      {activeSubTab === 'wordcloud' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter 50 words..."
                  value={wordSearch}
                  onChange={(e) => setWordSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-48"
                />
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto py-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    All ({wordCloudData.words.length})
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setViewFormat('cloud')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    viewFormat === 'cloud' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Cloud View
                </button>
                <button
                  onClick={() => setViewFormat('table')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    viewFormat === 'table' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Table View
                </button>
              </div>

              <button
                onClick={copyTopWords}
                className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs flex items-center gap-1 px-2.5"
                title="Copy Top 50 List"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={downloadJson}
                className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs flex items-center gap-1 px-2.5"
                title="Export word_cloud.json"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              <a
                href={`/legacy/wordcloud.html?file=data/wordclouds/intelligence.word_cloud.json`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs flex items-center gap-1 px-2.5 font-medium"
                title="Open in Legacy Canvas App"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Canvas Tool</span>
              </a>
            </div>
          </div>

          {/* Interactive Cloud Container */}
          {viewFormat === 'cloud' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 min-h-[380px] flex flex-wrap items-center justify-center gap-3 md:gap-4 select-none relative overflow-hidden shadow-xs">
              {filteredWords.map((word) => {
                const fontSize = getFontSize(word.weight);
                const isSelected = selectedWord?.text === word.text;
                const colorClass = getWordColor(word.category, word.weight);

                return (
                  <button
                    key={word.text}
                    onClick={() => setSelectedWord(isSelected ? null : word)}
                    style={{ fontSize: `${fontSize}px` }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer font-medium leading-none ${
                      isSelected
                        ? 'ring-3 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-110 shadow-md z-10 ' + colorClass
                        : 'hover:scale-105 hover:shadow-xs ' + colorClass
                    }`}
                  >
                    <span>{word.text}</span>
                    <span className="text-[10px] opacity-70 font-mono tracking-tight font-normal bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
                      {word.weight}
                    </span>
                  </button>
                );
              })}

              {filteredWords.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No keywords match your search query.
                </div>
              )}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-12">#</th>
                      <th className="py-3 px-4">Keyword</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Relative Weight</th>
                      <th className="py-3 px-4">Clip Occurrence</th>
                      <th className="py-3 px-4">Semantic Context</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredWords.map((word, idx) => (
                      <tr 
                        key={word.text}
                        onClick={() => setSelectedWord(word)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          selectedWord?.text === word.text ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="text-sm">{word.text}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {word.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full" 
                                style={{ width: `${(word.weight / maxWeight) * 100}%` }}
                              />
                            </div>
                            <span className="font-mono text-slate-600 dark:text-slate-400">{word.weight}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {word.clipCount ? `${word.clipCount} clips` : 'Multiple'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {word.context || 'Appears in transcripts'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWord(word);
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md"
                          >
                            Explore Clips
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Selected Word Context & Filtered Clips Panel */}
          {selectedWord && (
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-indigo-950 dark:text-indigo-200 capitalize">
                      Keyword: "{selectedWord.text}"
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                      Weight: {selectedWord.weight}
                    </span>
                    {selectedWord.category && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        Category: {selectedWord.category}
                      </span>
                    )}
                  </div>
                  {selectedWord.context && (
                    <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-1">
                      {selectedWord.context}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedWord(null)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>

              {/* Matched Clips in Playlist */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Playlist Clips Featuring "{selectedWord.text}" ({matchingClips.length}):</span>
                  <span className="text-slate-400 font-normal">Click a clip to open or study</span>
                </div>

                {matchingClips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {matchingClips.map((clip, cIdx) => (
                      <div
                        key={`${clip.id}-${clip.playlistId || cIdx}`}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span className="font-medium text-slate-600 dark:text-slate-300">{clip.channel}</span>
                            <span className="flex items-center gap-0.5 font-mono">
                              <Clock className="w-3 h-3" />
                              {clip.duration || '10:00'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {clip.title}
                          </h4>
                          {clip.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 italic">
                              "{clip.notes}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                            {clip.id}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {onSelectClip && (
                              <button
                                onClick={() => onSelectClip(clip)}
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded text-[11px] font-medium"
                              >
                                View Details
                              </button>
                            )}
                            <a
                              href={`https://www.youtube.com/watch?v=${clip.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-slate-400 hover:text-red-500"
                              title="Watch on YouTube"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-3 bg-white dark:bg-slate-900 rounded-xl px-4 border border-slate-200 dark:border-slate-800">
                    This term appears across the merged transcript frequency distribution for the playlist.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: 3-LEVEL MINDMAP */}
      {activeSubTab === 'mindmap' && (
        <div className="space-y-6">
          {/* Mindmap Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search concept or clip..."
                  value={mindmapSearch}
                  onChange={(e) => setMindmapSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-52"
                />
              </div>

              {/* Depth Controls */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 mr-1 text-[11px]">Depth:</span>
                <button
                  onClick={() => {
                    setMindmapDepth(1);
                    setExpandedNodes({ [mindMapData.id]: true });
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    mindmapDepth === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  L1 (Root)
                </button>
                <button
                  onClick={collapseToLevel2}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    mindmapDepth === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  L2 (Pillars)
                </button>
                <button
                  onClick={expandAll}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    mindmapDepth === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  L3 (Full Deep)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Expand All
              </button>
              <button
                onClick={collapseToLevel2}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                Collapse to L2
              </button>
            </div>
          </div>

          {/* 3-Level Mindmap Graph Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Hierarchical Mindmap Canvas */}
            <div className="lg:col-span-8 space-y-4">
              {/* LEVEL 1: ROOT NODE */}
              <div 
                onClick={() => setSelectedNode(mindMapData)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm relative overflow-hidden ${
                  selectedNode?.id === mindMapData.id
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 ring-4 ring-indigo-500/20'
                    : 'border-indigo-300 dark:border-indigo-800 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-slate-900 dark:to-indigo-950/40 hover:border-indigo-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      L1
                    </span>
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Playlist Central Concept
                      </span>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {mindMapData.label}
                      </h2>
                    </div>
                  </div>

                  <span className="text-xs px-2.5 py-1 bg-white/80 dark:bg-slate-800/80 rounded-lg text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                    {mindMapData.children?.length || 0} Core Branches
                  </span>
                </div>
                {mindMapData.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
                    {mindMapData.description}
                  </p>
                )}
              </div>

              {/* LEVEL 2 & LEVEL 3: BRANCHES & CONCEPTS */}
              <div className="space-y-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900/60 ml-4">
                {mindMapData.children?.map((branch) => {
                  const isBranchExpanded = expandedNodes[branch.id] !== false;
                  const isBranchSelected = selectedNode?.id === branch.id;
                  const matchesBranchSearch = !mindmapSearch || 
                    branch.label.toLowerCase().includes(mindmapSearch.toLowerCase()) ||
                    branch.children?.some(c => c.label.toLowerCase().includes(mindmapSearch.toLowerCase()) || c.keyTakeaway?.toLowerCase().includes(mindmapSearch.toLowerCase()));

                  if (!matchesBranchSearch) return null;

                  return (
                    <div key={branch.id} className="space-y-3">
                      {/* LEVEL 2 PILLAR CARD */}
                      <div
                        onClick={() => setSelectedNode(branch)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between shadow-xs ${
                          isBranchSelected
                            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNode(branch.id);
                            }}
                            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200"
                            title={isBranchExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isBranchExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>

                          <div 
                            className="w-2.5 h-8 rounded-full" 
                            style={{ backgroundColor: branch.color || '#6366f1' }}
                          />

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                L2 Pillar
                              </span>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {branch.label}
                              </h3>
                            </div>
                            {branch.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {branch.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800">
                          {branch.children?.length || 0} Concepts
                        </span>
                      </div>

                      {/* LEVEL 3 LEAF NODES (CONCEPTS & CLIPS) */}
                      {isBranchExpanded && branch.children && branch.children.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
                          {branch.children.map((leaf) => {
                            const isLeafSelected = selectedNode?.id === leaf.id;
                            const matchesLeafSearch = !mindmapSearch ||
                              leaf.label.toLowerCase().includes(mindmapSearch.toLowerCase()) ||
                              leaf.keyTakeaway?.toLowerCase().includes(mindmapSearch.toLowerCase()) ||
                              leaf.clipTitle?.toLowerCase().includes(mindmapSearch.toLowerCase());

                            if (!matchesLeafSearch) return null;

                            return (
                              <div
                                key={leaf.id}
                                onClick={() => setSelectedNode(leaf)}
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                  isLeafSelected
                                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xs'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                                      L3 Concept
                                    </span>
                                    {leaf.duration && (
                                      <span className="flex items-center gap-1 font-mono">
                                        <Clock className="w-2.5 h-2.5" />
                                        {leaf.duration}
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                    {leaf.label}
                                  </h4>

                                  {leaf.keyTakeaway && (
                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed">
                                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">Insight:</strong> {leaf.keyTakeaway}
                                    </p>
                                  )}
                                </div>

                                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                  <span className="text-[11px] text-slate-500 truncate max-w-[160px]">
                                    {leaf.clipTitle || leaf.channel}
                                  </span>

                                  <div className="flex items-center gap-1">
                                    {leaf.keywords && leaf.keywords.slice(0, 2).map(kw => (
                                      <span key={kw} className="text-[9px] px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                                        #{kw}
                                      </span>
                                    ))}
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Node Inspector & Study Card */}
            <div className="lg:col-span-4">
              <div className="sticky top-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Mindmap Concept Inspector
                    </h3>
                  </div>
                  {selectedNode && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                      Level {selectedNode.level}
                    </span>
                  )}
                </div>

                {selectedNode ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {selectedNode.label}
                      </h4>
                      {selectedNode.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                          {selectedNode.description}
                        </p>
                      )}
                    </div>

                    {selectedNode.keyTakeaway && (
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl">
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block mb-1">
                          Core Principle & Insight
                        </span>
                        <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
                          {selectedNode.keyTakeaway}
                        </p>
                      </div>
                    )}

                    {/* Associated Video Clip */}
                    {selectedNode.clipId && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Associated Video Reference
                        </span>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {selectedNode.clipTitle || 'Video Lecture'}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{selectedNode.channel || 'Instructor'}</span>
                          <span className="font-mono">{selectedNode.duration}</span>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <a
                            href={`https://www.youtube.com/watch?v=${selectedNode.clipId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-1.5 text-center text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Watch Video Clip
                          </a>

                          {onSelectClip && (
                            <button
                              onClick={() => {
                                const clip = currentPlaylist.clips.find(c => c.id === selectedNode.clipId);
                                if (clip) onSelectClip(clip);
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg whitespace-nowrap"
                            >
                              Open Notes
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Associated Keywords */}
                    {selectedNode.keywords && selectedNode.keywords.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Cross-Referenced Keywords
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedNode.keywords.map(kw => (
                            <button
                              key={kw}
                              onClick={() => {
                                setActiveSubTab('wordcloud');
                                setWordSearch(kw);
                              }}
                              className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50"
                            >
                              #{kw}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    <Network className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
                    Click any node in the mindmap tree to inspect its core takeaway, source video, and related keywords.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CLI & AUTOMATION GUIDE */}
      {activeSubTab === 'pipeline-guide' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                Phase W3: Multi-Video Merge Architecture
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              How to Generate Playlist Word Clouds via CLI & Python
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              The underlying repository features a standalone, zero-dependency Python script (<code className="font-mono text-amber-600 dark:text-amber-400">code/make_wordcloud.py</code>) that merges multiple transcripts into a single aggregated frequency distribution.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Download Captions / Transcripts</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Run the downloader runner <code className="font-mono text-indigo-600">r</code> with your playlist ID set in <code className="font-mono">code/read_channel.py</code> to download audio and transcripts to <code className="font-mono">data/transcripts/</code>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Configure JSON with MERGE=true</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Create a config file (like <code className="font-mono text-indigo-600">config/config_wordcloud.intelligence.json</code>) specifying <code className="font-mono">"merge": true</code>, <code className="font-mono">"select_by": "id"</code>, and <code className="font-mono">"max_words": 50</code>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">3</div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Execute and Render</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Run <code className="font-mono text-indigo-600">python code/make_wordcloud.py config/config_wordcloud.intelligence.json</code>. The output lands in <code className="font-mono">data/wordclouds/intelligence.word_cloud.json</code>.
              </p>
            </div>
          </div>

          {/* Code Snippet for Intelligence Playlist Config */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Generated Configuration: <code className="font-mono text-indigo-600">imported_repo/config/config_wordcloud.intelligence.json</code>
            </span>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto">
{`{
  "_comment": "Word cloud generation config for Playlist: Intelligence (12 clips merged)",
  "select_by": "id",
  "select": [
    "G5sxVf9K-_c", "XSy7ry-x5pA", "X847teCz1pQ", "BwmddtPFWtA",
    "0Vg7DWNc694", "a-Lj9moBlqE", "YmLp8qe87A0", "AyzOUbkUf3M",
    "O5xeyoRL95U", "gE8SvBqMf8o", "IMLwvK08JVc", "up0Bsf3f0Xc"
  ],
  "merge": true,
  "output_name": "intelligence",
  "min_length": 3,
  "max_words": 50,
  "lowercase": true,
  "language": "en",
  "stopwords_extra": []
}`}
            </pre>
          </div>

          {/* Quick Terminal Command */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Run From Repo Root:
              </span>
              <p className="text-xs font-mono text-indigo-700 dark:text-indigo-300 mt-0.5">
                python code/make_wordcloud.py config/config_wordcloud.intelligence.json
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('python code/make_wordcloud.py config/config_wordcloud.intelligence.json');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 text-xs font-semibold text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs"
            >
              {copied ? 'Copied' : 'Copy Command'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
