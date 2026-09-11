import React, { useState, useMemo } from 'react';
import { 
  Play, 
  ExternalLink, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Sparkles, 
  FolderPlus,
  Tv,
  ListVideo,
  FileText,
  RefreshCw,
  Layers,
  Youtube,
  RotateCcw,
  Check
} from 'lucide-react';
import { Playlist, YouTubeClip, SummaryData } from '../types';

interface PlaylistManagerProps {
  playlists: Playlist[];
  summaries: SummaryData[];
  onSelectClipForStudy: (clip: YouTubeClip) => void;
  onAddClip: (clip: Omit<YouTubeClip, 'addedAt'>) => void;
  onCreatePlaylist: (title: string, description: string, category: string) => void;
  onUpdateClipStatus: (clipId: string, status: YouTubeClip['status']) => void;
  onSyncYouTube?: () => Promise<void>;
  isSyncing?: boolean;
  onResetToAllPlaylists?: () => void;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  playlists,
  summaries,
  onSelectClipForStudy,
  onAddClip,
  onCreatePlaylist,
  onUpdateClipStatus,
  onSyncYouTube,
  isSyncing = false,
  onResetToAllPlaylists,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activePreviewClip, setActivePreviewClip] = useState<YouTubeClip | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(36);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Modal states
  const [isAddClipOpen, setIsAddClipOpen] = useState(false);
  const [isAddPlaylistOpen, setIsAddPlaylistOpen] = useState(false);

  // New Clip Form State
  const [newUrlOrId, setNewUrlOrId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [newPlaylistId, setNewPlaylistId] = useState(playlists[0]?.id || '');
  const [newTags, setNewTags] = useState('');

  // New Playlist Form State
  const [newPlTitle, setNewPlTitle] = useState('');
  const [newPlDesc, setNewPlDesc] = useState('');
  const [newPlCategory, setNewPlCategory] = useState('AI & Machine Learning');

  // Categories list with counts
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const pl of playlists) {
      const cat = pl.category || 'General';
      map.set(cat, (map.get(cat) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [playlists]);

  // Filtered playlists by active category
  const categoryPlaylists = useMemo(() => {
    if (selectedCategoryId === 'all') return playlists;
    return playlists.filter(p => (p.category || 'General') === selectedCategoryId);
  }, [playlists, selectedCategoryId]);

  // Extract Video ID from any URL or string
  const extractVideoId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.length === 11 && !trimmed.includes('/')) return trimmed;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = trimmed.match(regExp);
    return match && match[2].length === 11 ? match[2] : trimmed;
  };

  const handleCreateClipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractVideoId(newUrlOrId);
    if (!cleanId) return;

    onAddClip({
      id: cleanId,
      title: newTitle.trim() || `YouTube Clip (${cleanId})`,
      channel: newChannel.trim() || 'Custom Added',
      playlistId: newPlaylistId || (playlists[0]?.id || 'general'),
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'to-watch',
      transcriptAvailable: true,
      notes: '',
      userQuestions: [],
      userIdeas: [],
    });

    setNewUrlOrId('');
    setNewTitle('');
    setNewChannel('');
    setNewTags('');
    setIsAddClipOpen(false);
  };

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlTitle.trim()) return;
    onCreatePlaylist(newPlTitle, newPlDesc, newPlCategory);
    setNewPlTitle('');
    setNewPlDesc('');
    setIsAddPlaylistOpen(false);
  };

  const handleTriggerSync = async () => {
    if (!onSyncYouTube) return;
    setSyncMessage('Syncing all playlists and clips from YouTube...');
    try {
      await onSyncYouTube();
      setSyncMessage('Successfully updated all playlists and clips from YouTube!');
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      setSyncMessage(`Sync failed: ${err.message || 'Unknown error'}`);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  // Clips aggregation
  const allClips = useMemo(() => playlists.flatMap((pl) => pl.clips), [playlists]);

  const activePlaylist = useMemo(() => {
    if (selectedPlaylistId === 'all') return null;
    return playlists.find((p) => p.id === selectedPlaylistId) || null;
  }, [playlists, selectedPlaylistId]);

  // Filter clips
  const filteredClips = useMemo(() => {
    return allClips.filter((clip) => {
      // Playlist filter
      if (selectedPlaylistId !== 'all' && clip.playlistId !== selectedPlaylistId) {
        return false;
      }
      // Category filter (if no specific playlist selected)
      if (selectedPlaylistId === 'all' && selectedCategoryId !== 'all') {
        const parentPl = playlists.find(p => p.id === clip.playlistId);
        if ((parentPl?.category || 'General') !== selectedCategoryId) {
          return false;
        }
      }
      // Status filter
      if (statusFilter !== 'all' && clip.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = clip.title.toLowerCase().includes(query);
        const matchesChannel = clip.channel.toLowerCase().includes(query);
        const matchesTags = clip.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesChannel && !matchesTags) return false;
      }
      return true;
    });
  }, [allClips, playlists, selectedPlaylistId, selectedCategoryId, statusFilter, searchTerm]);

  // Pagination slice
  const displayedClips = useMemo(() => {
    return filteredClips.slice(0, visibleCount);
  }, [filteredClips, visibleCount]);

  const getStatusBadge = (status: YouTubeClip['status']) => {
    switch (status) {
      case 'mastered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Mastered
          </span>
        );
      case 'synthesized':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800">
            <Sparkles className="w-3 h-3 text-sky-400" /> Synthesized
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            To Watch
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ListVideo className="w-5 h-5 text-sky-400" />
              YouTube Channel Playlists & Knowledge Extractor
            </h1>
            <a
              href="https://www.youtube.com/@dragosborosgpt/playlists"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-950/80 text-red-300 border border-red-800/80 hover:bg-red-900/60 transition-colors"
              title="Open YouTube Channel Playlists"
            >
              <Youtube className="w-3.5 h-3.5 text-red-400" />
              @dragosborosgpt
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Indexed <span className="font-semibold text-slate-200">{playlists.length} playlists</span> and{' '}
            <span className="font-semibold text-slate-200">{allClips.length} clips</span> from YouTube. Extract transcripts, synthesize with Gemini, and organize personal knowledge notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onSyncYouTube && (
            <button
              id="btn-sync-youtube"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-lg transition-colors shadow-sm"
              title="Re-fetch latest playlists and clips directly from YouTube channel @dragosborosgpt"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync with YouTube'}
            </button>
          )}

          {onResetToAllPlaylists && (
            <button
              onClick={onResetToAllPlaylists}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
              title="Restore full baseline of 70 channel playlists"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore All 70
            </button>
          )}

          <button
            id="btn-open-add-playlist"
            onClick={() => setIsAddPlaylistOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-sky-400" />
            New Playlist
          </button>
          <button
            id="btn-open-add-clip"
            onClick={() => setIsAddClipOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Clip
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="bg-sky-950/80 border border-sky-800 text-sky-200 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Embedded Player / Active Inspector */}
      {activePreviewClip && (
        <div className="bg-slate-900 border border-sky-800/80 rounded-xl p-5 shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <h2 className="text-base font-semibold text-white truncate max-w-xl">
                {activePreviewClip.title}
              </h2>
            </div>
            <button
              onClick={() => setActivePreviewClip(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Close Player
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 shadow-inner">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${activePreviewClip.id}?autoplay=1`}
                title={activePreviewClip.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="flex flex-col justify-between space-y-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Channel: <strong className="text-slate-200">{activePreviewClip.channel}</strong></span>
                  <span>{activePreviewClip.duration || 'Video'}</span>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Study Status</label>
                  <select
                    value={activePreviewClip.status}
                    onChange={(e) => onUpdateClipStatus(activePreviewClip.id, e.target.value as any)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="to-watch">To Watch</option>
                    <option value="in-progress">In Progress</option>
                    <option value="synthesized">Synthesized</option>
                    <option value="mastered">Mastered</option>
                  </select>
                </div>

                <div className="text-xs text-slate-300">
                  <p className="font-medium text-slate-400 mb-1">Active Notes / Takeaway:</p>
                  <p className="bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300 leading-relaxed max-h-32 overflow-y-auto">
                    {activePreviewClip.notes || 'No user notes added yet. Click "Study & Extract Knowledge" to write reflections, questions, or extract AI takeaways.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => onSelectClipForStudy(activePreviewClip)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Study & Extract Knowledge
                </button>
                <a
                  href={`https://www.youtube.com/watch?v=${activePreviewClip.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Open in YouTube"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategoryId('all');
            setSelectedPlaylistId('all');
            setVisibleCount(36);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            selectedCategoryId === 'all'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          All Categories ({playlists.length})
        </button>
        {categories.map(([categoryName, count]) => (
          <button
            key={categoryName}
            onClick={() => {
              setSelectedCategoryId(categoryName);
              setSelectedPlaylistId('all');
              setVisibleCount(36);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategoryId === categoryName
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {categoryName} ({count})
          </button>
        ))}
      </div>

      {/* Playlist Selector Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Choose Playlist:</span>
            <select
              id="select-active-playlist"
              value={selectedPlaylistId}
              onChange={(e) => {
                setSelectedPlaylistId(e.target.value);
                setVisibleCount(36);
              }}
              className="flex-1 md:w-80 text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="all">All Playlists ({categoryPlaylists.length} playlists • {filteredClips.length} clips)</option>
              {categoryPlaylists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.title} ({pl.clips.length} clip{pl.clips.length === 1 ? '' : 's'})
                </option>
              ))}
            </select>
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search clips, channels, tags..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(36);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setVisibleCount(36);
              }}
              className="text-xs bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300"
            >
              <option value="all">All Statuses</option>
              <option value="to-watch">To Watch</option>
              <option value="in-progress">In Progress</option>
              <option value="synthesized">Synthesized</option>
              <option value="mastered">Mastered</option>
            </select>
          </div>
        </div>

        {/* Selected Playlist Highlight Card */}
        {activePlaylist && (
          <div className="bg-slate-950/70 border border-sky-900/60 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-medium">
                  {activePlaylist.category || 'General'}
                </span>
                <h2 className="text-sm font-bold text-white">
                  {activePlaylist.title}
                </h2>
                <span className="text-xs text-slate-400">
                  ({activePlaylist.clips.length} clip{activePlaylist.clips.length === 1 ? '' : 's'})
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {activePlaylist.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`https://www.youtube.com/playlist?list=${activePlaylist.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Youtube className="w-3.5 h-3.5 text-red-400" />
                View on YouTube
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
              <button
                onClick={() => setSelectedPlaylistId('all')}
                className="text-xs px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Show All Playlists
              </button>
            </div>
          </div>
        )}

        {/* Quick Playlist Chips (Top 12 in category) */}
        {selectedPlaylistId === 'all' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mr-1">Quick Select:</span>
            {categoryPlaylists.slice(0, 14).map((pl) => (
              <button
                key={pl.id}
                onClick={() => {
                  setSelectedPlaylistId(pl.id);
                  setVisibleCount(36);
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border border-slate-800 whitespace-nowrap transition-colors"
              >
                {pl.title} <span className="text-slate-500 font-mono text-[10px]">({pl.clips.length})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Video Clips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedClips.map((clip) => {
          const matchingSummary = summaries.find(s => s.videoId === clip.id);
          const parentPlaylist = playlists.find(p => p.id === clip.playlistId);

          return (
            <div
              key={`${clip.playlistId}-${clip.id}`}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
            >
              {/* Card Header & Thumbnail */}
              <div>
                <div 
                  className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer"
                  onClick={() => setActivePreviewClip(clip)}
                >
                  <img
                    src={`https://img.youtube.com/vi/${clip.id}/mqdefault.jpg`}
                    alt={clip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  {clip.duration && (
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] font-semibold bg-black/80 text-white rounded">
                      {clip.duration}
                    </span>
                  )}
                  {matchingSummary && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold bg-indigo-900/90 text-indigo-200 border border-indigo-700 rounded-full flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Repo Summary Ready
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 font-medium truncate max-w-[150px]" title={clip.channel}>
                      {clip.channel}
                    </span>
                    {getStatusBadge(clip.status)}
                  </div>

                  <h3 
                    onClick={() => setActivePreviewClip(clip)}
                    className="text-sm font-semibold text-white line-clamp-2 hover:text-sky-400 cursor-pointer"
                    title={clip.title}
                  >
                    {clip.title}
                  </h3>

                  {parentPlaylist && (
                    <p className="text-[11px] text-sky-400/90 truncate flex items-center gap-1">
                      <ListVideo className="w-3 h-3 shrink-0" />
                      {parentPlaylist.title}
                    </p>
                  )}

                  {matchingSummary?.oneLineTakeaway && (
                    <p className="text-xs text-slate-400 line-clamp-2 italic bg-slate-950/60 p-2 rounded border border-slate-800">
                      "{matchingSummary.oneLineTakeaway}"
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {clip.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 truncate max-w-[140px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onSelectClipForStudy(clip)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Extract & Study
                </button>
                <button
                  onClick={() => setActivePreviewClip(clip)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                >
                  <Tv className="w-3.5 h-3.5" />
                  Watch
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination / Load More */}
      {filteredClips.length > visibleCount && (
        <div className="text-center py-6 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
          <p className="text-xs text-slate-400">
            Showing <strong className="text-white">{visibleCount}</strong> of <strong className="text-white">{filteredClips.length}</strong> clips
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setVisibleCount(prev => prev + 36)}
              className="px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm"
            >
              Load 36 More Clips
            </button>
            <button
              onClick={() => setVisibleCount(filteredClips.length)}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              Show All ({filteredClips.length})
            </button>
          </div>
        </div>
      )}

      {filteredClips.length === 0 && (
        <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
          <Play className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No clips match your search or filter.</p>
          <button
            onClick={() => { 
              setSelectedCategoryId('all');
              setSelectedPlaylistId('all'); 
              setSearchTerm(''); 
              setStatusFilter('all'); 
            }}
            className="mt-3 text-xs text-sky-400 hover:underline"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Modal: Add YouTube Clip */}
      {isAddClipOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                Add YouTube Video or ID
              </h3>
              <button
                onClick={() => setIsAddClipOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClipSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  YouTube URL or Video ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://www.youtube.com/watch?v=tRZGeaHPoaw or tRZGeaHPoaw"
                  value={newUrlOrId}
                  onChange={(e) => setNewUrlOrId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Video Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Git Rebase and Merge Conflicts"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Channel / Creator</label>
                  <input
                    type="text"
                    placeholder="e.g. freeCodeCamp"
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Playlist</label>
                  <select
                    value={newPlaylistId}
                    onChange={(e) => setNewPlaylistId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    {playlists.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Git, CLI, Devops, Tools"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClipOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-sm"
                >
                  Save Clip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Playlist */}
      {isAddPlaylistOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-sky-400" />
                Create New Playlist
              </h3>
              <button
                onClick={() => setIsAddPlaylistOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Playlist Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Large Language Models & Fine-Tuning"
                  value={newPlTitle}
                  onChange={(e) => setNewPlTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={newPlCategory}
                  onChange={(e) => setNewPlCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Engineering & Code">Engineering & Code</option>
                  <option value="Science & Mathematics">Science & Mathematics</option>
                  <option value="Knowledge & Notes">Knowledge & Notes</option>
                  <option value="Lifestyle & General">Lifestyle & General</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain the learning goal or focus of this playlist collection..."
                  value={newPlDesc}
                  onChange={(e) => setNewPlDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlaylistOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-sm"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
