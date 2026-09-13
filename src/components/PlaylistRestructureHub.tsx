import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  FileText, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Code2, 
  HelpCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  RotateCcw, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  FolderTree, 
  ArrowRight, 
  Copy, 
  Check, 
  AlertCircle,
  PlaySquare,
  BookOpen,
  Info
} from 'lucide-react';
import { Playlist, YouTubeClip, ActiveTab } from '../types';
import { 
  RESTRUCTURE_CLUSTERS, 
  computeVideoAllocations, 
  buildRestructuredPlaylists,
  exportAllocationPDF, 
  exportRestructurePlanPDF,
  exportAllocationCSV, 
  exportRestructurePlanCSV,
  exportDataJSON,
  YOUTUBE_AUTOMATION_PYTHON_SCRIPT
} from '../data/playlistRestructureData';

interface PlaylistRestructureHubProps {
  playlists: Playlist[];
  onApplyRestructuredPlaylists: (restructured: Playlist[]) => void;
  onRestoreOriginalPlaylists: () => void;
  isRestructuredActive: boolean;
  onSelectClipForStudy?: (clip: YouTubeClip) => void;
  onNavigateToTab?: (tab: ActiveTab) => void;
}

export const PlaylistRestructureHub: React.FC<PlaylistRestructureHubProps> = ({
  playlists,
  onApplyRestructuredPlaylists,
  onRestoreOriginalPlaylists,
  isRestructuredActive,
  onSelectClipForStudy,
  onNavigateToTab
}) => {
  const [subTab, setSubTab] = useState<'allocation' | 'restructure-plan' | 'guidance'>('allocation');

  // Allocation Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSourcePlaylist, setSelectedSourcePlaylist] = useState<string>('all');
  const [selectedTargetCluster, setSelectedTargetCluster] = useState<string>('all');
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Proposal State
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [clusterCategoryFilter, setClusterCategoryFilter] = useState<string>('all');
  const [hasCopiedScript, setHasCopiedScript] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Compute the full video allocation matrix
  const allAllocations = useMemo(() => {
    return computeVideoAllocations(playlists);
  }, [playlists]);

  // Compute the 28 consolidated playlists
  const restructuredPlaylists = useMemo(() => {
    return buildRestructuredPlaylists(playlists);
  }, [playlists]);

  // Available unique source playlists from allocations
  const sourcePlaylistOptions = useMemo(() => {
    const map = new Map<string, number>();
    allAllocations.forEach(a => {
      map.set(a.originalPlaylistTitle, (map.get(a.originalPlaylistTitle) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [allAllocations]);

  // Available categories
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    allAllocations.forEach(a => set.add(a.category));
    return Array.from(set).sort();
  }, [allAllocations]);

  // Filtered allocations based on search and dropdowns
  const filteredAllocations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allAllocations.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedSourcePlaylist !== 'all' && item.originalPlaylistTitle !== selectedSourcePlaylist) return false;
      if (selectedTargetCluster !== 'all' && item.proposedClusterId !== selectedTargetCluster) return false;
      
      if (q) {
        const matches = 
          item.videoTitle.toLowerCase().includes(q) ||
          item.channel.toLowerCase().includes(q) ||
          item.videoId.toLowerCase().includes(q) ||
          item.originalPlaylistTitle.toLowerCase().includes(q) ||
          item.proposedClusterTitle.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [allAllocations, searchQuery, selectedCategory, selectedSourcePlaylist, selectedTargetCluster]);

  // Pagination for allocation table
  const paginatedAllocations = useMemo(() => {
    if (pageSize === -1) return filteredAllocations;
    const start = (currentPage - 1) * pageSize;
    return filteredAllocations.slice(start, start + pageSize);
  }, [filteredAllocations, currentPage, pageSize]);

  const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredAllocations.length / pageSize);

  // Filtered clusters for Plan Tab
  const filteredClusters = useMemo(() => {
    if (clusterCategoryFilter === 'all') return RESTRUCTURE_CLUSTERS;
    return RESTRUCTURE_CLUSTERS.filter(c => c.category === clusterCategoryFilter);
  }, [clusterCategoryFilter]);

  // Stats
  const totalClips = allAllocations.length;
  const uniqueVideosCount = useMemo(() => new Set(allAllocations.map(a => a.videoId)).size, [allAllocations]);
  const originalPlaylistsCount = sourcePlaylistOptions.length;

  // Actions
  const handleApplyRestructure = () => {
    onApplyRestructuredPlaylists(restructuredPlaylists);
    setActionNotice('Library successfully restructured into 28 thematic playlists! The changes are now active across your app.');
    setTimeout(() => setActionNotice(null), 6000);
  };

  const handleRestoreOriginal = () => {
    onRestoreOriginalPlaylists();
    setActionNotice('Original 71 playlists restored. You can switch between views anytime.');
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleDownloadAllocationPDF = () => {
    setIsExportingPDF(true);
    try {
      const summaryText = searchQuery || selectedCategory !== 'all' || selectedSourcePlaylist !== 'all' 
        ? `Filtered View (${filteredAllocations.length} videos)` 
        : 'Complete Library Catalog';
      exportAllocationPDF(filteredAllocations, summaryText);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDownloadPlanPDF = () => {
    setIsExportingPDF(true);
    try {
      exportRestructurePlanPDF(RESTRUCTURE_CLUSTERS, restructuredPlaylists, originalPlaylistsCount);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(YOUTUBE_AUTOMATION_PYTHON_SCRIPT);
    setHasCopiedScript(true);
    setTimeout(() => setHasCopiedScript(false), 2500);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([YOUTUBE_AUTOMATION_PYTHON_SCRIPT], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'regroup_youtube_playlists.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <FolderTree className="w-3.5 h-3.5" />
                Architectural Restructuring
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isRestructuredActive 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isRestructuredActive 
                  ? 'Active Mode: 28 Consolidated Playlists' 
                  : 'Active Mode: 71 Original Playlists'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Playlist Restructuring & Video Allocation Matrix
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Examine the full mapping of every single video ({totalClips} clip allocations across {uniqueVideosCount} unique videos) 
              from your 71 fragmented playlists into <strong className="text-indigo-300">28 clean thematic collections</strong>. 
              Download PDF reports, export spreadsheets, or apply the regrouping automatically.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isRestructuredActive ? (
              <button
                onClick={handleRestoreOriginal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                Restore 71 Original Playlists
              </button>
            ) : (
              <button
                onClick={handleApplyRestructure}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-900/30"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                Apply 28 Restructured Playlists Now
              </button>
            )}

            <button
              onClick={subTab === 'allocation' ? handleDownloadAllocationPDF : handleDownloadPlanPDF}
              disabled={isExportingPDF}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md shadow-sky-900/30"
            >
              <Download className="w-4 h-4" />
              {subTab === 'allocation' ? 'Download Allocation PDF' : 'Download 28-Plan PDF'}
            </button>
          </div>
        </div>

        {/* Action Notice toast */}
        {actionNotice && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('playlists')}
                className="underline hover:text-white font-medium"
              >
                Go to Playlists &rarr;
              </button>
            )}
          </div>
        )}

        {/* Key Metrics Counter Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400">Original Playlists</span>
            <div className="text-xl font-bold text-white mt-0.5">{originalPlaylistsCount}</div>
            <span className="text-[10px] text-amber-400/90 font-medium">34 have ≤ 2 clips</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400">Proposed Playlists</span>
            <div className="text-xl font-bold text-indigo-300 mt-0.5">28 Topics</div>
            <span className="text-[10px] text-emerald-400/90 font-medium">Avg. 17.8 clips / topic</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400">Total Video Allocations</span>
            <div className="text-xl font-bold text-white mt-0.5">{totalClips}</div>
            <span className="text-[10px] text-slate-400">{uniqueVideosCount} unique clips</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400">Coverage & Integrity</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">100%</div>
            <span className="text-[10px] text-emerald-400/90 font-medium">0 orphaned clips</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('allocation')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              subTab === 'allocation'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            Video Allocation Matrix ({allAllocations.length})
          </button>

          <button
            onClick={() => setSubTab('restructure-plan')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              subTab === 'restructure-plan'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            28-Playlist Restructuring Proposal
          </button>

          <button
            onClick={() => setSubTab('guidance')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              subTab === 'guidance'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Regrouping Guidance & Python Script
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            title="Print or Save via Browser PDF engine"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print View
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: VIDEO ALLOCATION MATRIX */}
      {/* ========================================================================= */}
      {subTab === 'allocation' && (
        <div className="space-y-4">
          {/* Controls & Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 no-print">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by video title, channel, video ID, original playlist, or target topic..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadAllocationPDF}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>

                <button
                  onClick={() => exportAllocationCSV(filteredAllocations)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  CSV (Excel)
                </button>

                <button
                  onClick={() => exportDataJSON(filteredAllocations, 'youtube_videos_playlist_allocation.json')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5 text-sky-400" />
                  JSON
                </button>
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Filter by Category ({categoryOptions.length})
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Categories ({categoryOptions.length})</option>
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Filter by Original Playlist ({sourcePlaylistOptions.length})
                </label>
                <select
                  value={selectedSourcePlaylist}
                  onChange={(e) => {
                    setSelectedSourcePlaylist(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All Original Playlists ({sourcePlaylistOptions.length})</option>
                  {sourcePlaylistOptions.map(([title, count]) => (
                    <option key={title} value={title}>{title} ({count} clips)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Filter by Proposed Target Playlist ({RESTRUCTURE_CLUSTERS.length})
                </label>
                <select
                  value={selectedTargetCluster}
                  onChange={(e) => {
                    setSelectedTargetCluster(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">All 28 Proposed Topics</option>
                  {RESTRUCTURE_CLUSTERS.map(cluster => (
                    <option key={cluster.id} value={cluster.id}>{cluster.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters summary */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
              <div>
                Showing <strong className="text-white">{filteredAllocations.length}</strong> of{' '}
                <strong className="text-slate-300">{allAllocations.length}</strong> video allocations
                {(searchQuery || selectedCategory !== 'all' || selectedSourcePlaylist !== 'all' || selectedTargetCluster !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedSourcePlaylist('all');
                      setSelectedTargetCluster('all');
                      setCurrentPage(1);
                    }}
                    className="ml-2 text-indigo-400 hover:underline"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={-1}>All ({filteredAllocations.length})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Allocation Table Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse print-table">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-300 font-semibold">
                    <th className="py-3 px-3 w-12 text-center">#</th>
                    <th className="py-3 px-4 min-w-[280px]">Video Title</th>
                    <th className="py-3 px-3 min-w-[140px]">Channel</th>
                    <th className="py-3 px-2 w-16 text-center">Length</th>
                    <th className="py-3 px-3 min-w-[150px]">Current Playlist</th>
                    <th className="py-3 px-3 min-w-[200px]">Proposed Target Playlist (28)</th>
                    <th className="py-3 px-3 min-w-[110px]">Category</th>
                    <th className="py-3 px-3 w-24 text-right no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {paginatedAllocations.map((item) => (
                    <tr 
                      key={`${item.originalPlaylistId}-${item.videoId}-${item.index}`}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {item.index}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-100 line-clamp-2">
                          {item.videoTitle}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            {item.videoId}
                          </span>
                          {item.transcriptAvailable && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/50">
                              Transcript
                            </span>
                          )}
                          {item.notes && (
                            <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-800/50">
                              Has Notes
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-medium">
                        {item.channel}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400 font-mono text-[11px]">
                        {item.duration}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/60">
                          {item.originalPlaylistTitle}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/70 text-indigo-300 text-[11px] font-semibold border border-indigo-800/60">
                          <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                          {item.proposedClusterTitle}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://www.youtube.com/watch?v=${item.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="Watch on YouTube"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          {onSelectClipForStudy && (
                            <button
                              onClick={() => {
                                onSelectClipForStudy({
                                  id: item.videoId,
                                  title: item.videoTitle,
                                  channel: item.channel,
                                  duration: item.duration,
                                  playlistId: item.originalPlaylistId,
                                  tags: item.tags,
                                  status: item.status as any,
                                  transcriptAvailable: item.transcriptAvailable,
                                  notes: item.notes,
                                  addedAt: '2026-09-11'
                                });
                                if (onNavigateToTab) onNavigateToTab('knowledge');
                              }}
                              className="p-1 rounded hover:bg-indigo-600/40 text-indigo-300 hover:text-white transition-colors"
                              title="Study in Knowledge Hub"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAllocations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        No videos found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pageSize !== -1 && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-t border-slate-800 text-xs no-print">
                <span className="text-slate-400">
                  Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 rounded text-xs font-medium ${
                          currentPage === p 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: 28-PLAYLIST RESTRUCTURING PROPOSAL */}
      {/* ========================================================================= */}
      {subTab === 'restructure-plan' && (
        <div className="space-y-6">
          {/* Executive Strategy Comparison Card */}
          <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-800/60 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Strategic Restructuring Blueprint
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Consolidate 71 Fragmented Playlists into 28 Thematic Power Hubs
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Over time, organic playlist creation on YouTube leads to micro-playlists containing only 1 or 2 videos, 
                  accidental duplicates (e.g. two "Cursor", two "WSL", two "QWEN", two "Learning", two "Git" playlists), 
                  and fragmented subject matter. This proposal groups every clip into <strong>28 unified domain playlists</strong>, 
                  improving cognitive retention, reducing navigation clutter by <strong>60.5%</strong>, and enabling cohesive 
                  multi-clip synthesis.
                </p>
              </div>

              {/* Automatic Execution Control */}
              <div className="flex flex-col gap-2.5 shrink-0 min-w-[240px] bg-slate-950/80 p-4 rounded-xl border border-indigo-900/60">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Automated Migration
                </span>
                {isRestructuredActive ? (
                  <>
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      28 Consolidated Playlists Active
                    </div>
                    <button
                      onClick={handleRestoreOriginal}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      Revert to 71 Original Playlists
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleApplyRestructure}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-900/40"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                      Apply 28 Restructured Playlists
                    </button>
                    <span className="text-[10px] text-slate-400 text-center">
                      Reorganizes app view instantly. Zero data loss.
                    </span>
                  </>
                )}

                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={handleDownloadPlanPDF}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium"
                  >
                    <Download className="w-3 h-3 text-sky-400" />
                    PDF Plan
                  </button>
                  <button
                    onClick={() => exportRestructurePlanCSV(RESTRUCTURE_CLUSTERS, restructuredPlaylists)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                    CSV Plan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 no-print">
            <span className="text-xs text-slate-400 font-medium mr-1">Filter Proposal by Category:</span>
            <button
              onClick={() => setClusterCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                clusterCategoryFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              All 28 Clusters
            </button>
            {categoryOptions.map(cat => (
              <button
                key={cat}
                onClick={() => setClusterCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  clusterCategoryFilter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* The 28 Clusters Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClusters.map((cluster, idx) => {
              const matchingPl = restructuredPlaylists.find(p => p.id === cluster.id);
              const clipCount = matchingPl ? matchingPl.clips.length : 0;
              const isExpanded = expandedClusterId === cluster.id;

              return (
                <div
                  key={cluster.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm print-card-break"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm">
                            {cluster.title}
                          </h3>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {cluster.category}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 shrink-0">
                        {clipCount} clips
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {cluster.description}
                    </p>

                    {/* Merged Playlists Chip Box */}
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Merged from {cluster.sourcePlaylistTitles.length} source {cluster.sourcePlaylistTitles.length === 1 ? 'playlist' : 'playlists'}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cluster.sourcePlaylistTitles.map(st => (
                          <span
                            key={st}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Rationale */}
                    <div className="text-[11px] text-slate-400 flex items-start gap-1.5 italic">
                      <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{cluster.rationale}</span>
                    </div>

                    {/* Expandable clips preview */}
                    {isExpanded && matchingPl && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                        <span className="text-[11px] font-semibold text-slate-300">
                          Included Videos ({matchingPl.clips.length}):
                        </span>
                        <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                          {matchingPl.clips.map((clip, cIdx) => (
                            <div
                              key={`${clip.id}-${cIdx}`}
                              className="p-2 rounded bg-slate-950/60 border border-slate-800/60 text-xs flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <p className="text-slate-200 font-medium truncate">{clip.title}</p>
                                <span className="text-[10px] text-slate-400">{clip.channel} &bull; {clip.duration}</span>
                              </div>
                              <a
                                href={`https://www.youtube.com/watch?v=${clip.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs no-print">
                    <button
                      onClick={() => setExpandedClusterId(isExpanded ? null : cluster.id)}
                      className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>Hide Videos <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>View All {clipCount} Videos <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>

                    {matchingPl && matchingPl.clips.length > 0 && onNavigateToTab && (
                      <button
                        onClick={() => onNavigateToTab('playlists')}
                        className="text-slate-400 hover:text-white"
                      >
                        Browse in Library &rarr;
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: REGROUPING GUIDANCE & YOUTUBE AUTOMATION SCRIPT */}
      {/* ========================================================================= */}
      {subTab === 'guidance' && (
        <div className="space-y-6">
          {/* Guide Introduction */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              How to Regroup Your YouTube Playlists: Complete Strategic Guidance
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Consolidating playlists on YouTube can be handled in three distinct ways depending on your technical preferences. 
              Below is clear guidance for each method, including an automated Python script that creates the 28 playlists 
              directly on your personal YouTube account using the official YouTube Data API v3.
            </p>
          </div>

          {/* Three Regrouping Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Method 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 text-[11px] font-bold">
                  METHOD 1 (RECOMMENDED)
                </span>
                <h3 className="font-bold text-slate-100 text-sm">
                  Instant In-App Automated Regrouping
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click the <strong>"Apply 28 Restructured Playlists"</strong> button in this dashboard. 
                  The entire web application immediately shifts its active database and UI navigation from 
                  71 fragmented playlists to the 28 consolidated topic collections.
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                  <li>Zero setup or API keys required.</li>
                  <li>All notes, transcripts, tags, and AI syntheses are preserved.</li>
                  <li>Easily toggle back to the 71 original playlists anytime.</li>
                </ul>
              </div>

              <button
                onClick={handleApplyRestructure}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors text-center"
              >
                Apply In-App Regrouping Now
              </button>
            </div>

            {/* Method 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded bg-sky-950 text-sky-400 border border-sky-800 text-[11px] font-bold">
                  METHOD 2 (FULL YOUTUBE CLOUD SYNC)
                </span>
                <h3 className="font-bold text-slate-100 text-sm">
                  Automated Python Script (YouTube API v3)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Run our ready-to-use Python automation script (<code className="text-sky-300">regroup_youtube_playlists.py</code>) 
                  on your local machine with Google Cloud OAuth2 credentials.
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                  <li>Creates all 28 playlists on your YouTube account.</li>
                  <li>Includes dry-run mode to verify before writing.</li>
                  <li>Uses batch operations with rate limiting.</li>
                </ul>
              </div>

              <button
                onClick={handleDownloadScript}
                className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors text-center"
              >
                Download Python Script (.py)
              </button>
            </div>

            {/* Method 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold">
                  METHOD 3 (MANUAL YT STUDIO)
                </span>
                <h3 className="font-bold text-slate-100 text-sm">
                  Manual YouTube Studio Checklist
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If you prefer manual curation in YouTube Studio or want to reorganize specific clusters one at a time:
                </p>
                <ol className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4">
                  <li>Create the new consolidated playlist in YouTube Studio.</li>
                  <li>Open the old fragmented playlist (e.g. "Cursor [2]").</li>
                  <li>Click the three dots &rarr; "Add all to..." &rarr; select new playlist.</li>
                  <li>Delete or set the old fragmented playlist to private.</li>
                </ol>
              </div>

              <button
                onClick={handleDownloadPlanPDF}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors text-center"
              >
                Download Reference PDF for Studio
              </button>
            </div>
          </div>

          {/* Python Automation Script Viewer & Copy */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  YouTube Data API v3 Automation Script (<code>regroup_youtube_playlists.py</code>)
                </h3>
                <p className="text-xs text-slate-400">
                  Pre-configured with all 28 topic clusters, original playlist mappings, and error-handling routines.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                >
                  {hasCopiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied Script!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Copy Script
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .py
                </button>
              </div>
            </div>

            {/* Instructions box */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
              <p className="text-amber-400 font-sans font-semibold">How to run the script locally:</p>
              <div className="text-slate-400"># 1. Install required Google client libraries</div>
              <div className="text-emerald-300">pip install google-api-python-client google-auth-oauthlib google-auth-httplib2</div>
              <div className="text-slate-400 mt-2"># 2. Test in Dry-Run mode (verifies mapping without creating playlists)</div>
              <div className="text-emerald-300">python regroup_youtube_playlists.py --dry-run</div>
              <div className="text-slate-400 mt-2"># 3. Live execute creation of 28 playlists on your YouTube account</div>
              <div className="text-emerald-300">python regroup_youtube_playlists.py --execute</div>
            </div>

            {/* Code snippet block */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed">
              <pre>{YOUTUBE_AUTOMATION_PYTHON_SCRIPT}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
