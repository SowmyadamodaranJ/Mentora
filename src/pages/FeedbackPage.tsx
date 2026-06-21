import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Brain, ChevronDown, ChevronUp, Play, BarChart2, CheckCircle,
  AlertTriangle, Mic, Eye, Zap, TrendingUp, MessageSquare,
  ChevronRight, ArrowUpRight, Lightbulb
} from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getFeedbackForInterview, getInterviewById } from '../lib/localDb';
import { useAuth } from '../contexts/AuthContext';
import { InterviewFeedback, InterviewConfig } from '../types';
import ScoreRing from '../components/ui/ScoreRing';

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${value}%`, background: color, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
    </div>
  );
}

function QuestionAccordion({ qf, idx }: { qf: { question: string; transcript: string; scores: { relevance: number; clarity: number; structure: number; depth: number }; improved_answer: string; key_points_missed: string[] }; idx: number }) {
  const [open, setOpen] = useState(false);
  const avgScore = Math.round(Object.values(qf.scores).reduce((a, b) => a + b, 0) / 4);
  const color = avgScore >= 75 ? '#22C55E' : avgScore >= 55 ? '#F59E0B' : '#EF4444';

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: open ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8' }}
        >
          {idx + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-200 line-clamp-1">{qf.question}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{qf.transcript || 'No response recorded'}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-center">
            <p className="text-sm font-bold" style={{ color }}>{avgScore}</p>
            <p className="text-xs text-gray-600">Score</p>
          </div>
          {open ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-5 space-y-4 animate-fade-in">
          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Response Scores</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(qf.scores).map(([key, val]) => (
                <div key={key} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-lg font-bold" style={{ color: val >= 70 ? '#22C55E' : val >= 50 ? '#F59E0B' : '#EF4444' }}>{val}</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{key}</p>
                </div>
              ))}
            </div>
          </div>

          {qf.transcript && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Your Response</p>
              <div className="p-3 rounded-xl text-sm text-gray-300 leading-relaxed" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {qf.transcript}
              </div>
            </div>
          )}

          {qf.improved_answer && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight size={13} style={{ color: '#22D3EE' }} />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Improved Answer</p>
              </div>
              <div className="p-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.12)', color: '#CBD5E1' }}>
                {qf.improved_answer}
              </div>
            </div>
          )}

          {qf.key_points_missed?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Key Points to Add</p>
              <div className="space-y-1.5">
                {qf.key_points_missed.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    {pt}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(location.state?.feedback || null);
  const [config, setConfig] = useState<InterviewConfig | null>(location.state?.config || null);
  const [loading, setLoading] = useState(!feedback);

  useEffect(() => {
    if (!feedback && id && user) loadFeedback();
  }, [id, user]);

  async function loadFeedback() {
    setLoading(true);
    const fb = getFeedbackForInterview(id!, user!.id);
    if (fb) setFeedback(fb);

    const iv = getInterviewById(id!);
    if (iv) setConfig({ type: iv.type, role: iv.role, difficulty: iv.difficulty, questionCount: iv.question_count });
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F1A' }}>
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-400 mb-4">Feedback not found</p>
        <button onClick={() => navigate('/history')} className="btn-primary">View History</button>
      </div>
    );
  }

  const radarData = [
    { subject: 'Confidence', score: feedback.confidence_score },
    { subject: 'Communication', score: feedback.communication_score },
    { subject: 'Technical', score: feedback.technical_score },
    { subject: 'Relevance', score: Math.round((feedback.question_feedback || []).reduce((s: number, q: { scores: { relevance: number } }) => s + q.scores.relevance, 0) / Math.max((feedback.question_feedback || []).length, 1)) },
    { subject: 'Clarity', score: Math.round((feedback.question_feedback || []).reduce((s: number, q: { scores: { clarity: number } }) => s + q.scores.clarity, 0) / Math.max((feedback.question_feedback || []).length, 1)) },
    { subject: 'Structure', score: Math.round((feedback.question_feedback || []).reduce((s: number, q: { scores: { structure: number } }) => s + q.scores.structure, 0) / Math.max((feedback.question_feedback || []).length, 1)) },
  ];

  const overallColor = feedback.overall_score >= 75 ? '#22C55E' : feedback.overall_score >= 55 ? '#F59E0B' : '#EF4444';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} style={{ color: '#22C55E' }} />
            <span className="text-sm text-green-400 font-medium">Interview Complete</span>
          </div>
          <h1 className="font-heading font-bold text-2xl text-white">
            {config?.type ? `${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Interview` : 'Interview'} Feedback
          </h1>
          {config?.role && <p className="text-gray-400 text-sm mt-0.5">Role: {config.role}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/analytics')} className="btn-secondary flex items-center gap-2 text-sm">
            <BarChart2 size={14} />
            Analytics
          </button>
          <button onClick={() => navigate('/interview')} className="btn-primary flex items-center gap-2 text-sm">
            <Play size={14} />
            New Interview
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 glass p-6 flex flex-col items-center justify-center animate-slide-up">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-4">Overall Score</p>
          <div className="relative">
            <ScoreRing
              score={feedback.overall_score}
              label="Overall"
              color={feedback.overall_score >= 75 ? 'success' : feedback.overall_score >= 55 ? 'secondary' : 'error'}
              size={140}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-medium" style={{ color: overallColor }}>
              {feedback.overall_score >= 75 ? 'Excellent performance' : feedback.overall_score >= 55 ? 'Good progress' : 'Needs improvement'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 glass p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-white">Score Breakdown</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Confidence', score: feedback.confidence_score, color: '#6366F1', ring: 'primary' as const },
              { label: 'Communication', score: feedback.communication_score, color: '#22D3EE', ring: 'secondary' as const },
              { label: 'Technical', score: feedback.technical_score, color: '#A78BFA', ring: 'accent' as const },
            ].map(({ label, score, color, ring }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <ScoreRing score={score} label={label} color={ring} size={90} />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <ScoreBar label="Relevance" value={Math.round(radarData[3].score)} color="#22C55E" />
            <ScoreBar label="Clarity" value={Math.round(radarData[4].score)} color="#22D3EE" />
            <ScoreBar label="Structure" value={Math.round(radarData[5].score)} color="#A78BFA" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="glass p-6 animate-slide-up">
          <h2 className="font-heading font-semibold text-white mb-5">Performance Radar</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.2}
                dot={{ fill: '#6366F1', r: 3 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-6 animate-slide-up space-y-5">
          <h2 className="font-heading font-semibold text-white">Voice & Behavior</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Mic, label: 'Speaking Speed', value: `${feedback.voice_metrics?.words_per_minute || 0} WPM`, sub: feedback.voice_metrics?.speed || '', color: '#22D3EE' },
              { icon: MessageSquare, label: 'Tone', value: feedback.voice_metrics?.tone || 'N/A', sub: 'Detected tone', color: '#A78BFA' },
              { icon: Eye, label: 'Eye Contact', value: feedback.behavior_metrics?.eye_contact || 'N/A', sub: 'Quality', color: '#6366F1' },
              { icon: Brain, label: 'Emotion', value: feedback.behavior_metrics?.emotion || 'N/A', sub: `Engagement: ${feedback.behavior_metrics?.engagement_score || 0}%`, color: '#22C55E' },
            ].map(({ icon: Icon, label, value, sub, color }) => (
              <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} style={{ color }} />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-200 capitalize">{value}</p>
                <p className="text-xs text-gray-600 mt-0.5 capitalize">{sub}</p>
              </div>
            ))}
          </div>

          {feedback.voice_metrics?.filler_words > 0 && (
            <div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <p className="text-xs font-medium text-amber-400 mb-1.5">Filler Words Detected ({feedback.voice_metrics.filler_words})</p>
              <div className="flex flex-wrap gap-1.5">
                {(feedback.voice_metrics.filler_word_list || []).map((w: string) => (
                  <span key={w} className="tag" style={{ background: 'rgba(245,158,11,0.1)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.2)', fontSize: '11px', padding: '1px 8px' }}>
                    "{w}"
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass p-6 mb-8 animate-slide-up">
        <div className="flex items-center gap-2 mb-5">
          <Lightbulb size={16} style={{ color: '#F59E0B' }} />
          <h2 className="font-heading font-semibold text-white">AI Coach Suggestions</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {(feedback.suggestions || []).map((s: string, i: number) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: 'rgba(99,102,241,0.2)', color: '#818CF8' }}
              >
                {i + 1}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {feedback.analysis?.strengths?.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-6 mb-8 animate-slide-up">
          <div className="glass p-6">
            <h3 className="font-medium text-white flex items-center gap-2 mb-4">
              <CheckCircle size={14} style={{ color: '#22C55E' }} />
              Strengths
            </h3>
            <div className="space-y-2">
              {feedback.analysis.strengths.map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#22C55E' }} />
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div className="glass p-6">
            <h3 className="font-medium text-white flex items-center gap-2 mb-4">
              <TrendingUp size={14} style={{ color: '#F59E0B' }} />
              Areas to Improve
            </h3>
            <div className="space-y-2">
              {feedback.analysis.weaknesses.map((w: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#F59E0B' }} />
                  {w}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {feedback.question_feedback?.length > 0 && (
        <div className="glass p-6 animate-slide-up">
          <h2 className="font-heading font-semibold text-white mb-5">Question-by-Question Analysis</h2>
          <div className="space-y-3">
            {(feedback.question_feedback as Array<{ question: string; transcript: string; scores: { relevance: number; clarity: number; structure: number; depth: number }; improved_answer: string; key_points_missed: string[] }>).map((qf, i) => (
              <QuestionAccordion key={i} qf={qf} idx={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
