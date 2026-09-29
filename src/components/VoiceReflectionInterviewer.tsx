import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  Square, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  BrainCircuit, 
  BookOpen, 
  Lightbulb, 
  HelpCircle, 
  Volume2, 
  Loader2, 
  Save, 
  RotateCcw 
} from 'lucide-react';
import { YouTubeClip, VoiceReflectionSession, VoiceInterviewTurn } from '../types';
import { transcribeAudio, getSocraticNextQuestion, synthesizeSocraticInterview } from '../services/api';

interface VoiceReflectionInterviewerProps {
  clip: YouTubeClip;
  onSaveReflection: (clipId: string, session: VoiceReflectionSession, appendToNotes: boolean) => void;
  onClose?: () => void;
}

interface StepConfig {
  stepNumber: number;
  stage: 'merits' | 'learnings' | 'applications';
  title: string;
  subtitle: string;
  defaultQuestion: string;
}

const STEPS: StepConfig[] = [
  {
    stepNumber: 1,
    stage: 'merits',
    title: 'Value & Merits',
    subtitle: 'Why this clip is standout and valuable',
    defaultQuestion: 'What stood out most to you about this clip, and why do you consider it particularly good or valuable?',
  },
  {
    stepNumber: 2,
    stage: 'learnings',
    title: 'Key Learnings',
    subtitle: 'Concepts and insights absorbed',
    defaultQuestion: 'What specific concept, technique, or insight did you learn from this video that felt new or surprising?',
  },
  {
    stepNumber: 3,
    stage: 'applications',
    title: 'Practical Application',
    subtitle: 'How you plan to build or experiment',
    defaultQuestion: 'What did you like most, and how do you plan to practically apply or experiment with this in your code or vibe-coding projects?',
  },
];

export const VoiceReflectionInterviewer: React.FC<VoiceReflectionInterviewerProps> = ({
  clip,
  onSaveReflection,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0, 1, 2, or 3 (summary)
  const [activeQuestion, setActiveQuestion] = useState(STEPS[0].defaultQuestion);
  const [aiAcknowledgment, setAiAcknowledgment] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [turns, setTurns] = useState<VoiceInterviewTurn[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({ 0: true });

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioMeterBars, setAudioMeterBars] = useState<number[]>(new Array(14).fill(12));

  // Synthesis result
  const [synthesis, setSynthesis] = useState<{
    whyGood: string;
    keyLearnings: string[];
    practicalApplications: string[];
    oneLineSummary: string;
  } | null>(null);
  const [appendToNotes, setAppendToNotes] = useState(true);

  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const pressStartTimeRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);

  // Reset when clip changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setActiveQuestion(STEPS[0].defaultQuestion);
    setAiAcknowledgment(null);
    setTranscript('');
    setTurns([]);
    setSynthesis(null);
    setExpandedCards({ 0: true });
    setRecordingSeconds(0);
  }, [clip.id]);

  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Calculate linear progress percentage
  const progressPercent = currentStepIndex >= 3 
    ? 100 
    : Math.round(((currentStepIndex) / 3) * 100);

  const startRecording = async () => {
    if (isRecording) return;
    try {
      setTranscript('');
      audioChunksRef.current = [];

      // 1. Web Speech API for instantaneous live text streaming
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';
          rec.onresult = (evt: any) => {
            let str = '';
            for (let i = 0; i < evt.results.length; i++) {
              str += evt.results[i][0].transcript + ' ';
            }
            setTranscript(str.trim());
          };
          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          console.warn('SpeechRecognition init error:', e);
        }
      }

      // 2. High-fidelity audio stream capture for Gemini audio transcription
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType: mime });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
        setAudioMeterBars(new Array(14).fill(0).map(() => Math.floor(Math.random() * 45) + 12));
      }, 200);
    } catch (err) {
      console.error('Microphone error:', err);
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);

    if (timerRef.current) clearInterval(timerRef.current);
    setAudioMeterBars(new Array(14).fill(12));

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setIsProcessingAudio(true);
      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorderRef.current?.mimeType || 'audio/webm',
          });

          if (audioBlob.size > 800) {
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64 = reader.result as string;
              try {
                const res = await transcribeAudio(base64, audioBlob.type);
                if (res && res.transcript && !res.transcript.includes('no speech detected')) {
                  setTranscript((prev) => (prev.trim().length > 0 ? prev : res.transcript));
                }
              } catch (e) {
                console.warn('Audio transcribe fallback:', e);
              } finally {
                setIsProcessingAudio(false);
              }
            };
            reader.readAsDataURL(audioBlob);
          } else {
            setIsProcessingAudio(false);
          }
        } catch (e) {
          console.error('Audio blob processing error:', e);
          setIsProcessingAudio(false);
        }

        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.stop();
    }
  };

  // Push-to-talk dual-mode handlers: Click to toggle OR hold down to record
  const handleMouseDown = () => {
    pressStartTimeRef.current = Date.now();
    isHoldingRef.current = true;
    startRecording();
  };

  const handleMouseUp = () => {
    const pressDuration = Date.now() - pressStartTimeRef.current;
    if (pressDuration > 450) {
      // Long press: hold-to-talk mode, stop on release
      stopRecording();
      isHoldingRef.current = false;
    } else {
      // Short click: click-toggle mode (stays recording until user clicks again)
      isHoldingRef.current = false;
    }
  };

  const handleButtonClick = () => {
    if (isRecording && !isHoldingRef.current) {
      stopRecording();
    }
  };

  // Advance to next Socratic stage
  const handleConfirmAnswer = async () => {
    if (!transcript.trim()) return;

    setIsAdvancing(true);
    const activeStep = STEPS[currentStepIndex];
    const newTurn: VoiceInterviewTurn = {
      stage: activeStep.stage,
      question: activeQuestion,
      transcript: transcript.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextTurns = [...turns, newTurn];
    setTurns(nextTurns);

    try {
      if (currentStepIndex === 0) {
        // From Step 1 to Step 2
        const nextData = await getSocraticNextQuestion({
          clipTitle: clip.title,
          clipChannel: clip.channel,
          stage: 'merits',
          userTranscript: transcript.trim(),
        });

        setAiAcknowledgment(nextData.acknowledgment);
        setActiveQuestion(nextData.nextQuestion || STEPS[1].defaultQuestion);
        setCurrentStepIndex(1);
        setTranscript('');
        setExpandedCards({ 0: false, 1: true });
      } else if (currentStepIndex === 1) {
        // From Step 2 to Step 3
        const nextData = await getSocraticNextQuestion({
          clipTitle: clip.title,
          clipChannel: clip.channel,
          stage: 'learnings',
          userTranscript: transcript.trim(),
        });

        setAiAcknowledgment(nextData.acknowledgment);
        setActiveQuestion(nextData.nextQuestion || STEPS[2].defaultQuestion);
        setCurrentStepIndex(2);
        setTranscript('');
        setExpandedCards({ 0: false, 1: false, 2: true });
      } else if (currentStepIndex === 2) {
        // Completed all 3 questions, synthesize
        const synth = await synthesizeSocraticInterview({
          clipTitle: clip.title,
          turns: nextTurns,
        });

        setSynthesis(synth);
        setCurrentStepIndex(3);
        setExpandedCards({ 0: false, 1: false, 2: false, 3: true });
      }
    } catch (e) {
      console.warn('Next question fallback error:', e);
      if (currentStepIndex < 2) {
        const nextIdx = currentStepIndex + 1;
        setCurrentStepIndex(nextIdx);
        setActiveQuestion(STEPS[nextIdx].defaultQuestion);
        setTranscript('');
        setExpandedCards({ [nextIdx]: true });
      } else {
        setCurrentStepIndex(3);
      }
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleSaveAndSync = () => {
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
        whyGood: turns[0]?.transcript || 'Highlighted clear core methodology.',
        keyLearnings: [turns[1]?.transcript || 'Synthesized key concepts.'],
        practicalApplications: [turns[2]?.transcript || 'Plan to prototype core architecture.'],
        oneLineSummary: `Socratic spoken reflection on ${clip.title}`,
      },
    };

    onSaveReflection(clip.id, session, appendToNotes);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setActiveQuestion(STEPS[0].defaultQuestion);
    setAiAcknowledgment(null);
    setTranscript('');
    setTurns([]);
    setSynthesis(null);
    setExpandedCards({ 0: true });
  };

  const toggleCard = (index: number) => {
    setExpandedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
      {/* Panel Top Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
              Socratic Interviewer
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-800/80 text-indigo-300">
                Live Voice
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
              {clip.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
            title="Restart interview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
              title="Close interviewer panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Linear Progress Bar */}
      <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">
            {currentStepIndex >= 3 
              ? 'Synthesis Complete' 
              : `Step ${currentStepIndex + 1} of 3: ${STEPS[currentStepIndex].title}`}
          </span>
          <span className="text-indigo-400 font-mono font-semibold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-rose-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Content Area: Collapsible Socratic Question Cards */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const isPending = index > currentStepIndex;
          const isExpanded = Boolean(expandedCards[index]);
          const completedTurn = turns.find((t) => t.stage === step.stage);

          return (
            <div
              key={step.stepNumber}
              className={`rounded-xl border transition-all overflow-hidden ${
                isActive
                  ? 'bg-slate-950/80 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30'
                  : isCompleted
                  ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/20 border-slate-800/50 opacity-60'
              }`}
            >
              {/* Card Header Accordion Toggle */}
              <button
                type="button"
                onClick={() => toggleCard(index)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isActive
                        ? 'bg-indigo-600 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : step.stepNumber}
                  </div>
                  <div>
                    <h4 className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-slate-400">{step.subtitle}</p>
                  </div>
                </div>

                <div className="text-slate-500">
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </button>

              {/* Card Body */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-slate-800/60 text-xs">
                  {/* If this stage is already completed, show user's transcript summary */}
                  {isCompleted && completedTurn && (
                    <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                      <div className="text-slate-400 italic">"{completedTurn.question}"</div>
                      <div className="text-slate-200 pl-2.5 border-l-2 border-emerald-500/70 font-medium">
                        {completedTurn.transcript}
                      </div>
                    </div>
                  )}

                  {/* If this stage is currently ACTIVE */}
                  {isActive && (
                    <div className="space-y-3">
                      {/* AI Socrates Acknowledgment if advancing from previous turn */}
                      {aiAcknowledgment && (
                        <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-indigo-200">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-indigo-100 block mb-0.5">Socrates:</span>
                            {aiAcknowledgment}
                          </div>
                        </div>
                      )}

                      {/* Active AI Question */}
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                        <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          AI Active Question
                        </div>
                        <p className="text-xs font-semibold text-white leading-relaxed">
                          "{activeQuestion}"
                        </p>
                      </div>

                      {/* Push-to-Talk Button & Audio Waveform Controls */}
                      <div className={`p-3 rounded-xl border transition-all space-y-2.5 ${
                        isRecording 
                          ? 'bg-rose-950/30 border-rose-500/80 ring-1 ring-rose-500/40' 
                          : 'bg-slate-900 border-slate-800'
                      }`}>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-medium text-slate-300 flex items-center gap-1.5">
                            <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                            Voice Response:
                          </span>
                          <span className="text-[10px]">
                            {isRecording ? (
                              <span className="text-rose-400 font-semibold animate-pulse">
                                Recording ({recordingSeconds}s)...
                              </span>
                            ) : (
                              'Hold or click to talk'
                            )}
                          </span>
                        </div>

                        {/* Push-to-talk button */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onTouchStart={handleMouseDown}
                            onTouchEnd={handleMouseUp}
                            onClick={handleButtonClick}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap ${
                              isRecording
                                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                          >
                            {isRecording ? (
                              <>
                                <Square className="w-3.5 h-3.5 fill-white" />
                                Stop Talking
                              </>
                            ) : (
                              <>
                                <Mic className="w-3.5 h-3.5" />
                                Push to Talk
                              </>
                            )}
                          </button>

                          {/* Audio Wave Bars */}
                          <div className="flex items-center gap-1 h-6 flex-1 px-2">
                            {audioMeterBars.map((bar, idx) => (
                              <div
                                key={idx}
                                className={`w-1 rounded-full transition-all duration-150 ${
                                  isRecording ? 'bg-rose-400' : 'bg-slate-700'
                                }`}
                                style={{ height: `${isRecording ? bar : 8}px` }}
                              />
                            ))}
                          </div>

                          {isProcessingAudio && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                          )}
                        </div>

                        {/* Editable live transcript */}
                        <textarea
                          rows={3}
                          value={transcript}
                          onChange={(e) => setTranscript(e.target.value)}
                          placeholder="Your spoken words will appear here live, or type directly..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                        />
                      </div>

                      {/* Confirm & advance button */}
                      <button
                        type="button"
                        disabled={!transcript.trim() || isAdvancing}
                        onClick={handleConfirmAnswer}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm"
                      >
                        {isAdvancing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Synthesizing Socrates Response...
                          </>
                        ) : (
                          <>
                            <span>{index === 2 ? 'Complete & Generate Debrief' : 'Confirm & Next Question'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* If pending */}
                  {isPending && (
                    <div className="text-[11px] text-slate-500 italic py-1">
                      Awaiting completion of previous Socratic inquiry...
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Stage 4: FINAL SYNTHESIS DEBRIEF CARD */}
        {currentStepIndex >= 3 && (
          <div className="rounded-xl border border-emerald-500/80 bg-slate-950/90 p-4 space-y-4 shadow-lg ring-1 ring-emerald-500/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400" />
              Interview Completed · Socratic Debrief
            </div>

            <p className="text-xs text-slate-200 italic leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              "{synthesis?.oneLineSummary || 'Key principles extracted from your spoken reflection.'}"
            </p>

            <div className="space-y-2 text-[11px]">
              <div className="space-y-1">
                <span className="font-semibold text-amber-400 uppercase tracking-wider block text-[10px]">
                  Why Standout:
                </span>
                <p className="text-slate-300 leading-snug">{synthesis?.whyGood}</p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-indigo-400 uppercase tracking-wider block text-[10px]">
                  Learnings:
                </span>
                <ul className="text-slate-300 space-y-0.5">
                  {synthesis?.keyLearnings?.map((l, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-indigo-400">•</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-emerald-400 uppercase tracking-wider block text-[10px]">
                  Applications:
                </span>
                <ul className="text-slate-300 space-y-0.5">
                  {synthesis?.practicalApplications?.map((a, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-emerald-400">→</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Append to notes toggle */}
            <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer pt-1 border-t border-slate-800">
              <input
                type="checkbox"
                checked={appendToNotes}
                onChange={(e) => setAppendToNotes(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 bg-slate-900"
              />
              <span>Append distilled debrief directly into Study Notes</span>
            </label>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveAndSync}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-md active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              Save to Reflections Journal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
