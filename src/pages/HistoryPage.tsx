import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Clock, ChevronRight, Filter, Search, Calendar,
  Play, Trash2, TrendingUp
} from 'lucide-react';
import { getInterviewsForUser, deleteInterview as dbDeleteInterview } from '../lib/localDb';
import { useAuth } from '../contexts/AuthContext';
import { Interview, InterviewFeedback, InterviewType, Difficulty } from '../types';

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

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<InterviewType | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
    setLoading(true);
    const data = getInterviewsForUser(user!.id, { ascending: false });
    setInterviews(data);
    setLoading(false);
  }

  async function deleteInterview(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm('Delete this interview session?')) return;
    dbDeleteInterview(id);
    setInterviews(prev => prev.filter(iv => iv.id !== id));
  }

  const filtered = interviews.filter(iv => {
    const matchSearch = !search || iv.role.toLowerCase().includes(search.toLowerCase()) || iv.type.includes(search.toLowerCase());
    const matchType = filterType === 'all' || iv.type === filterType;
    const matchDiff = filterDifficulty === 'all' || iv.difficulty === filterDifficulty;
    return matchSearch && matchType && matchDiff;
  });

  function formatDuration(secs: number) {
    if (!secs) return '--';
    const m = Math.floor(secs / 60);
    return `${m}m`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="font-heading font-bold text-2xl text-white">Interview History</h1>
          <p className="text-gray-400 text-sm mt-1">{interviews.length} session{interviews.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <button onClick={() => navigate('/interview')} className="btn-primary flex items-center gap-2 text-sm">
          <Play size={14} />
          New Interview
        </button>
      </div>

      <div className="glass p-4 mb-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by role or type..."
              className="input-field pl-9"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as InterviewType | 'all')}
                className="select-field pl-8 pr-8 py-2.5 text-sm"
                style={{ minWidth: '140px' }}
              >
                <option value="all">All Types</option>
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="behavioral">Behavioral</option>
                <option value="communication">Communication</option>
              </select>
              <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterDifficulty}
                onChange={e => setFilterDifficulty(e.target.value as Difficulty | 'all')}
                className="select-field pr-8 py-2.5 text-sm"
                style={{ minWidth: '130px' }}
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass p-16 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.08)' }}>
            <Calendar size={24} style={{ color: '#6366F1' }} />
          </div>
          <p className="text-gray-300 font-medium mb-1">
            {search || filterType !== 'all' || filterDifficulty !== 'all' ? 'No matching interviews' : 'No interviews yet'}
          </p>
          <p className="text-gray-500 text-sm mb-4">
            {search || filterType !== 'all' ? 'Try adjusting your filters' : 'Start your first session to build history'}
          </p>
          {!(search || filterType !== 'all') && (
            <button onClick={() => navigate('/interview')} className="btn-primary text-sm flex items-center gap-2">
              <Play size={14} />Start Interview
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 animate-slide-up">
          {filtered.map(iv => {
            const fb = (iv.interview_feedback?.[0] as InterviewFeedback | undefined);
            const date = new Date(iv.created_at);
            const typeColor = typeColors[iv.type] || '#6366F1';

            return (
              <div
                key={iv.id}
                onClick={() => fb && navigate(`/feedback/${iv.id}`)}
                className="glass glass-hover p-5 flex items-center gap-5"
                style={{ cursor: fb ? 'pointer' : 'default' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${typeColor}18` }}
                >
                  <Brain size={20} style={{ color: typeColor }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-sm font-semibold text-gray-100 capitalize">{iv.type} Interview</span>
                    <span
                      className="tag text-xs"
                      style={{
                        background: `${difficultyColors[iv.difficulty]}15`,
                        color: difficultyColors[iv.difficulty],
                        border: `1px solid ${difficultyColors[iv.difficulty]}30`,
                        padding: '1px 8px',
                        fontSize: '11px',
                      }}
                    >
                      {iv.difficulty}
                    </span>
                    <span
                      className="tag text-xs"
                      style={{
                        background: iv.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                        color: iv.status === 'completed' ? '#22C55E' : '#F59E0B',
                        border: `1px solid ${iv.status === 'completed' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
                        padding: '1px 8px',
                        fontSize: '11px',
                      }}
                    >
                      {iv.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {iv.role && <span className="text-xs text-gray-400">{iv.role}</span>}
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Calendar size={10} />
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {iv.duration_seconds > 0 && (
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock size={10} />
                        {formatDuration(iv.duration_seconds)}
                      </span>
                    )}
                    <span className="text-xs text-gray-600">{iv.question_count} questions</span>
                  </div>
                </div>

                {fb && (
                  <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                    {[
                      { label: 'Confidence', value: fb.confidence_score, color: '#6366F1' },
                      { label: 'Communication', value: fb.communication_score, color: '#22D3EE' },
                      { label: 'Overall', value: fb.overall_score, color: '#A78BFA' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="text-center">
                        <p className="text-base font-bold" style={{ color }}>{value}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-shrink-0">
                  {fb && <ChevronRight size={16} className="text-gray-600" />}
                  <button
                    onClick={e => deleteInterview(iv.id, e)}
                    className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
