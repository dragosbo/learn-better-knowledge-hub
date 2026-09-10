import React, { useState } from 'react';
import { 
  Play, 
  ExternalLink, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Tag, 
  FolderPlus,
  Tv,
  ListVideo,
  FileText
} from 'lucide-react';
import { Playlist, YouTubeClip, SummaryData } from '../types';

interface PlaylistManagerProps {
  playlists: Playlist[];
  summaries: SummaryData[];
  onSelectClipForStudy: (clip: YouTubeClip) => void;
  onAddClip: (clip: Omit<YouTubeClip, 'addedAt'>) => void;
  onCreatePlaylist: (title: string, description: string, category: string) => void;
  onUpdateClipStatus: (clipId: string, status: YouTubeClip['status']) => void;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  playlists,
  summaries,
  onSelectClipForStudy,
  onAddClip,
  onCreatePlaylist,
  onUpdateClipStatus,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activePreviewClip, setActivePreviewClip] = useState<YouTubeClip | null>(null);

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
  const [newPlCategory, setNewPlCategory] = useState('AI & Development');

  // Extract ID from any URL
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

  // Filter clips
  const allClips = playlists.flatMap((pl) => pl.clips);
  const filteredClips = allClips.filter((clip) => {
    const matchesPlaylist = selectedPlaylistId === 'all' || clip.playlistId === selectedPlaylistId;
    const matchesSearch = 
      clip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clip.channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clip.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || clip.status === statusFilter;
    return matchesPlaylist && matchesSearch && matchesStatus;
  });

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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ListVideo className="w-5 h-5 text-sky-400" />
            YouTube Playlists & Knowledge Extractor
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize study material, explore video transcripts, and convert clips into actionable personal knowledge notes.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
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
            Add YouTube Clip
          </button>
        </div>
      </div>

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

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        {/* Playlists Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedPlaylistId('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedPlaylistId === 'all'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Playlists ({allClips.length})
          </button>
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => setSelectedPlaylistId(pl.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedPlaylistId === pl.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {pl.title} ({pl.clips.length})
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search clips or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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

      {/* Video Clips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClips.map((clip) => {
          const matchingSummary = summaries.find(s => s.videoId === clip.id);
          return (
            <div
              key={clip.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
            >
              {/* Card Header & Thumbnail */}
              <div>
                <div className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer"
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium truncate max-w-[160px]">
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

                  {matchingSummary?.oneLineTakeaway && (
                    <p className="text-xs text-slate-400 line-clamp-2 italic bg-slate-950/60 p-2 rounded border border-slate-850">
                      "{matchingSummary.oneLineTakeaway}"
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {clip.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700"
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

      {filteredClips.length === 0 && (
        <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
          <Play className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No clips match your search or filter.</p>
          <button
            onClick={() => { setSelectedPlaylistId('all'); setSearchTerm(''); setStatusFilter('all'); }}
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
                <label className="block text-slate-300 font-medium mb-1">
                  Video Title (Optional - auto-named if blank)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Git and GitHub Beginner Tutorial"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Channel / Speaker</label>
                  <input
                    type="text"
                    placeholder="e.g. freeCodeCamp"
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assign to Playlist</label>
                  <select
                    value={newPlaylistId}
                    onChange={(e) => setNewPlaylistId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  >
                    {playlists.map((pl) => (
                      <option key={pl.id} value={pl.id}>{pl.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. git, devops, vscode, terminal"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddClipOpen(false)}
                  className="px-3.5 py-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Clip to Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Playlist */}
      {isAddPlaylistOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
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

            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Playlist Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LLM Prompting & Reasoning"
                  value={newPlTitle}
                  onChange={(e) => setNewPlTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. AI & Vibe Coding"
                  value={newPlCategory}
                  onChange={(e) => setNewPlCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the study topic..."
                  value={newPlDesc}
                  onChange={(e) => setNewPlDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddPlaylistOpen(false)}
                  className="px-3.5 py-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm"
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
