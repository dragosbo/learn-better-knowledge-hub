import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitBranch, 
  Download, 
  Check, 
  Key, 
  Folder, 
  FileText, 
  AlertCircle, 
  ExternalLink, 
  Search,
  Sparkles,
  Layers,
  ShieldCheck,
  RefreshCw,
  ListFilter,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  getGitHubToken, 
  setGitHubToken, 
  clearGitHubToken, 
  validateGitHubToken, 
  importFromGitHubToKnowledgeHub,
  importSpecificFilesToKnowledgeHub,
  fetchRepositoryTree,
  fetchRateLimit,
  parseGitHubUrl,
  GitHubUser,
  GitHubRateLimit,
  KnowledgeHubImportResult,
  GitHubTreeItem
} from '../services/githubApi';
import { YouTubeClip, SummaryData } from '../types/index';

interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (clips: YouTubeClip[], summaries: SummaryData[]) => void;
}

export const GitHubImportModal: React.FC<GitHubImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [activeMode, setActiveMode] = useState<'folder' | 'specific-files'>('folder');
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenSettings, setShowTokenSettings] = useState(false);
  
  // Folder mode input
  const [targetRepoInput, setTargetRepoInput] = useState('dragosbo/learn-better/lessons_Claude');
  const [branchInput, setBranchInput] = useState('main');
  const [categoryTag, setCategoryTag] = useState('github-import');

  // Specific files mode input
  const [specificRepoInput, setSpecificRepoInput] = useState('dragosbo/learn-better');
  const [specificFilesText, setSpecificFilesText] = useState(
    'lessons_Claude/01_prompt_engineering.md\nlessons_Claude/02_system_prompts.md\nprerequisite.md'
  );
  const [scannedFiles, setScannedFiles] = useState<GitHubTreeItem[]>([]);
  const [isScanningTree, setIsScanningTree] = useState(false);
  const [selectedFilePaths, setSelectedFilePaths] = useState<Set<string>>(new Set());

  // Status states
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [userProfile, setUserProfile] = useState<GitHubUser | null>(null);
  const [rateLimit, setRateLimit] = useState<GitHubRateLimit | null>(null);
  const [tokenError, setTokenError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<KnowledgeHubImportResult | null>(null);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const activeToken = getGitHubToken();
      if (activeToken) {
        setTokenInput(activeToken);
        handleValidateToken(activeToken);
      } else {
        // Fetch public rate limit
        fetchRateLimit().then(setRateLimit).catch(() => {});
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleValidateToken = async (tok?: string) => {
    const t = tok || tokenInput;
    if (!t.trim()) {
      clearGitHubToken();
      setUserProfile(null);
      fetchRateLimit().then(setRateLimit).catch(() => {});
      return;
    }

    setIsValidatingToken(true);
    setTokenError('');
    try {
      const res = await validateGitHubToken(t.trim());
      if (res.valid && res.user) {
        setGitHubToken(t.trim());
        setUserProfile(res.user);
        if (res.rateLimit) setRateLimit(res.rateLimit);
      } else {
        setTokenError(res.error || 'Failed to authenticate token with GitHub.');
      }
    } catch (err: any) {
      setTokenError(err.message || 'Token validation error.');
    } finally {
      setIsValidatingToken(false);
    }
  };

  const handleClearToken = () => {
    clearGitHubToken();
    setTokenInput('');
    setUserProfile(null);
    setTokenError('');
    fetchRateLimit().then(setRateLimit).catch(() => {});
  };

  const handleScanRepositoryTree = async () => {
    let owner = '';
    let repo = '';

    const parsed = parseGitHubUrl(specificRepoInput.trim());
    if (parsed) {
      owner = parsed.owner;
      repo = parsed.repo;
    } else {
      const parts = specificRepoInput.trim().split('/').filter(Boolean);
      if (parts.length >= 2) {
        owner = parts[0];
        repo = parts[1];
      }
    }

    if (!owner || !repo) {
      setImportError('Please enter a valid repository (e.g., "owner/repo").');
      return;
    }

    setIsScanningTree(true);
    setImportError('');
    try {
      const tree = await fetchRepositoryTree(owner, repo, branchInput.trim() || 'main');
      // Filter for markdown and text documents
      const docs = tree.filter(
        (item) =>
          item.type === 'blob' &&
          (item.path.endsWith('.md') ||
            item.path.endsWith('.markdown') ||
            item.path.endsWith('.txt') ||
            item.path.endsWith('.json') ||
            item.path.endsWith('.ts') ||
            item.path.endsWith('.py'))
      );
      setScannedFiles(docs);
      if (docs.length === 0) {
        setImportError('No compatible document or code files found in the repository.');
      }
    } catch (err: any) {
      setImportError(`Tree scan failed: ${err.message}`);
    } finally {
      setIsScanningTree(false);
    }
  };

  const toggleSelectScannedFile = (path: string) => {
    setSelectedFilePaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleSelectAllScanned = () => {
    if (selectedFilePaths.size === scannedFiles.length) {
      setSelectedFilePaths(new Set());
    } else {
      setSelectedFilePaths(new Set(scannedFiles.map((f) => f.path)));
    }
  };

  const handleStartImport = async () => {
    setIsImporting(true);
    setImportError('');
    setImportResult(null);

    try {
      let result: KnowledgeHubImportResult;

      if (activeMode === 'folder') {
        if (!targetRepoInput.trim()) {
          setImportError('Please specify a repository or folder path.');
          setIsImporting(false);
          return;
        }

        result = await importFromGitHubToKnowledgeHub(targetRepoInput.trim(), {
          branch: branchInput.trim() || 'main',
          categoryTag: categoryTag.trim() || 'github',
          allowedExtensions: ['.md', '.markdown', '.txt', '.json', '.ts', '.py'],
          maxFiles: 50,
        });
      } else {
        // Specific files mode
        let owner = '';
        let repo = '';
        const parsed = parseGitHubUrl(specificRepoInput.trim());
        if (parsed) {
          owner = parsed.owner;
          repo = parsed.repo;
        } else {
          const parts = specificRepoInput.trim().split('/').filter(Boolean);
          if (parts.length >= 2) {
            owner = parts[0];
            repo = parts[1];
          }
        }

        if (!owner || !repo) {
          throw new Error('Please specify a valid repository in "owner/repo" format.');
        }

        let paths: string[] = [];
        if (selectedFilePaths.size > 0) {
          paths = Array.from(selectedFilePaths);
        } else {
          paths = specificFilesText
            .split(/[\n,]/)
            .map((p) => p.trim())
            .filter((p) => p.length > 0);
        }

        if (paths.length === 0) {
          throw new Error('Please enter at least one file path or select from scanned files.');
        }

        result = await importSpecificFilesToKnowledgeHub(owner, repo, paths, {
          branch: branchInput.trim() || 'main',
          categoryTag: categoryTag.trim() || 'github-selective',
          allowedExtensions: ['.md', '.markdown', '.txt', '.json', '.ts', '.py'],
          maxFiles: 50,
        });
      }

      setImportResult(result);

      if (result.clips.length > 0) {
        onImportComplete(result.clips, result.summaries);
      } else {
        setImportError('No compatible Markdown or text files were found or fetched.');
      }
    } catch (err: any) {
      setImportError(err.message || 'Import failed. Check repository name and permissions.');
    } finally {
      setIsImporting(false);
    }
  };

  const setPreset = (presetPath: string) => {
    setActiveMode('folder');
    setTargetRepoInput(presetPath);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Import from GitHub</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                  src/services/githubApi.ts
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authenticate with GitHub and fetch specific file paths or entire folders to populate KnowledgeHub.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">

          {/* Authentication & Rate Limit Status Banner */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${userProfile ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <div>
                <div className="font-semibold text-white">
                  {userProfile ? `Authenticated as @${userProfile.login}` : 'Public / Unauthenticated Mode'}
                </div>
                <div className="text-[11px] text-slate-400">
                  API Rate Limit: <strong className="text-slate-200">{rateLimit ? `${rateLimit.remaining} / ${rateLimit.limit}` : 'Checking...'}</strong> requests left
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTokenSettings(!showTokenSettings)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium underline self-start sm:self-auto cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{userProfile ? 'Manage Token' : 'Add Personal Access Token'}</span>
            </button>
          </div>

          {/* Expandable Token Configuration */}
          {showTokenSettings && (
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  GitHub Personal Access Token (PAT)
                </label>
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span>Generate Token</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                Optional for public repositories. Required for private repos or to increase rate limits to 5,000 requests/hr.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ghp_... or github_pat_..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  onClick={() => handleValidateToken()}
                  disabled={isValidatingToken || !tokenInput.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  {isValidatingToken ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  <span>Save</span>
                </button>
                {userProfile && (
                  <button
                    onClick={handleClearToken}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs rounded-lg border border-slate-700 transition-colors"
                    title="Remove token"
                  >
                    Clear
                  </button>
                )}
              </div>

              {tokenError && (
                <div className="text-xs text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{tokenError}</span>
                </div>
              )}
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              type="button"
              onClick={() => setActiveMode('folder')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeMode === 'folder'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Fetch Folder or Repository</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('specific-files')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeMode === 'specific-files'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Fetch Specific File Paths</span>
            </button>
          </div>

          {/* Tab 1: Folder / Repo Mode */}
          {activeMode === 'folder' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Repository Target or Folder Path
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={targetRepoInput}
                    onChange={(e) => setTargetRepoInput(e.target.value)}
                    placeholder="owner/repo/folder or full GitHub URL"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono pl-8"
                  />
                  <Folder className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Example: <code>dragosbo/learn-better/lessons_Claude</code> or <code>https://github.com/dragosbo/learn-better/tree/main/videos</code>
                </p>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quick Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreset('dragosbo/learn-better/lessons_Claude')}
                    className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-sky-300 text-[11px] rounded border border-slate-700 transition-colors"
                  >
                    Claude Lessons (10)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('dragosbo/learn-better/lessons_Kiro')}
                    className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-emerald-300 text-[11px] rounded border border-slate-700 transition-colors"
                  >
                    Kiro Lessons (9)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('dragosbo/learn-better/videos')}
                    className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-indigo-300 text-[11px] rounded border border-slate-700 transition-colors"
                  >
                    Dossiers &amp; Storyboards
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Specific Files Mode */}
          {activeMode === 'specific-files' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Repository (owner/repo)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={specificRepoInput}
                    onChange={(e) => setSpecificRepoInput(e.target.value)}
                    placeholder="dragosbo/learn-better"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleScanRepositoryTree}
                    disabled={isScanningTree || !specificRepoInput.trim()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    title="Scan all files in this repo using Git Trees API"
                  >
                    {isScanningTree ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" /> : <ListFilter className="w-3.5 h-3.5 text-sky-400" />}
                    <span>{isScanningTree ? 'Scanning...' : 'Scan Repo'}</span>
                  </button>
                </div>
              </div>

              {/* Scanned file picker if available */}
              {scannedFiles.length > 0 && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">
                      Discovered Files ({scannedFiles.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllScanned}
                      className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                    >
                      {selectedFilePaths.size === scannedFiles.length ? (
                        <>
                          <CheckSquare className="w-3 h-3" />
                          <span>Deselect All</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-3 h-3" />
                          <span>Select All ({selectedFilePaths.size} selected)</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[11px] pr-1">
                    {scannedFiles.map((file) => {
                      const isChecked = selectedFilePaths.has(file.path);
                      return (
                        <div
                          key={file.path}
                          onClick={() => toggleSelectScannedFile(file.path)}
                          className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/80'
                              : 'hover:bg-slate-800/60 text-slate-400'
                          }`}
                        >
                          <span className="truncate">{file.path}</span>
                          <span className="text-[10px] text-slate-500">
                            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Textarea for specific paths */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Specific File Paths (one per line or comma-separated)
                </label>
                <textarea
                  rows={4}
                  value={specificFilesText}
                  onChange={(e) => setSpecificFilesText(e.target.value)}
                  placeholder={`lessons_Claude/01_prompt_engineering.md\nlessons_Claude/02_system_prompts.md\nprerequisite.md`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Branch and Tag Config */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/60">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Branch</label>
              <input
                type="text"
                value={branchInput}
                onChange={(e) => setBranchInput(e.target.value)}
                placeholder="main"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Category Tag</label>
              <input
                type="text"
                value={categoryTag}
                onChange={(e) => setCategoryTag(e.target.value)}
                placeholder="github-import"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Error Display */}
          {importError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Success Result Display */}
          {importResult && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Check className="w-4 h-4" />
                <span>Successfully Imported {importResult.importedCount} Items!</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Created {importResult.clips.length} KnowledgeHub clips and {importResult.summaries.length} summaries from <code>{importResult.sourceRepo}/{importResult.folderPath}</code>.
              </p>
              <div className="max-h-28 overflow-y-auto space-y-1 bg-slate-950/80 p-2 rounded border border-slate-800 font-mono text-[10px] text-slate-400">
                {importResult.files.map((f, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate">{f.name}</span>
                    <span className="text-slate-500">{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            {importResult ? 'Done' : 'Cancel'}
          </button>

          <button
            onClick={handleStartImport}
            disabled={isImporting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-950/50 cursor-pointer"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Fetching Repository...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Import to KnowledgeHub</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
