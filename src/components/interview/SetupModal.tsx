import { useState } from 'react';
import { X, Briefcase, Code, Users, MessageSquare, ChevronDown } from 'lucide-react';
import { InterviewConfig, InterviewType, Difficulty } from '../../types';

interface SetupModalProps {
  onStart: (config: InterviewConfig) => void;
  onClose: () => void;
}

const interviewTypes: { type: InterviewType; label: string; description: string; icon: typeof Code }[] = [
  { type: 'technical', label: 'Technical', description: 'Algorithms, system design, coding', icon: Code },
  { type: 'hr', label: 'HR', description: 'Culture fit, motivations, goals', icon: Users },
  { type: 'behavioral', label: 'Behavioral', description: 'STAR-based experience questions', icon: Briefcase },
  { type: 'communication', label: 'Communication', description: 'Clarity, persuasion, storytelling', icon: MessageSquare },
];

const difficulties: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Entry level concepts', color: '#22C55E' },
  { value: 'medium', label: 'Medium', desc: 'Mid-level depth', color: '#F59E0B' },
  { value: 'hard', label: 'Hard', desc: 'Senior/expert level', color: '#EF4444' },
];

export default function SetupModal({ onStart, onClose }: SetupModalProps) {
  const [type, setType] = useState<InterviewType>('technical');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [jobDesc, setJobDesc] = useState('');

  function handleStart() {
    if (!role.trim()) return;
    onStart({ type, role: role.trim(), difficulty, questionCount, jobDescription: jobDesc });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden animate-slide-up"
        style={{
          background: 'rgba(16, 20, 35, 0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="font-heading font-bold text-white text-lg">Configure Your Interview</h2>
            <p className="text-sm text-gray-500 mt-0.5">Set up your personalized AI coaching session</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Interview Type</label>
            <div className="grid grid-cols-2 gap-2.5">
              {interviewTypes.map(({ type: t, label, description, icon: Icon }) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="flex items-start gap-3 p-3.5 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: type === t ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    border: type === t ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: type === t ? '0 0 15px rgba(99,102,241,0.1)' : 'none',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: type === t ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <Icon size={15} style={{ color: type === t ? '#818CF8' : '#9CA3AF' }} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${type === t ? 'text-white' : 'text-gray-300'}`}>{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Role</label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g., Senior Software Engineer, Product Manager"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Difficulty Level</label>
            <div className="flex gap-2.5">
              {difficulties.map(({ value, label, desc, color }) => (
                <button
                  key={value}
                  onClick={() => setDifficulty(value)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-center transition-all duration-200"
                  style={{
                    background: difficulty === value ? `${color}18` : 'rgba(255,255,255,0.03)',
                    border: difficulty === value ? `1px solid ${color}50` : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p className={`text-sm font-semibold`} style={{ color: difficulty === value ? color : '#9CA3AF' }}>{label}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Questions <span className="text-gray-500 font-normal">({questionCount})</span>
            </label>
            <input
              type="range"
              min={3}
              max={10}
              value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: '#6366F1' }}
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>3</span>
              <span>10</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Description <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste the job description for more tailored questions..."
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={!role.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
}
