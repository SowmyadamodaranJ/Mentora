import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Brain, Mic, Eye, Play, BarChart3, Target
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { getInterviewsForUser } from '../lib/localDb';
import { useAuth } from '../contexts/AuthContext';
import { Interview, InterviewFeedback } from '../types';

const COLORS = ['#6366F1', '#22D3EE', '#A78BFA', '#22C55E'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark p-3 rounded-xl text-xs space-y-1" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-gray-400 mb-1.5">{label}</p>
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

export default function AnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    const data = getInterviewsForUser(user!.id, { status: 'completed', ascending: true });
    setInterviews(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F1A' }}>
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.08)' }}>
          <BarChart3 size={24} style={{ color: '#6366F1' }} />
        </div>
        <h2 className="font-heading font-bold text-xl text-white mb-2">No Analytics Yet</h2>
        <p className="text-gray-400 text-sm mb-6">Complete at least one interview to see your analytics</p>
        <button onClick={() => navigate('/interview')} className="btn-primary flex items-center gap-2 text-sm">
          <Play size={14} />Start Interview
        </button>
      </div>
    );
  }

  const trendData = interviews.map(iv => {
    const fb = (iv.interview_feedback?.[0] as InterviewFeedback | undefined);
    const d = new Date(iv.created_at);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      confidence: fb?.confidence_score || 0,
      communication: fb?.communication_score || 0,
      technical: fb?.technical_score || 0,
      overall: fb?.overall_score || 0,
    };
  });

  const typeDistribution = Object.entries(
    interviews.reduce((acc: Record<string, number>, iv) => {
      acc[iv.type] = (acc[iv.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  const difficultyData = ['easy', 'medium', 'hard'].map(diff => ({
    difficulty: diff.charAt(0).toUpperCase() + diff.slice(1),
    count: interviews.filter(iv => iv.difficulty === diff).length,
    avgScore: (() => {
      const fbs = interviews
        .filter(iv => iv.difficulty === diff)
        .map(iv => (iv.interview_feedback?.[0] as InterviewFeedback | undefined)?.overall_score || 0)
        .filter(s => s > 0);
      return fbs.length ? Math.round(fbs.reduce((a, b) => a + b, 0) / fbs.length) : 0;
    })(),
  }));

  const allFeedbacks = interviews
    .map(iv => iv.interview_feedback?.[0] as InterviewFeedback | undefined)
    .filter(Boolean) as InterviewFeedback[];

  const avgConf = allFeedbacks.length ? Math.round(allFeedbacks.reduce((s, f) => s + f.confidence_score, 0) / allFeedbacks.length) : 0;
  const avgComm = allFeedbacks.length ? Math.round(allFeedbacks.reduce((s, f) => s + f.communication_score, 0) / allFeedbacks.length) : 0;
  const avgTech = allFeedbacks.length ? Math.round(allFeedbacks.reduce((s, f) => s + f.technical_score, 0) / allFeedbacks.length) : 0;
  const avgOverall = allFeedbacks.length ? Math.round(allFeedbacks.reduce((s, f) => s + f.overall_score, 0) / allFeedbacks.length) : 0;

  const latest = allFeedbacks[allFeedbacks.length - 1];
  const prev = allFeedbacks.length > 1 ? allFeedbacks[allFeedbacks.length - 2] : null;
  const overallTrend = prev ? latest?.overall_score - prev.overall_score : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Track your progress across {interviews.length} sessions</p>
        </div>
        <button onClick={() => navigate('/interview')} className="btn-primary flex items-center gap-2 text-sm">
          <Play size={14} />New Interview
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-slide-up">
        {[
          { label: 'Avg Confidence', value: `${avgConf}%`, icon: Brain, color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
          { label: 'Avg Communication', value: `${avgComm}%`, icon: Mic, color: '#22D3EE', bg: 'rgba(34,211,238,0.1)' },
          { label: 'Avg Technical', value: `${avgTech}%`, icon: Target, color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
          {
            label: 'Overall Score',
            value: `${avgOverall}%`,
            icon: TrendingUp,
            color: overallTrend >= 0 ? '#22C55E' : '#EF4444',
            bg: overallTrend >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            trend: overallTrend,
          },
        ].map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div key={label} className="glass p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p className="text-xl font-heading font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            {trend !== undefined && trend !== 0 && (
              <p className="text-xs mt-1 font-medium" style={{ color: trend > 0 ? '#22C55E' : '#EF4444' }}>
                {trend > 0 ? '+' : ''}{trend} from last session
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="glass p-6 mb-6 animate-slide-up">
        <h2 className="font-heading font-semibold text-white mb-5">Score Trends Over Time</h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              {[
                { id: 'gConf', color: '#6366F1' },
                { id: 'gComm', color: '#22D3EE' },
                { id: 'gTech', color: '#A78BFA' },
                { id: 'gOvrl', color: '#22C55E' },
              ].map(({ id, color }) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
            <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="confidence" stroke="#6366F1" strokeWidth={2} fill="url(#gConf)" dot={false} />
            <Area type="monotone" dataKey="communication" stroke="#22D3EE" strokeWidth={2} fill="url(#gComm)" dot={false} />
            <Area type="monotone" dataKey="technical" stroke="#A78BFA" strokeWidth={2} fill="url(#gTech)" dot={false} />
            <Area type="monotone" dataKey="overall" stroke="#22C55E" strokeWidth={2} fill="url(#gOvrl)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {[
            { label: 'Confidence', color: '#6366F1' },
            { label: 'Communication', color: '#22D3EE' },
            { label: 'Technical', color: '#A78BFA' },
            { label: 'Overall', color: '#22C55E' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6 animate-slide-up">
        <div className="glass p-6">
          <h2 className="font-heading font-semibold text-white mb-5">Interview Types</h2>
          {typeDistribution.length > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {typeDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} sessions`, '']} contentStyle={{ background: 'rgba(20,25,45,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#E5E7EB' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {typeDistribution.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-gray-400">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6">
          <h2 className="font-heading font-semibold text-white mb-5">Performance by Difficulty</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={difficultyData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
              <XAxis dataKey="difficulty" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(20,25,45,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#E5E7EB' }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="avgScore" name="Avg Score" fill="#6366F1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="count" name="Sessions" fill="#22D3EE" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {allFeedbacks.length > 0 && (
        <div className="glass p-6 animate-slide-up">
          <h2 className="font-heading font-semibold text-white mb-5">Overall Score Progress</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
              <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="overall"
                stroke="#22C55E"
                strokeWidth={2.5}
                dot={{ fill: '#22C55E', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
