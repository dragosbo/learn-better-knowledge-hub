import React, { useState, useMemo } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  GitBranch,
  Smartphone,
  Laptop,
  Tablet,
  Volume2,
  FileCode2,
  Share2,
  UploadCloud,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Flame,
  FolderGit2,
  HelpCircle,
  PlusCircle,
  Film
} from 'lucide-react';
import { 
  ROADMAP_ITEMS, 
  ARCHITECTURAL_TOPICS, 
  RoadmapItem, 
  ArchitecturalTopic 
} from '../data/roadmapData';

export const RoadmapHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'roadmap' | 'architecture' | 'blobs' | 'cross-device'>('roadmap');
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'in-progress' | 'planned' | 'exploration'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'rm-01': true,
    'rm-02': true,
    'rm-03': true
  });
  const [copiedTopicId, setCopiedTopicId] = useState<string | null>(null);

  // New roadmap item proposal form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [customItems, setCustomItems] = useState<RoadmapItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<RoadmapItem['category']>('Multi-AI Integration');
  const [newSummary, setNewSummary] = useState('');

  const allItems = useMemo(() => {
    return [...customItems, ...ROADMAP_ITEMS];
  }, [customItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      return true;
    });
  }, [allItems, statusFilter, categoryFilter]);

  const toggleItemExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTopicId(id);
    setTimeout(() => setCopiedTopicId(null), 2000);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;

    const newItem: RoadmapItem = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      status: 'planned',
      priority: 'Medium',
      devices: ['iPad', 'Windows Desktop'],
      aiModels: ['Claude', 'Gemini'],
      summary: newSummary,
      implementationDetails: ['Proposed by developer in active session'],
      keyBenefits: ['Expands custom workflow efficiency'],
      nextAction: 'Outline technical specification and prototype in dedicated directory.'
    };

    setCustomItems(prev => [newItem, ...prev]);
    setNewTitle('');
    setNewSummary('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner with Token & Interaction Evaluation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md text-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-950/40">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Ecosystem Roadmap &amp; Multi-AI Topology
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Continuous Evolution Hub
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Strategic roadmap for harmonizing iPad, Windows Desktop, iPhone, Claude, ChatGPT, Kiro, and NotebookLM into a unified learning engine.
                </p>
              </div>
            </div>
          </div>

          {/* Token & Quota Health Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2 min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Token &amp; Quota Health:
              </span>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                100% HEALTHY
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Context Window (1M tokens):</span>
                <span className="text-emerald-300 font-mono font-bold">&gt;850k Free</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              <strong className="text-emerald-400">Token Evaluation: </strong> 
              Ample headroom. We can engage in deep planning, code generation, and multi-AI architecture without running out.
            </p>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveSubTab('roadmap')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all ${
                activeSubTab === 'roadmap'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Interactive Milestones ({allItems.length})
            </button>

            <button
              onClick={() => setActiveSubTab('architecture')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all ${
                activeSubTab === 'architecture'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Repo Architecture (Single vs Multi-Repo)
            </button>

            <button
              onClick={() => setActiveSubTab('blobs')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all ${
                activeSubTab === 'blobs'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Large Blobs (MP3s, OBS, NotebookLM)
            </button>

            <button
              onClick={() => setActiveSubTab('cross-device')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all ${
                activeSubTab === 'cross-device'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Cross-Device Symphony (iPad + Desktop + iPhone)
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Propose New Roadmap Idea</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE ROADMAP MILESTONES */}
      {activeSubTab === 'roadmap' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 font-semibold mr-1">Status:</span>
              {(['all', 'done', 'in-progress', 'planned', 'exploration'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {st === 'all' ? 'All Milestones' : st}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="Multi-AI Integration">Multi-AI Integration</option>
                <option value="Cross-Device Topology">Cross-Device Topology</option>
                <option value="Large Media & Blobs">Large Media &amp; Blobs</option>
                <option value="Sync & Architecture">Sync &amp; Architecture</option>
                <option value="Audio & UX">Audio &amp; UX</option>
              </select>
            </div>
          </div>

          {/* Milestones Cards */}
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map(item => {
              const isExpanded = expandedItems[item.id] || false;
              
              const statusBadge = 
                item.status === 'done' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                item.status === 'in-progress' ? 'bg-sky-950 text-sky-300 border-sky-800' :
                item.status === 'planned' ? 'bg-indigo-950 text-indigo-300 border-indigo-800' :
                'bg-amber-950 text-amber-300 border-amber-800';

              const priorityBadge =
                item.priority === 'Critical' ? 'text-red-400' :
                item.priority === 'High' ? 'text-amber-400' :
                'text-slate-400';

              return (
                <div 
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all shadow-sm"
                >
                  {/* Card Header Bar */}
                  <div 
                    onClick={() => toggleItemExpand(item.id)}
                    className="p-4 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-950/90 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                      <button className="text-slate-400 hover:text-white">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${statusBadge}`}>
                            {item.status}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            {item.category}
                          </span>
                          <span className={`text-[11px] font-bold ${priorityBadge}`}>
                            &bull; {item.priority} Priority
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white tracking-tight">{item.title}</h3>
                      </div>
                    </div>

                    {/* Devices and AI Model Tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        {item.devices.map(d => (
                          <span key={d} className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700 flex items-center gap-1">
                            {d === 'iPad' && <Tablet className="w-3 h-3 text-sky-400" />}
                            {d === 'Windows Desktop' && <Laptop className="w-3 h-3 text-indigo-400" />}
                            {d === 'iPhone' && <Smartphone className="w-3 h-3 text-emerald-400" />}
                            <span>{d}</span>
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        {item.aiModels.map(m => (
                          <span key={m} className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-900 text-amber-300 rounded border border-amber-900/60">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="px-4 py-3 border-t border-slate-800/60 text-xs text-slate-300 leading-relaxed">
                    {item.summary}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Implementation Details */}
                        <div className="space-y-1.5">
                          <span className="font-bold text-slate-200 block uppercase tracking-wider text-[10px]">
                            Technical Implementation:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                            {item.implementationDetails.map((detail, idx) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Key Benefits */}
                        <div className="space-y-1.5">
                          <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[10px]">
                            Strategic Benefits:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                            {item.keyBenefits.map((b, idx) => (
                              <li key={idx}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Next Action Item */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          <strong className="text-amber-400 font-bold uppercase text-[10px]">Action:</strong>
                          <span className="text-slate-300 font-mono">{item.nextAction}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: SINGLE REPO VS MULTI-REPO ARCHITECTURE */}
      {activeSubTab === 'architecture' && (
        <div className="space-y-6">
          {ARCHITECTURAL_TOPICS.filter(t => t.id === 'repo-strategy' || t.id === 'google-drive-interim').map(topic => (
            <div key={topic.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {topic.badge}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1.5">{topic.title}</h2>
                </div>
              </div>

              {/* Question & Verdict */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="text-amber-300 font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Question: {topic.question}</span>
                </div>
                <div className="text-emerald-300 font-semibold flex items-start gap-1.5 pl-5">
                  <span className="text-emerald-400 font-bold shrink-0">Verdict:</span>
                  <span>{topic.verdict}</span>
                </div>
              </div>

              {/* Approaches Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {topic.comparison.map((comp, cIdx) => (
                  <div 
                    key={cIdx} 
                    className={`p-4 rounded-lg border flex flex-col justify-between ${
                      comp.recommended
                        ? 'bg-emerald-950/20 border-emerald-700/80 text-slate-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className={`font-bold text-sm ${comp.recommended ? 'text-emerald-300' : 'text-slate-300'}`}>
                          {comp.approach}
                        </h3>
                        {comp.recommended && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500 text-slate-950">
                            RECOMMENDED
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <strong className="text-[10px] uppercase font-bold text-emerald-400 block">Pros:</strong>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1 text-[11px]">
                          {comp.pros.map((p, pIdx) => <li key={pIdx}>{p}</li>)}
                        </ul>
                      </div>

                      <div className="space-y-1.5">
                        <strong className="text-[10px] uppercase font-bold text-rose-400 block">Cons &amp; Traps:</strong>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1 text-[11px]">
                          {comp.cons.map((c, cIdx2) => <li key={cIdx2}>{c}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Step by step playbook */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Step-by-Step Playbook:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                  {topic.stepByStepPlaybook.map((step, sIdx) => (
                    <li key={sIdx} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>

              {/* Code example if present */}
              {topic.concreteCodeExample && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Folder Structure Specification:</span>
                    <button
                      onClick={() => handleCopyCode(topic.concreteCodeExample!, topic.id)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
                    >
                      {copiedTopicId === topic.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedTopicId === topic.id ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto">
                    <code>{topic.concreteCodeExample}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: LARGE BLOBS & GITHUB RELEASES ASSETS */}
      {activeSubTab === 'blobs' && (
        <div className="space-y-6">
          {ARCHITECTURAL_TOPICS.filter(t => t.id === 'github-artifacts-blobs').map(topic => (
            <div key={topic.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                    {topic.badge}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1.5">{topic.title}</h2>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="text-amber-300 font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Question: {topic.question}</span>
                </div>
                <div className="text-emerald-300 font-semibold flex items-start gap-1.5 pl-5">
                  <span className="text-emerald-400 font-bold shrink-0">Verdict:</span>
                  <span>{topic.verdict}</span>
                </div>
              </div>

              {/* Visual Architecture Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <UploadCloud className="w-4 h-4" />
                    <span>1. GitHub Releases</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Upload your NotebookLM podcast (.mp3), ChatGPT voice files, or OBS video (.mp4) to a GitHub Release tag. Up to <strong>2GB per file free</strong> with direct CDN download links.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-sky-950/30 border border-sky-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-sky-300 font-bold">
                    <FileCode2 className="w-4 h-4" />
                    <span>2. Clean Git Tree</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Your git repository stores only tiny JSON metadata strings (pointing to the release URL). Git clone speed stays under 5 seconds on all devices.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <Volume2 className="w-4 h-4" />
                    <span>3. In-App Audio Player</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <code>learn-better</code> streams the audio directly from GitHub CDN with native scrub bar, speed pitch controls (0.75x - 2.0x), and lockscreen controls on your iPad/iPhone.
                  </p>
                </div>
              </div>

              {/* Step by step */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">How to upload &amp; bind in 5 steps:</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                  {topic.stepByStepPlaybook.map((step, sIdx) => (
                    <li key={sIdx} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>

              {/* Code Example */}
              {topic.concreteCodeExample && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">JSON Schema Integration:</span>
                    <button
                      onClick={() => handleCopyCode(topic.concreteCodeExample!, topic.id)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
                    >
                      {copiedTopicId === topic.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedTopicId === topic.id ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto">
                    <code>{topic.concreteCodeExample}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* VIEW 4: CROSS-DEVICE TOPOLOGY (IPAD + WINDOWS + IPHONE) */}
      {activeSubTab === 'cross-device' && (
        <div className="space-y-6">
          {ARCHITECTURAL_TOPICS.filter(t => t.id === 'cross-device-multi-ai').map(topic => (
            <div key={topic.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {topic.badge}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1.5">{topic.title}</h2>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="text-amber-300 font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Question: {topic.question}</span>
                </div>
                <div className="text-emerald-300 font-semibold flex items-start gap-1.5 pl-5">
                  <span className="text-emerald-400 font-bold shrink-0">Verdict:</span>
                  <span>{topic.verdict}</span>
                </div>
              </div>

              {/* Device Superpowers Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* iPhone */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="font-bold text-white text-sm">iPhone Superpower</h3>
                      <span className="text-[10px] text-emerald-400 uppercase font-semibold">Human Voice &amp; Capture</span>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pl-1 leading-relaxed">
                    <li><strong>ChatGPT Voice Mode:</strong> Natural conversation with zero robot tone.</li>
                    <li><strong>Whisper Voice-to-Text:</strong> Speak stream of consciousness while walking.</li>
                    <li><strong>AirDrop to iPad / Mac:</strong> One-tap audio file transfer into the app.</li>
                  </ul>
                </div>

                {/* iPad */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Tablet className="w-5 h-5 text-sky-400" />
                    <div>
                      <h3 className="font-bold text-white text-sm">iPad Superpower</h3>
                      <span className="text-[10px] text-sky-400 uppercase font-semibold">Touch UI &amp; Synthesis</span>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pl-1 leading-relaxed">
                    <li><strong>AI Studio Build Web Preview:</strong> Test the app anywhere without a heavy laptop.</li>
                    <li><strong>Word Cloud Mind Maps:</strong> Tap and explore 28 clusters naturally.</li>
                    <li><strong>AirPods Media Session:</strong> Listen to playlists with physical stem button controls.</li>
                  </ul>
                </div>

                {/* Windows Desktop */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="font-bold text-white text-sm">Desktop Windows Superpower</h3>
                      <span className="text-[10px] text-indigo-400 uppercase font-semibold">Heavy Compute &amp; OBS</span>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pl-1 leading-relaxed">
                    <li><strong>OBS Studio:</strong> Record high-resolution coding walk-throughs &amp; clips.</li>
                    <li><strong>Claude &amp; Kiro IDE:</strong> Heavy local refactoring into <code>/lessons_Claude/</code>.</li>
                    <li><strong>Python Innertube Scraper:</strong> Batch download transcripts for all 70 playlists.</li>
                  </ul>
                </div>
              </div>

              {/* Concrete 4-Step Cycle */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">The 4-Step Cross-Device Workflow:</h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-1">
                  {topic.stepByStepPlaybook.map((step, sIdx) => (
                    <li key={sIdx} className="leading-relaxed p-2.5 rounded bg-slate-950 border border-slate-800/80">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Propose Idea Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                Propose New Roadmap Idea
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Idea Title:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Add ChatGPT Whisper Voice Transcribe Widget"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Multi-AI Integration">Multi-AI Integration</option>
                  <option value="Cross-Device Topology">Cross-Device Topology</option>
                  <option value="Large Media & Blobs">Large Media &amp; Blobs</option>
                  <option value="Sync & Architecture">Sync &amp; Architecture</option>
                  <option value="Audio & UX">Audio &amp; UX</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">Executive Summary &amp; Scope:</label>
                <textarea
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Describe the workflow benefit and which device/model is used..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                >
                  Add to Roadmap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
