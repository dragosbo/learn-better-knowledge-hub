import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  FastForward, 
  Rewind, 
  Headphones, 
  Settings2, 
  Radio, 
  Youtube, 
  GitBranch, 
  Check, 
  Copy,
  Info,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { LessonItem } from '../types';

interface AudioLessonPlayerProps {
  lesson?: LessonItem;
  title?: string;
  series?: string;
  content?: string;
  compact?: boolean;
}

export const AudioLessonPlayer: React.FC<AudioLessonPlayerProps> = ({ 
  lesson,
  title,
  series,
  content,
  compact = false
}) => {
  const activeTitle = lesson?.title || title || 'Audio Lesson';
  const activeSeries = lesson?.series || series || 'Knowledge';
  const activeContent = lesson?.content || content || '';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showStoragePlan, setShowStoragePlan] = useState(false);
  const [copiedBatchScript, setCopiedBatchScript] = useState(false);

  // References to keep state in SpeechSynthesis callbacks
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef(false);
  const paragraphIndexRef = useRef(0);
  const rateRef = useRef<number>(rate);
  const pitchRef = useRef<number>(pitch);
  const voiceRef = useRef<string>(selectedVoice);

  // Keep refs synchronized with React state
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    pitchRef.current = pitch;
  }, [pitch]);

  useEffect(() => {
    voiceRef.current = selectedVoice;
  }, [selectedVoice]);

  // Clean and split lesson markdown into conversational spoken paragraphs
  const spokenParagraphs = useMemo(() => {
    if (!activeContent) return [];

    const lines = activeContent.split('\n');
    const cleanedBlocks: string[] = [];
    let inCodeBlock = false;
    let currentBlock = '';

    for (const rawLine of lines) {
      const line = rawLine.trim();

      // Handle code block fences
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock && currentBlock.trim()) {
          cleanedBlocks.push(currentBlock.trim());
          currentBlock = '';
        }
        continue;
      }

      if (inCodeBlock) {
        // Skip dense code lines, but if it's a short command, announce it naturally
        if (line.startsWith('pip install') || line.startsWith('python') || line.startsWith('git ')) {
          cleanedBlocks.push(`Terminal command: ${line}`);
        }
        continue;
      }

      // Empty line signals paragraph boundary
      if (!line) {
        if (currentBlock.trim()) {
          cleanedBlocks.push(currentBlock.trim());
          currentBlock = '';
        }
        continue;
      }

      // Format markdown headings cleanly
      let spokenLine = line;
      if (line.startsWith('# ')) spokenLine = `Title: ${line.replace(/^#\s+/, '')}.`;
      else if (line.startsWith('## ')) spokenLine = `Section: ${line.replace(/^##\s+/, '')}.`;
      else if (line.startsWith('### ')) spokenLine = `Topic: ${line.replace(/^###\s+/, '')}.`;
      else if (line.startsWith('- ') || line.startsWith('* ')) spokenLine = `${line.replace(/^[-*]\s+/, '')}.`;

      // Remove markdown bold/italics markers
      spokenLine = spokenLine.replace(/[*_`]/g, '');

      currentBlock += ' ' + spokenLine;
    }

    if (currentBlock.trim()) {
      cleanedBlocks.push(currentBlock.trim());
    }

    return cleanedBlocks.filter(b => b.length > 5);
  }, [activeContent]);

  // Load available system/browser voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      if (!selectedVoice && voices.length > 0) {
        // Prefer natural English voices (Google, Siri, Samantha, Daniel, Natural)
        const preferred = voices.find(v => 
          (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Siri') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        if (preferred) setSelectedVoice(preferred.name);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoice]);

  // MediaSession API setup for AirPods & Bluetooth Headphone integration
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: activeTitle,
      artist: `Learn Better Academy (${activeSeries})`,
      album: 'Multi-AI Vibe Coding Curriculum',
      artwork: [
        { src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=512&auto=format&fit=crop&q=80', sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => handleResume());
    navigator.mediaSession.setActionHandler('pause', () => handlePause());
    navigator.mediaSession.setActionHandler('stop', () => handleStop());
    navigator.mediaSession.setActionHandler('seekbackward', () => handlePrevious());
    navigator.mediaSession.setActionHandler('seekforward', () => handleNext());

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('stop', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    };
  }, [activeTitle, activeSeries]);

  // Stop current speech when switching content
  useEffect(() => {
    handleStop();
    setCurrentParagraphIndex(0);
    paragraphIndexRef.current = 0;
  }, [activeTitle, activeContent]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Core speak paragraph logic
  const speakParagraph = (index: number, overrideRate?: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (index >= spokenParagraphs.length) {
      handleStop();
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = spokenParagraphs[index];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Apply voice
    const activeVoice = voiceRef.current || selectedVoice;
    if (activeVoice) {
      const voiceObj = availableVoices.find(v => v.name === activeVoice);
      if (voiceObj) utterance.voice = voiceObj;
    }

    // Set playback rate safely (explicit override or latest ref)
    const effectiveRate = overrideRate !== undefined ? overrideRate : rateRef.current;
    utterance.rate = Math.max(0.1, Math.min(10, effectiveRate));
    utterance.pitch = pitchRef.current || pitch;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      isPlayingRef.current = true;
      setCurrentParagraphIndex(index);
      paragraphIndexRef.current = index;
    };

    utterance.onend = () => {
      // If still supposed to play, move to next paragraph using current rateRef
      if (isPlayingRef.current) {
        const nextIdx = paragraphIndexRef.current + 1;
        if (nextIdx < spokenParagraphs.length) {
          speakParagraph(nextIdx, rateRef.current);
        } else {
          handleStop();
        }
      }
    };

    utterance.onerror = (e) => {
      // Chrome sometimes throws 'interrupted' when cancelled intentionally
      if (e.error !== 'interrupted') {
        console.warn('SpeechSynthesis error:', e);
      }
      setIsPlaying(false);
      setIsPaused(false);
      isPlayingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (spokenParagraphs.length === 0) return;
    isPlayingRef.current = true;
    speakParagraph(currentParagraphIndex, rateRef.current);
  };

  const handlePause = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };

  const handleResume = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
        isPlayingRef.current = true;
      } else {
        speakParagraph(currentParagraphIndex, rateRef.current);
      }
    }
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      isPlayingRef.current = false;
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleNext = () => {
    const nextIdx = Math.min(spokenParagraphs.length - 1, currentParagraphIndex + 1);
    setCurrentParagraphIndex(nextIdx);
    paragraphIndexRef.current = nextIdx;
    if (isPlaying || isPaused) {
      speakParagraph(nextIdx, rateRef.current);
    }
  };

  const handlePrevious = () => {
    const prevIdx = Math.max(0, currentParagraphIndex - 1);
    setCurrentParagraphIndex(prevIdx);
    paragraphIndexRef.current = prevIdx;
    if (isPlaying || isPaused) {
      speakParagraph(prevIdx, rateRef.current);
    }
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    rateRef.current = newRate;
    // If currently active or paused, immediately apply rate and restart utterance
    if (isPlayingRef.current || isPlaying || isPaused) {
      speakParagraph(currentParagraphIndex, newRate);
    }
  };

  const handleJumpToParagraph = (index: number) => {
    setCurrentParagraphIndex(index);
    paragraphIndexRef.current = index;
    if (isPlaying || isPaused) {
      speakParagraph(index, rateRef.current);
    }
  };

  const pythonBatchScript = `"""
Batch Lesson Audio Generator for learn-better
Generates MP3/WAV files for all Claude & Kiro lessons using Piper TTS or gTTS.
Run: python scripts/generate_lesson_podcasts.py
"""
import os
import glob
import re

# Output directory for audio lessons
OUTPUT_DIR = "data/audio_lessons"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def clean_markdown(md_text):
    # Remove code blocks for smooth listening narrative
    cleaned = re.sub(r'\`\`\`[\\s\\S]*?\`\`\`', ' [Code block omitted for audio] ', md_text)
    cleaned = re.sub(r'#+\\s+', '', cleaned)
    cleaned = re.sub(r'[*_\`]', '', cleaned)
    return cleaned

def generate_audio_for_lessons():
    lesson_files = sorted(glob.glob("lessons_*/*.md"))
    print(f"Found {len(lesson_files)} lessons to convert...")

    for fpath in lesson_files:
        series = "Claude" if "Claude" in fpath else "Kiro"
        basename = os.path.splitext(os.path.basename(fpath))[0]
        out_file = os.path.join(OUTPUT_DIR, f"{series}_{basename}.mp3")

        if os.path.exists(out_file):
            print(f"Skipping already generated: {out_file}")
            continue

        print(f"Converting {fpath} -> {out_file}...")
        with open(fpath, "r", encoding="utf-8") as f:
            content = clean_markdown(f.read())

        # Example using Piper or edge-tts or gTTS
        # If using your repo's Piper TTS:
        # os.system(f'echo "{content[:2000]}" | piper --model ... --output_file "{out_file}"')
        try:
            from gtts import gTTS
            tts = gTTS(text=content, lang='en', slow=False)
            tts.save(out_file)
            print(f"Saved: {out_file}")
        except ImportError:
            print("Please install gTTS: pip install gTTS (or use edge-tts / Piper)")

if __name__ == "__main__":
    generate_audio_for_lessons()
`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(pythonBatchScript);
    setCopiedBatchScript(true);
    setTimeout(() => setCopiedBatchScript(false), 2000);
  };

  const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
      {/* Top Bar: Title, AirPods Badge, Settings Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white tracking-wide">
                AirPods &amp; Audio Player
              </h4>
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                On-Demand Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Listen hands-free with stem clicks &amp; lock-screen controls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors border ${
              showSettings 
                ? 'bg-sky-950/80 text-sky-300 border-sky-700' 
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Voice &amp; Speed
          </button>

          <button
            onClick={() => setShowStoragePlan(!showStoragePlan)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors border ${
              showStoragePlan
                ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            MP3 &amp; YouTube Plan
          </button>
        </div>
      </div>

      {/* Main Playback Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentParagraphIndex === 0}
            className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 border border-slate-800"
            title="Previous Section (or squeeze AirPods left)"
          >
            <Rewind className="w-4 h-4" />
          </button>

          {!isPlaying && !isPaused && (
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm text-xs transition-colors"
              title="Start listening"
            >
              <Play className="w-4 h-4 fill-white" />
              Listen to Lesson
            </button>
          )}

          {isPlaying && (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-sm text-xs transition-colors"
              title="Pause (or squeeze AirPods)"
            >
              <Pause className="w-4 h-4 fill-white" />
              Pause
            </button>
          )}

          {isPaused && (
            <button
              onClick={handleResume}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm text-xs transition-colors"
              title="Resume (or squeeze AirPods)"
            >
              <Play className="w-4 h-4 fill-white" />
              Resume
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button
              onClick={handleStop}
              className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-800"
              title="Stop playback"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={currentParagraphIndex >= spokenParagraphs.length - 1}
            className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 border border-slate-800"
            title="Next Section (or squeeze AirPods right)"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Multipliers */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 flex-wrap">
          <span className="text-[10px] text-slate-500 font-semibold px-1 hidden sm:inline">Speed:</span>
          {[0.3, 0.5, 0.8, 1.0, 1.25, 1.5, 1.75, 2.0].map((s) => (
            <button
              key={s}
              onClick={() => handleRateChange(s)}
              className={`px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                rate === s
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Paragraph Counter & Progress */}
        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span>
            Section <strong className="text-white">{currentParagraphIndex + 1}</strong> of {spokenParagraphs.length}
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-sky-400 font-mono">
            ~{Math.max(1, Math.round((spokenParagraphs.length - currentParagraphIndex) * 0.4 / Math.max(0.2, rate)))} min remaining
          </span>
        </div>
      </div>

      {/* Scrubber Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 cursor-pointer">
          <div
            className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-300"
            style={{
              width: `${((currentParagraphIndex + 1) / Math.max(1, spokenParagraphs.length)) * 100}%`
            }}
          ></div>
        </div>

        {/* Current Spoken Preview Snippet */}
        {(isPlaying || isPaused) && (
          <div className="p-2.5 rounded-lg bg-slate-950/90 border border-sky-900/50 text-[11px] text-slate-300 leading-relaxed animate-in fade-in duration-200">
            <span className="text-sky-400 font-semibold mr-1.5">Speaking:</span>
            "{spokenParagraphs[currentParagraphIndex]}"
          </div>
        )}
      </div>

      {/* Voice & Speech Rate Settings Panel */}
      {showSettings && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Voice Selection ({englishVoices.length} English voices available)
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  if (isPlaying) speakParagraph(currentParagraphIndex);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
              >
                {englishVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} {v.default ? '(System Default)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-slate-300">
                  Speed &amp; Pacing
                </label>
                <span className="text-sky-400 font-bold font-mono">
                  {rate.toFixed(1)}x {rate <= 0.3 ? '(Slow Study)' : rate <= 0.5 ? '(Half Speed)' : rate <= 0.8 ? '(Deliberate)' : rate === 1.0 ? '(Normal)' : '(Fast)'}
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0.2x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-slate-300">
                  Pitch adjustment
                </label>
                <span className="text-sky-400 font-bold font-mono">
                  {pitch.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0.7 (Deeper)</span>
                <span>1.0</span>
                <span>1.3 (Higher)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Architectural Plan: MP3 Pre-Generation, GitHub Storage, and YouTube Alternative */}
      {showStoragePlan && (
        <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/50 space-y-3.5 text-xs text-slate-300 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-white text-xs">
                Alternative Audio Architectures &amp; Storage Strategy
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold">
              Evaluation Guide
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Approach A */}
            <div className="p-3 rounded-lg bg-slate-900 border border-emerald-900/50 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Approach 1 (Active)
              </span>
              <h5 className="font-semibold text-white">On-Demand Browser Synthesis</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Zero cloud costs, zero latency, no Git storage bloat. Operates natively with AirPods stem controls via MediaSession.
              </p>
            </div>

            {/* Approach B */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                Approach 2 (GitHub Releases)
              </span>
              <h5 className="font-semibold text-white">Batch MP3s via Piper TTS</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pre-generate MP3s with Piper TTS. Instead of committing large MP3s to git history, attach them as <strong className="text-white">GitHub Release Assets</strong> (up to 2GB per asset free).
              </p>
            </div>

            {/* Approach C */}
            <div className="p-3 rounded-lg bg-slate-900 border border-purple-900/50 space-y-1.5">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                Approach 3 (YouTube Channel)
              </span>
              <h5 className="font-semibold text-white">Unlisted YouTube Podcast Playlist</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Generate 10-minute slide videos with audio and upload as an unlisted playlist. You can then manage and stream them right from this webapp's Playlist Studio!
              </p>
            </div>
          </div>

          {/* Batch Script Helper */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300">
                Batch Python Generator for local Piper / TTS:
              </span>
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
              >
                {copiedBatchScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedBatchScript ? 'Copied Python Script' : 'Copy Script'}
              </button>
            </div>
            <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-400 overflow-x-auto max-h-32">
              {pythonBatchScript}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
