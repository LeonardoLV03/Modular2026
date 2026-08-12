const API_URL = import.meta.env.VITE_STATS_URL ?? 'http://localhost:3001';

const TOKEN_KEY = 'modular_user_token';
const USER_KEY = 'modular_user_data';

export interface UserData {
  id: string;
  email: string;
  username: string;
  xp: number;
  level: number;
  streak: { current: number; longest: number; lastActivityDate: string | null };
  completedLessons: string[];
}

export interface LessonSummary {
  _id: string;
  module: string;
  order: number;
  title: string;
  xpReward: number;
}

export interface LessonQuestion {
  question: string;
  options: string[];
}

export interface LessonDetail {
  _id: string;
  module: string;
  order: number;
  title: string;
  xpReward: number;
  questions: LessonQuestion[];
}

export interface CompleteLessonResult {
  results: { isCorrect: boolean; correctIndex: number; explanation: string }[];
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
  xp: number;
  level: number;
  leveledUp: boolean;
  streak: { current: number; longest: number; lastActivityDate: string | null };
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): UserData | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveSession(token: string, user: UserData) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function updateStoredUser(patch: Partial<UserData>) {
  const current = getStoredUser();
  if (!current) return;
  const updated = { ...current, ...patch };
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public needsVerification?: boolean) {
    super(message);
  }
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || 'Error en la petición', res.status, data.needsVerification);
  }

  return data;
}

export async function register(email: string, password: string, username: string) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  });
}

export async function login(email: string, password: string): Promise<UserData> {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  saveSession(data.token, data.user);
  return data.user;
}

export async function resendVerification(email: string) {
  return request('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function getMe(): Promise<UserData> {
  const token = getToken();
  return request('/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getLessons(): Promise<LessonSummary[]> {
  return request('/api/lessons');
}

export async function getLesson(id: string): Promise<LessonDetail> {
  const token = getToken();
  return request(`/api/lessons/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function completeLesson(id: string, answers: number[]): Promise<CompleteLessonResult> {
  const token = getToken();
  return request(`/api/lessons/${id}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ answers }),
  });
}

export function logout() {
  clearSession();
}