import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Compass, 
  Layers, 
  Code, 
  Sparkles,
  ArrowUpRight,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { LegacyApp } from '../types';
import { fetchLegacyApps, DEFAULT_LEGACY_APPS } from '../services/api';

interface LegacyAppsHubProps {
  onNavigateToPython?: () => void;
}

export const LegacyAppsHub: React.FC<LegacyAppsHubProps> = ({ onNavigateToPython }) => {
  const [apps, setApps] = useState<LegacyApp[]>(DEFAULT_LEGACY_APPS);
  const [selectedApp, setSelectedApp] = useState<LegacyApp | null>(DEFAULT_LEGACY_APPS[0] || null);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    fetchLegacyApps().then((data) => {
      if (data && data.length > 0) {
        setApps(data);
        setSelectedApp((prev) => prev || data[0]);
      }
      setLoading(false);
    });
  }, []);

  const rootUrl = selectedApp ? `/${selectedApp.file.split('/').pop()}` : '';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl font-bold text-white">Original Tools &amp; Legacy Apps</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Verified Serving &amp; 100% Preserved
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Directly launch or preview the standalone HTML apps created prior to this dashboard: YouTube Explorer, Claude &amp; Kiro curriculum readers, and Wordcloud visualizer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToPython && (
            <button
              onClick={onNavigateToPython}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              View Python Code (2-Col)
            </button>
          )}

          {selectedApp && (
            <a
              href={selectedApp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Launch "{selectedApp.title.split(' ')[0]}" ↗
            </a>
          )}
        </div>
      </div>

      {/* Grid of Legacy Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => {
          const isSelected = selectedApp?.id === app.id;
          return (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                    {app.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {app.file}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                  {app.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {app.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApp(app);
                  }}
                  className={`flex items-center gap-1 font-medium ${
                    isSelected ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {isSelected ? 'Active in Frame' : 'Preview Below'}
                </button>

                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-slate-400 hover:text-sky-300 transition-colors"
                >
                  Launch
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded Live Preview Frame */}
      {selectedApp && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-0">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${iframeLoaded ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
              <span className="text-xs font-semibold text-white">
                Live Interactive Frame: <span className="text-sky-400">{selectedApp.title}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                ({selectedApp.file})
              </span>
              {iframeLoaded && (
                <span className="text-[10px] text-emerald-400 font-mono hidden sm:inline">
                  • Loaded
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIframeLoaded(false);
                  setIframeKey((k) => k + 1);
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs flex items-center gap-1"
                title="Reload Frame"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload
              </button>

              {rootUrl && (
                <a
                  href={rootUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors border border-slate-700"
                  title={`Open direct root alias: ${rootUrl}`}
                >
                  <ExternalLink className="w-3 h-3" />
                  {rootUrl}
                </a>
              )}

              <a
                href={selectedApp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
                title={`Open full URL: ${selectedApp.url}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Standalone ↗
              </a>
            </div>
          </div>

          <div className="w-full bg-slate-950 relative" style={{ height: '720px' }}>
            <iframe
              key={iframeKey}
              src={selectedApp.url}
              title={selectedApp.title}
              onLoad={() => setIframeLoaded(true)}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      )}
    </div>
  );
};
