// ─────────────────────────────────────────────────────────────────────────────
// Local Auth – stores users in localStorage so the app works without Supabase
// ─────────────────────────────────────────────────────────────────────────────

export interface LocalUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  target_role: string;
  career_level: string;
  interviews_completed: number;
  avg_confidence_score: number;
  avg_communication_score: number;
  avg_technical_score: number;
  created_at: string;
}

const USERS_KEY = 'local_auth_users';
const SESSION_KEY = 'local_auth_session';

function getUsers(): (LocalUser & { _hash: string })[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: (LocalUser & { _hash: string })[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeHash(email: string, password: string): string {
  return btoa(`${email}::${password}`);
}

export function localSignUp(
  email: string,
  password: string,
  fullName: string
): { user: LocalUser | null; error: string | null } {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { user: null, error: 'An account with this email already exists.' };
  }

  const user: LocalUser = {
    id: generateId(),
    email: email.toLowerCase(),
    full_name: fullName,
    avatar_url: '',
    target_role: '',
    career_level: 'mid',
    interviews_completed: 0,
    avg_confidence_score: 0,
    avg_communication_score: 0,
    avg_technical_score: 0,
    created_at: new Date().toISOString(),
  };

  saveUsers([...users, { ...user, _hash: makeHash(email, password) }]);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { user, error: null };
}

export function localSignIn(
  email: string,
  password: string
): { user: LocalUser | null; error: string | null } {
  const users = getUsers();
  const match = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!match) {
    return { user: null, error: 'No account found with this email. Please sign up first.' };
  }

  if (match._hash !== makeHash(email, password)) {
    return { user: null, error: 'Incorrect password. Please try again.' };
  }

  const { _hash: _h, ...user } = match;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { user, error: null };
}

export function localGetSession(): LocalUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function localSignOut() {
  localStorage.removeItem(SESSION_KEY);
}

export function localUpdateProfile(userId: string, updates: Partial<LocalUser>) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  // Also update session if this is the logged-in user
  const session = localGetSession();
  if (session && session.id === userId) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, ...updates }));
  }
}
