import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  Square, 
  Sparkles, 
  Check, 
  ArrowRight, 
  RotateCcw, 
  Save, 
  BrainCircuit, 
  Lightbulb, 
  BookOpen, 
  HelpCircle, 
  Loader2,
  Volume2,
  FileText
} from 'lucide-react';
import { YouTubeClip, VoiceReflectionSession, VoiceInterviewTurn } from '../types';
import { transcribeAudio, getSocraticNextQuestion, synthesizeSocraticInterview } from '../services/api';

interface SocraticVoiceInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: YouTubeClip;
  onSaveReflection: (clipId: string, session: VoiceReflectionSession, appendToNotes: boolean) => void;
}

type InterviewStage = 'merits' | 'learnings' | 'applications' | 'summary';

const STAGE_CONFIG: Record<
  'merits' | 'learnings' | 'applications',
  { title: string; defaultQuestion: string; stepNumber: number }
> = {
  merits: {
    stepNumber: 1,
    title: 'Value & Merits',
    defaultQuestion: 'What stood out most to you about this clip, and why do you consider it particularly good or valuable?',
  },
  learnings: {
    stepNumber: 2,
    title: 'Key Learnings',
    defaultQuestion: 'What specific concept, technique, or insight did you learn from this video that felt new or surprising?',
  },
  applications: {
    stepNumber: 3,
    title: 'Practical Application',
    defaultQuestion: 'What did you like most, and how do you plan to practically apply or experiment with this in your code or vibe-coding projects?',
  },
};

export const SocraticVoiceInterviewModal: React.FC<SocraticVoiceInterviewModalProps> = ({
  isOpen,
  onClose,
  clip,
  onSaveReflection,
}) => {
  const [stage, setStage] = useState<InterviewStage>('merits');
  const [currentQuestion, setCurrentQuestion] = useState(STAGE_CONFIG.merits.defaultQuestion);
  const [aiAcknowledgment, setAiAcknowledgment] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [turns, setTurns] = useState<VoiceInterviewTurn[]>([]);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isAdvancingStage, setIsAdvancingStage] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(16).fill(15));
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Final synthesis
  const [synthesis, setSynthesis] = useState<{
    whyGood: string;
    keyLearnings: string[];
    practicalApplications: string[];
    oneLineSummary: string;
  } | null>(null);
  const [appendToNotes, setAppendToNotes] = useState(true);

  // Media references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const durationTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStage('merits');
      setCurrentQuestion(STAGE_CONFIG.merits.defaultQuestion);
      setAiAcknowledgment(null);
      setTranscript('');
      setTurns([]);
      setSynthesis(null);
      setRecordingDuration(0);
    }
  }, [isOpen, clip.id]);

  // Clean up recording on unmount or close
  useEffect(() => {
    return () => {
      stopRecording();
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Start Voice Recording with WebM capture + fallback WebSpeech live text
  const startRecording = async () => {
    try {
      setTranscript('');
      audioChunksRef.current = [];

      // 1. Browser Web Speech API for immediate live transcription preview
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          recognition.onresult = (event: any) => {
            let liveText = '';
            for (let i = 0; i < event.results.length; i++) {
              liveText += event.results[i][0].transcript + ' ';
            }
            setTranscript(liveText.trim());
          };
          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('WebSpeech init error (non-fatal):', e);
        }
      }

      // 2. MediaRecorder for high-fidelity audio capture sent to Gemini
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);

      durationTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
        // Simulate organic waveform variation
        setAudioLevel(new Array(16).fill(0).map(() => Math.floor(Math.random() * 55) + 15));
      }, 200);
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      alert('Microphone access was denied or is not supported. You can still type your reflection directly into the box.');
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    setAudioLevel(new Array(16).fill(15));

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setIsProcessingAudio(true);
      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
          if (audioBlob.size > 1000) {
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64Data = reader.result as string;
              try {
                const res = await transcribeAudio(base64Data, audioBlob.type);
                if (res && res.transcript && res.transcript.length > 5 && !res.transcript.includes('no speech detected')) {
                  setTranscript((prev) => (prev.trim().length > 0 ? prev : res.transcript));
                }
              } catch (e) {
                console.warn('Gemini audio transcription fallback:', e);
              } finally {
                setIsProcessingAudio(false);
              }
            };
            reader.readAsDataURL(audioBlob);
          } else {
            setIsProcessingAudio(false);
          }
        } catch (err) {
          console.error('Error handling recorded audio:', err);
          setIsProcessingAudio(false);
        }

        // Stop all audio tracks
        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.stop();
    }
  };

  // Submit current stage response and advance
  const handleNextStage = async () => {
    if (!transcript.trim()) return;

    setIsAdvancingStage(true);
    const newTurn: VoiceInterviewTurn = {
      stage: stage as 'merits' | 'learnings' | 'applications',
      question: currentQuestion,
      transcript: transcript.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedTurns = [...turns, newTurn];
    setTurns(updatedTurns);

    try {
      if (stage === 'merits') {
        // Fetch AI acknowledgment and transition to Stage 2 (learnings)
        const nextData = await getSocraticNextQuestion({
          clipTitle: clip.title,
          clipChannel: clip.channel,
          stage: 'merits',
          userTranscript: transcript.trim(),
        });

        setAiAcknowledgment(nextData.acknowledgment);
        setCurrentQuestion(nextData.nextQuestion || STAGE_CONFIG.learnings.defaultQuestion);
        setStage('learnings');
        setTranscript('');
      } else if (stage === 'learnings') {
        // Fetch AI acknowledgment and transition to Stage 3 (applications)
        const nextData = await getSocraticNextQuestion({
          clipTitle: clip.title,
          clipChannel: clip.channel,
          stage: 'learnings',
          userTranscript: transcript.trim(),
        });

        setAiAcknowledgment(nextData.acknowledgment);
        setCurrentQuestion(nextData.nextQuestion || STAGE_CONFIG.applications.defaultQuestion);
        setStage('applications');
        setTranscript('');
      } else if (stage === 'applications') {
        // Final synthesis
        const synthRes = await synthesizeSocraticInterview({
          clipTitle: clip.title,
          turns: updatedTurns,
        });

        setSynthesis(synthRes);
        setStage('summary');
      }
    } catch (err) {
      console.error('Stage transition error:', err);
      if (stage === 'merits') {
        setStage('learnings');
        setCurrentQuestion(STAGE_CONFIG.learnings.defaultQuestion);
        setTranscript('');
      } else if (stage === 'learnings') {
        setStage('applications');
        setCurrentQuestion(STAGE_CONFIG.applications.defaultQuestion);
        setTranscript('');
      } else {
        setStage('summary');
      }
    } finally {
      setIsAdvancingStage(false);
    }
  };

  const handleSaveAndFinish = () => {
    const session: VoiceReflectionSession = {
      id: `reflection-${Date.now()}`,
      clipId: clip.id,
      clipTitle: clip.title,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      turns,
      synthesis: synthesis || {
        whyGood: turns[0]?.transcript || 'Highlighted compelling core methodology.',
        keyLearnings: [turns[1]?.transcript || 'Synthesized key concepts.'],
        practicalApplications: [turns[2]?.transcript || 'Plan to prototype core architecture.'],
        oneLineSummary: `Socratic spoken reflection on ${clip.title}`,
      },
    };

    onSaveReflection(clip.id, session, appendToNotes);
    onClose();
  };

  const currentStepNum = stage === 'summary' ? 4 : STAGE_CONFIG[stage]?.stepNumber || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">Socratic Clip Reflection</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300">
                  Voice Interview
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                Reflecting on: <span className="text-slate-200 font-medium">{clip.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper progress indicator */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 ${currentStepNum >= 1 ? 'text-indigo-400 font-medium' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStepNum >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                1
              </span>
              <span>1. Why It's Good</span>
            </div>
            <div className={`flex items-center gap-2 ${currentStepNum >= 2 ? 'text-indigo-400 font-medium' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStepNum >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                2
              </span>
              <span>2. Learnings</span>
            </div>
            <div className={`flex items-center gap-2 ${currentStepNum >= 3 ? 'text-indigo-400 font-medium' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStepNum >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                3
              </span>
              <span>3. Applications</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Step {currentStepNum} of 3
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {stage !== 'summary' ? (
            <div className="space-y-6">
              {/* Previous Turn Acknowledgment if any */}
              {aiAcknowledgment && (
                <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-3.5 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-200 leading-relaxed">
                    <span className="font-semibold text-indigo-100 block mb-0.5">Socrates Insight:</span>
                    {aiAcknowledgment}
                  </div>
                </div>
              )}

              {/* Socrates Active Question */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  Socratic Inquiry ({STAGE_CONFIG[stage]?.title}):
                </div>
                <p className="text-sm font-medium text-white leading-relaxed">
                  "{currentQuestion}"
                </p>
              </div>

              {/* Push-to-Talk Voice Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                    Speak Your Reflection:
                  </label>
                  <span>
                    {isRecording ? (
                      <span className="text-rose-400 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        Recording ({recordingDuration}s)... Click to Stop
                      </span>
                    ) : (
                      'Click microphone or hold to talk'
                    )}
                  </span>
                </div>

                {/* Central Push-to-Talk & Waveform Control */}
                <div className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isRecording 
                    ? 'bg-rose-950/30 border-rose-500/80 shadow-lg ring-1 ring-rose-500/40' 
                    : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 fill-white" />
                        Finish Speaking
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Push to Talk
                      </>
                    )}
                  </button>

                  {/* Audio Waveform visualization */}
                  <div className="flex items-center gap-1.5 h-8 px-4 flex-1 justify-center sm:justify-start">
                    {audioLevel.map((lvl, idx) => (
                      <div
                        key={idx}
                        className={`w-1 rounded-full transition-all duration-150 ${
                          isRecording ? 'bg-rose-400' : 'bg-slate-700'
                        }`}
                        style={{ height: `${isRecording ? lvl : 12}px` }}
                      />
                    ))}
                  </div>

                  {isProcessingAudio && (
                    <div className="text-xs text-amber-300 flex items-center gap-1.5 shrink-0">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Transcribing audio...
                    </div>
                  )}
                </div>

                {/* Live Transcript Editor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Transcribed response (you can edit text directly):</span>
                    {transcript && (
                      <button
                        type="button"
                        onClick={() => setTranscript('')}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Your spoken words will appear here in real-time, or you can type directly..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* FINAL STAGE: Structured Synthesis Debrief */
            <div className="space-y-5">
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-emerald-200">
                    Interview Complete · Socratic Synthesis Ready
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {synthesis?.oneLineSummary || `Synthesized personal reflections for "${clip.title}"`}
                  </p>
                </div>
              </div>

              {/* Debrief Blocks */}
              <div className="space-y-4 text-xs">
                {/* 1. Why Good */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-1.5">
                  <div className="font-semibold text-rose-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Why You Found It Valuable:
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {synthesis?.whyGood}
                  </p>
                </div>

                {/* 2. Key Learnings */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="font-semibold text-indigo-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    What You Learned & Liked:
                  </div>
                  <ul className="space-y-1.5">
                    {synthesis?.keyLearnings?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300 leading-relaxed">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Practical Applications */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Practical Applications & Next Steps:
                  </div>
                  <ul className="space-y-1.5">
                    {synthesis?.practicalApplications?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300 leading-relaxed">
                        <span className="text-emerald-400 font-bold">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Full Transcript Expandable */}
                <details className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400">
                  <summary className="font-medium text-slate-300 cursor-pointer hover:text-white transition-colors">
                    View Full Spoken Dialogue Transcript ({turns.length} turns)
                  </summary>
                  <div className="mt-3 space-y-3 pt-2 border-t border-slate-800">
                    {turns.map((t, idx) => (
                      <div key={idx} className="space-y-1">
                        <span className="font-semibold text-indigo-300 block">
                          Socrates (Q{idx + 1}): {t.question}
                        </span>
                        <p className="text-slate-200 pl-3 border-l-2 border-slate-700 italic">
                          "{t.transcript}"
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
              </div>

              {/* Study Notes Checkbox */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={appendToNotes}
                  onChange={(e) => setAppendToNotes(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-900"
                />
                <div>
                  <div className="text-xs font-semibold text-white">
                    Append Distilled Takeaways to Clip Study Notes
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Automatically enriches your permanent study notes and Obsidian export with this verbal reflection.
                  </div>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {stage !== 'summary' ? 'Stage ' + currentStepNum + ' of 3' : 'Ready to archive'}
          </div>

          <div className="flex items-center gap-3">
            {stage !== 'summary' ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!transcript.trim() || isAdvancingStage}
                  onClick={handleNextStage}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md active:scale-95"
                >
                  {isAdvancingStage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <span>{stage === 'applications' ? 'Complete & Synthesize' : 'Next Question'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSaveAndFinish}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save to Voice Reflections Journal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
