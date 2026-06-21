// ─────────────────────────────────────────────────────────────────────────────
// Local Database – persists interview data in localStorage
// Replaces all Supabase table operations so the app works with no backend.
// ─────────────────────────────────────────────────────────────────────────────
import { Interview, InterviewFeedback, InterviewType, Difficulty } from '../types';

// ── Storage keys ─────────────────────────────────────────────────────────────
const INTERVIEWS_KEY = 'local_db_interviews';
const FEEDBACK_KEY = 'local_db_feedback';

function uid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Interviews ────────────────────────────────────────────────────────────────

type StoredInterview = Interview & { interview_feedback?: InterviewFeedback[] };

function getAllInterviews(): StoredInterview[] {
  try { return JSON.parse(localStorage.getItem(INTERVIEWS_KEY) || '[]'); }
  catch { return []; }
}

function saveAllInterviews(data: StoredInterview[]) {
  localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(data));
}

export function createInterview(fields: {
  user_id: string;
  type: InterviewType;
  role: string;
  difficulty: Difficulty;
  question_count: number;
}): StoredInterview {
  const iv: StoredInterview = {
    id: uid(),
    user_id: fields.user_id,
    type: fields.type,
    role: fields.role,
    difficulty: fields.difficulty,
    question_count: fields.question_count,
    status: 'in_progress',
    duration_seconds: 0,
    created_at: new Date().toISOString(),
    completed_at: null,
    interview_feedback: [],
  };
  saveAllInterviews([...getAllInterviews(), iv]);
  return iv;
}

export function updateInterview(id: string, updates: Partial<StoredInterview>) {
  const all = getAllInterviews();
  const idx = all.findIndex(iv => iv.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updates };
    saveAllInterviews(all);
  }
}

export function deleteInterview(id: string) {
  saveAllInterviews(getAllInterviews().filter(iv => iv.id !== id));
  // Also clean up feedback
  saveFeedback(getAllFeedback().filter(f => f.interview_id !== id));
}

export function getInterviewsForUser(
  userId: string,
  opts: { status?: string; ascending?: boolean; limit?: number } = {}
): StoredInterview[] {
  let list = getAllInterviews()
    .filter(iv => iv.user_id === userId)
    .filter(iv => !opts.status || iv.status === opts.status);

  // attach feedback
  const feedback = getAllFeedback();
  list = list.map(iv => ({
    ...iv,
    interview_feedback: feedback.filter(f => f.interview_id === iv.id),
  }));

  list.sort((a, b) => {
    const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return opts.ascending ? diff : -diff;
  });

  if (opts.limit) list = list.slice(0, opts.limit);
  return list;
}

export function getInterviewById(id: string): StoredInterview | null {
  const iv = getAllInterviews().find(i => i.id === id) || null;
  if (!iv) return null;
  const feedback = getAllFeedback().filter(f => f.interview_id === id);
  return { ...iv, interview_feedback: feedback };
}

// ── Feedback ─────────────────────────────────────────────────────────────────

function getAllFeedback(): InterviewFeedback[] {
  try { return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]'); }
  catch { return []; }
}

function saveFeedback(data: InterviewFeedback[]) {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(data));
}

export function saveFeedbackForInterview(feedback: Omit<InterviewFeedback, 'id'>) {
  const entry: InterviewFeedback = { id: uid(), ...feedback };
  saveFeedback([...getAllFeedback(), entry]);
  return entry;
}

export function getFeedbackForInterview(
  interviewId: string,
  userId: string
): InterviewFeedback | null {
  return getAllFeedback().find(
    f => f.interview_id === interviewId && f.user_id === userId
  ) || null;
}
