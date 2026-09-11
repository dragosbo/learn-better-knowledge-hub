import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileCode2, 
  Printer, 
  Copy, 
  Check, 
  Download, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Terminal, 
  Layers, 
  Cpu, 
  ExternalLink,
  Sparkles,
  AlignLeft,
  WrapText,
  FoldHorizontal,
  Info,
  CheckCircle2,
  FolderTree
} from 'lucide-react';
import { PythonFileInfo } from '../types';
import { PYTHON_FILES_DATA } from '../data/pythonFiles';
import { fetchPythonFiles } from '../services/api';
import { PythonSyntaxHighlighter } from './PythonSyntaxHighlighter';

interface PythonCodeViewerProps {
  initialFileId?: string;
}

export const PythonCodeViewer: React.FC<PythonCodeViewerProps> = ({ initialFileId }) => {
  const [files, setFiles] = useState<PythonFileInfo[]>(PYTHON_FILES_DATA);
  const [selectedFileId, setSelectedFileId] = useState<string>(initialFileId || PYTHON_FILES_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [wrapLines, setWrapLines] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  // TOC Collapsible States
  const [isTocOpen, setIsTocOpen] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Right column accordion sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    purpose: true,
    functions: true,
    dataflow: true,
    dependencies: true,
    usage: true,
    vibeCoding: true,
  });

  // Fetch updated live files from backend on mount
  useEffect(() => {
    fetchPythonFiles().then((liveData) => {
      if (liveData && liveData.length > 0) {
        setFiles(liveData);
      }
    });
  }, []);

  // Selected file reference
  const selectedFile = useMemo(() => {
    return files.find((f) => f.id === selectedFileId) || files[0];
  }, [files, selectedFileId]);

  // Group files by category
  const categories = useMemo(() => {
    const map = new Map<string, PythonFileInfo[]>();
    files.forEach((file) => {
      const cat = file.category || 'Other';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(file);
    });
    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [files]);

  // Filtered files based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories
      .map(({ category, items }) => ({
        category,
        items: items.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.path.toLowerCase().includes(q) ||
            f.purpose.toLowerCase().includes(q) ||
            f.functions.some((fn) => fn.toLowerCase().includes(q)) ||
            f.docstring.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [categories, searchQuery]);

  // Next and previous file handlers
  const currentIndex = files.findIndex((f) => f.id === selectedFile.id);
  const prevFile = currentIndex > 0 ? files[currentIndex - 1] : null;
  const nextFile = currentIndex < files.length - 1 ? files[currentIndex + 1] : null;

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(selectedFile.usageExample);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleDownloadPy = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalLines = useMemo(() => {
    return files.reduce((acc, f) => acc + f.lineCount, 0);
  }, [files]);

  return (
    <div className="space-y-6 printable-card">
      {/* Top Controls & Table of Contents Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm no-print">
        {/* Header Bar */}
        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-emerald-400" />
              <h1 className="text-xl font-bold text-white">Python Architecture &amp; Code Inspector</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                15 Core Modules • {totalLines.toLocaleString()} Lines
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Interactive 2-column code visualization: nicely formatted syntax-highlighted code on the left (printable to PDF), paired with in-depth purpose, data flow, and architecture breakdowns on the right.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTocOpen(!isTocOpen)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <FolderTree className="w-3.5 h-3.5 text-sky-400" />
              {isTocOpen ? 'Hide Table of Contents' : 'Show Table of Contents'}
              {isTocOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              title="Print formatted code and documentation to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / PDF
            </button>
          </div>
        </div>

        {/* Collapsible Table of Contents */}
        {isTocOpen && (
          <div className="p-4 bg-slate-950/70 border-b border-slate-800/80 space-y-3">
            {/* Search Input */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by script name, function name, or keyword (e.g. whisper, yt-dlp, piper, wordcloud)..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline whitespace-nowrap">
                Showing {filteredCategories.reduce((acc, c) => acc + c.items.length, 0)} of {files.length} scripts
              </span>
            </div>

            {/* Categorized TOC Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {filteredCategories.map(({ category, items }) => {
                const isCollapsed = collapsedCategories[category];
                return (
                  <div key={category} className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
                    <div
                      onClick={() => toggleCategory(category)}
                      className="flex items-center justify-between cursor-pointer pb-2 mb-1.5 border-b border-slate-800/80 group select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                          {category}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {items.length}
                        </span>
                      </div>
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="space-y-1">
                        {items.map((file) => {
                          const isSelected = file.id === selectedFile.id;
                          return (
                            <button
                              key={file.id}
                              onClick={() => {
                                setSelectedFileId(file.id);
                                setHighlightedLine(null);
                              }}
                              className={`w-full text-left px-2 py-1.5 rounded text-xs transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-medium'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                              }`}
                            >
                              <span className="font-mono truncate mr-2">{file.name}</span>
                              <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                                {file.lineCount}L
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Breadcrumb & Pagination Bar */}
        <div className="px-4 py-2.5 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <span className="text-slate-500">Active File:</span>
            <span className="font-mono text-emerald-400 font-medium">{selectedFile.path}</span>
            <span className="text-slate-600">•</span>
            <span>{selectedFile.category}</span>
            <span className="text-slate-600">•</span>
            <span>{selectedFile.lineCount} lines</span>
            <span className="text-slate-600">•</span>
            <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-4">
            <button
              disabled={!prevFile}
              onClick={() => {
                if (prevFile) setSelectedFileId(prevFile.id);
              }}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
              title={prevFile ? `Previous: ${prevFile.name}` : 'No previous file'}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-500 font-mono px-1">
              {currentIndex + 1} / {files.length}
            </span>
            <button
              disabled={!nextFile}
              onClick={() => {
                if (nextFile) setSelectedFileId(nextFile.id);
              }}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
              title={nextFile ? `Next: ${nextFile.name}` : 'No next file'}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2-VERTICAL-COLUMNS VISUALIZATION LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print-two-column items-start">
        {/* LEFT COLUMN: THE FORMATTED CODE (7 COLS) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col print-code-block">
          {/* Code Header & Actions Toolbar */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 no-print">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-xs font-bold text-slate-200 truncate">
                {selectedFile.path}
              </span>
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                ({selectedFile.lineCount} lines)
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setWrapLines(!wrapLines)}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                  wrapLines
                    ? 'bg-slate-800 border-slate-700 text-sky-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle Word Wrap"
              >
                <WrapText className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">{wrapLines ? 'Wrap' : 'Scroll'}</span>
              </button>

              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1 transition-colors"
                title="Copy entire code"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadPy}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1 transition-colors"
                title="Download .py file"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={handlePrint}
                className="p-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs flex items-center gap-1 transition-colors"
                title="Print this file to PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Printable Header (Visible only when printed) */}
          <div className="hidden print:block p-3 border-b border-slate-300 mb-2">
            <h2 className="text-sm font-bold text-slate-900 font-mono">{selectedFile.path}</h2>
            <p className="text-[10px] text-slate-600">{selectedFile.purpose}</p>
          </div>

          {/* Syntax Highlighted Code Viewer */}
          <div className="bg-slate-950 p-2 overflow-auto" style={{ maxHeight: '850px' }}>
            <PythonSyntaxHighlighter
              code={selectedFile.content}
              wrapLines={wrapLines}
              highlightedLine={highlightedLine}
              onLineClick={(num) => setHighlightedLine(num === highlightedLine ? null : num)}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED DESCRIPTION & PURPOSE (5 COLS) */}
        <div className="lg:col-span-5 space-y-4 print-doc-block">
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {selectedFile.category}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {selectedFile.name}
              </span>
            </div>

            <h2 className="text-lg font-bold text-white leading-snug">
              {selectedFile.name.replace('.py', '')}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedFile.purpose}
            </p>
          </div>

          {/* Section 1: Module Overview & Architecture Rationale */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div
              onClick={() => toggleSection('purpose')}
              className="p-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                  Architecture &amp; Core Purpose
                </span>
              </div>
              {expandedSections.purpose ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {expandedSections.purpose && (
              <div className="p-4 space-y-3 text-xs text-slate-300 leading-relaxed">
                {selectedFile.docstring ? (
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11.5px] whitespace-pre-wrap text-slate-300">
                    {selectedFile.docstring}
                  </div>
                ) : (
                  <p className="italic text-slate-400">No top-level module docstring present.</p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block">Lines of Code:</span>
                    <span className="font-mono text-white font-semibold">{selectedFile.lineCount}</span>
                  </div>
                  <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block">File Size:</span>
                    <span className="font-mono text-white font-semibold">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Key Functions & Classes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div
              onClick={() => toggleSection('functions')}
              className="p-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  Key Functions &amp; Classes ({selectedFile.functions.length + selectedFile.classes.length})
                </span>
              </div>
              {expandedSections.functions ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {expandedSections.functions && (
              <div className="p-4 space-y-2 text-xs">
                {selectedFile.classes.length > 0 && (
                  <div className="space-y-1 mb-3">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Classes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFile.classes.map((cls) => (
                        <span
                          key={cls}
                          className="px-2 py-0.5 rounded bg-teal-950/80 border border-teal-700/60 text-teal-300 font-mono text-[11px]"
                        >
                          class {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFile.functions.length > 0 ? (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Functions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFile.functions.map((fn) => (
                        <span
                          key={fn}
                          className="px-2 py-1 rounded bg-slate-950 border border-slate-800 font-mono text-amber-300 text-[11px] flex items-center gap-1"
                        >
                          <span className="text-slate-500">def</span>
                          <span>{fn}()</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">
                    Module consists strictly of top-level imports and shared variable declarations.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Data Flow & Filesystem I/O */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div
              onClick={() => toggleSection('dataflow')}
              className="p-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Data Flow (Inputs &amp; Outputs)
                </span>
              </div>
              {expandedSections.dataflow ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {expandedSections.dataflow && (
              <div className="p-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block mb-1">
                    Inputs Read:
                  </span>
                  <ul className="space-y-1">
                    {selectedFile.inputsOutputs.inputs.map((inp, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                        <span>{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block mb-1">
                    Outputs Generated:
                  </span>
                  <ul className="space-y-1">
                    {selectedFile.inputsOutputs.outputs.map((out, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-emerald-300 font-mono text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedFile.inputsOutputs.configs && selectedFile.inputsOutputs.configs.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block mb-1">
                      Configuration Schemas:
                    </span>
                    <ul className="space-y-1">
                      {selectedFile.inputsOutputs.configs.map((cfg, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-amber-300 font-mono text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          <span>{cfg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Dependencies & Imports */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div
              onClick={() => toggleSection('dependencies')}
              className="p-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                  Internal &amp; External Dependencies
                </span>
              </div>
              {expandedSections.dependencies ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {expandedSections.dependencies && (
              <div className="p-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block mb-1.5">
                    Internal Library Modules (lib/):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFile.dependencies.internal.length > 0 ? (
                      selectedFile.dependencies.internal.map((dep) => (
                        <span
                          key={dep}
                          className="px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800/60 text-purple-300 font-mono text-[11px]"
                        >
                          {dep}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">None (Standalone utility)</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block mb-1.5">
                    External / Third-Party Packages:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFile.dependencies.external.map((dep) => (
                      <span
                        key={dep}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: CLI Execution Command */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div
              onClick={() => toggleSection('usage')}
              className="p-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Terminal &amp; CLI Execution
                </span>
              </div>
              {expandedSections.usage ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {expandedSections.usage && (
              <div className="p-4 space-y-2 text-xs">
                <p className="text-slate-400 text-xs">
                  Run directly from terminal or within the Python virtual environment:
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                  <code className="font-mono text-emerald-300 text-[11.5px] break-all select-all">
                    {selectedFile.usageExample}
                  </code>
                  <button
                    onClick={handleCopyCommand}
                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedCommand ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Multi-AI Vibe Coding Lessons */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div
              onClick={() => toggleSection('vibeCoding')}
              className="p-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  Vibe Coding &amp; Architectural Insights
                </span>
              </div>
              {expandedSections.vibeCoding ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {expandedSections.vibeCoding && (
              <div className="p-4 space-y-2 text-xs text-slate-300 leading-relaxed bg-slate-950/30">
                <p>{selectedFile.vibeCodingNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
