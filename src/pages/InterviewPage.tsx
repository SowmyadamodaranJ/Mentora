import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, ChevronRight, CheckCircle, AlertCircle,
  Play, Square, RotateCcw, ArrowRight, Brain, Clock, Volume2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createInterview, updateInterview, saveFeedbackForInterview } from '../lib/localDb';
import { InterviewConfig, Emotion, LiveBehaviorData } from '../types';
import { getQuestions, getOpeningQuestion } from '../lib/questionBank';
import { generateFullFeedback, generateLiveBehaviorUpdate } from '../lib/mockAI';
import VideoPanel from '../components/interview/VideoPanel';
import SetupModal from '../components/interview/SetupModal';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface QuestionState {
  id: string;
  text: string;
  category: string;
  order: number;
}

type InterviewPhase = 'setup' | 'ready' | 'active' | 'reviewing' | 'submitting' | 'done';

export default function InterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const config = location.state?.config as InterviewConfig | undefined;

  const [phase, setPhase] = useState<InterviewPhase>(config ? 'ready' : 'setup');
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [timer, setTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [behavior, setBehavior] = useState<LiveBehaviorData>({ emotion: 'neutral', eyeContact: 75, confidence: 70 });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const behaviorRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (config) initInterview(config);
    return () => clearAllTimers();
  }, []);

  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
      questionTimerRef.current = setInterval(() => setQuestionTimer(t => t + 1), 1000);
      behaviorRef.current = setInterval(() => setBehavior(generateLiveBehaviorUpdate()), 3000);
    } else {
      clearAllTimers();
    }
    return () => clearAllTimers();
  }, [phase]);

  function clearAllTimers() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    if (behaviorRef.current) clearInterval(behaviorRef.current);
  }

  async function initInterview(cfg: InterviewConfig) {
    const opening = getOpeningQuestion(cfg.role, cfg.type);
    const rest = getQuestions(cfg.type, cfg.difficulty, cfg.questionCount - 1);

    const allQs: QuestionState[] = [
      { id: 'q-0', text: opening.question, category: opening.category, order: 0 },
      ...rest.map((q, i) => ({ id: `q-${i + 1}`, text: q.question, category: q.category, order: i + 1 })),
    ];

    setQuestions(allQs);

    const ivData = createInterview({
      user_id: user!.id,
      type: cfg.type,
      role: cfg.role,
      difficulty: cfg.difficulty,
      question_count: allQs.length,
    });

    setInterviewId(ivData.id);
    setQuestionIds(allQs.map(q => q.id));

    setPhase('active');
    setCurrentIdx(0);
    setTimer(0);
    setQuestionTimer(0);
  }

  function handleSetupStart(cfg: InterviewConfig) {
    navigate('/interview', { state: { config: cfg }, replace: true });
    initInterview(cfg);
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function handleStartRecording() {
    resetTranscript();
    startListening();
    setIsSpeaking(true);
  }

  function handleStopRecording() {
    stopListening();
    setIsSpeaking(false);
    if (transcript.trim()) {
      setAnswers(prev => ({ ...prev, [currentIdx]: (prev[currentIdx] || '') + transcript }));
    }
  }

  function handleNextQuestion() {
    if (isListening) handleStopRecording();
    const finalAnswer = answers[currentIdx] || transcript;
    setAnswers(prev => ({ ...prev, [currentIdx]: finalAnswer }));
    resetTranscript();
    setQuestionTimer(0);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      handleSubmitInterview();
    }
  }

  async function handleSubmitInterview() {
    if (isListening) stopListening();
    setPhase('submitting');
    clearAllTimers();

    const finalAnswers = questions.map((q, i) => ({
      question: q.text,
      transcript: answers[i] || '',
    }));

    const feedback = generateFullFeedback(
      config?.type || 'technical',
      finalAnswers,
      timer
    );

    if (interviewId) {
      updateInterview(interviewId, {
        status: 'completed',
        duration_seconds: timer,
        completed_at: new Date().toISOString(),
      });
      saveFeedbackForInterview({
        ...feedback,
        interview_id: interviewId,
        user_id: user!.id,
      });
    }

    navigate(`/feedback/${interviewId}`, { state: { feedback, config } });
  }

  const currentQuestion = questions[currentIdx];
  const progress = questions.length > 0 ? ((currentIdx) / questions.length) * 100 : 0;
  const currentAnswer = answers[currentIdx] || '';
  const displayText = currentAnswer + (isListening ? interimTranscript : '');

  if (phase === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F1A' }}>
        <SetupModal onStart={handleSetupStart} onClose={() => navigate('/dashboard')} />
      </div>
    );
  }

  if (phase === 'submitting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: '#0B0F1A' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
          <Brain size={32} style={{ color: '#6366F1' }} className="animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="font-heading font-bold text-2xl text-white mb-2">Analyzing your responses</h2>
          <p className="text-gray-400 text-sm">Our AI coach is generating your personalized feedback...</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: '#6366F1',
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-10px); } }`}</style>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Brain size={16} style={{ color: '#6366F1' }} />
          </div>
          <div>
            <h1 className="font-heading font-semibold text-white text-sm capitalize">
              {config?.type} Interview — {config?.role}
            </h1>
            <p className="text-xs text-gray-500">Question {currentIdx + 1} of {questions.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm" style={{ color: '#9CA3AF' }}>
            <Clock size={14} />
            <span className="font-mono">{formatTime(timer)}</span>
          </div>
          <button
            onClick={() => { if (window.confirm('End this interview session?')) navigate('/dashboard'); }}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            End Session
          </button>
        </div>
      </div>

      <div className="w-full h-1 rounded-full mb-6" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366F1, #22D3EE)' }}
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div
            className="glass p-6 rounded-2xl"
            style={{ border: '1px solid rgba(99,102,241,0.15)', boxShadow: '0 0 30px rgba(99,102,241,0.06)' }}
          >
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                <span className="tag tag-primary text-xs">Q{currentIdx + 1}</span>
                {currentQuestion?.category && (
                  <span className="tag tag-secondary text-xs capitalize">{currentQuestion.category.replace(/-/g, ' ')}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
                <Clock size={11} />
                <span className="font-mono">{formatTime(questionTimer)}</span>
              </div>
            </div>

            {currentQuestion && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Brain size={15} style={{ color: '#6366F1' }} />
                </div>
                <p className="text-gray-100 leading-relaxed text-base font-medium">{currentQuestion.text}</p>
              </div>
            )}

            {!isSupported && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#FCD34D' }}>
                <AlertCircle size={14} />
                <span>Speech recognition requires Chrome or Edge. Type your answer below.</span>
              </div>
            )}
          </div>

          <div className="glass p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Your Answer</p>
              {displayText && (
                <span className="text-xs text-gray-600">
                  {displayText.split(' ').filter(Boolean).length} words
                </span>
              )}
            </div>

            <div
              className="min-h-32 rounded-xl p-4 mb-4 relative"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {displayText ? (
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {currentAnswer}
                  {isListening && (
                    <span className="text-gray-400">{interimTranscript}</span>
                  )}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center h-28 text-center gap-2">
                  {isListening ? (
                    <>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map(i => (
                          <div
                            key={i}
                            className="w-1 rounded-full"
                            style={{
                              background: '#6366F1',
                              height: `${20 + Math.sin(i * 0.8) * 12}px`,
                              animation: `barPulse 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">Listening... speak your answer</p>
                    </>
                  ) : (
                    <>
                      <Mic size={20} className="text-gray-700" />
                      <p className="text-xs text-gray-500">
                        {isSupported ? 'Press Record to start speaking' : 'Type your answer in the field below'}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {!isSupported && (
              <textarea
                value={currentAnswer}
                onChange={e => setAnswers(prev => ({ ...prev, [currentIdx]: e.target.value }))}
                placeholder="Type your answer here..."
                rows={4}
                className="input-field resize-none mb-4"
              />
            )}

            <div className="flex items-center gap-3">
              {isSupported && (
                <>
                  {!isListening ? (
                    <button
                      onClick={handleStartRecording}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{
                        background: 'rgba(99,102,241,0.15)',
                        border: '1px solid rgba(99,102,241,0.3)',
                        color: '#818CF8',
                      }}
                    >
                      <Mic size={15} />
                      {currentAnswer ? 'Continue' : 'Start Recording'}
                    </button>
                  ) : (
                    <button
                      onClick={handleStopRecording}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium animate-recording-pulse"
                      style={{
                        background: 'rgba(239,68,68,0.15)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#F87171',
                      }}
                    >
                      <Square size={13} fill="#F87171" />
                      Stop Recording
                    </button>
                  )}

                  {currentAnswer && (
                    <button
                      onClick={() => { resetTranscript(); setAnswers(prev => ({ ...prev, [currentIdx]: '' })); }}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-300 transition-colors"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <RotateCcw size={13} />
                      Retry
                    </button>
                  )}
                </>
              )}

              <button
                onClick={handleNextQuestion}
                disabled={!currentAnswer && !transcript}
                className="ml-auto btn-primary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentIdx < questions.length - 1 ? (
                  <>Next <ChevronRight size={14} /></>
                ) : (
                  <>Submit <CheckCircle size={14} /></>
                )}
              </button>
            </div>
          </div>

          {questions.length > 0 && (
            <div className="glass p-4 rounded-2xl">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-medium">Progress</p>
              <div className="flex gap-2 flex-wrap">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200"
                    style={{
                      background: i < currentIdx
                        ? 'rgba(34,197,94,0.2)'
                        : i === currentIdx
                        ? 'rgba(99,102,241,0.25)'
                        : 'rgba(255,255,255,0.05)',
                      border: i === currentIdx ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.06)',
                      color: i < currentIdx ? '#22C55E' : i === currentIdx ? '#818CF8' : '#6B7280',
                    }}
                  >
                    {i < currentIdx ? '✓' : i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <VideoPanel
            isRecording={isListening}
            emotion={behavior.emotion}
            eyeContact={behavior.eyeContact}
            confidence={behavior.confidence}
            isListening={isListening}
            onStreamReady={setStream}
          />
        </div>
      </div>

      <style>{`
        @keyframes barPulse {
          0% { height: 12px; }
          100% { height: 28px; }
        }
      `}</style>
    </div>
  );
}
