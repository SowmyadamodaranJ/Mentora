import { useState } from 'react';
import { User, Save, Shield, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [targetRole, setTargetRole] = useState(profile?.target_role || '');
  const [careerLevel, setCareerLevel] = useState(profile?.career_level || 'mid');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await updateProfile({ full_name: fullName, target_role: targetRole, career_level: careerLevel });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-heading font-bold text-2xl text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      <div className="space-y-5 animate-slide-up">
        <div className="glass p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <User size={15} style={{ color: '#818CF8' }} />
            </div>
            <h2 className="font-heading font-semibold text-white">Profile Information</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366F1, #A78BFA)' }}
              >
                {(fullName || user?.email || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">{fullName || 'Your Name'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Target Role</label>
              <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g., Senior Software Engineer" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Career Level</label>
              <select value={careerLevel} onChange={e => setCareerLevel(e.target.value)} className="select-field">
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (2-5 years)</option>
                <option value="senior">Senior Level (5-8 years)</option>
                <option value="lead">Lead / Manager (8+ years)</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="glass p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.1)' }}>
              <Shield size={15} style={{ color: '#22D3EE' }} />
            </div>
            <h2 className="font-heading font-semibold text-white">Account</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div>
                <p className="text-sm text-gray-300">Email Address</p>
                <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
              </div>
              <span className="tag tag-success text-xs">Verified</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div>
                <p className="text-sm text-gray-300">Member Since</p>
                <p className="text-xs text-gray-500 mt-0.5">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '--'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.1)' }}>
              <Palette size={15} style={{ color: '#A78BFA' }} />
            </div>
            <h2 className="font-heading font-semibold text-white">Interview Preferences</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-400">
            {[
              { label: 'Speech Recognition', desc: 'Auto-detect voice answers', enabled: true },
              { label: 'Webcam Analysis', desc: 'Emotion and behavior detection', enabled: true },
              { label: 'AI Suggestions', desc: 'Real-time coaching hints', enabled: true },
            ].map(({ label, desc, enabled }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div>
                  <p className="text-gray-300 font-medium">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <div
                  className="w-10 h-5 rounded-full relative cursor-pointer transition-all duration-200"
                  style={{ background: enabled ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)' }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
                    style={{ left: enabled ? '22px' : '2px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
