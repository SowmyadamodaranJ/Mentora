import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Target, Mic, TrendingUp, Play, Clock, ChevronRight,
  Award, Activity, BarChart3, Calendar
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { getInterviewsForUser } from '../lib/localDb';
import { Interview, InterviewFeedback } from '../types';
import StatCard from '../components/ui/StatCard';
import SetupModal from '../components/interview/SetupModal';
import { InterviewConfig } from '../types';

const typeColors: Record<string, string> = {
  technical: '#6366F1',
  hr: '#22D3EE',
  behavioral: '#A78BFA',
  communication: '#22C55E',
};

const difficultyColors: Record<string, string> = {
  easy: '#22C55E',
  medium: '#F59E0B',
  hard: '#EF4444',
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark p-3 rounded-xl text-xs space-y-1" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-gray-400 mb-2">{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-gray-300 capitalize">{entry.name}:</span>
          <span className="text-white font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [chartData, setChartData] = useState<Array<{ date: string; confidence: number; communication: number; technical: number }>>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    const data = getInterviewsForUser(user!.id, { status: 'completed', ascending: false, limit: 10 });
    setInterviews(data);
    const cd = data.slice().reverse().map(iv => {
      const fb = (iv.interview_feedback || [])[0];
      const d = new Date(iv.created_at);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        confidence: fb?.confidence_score || 0,
        communication: fb?.communication_score || 0,
        technical: fb?.technical_score || 0,
      };
    });
    setChartData(cd);
    setLoading(false);
  }

  function handleStartInterview(config: InterviewConfig) {
    setShowSetup(false);
    navigate('/interview', { state: { config } });
  }

  const avgConfidence = interviews.length
    ? Math.round(interviews.reduce((s, iv) => s + ((iv.interview_feedback?.[0] as InterviewFeedback)?.confidence_score || 0), 0) / interviews.length)
    : 0;
  const avgComm = interviews.length
    ? Math.round(interviews.reduce((s, iv) => s + ((iv.interview_feedback?.[0] as InterviewFeedback)?.communication_score || 0), 0) / interviews.length)
    : 0;
  const avgTech = interviews.length
    ? Math.round(interviews.reduce((s, iv) => s + ((iv.interview_feedback?.[0] as InterviewFeedback)?.technical_score || 0), 0) / interviews.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {showSetup && (
        <SetupModal onStart={handleStartInterview} onClose={() => setShowSetup(false)} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <p className="text-sm text-gray-500 font-medium">{greeting},</p>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white mt-0.5">
            {displayName} <span className="wave">👋</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {interviews.length > 0
              ? `You have completed ${interviews.length} interview${interviews.length > 1 ? 's' : ''}. Keep up the great work!`
              : 'Start your first AI interview session to begin your journey.'}
          </p>
        </div>
        <button onClick={() => setShowSetup(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Play size={15} />
          New Interview
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <StatCard
          label="Completed"
          value={interviews.length}
          subtitle="Total sessions"
          icon={Activity}
          color="primary"
        />
        <StatCard
          label="Confidence"
          value={`${avgConfidence}%`}
          subtitle="Average score"
          icon={Target}
          color="secondary"
          trend={avgConfidence > 0 ? { value: 5, positive: true } : undefined}
        />
        <StatCard
          label="Communication"
          value={`${avgComm}%`}
          subtitle="Average score"
          icon={Mic}
          color="accent"
          trend={avgComm > 0 ? { value: 3, positive: true } : undefined}
        />
        <StatCard
          label="Technical"
          value={`${avgTech}%`}
          subtitle="Average score"
          icon={Brain}
          color="success"
          trend={avgTech > 0 ? { value: 8, positive: true } : undefined}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-semibold text-white">Performance Trends</h2>
              <p className="text-xs text-gray-500 mt-0.5">Score evolution across sessions</p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { label: 'Confidence', color: '#6366F1' },
                { label: 'Communication', color: '#22D3EE' },
                { label: 'Technical', color: '#A78BFA' },
              ].map(({ label, color }) => (
                <div key={label} className="hidden sm:flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gConf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gComm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTech" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="confidence" stroke="#6366F1" strokeWidth={2} fill="url(#gConf)" dot={{ fill: '#6366F1', r: 3, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="communication" stroke="#22D3EE" strokeWidth={2} fill="url(#gComm)" dot={{ fill: '#22D3EE', r: 3, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="technical" stroke="#A78BFA" strokeWidth={2} fill="url(#gTech)" dot={{ fill: '#A78BFA', r: 3, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <BarChart3 size={32} className="text-gray-700 mb-3" />
              <p className="text-gray-500 text-sm">Complete interviews to see your trends</p>
            </div>
          )}
        </div>

        <div className="glass p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-white">Quick Start</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Technical Interview', type: 'technical', desc: '5 questions · Medium', color: '#6366F1' },
              { label: 'HR Interview', type: 'hr', desc: '5 questions · Easy', color: '#22D3EE' },
              { label: 'Behavioral', type: 'behavioral', desc: '5 questions · Medium', color: '#A78BFA' },
              { label: 'Communication', type: 'communication', desc: '5 questions · Hard', color: '#22C55E' },
            ].map(({ label, type, desc, color }) => (
              <button
                key={type}
                onClick={() => navigate('/interview', { state: { config: { type, role: 'Software Engineer', difficulty: 'medium', questionCount: 5 } } })}
                className="w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 group text-left"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = `${color}12`)}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                    <Play size={12} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-heading font-semibold text-white">Recent Sessions</h2>
            <p className="text-xs text-gray-500 mt-0.5">Your latest interview history</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-sm font-medium flex items-center gap-1 transition-colors"
            style={{ color: '#818CF8' }}
          >
            View all <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : interviews.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.08)' }}>
              <Calendar size={24} style={{ color: '#6366F1' }} />
            </div>
            <p className="text-gray-300 font-medium mb-1">No interviews yet</p>
            <p className="text-gray-500 text-sm mb-4">Start your first session to build your coaching history</p>
            <button onClick={() => setShowSetup(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Play size={14} />
              Start First Interview
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.slice(0, 5).map(iv => {
              const fb = (iv.interview_feedback?.[0] as InterviewFeedback | undefined);
              const date = new Date(iv.created_at);
              return (
                <button
                  key={iv.id}
                  onClick={() => fb && navigate(`/feedback/${iv.id}`)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${typeColors[iv.type]}18` }}
                  >
                    <Brain size={16} style={{ color: typeColors[iv.type] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-200 capitalize">{iv.type} Interview</span>
                      <span className="tag" style={{ background: `${difficultyColors[iv.difficulty]}15`, color: difficultyColors[iv.difficulty], border: `1px solid ${difficultyColors[iv.difficulty]}30`, fontSize: '10px', padding: '1px 8px' }}>
                        {iv.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={10} />{date.toLocaleDateString()}
                      </span>
                      {iv.role && <span className="text-xs text-gray-600">· {iv.role}</span>}
                    </div>
                  </div>
                  {fb && (
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:flex items-center gap-3">
                        {[
                          { label: 'Conf', value: fb.confidence_score, color: '#6366F1' },
                          { label: 'Comm', value: fb.communication_score, color: '#22D3EE' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="text-center">
                            <p className="text-xs font-bold" style={{ color }}>{value}</p>
                            <p className="text-xs text-gray-600">{label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">{fb.overall_score}</p>
                        <p className="text-xs text-gray-500">Overall</p>
                      </div>
                    </div>
                  )}
                  {fb && <ChevronRight size={14} className="text-gray-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
