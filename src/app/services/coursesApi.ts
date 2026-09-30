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
  requiredLevel?: number;
}

// Tipos de pregunta soportados. "single" es el formato original
// (selección única); los demás son las variantes nuevas. El backend
// asume "single" si una pregunta vieja no trae "type".
export type QuestionType = 'single' | 'boolean' | 'order' | 'match';

export interface SingleQuestion {
  type: 'single' | 'boolean';
  question: string;
  options: string[];
}

export interface OrderQuestion {
  type: 'order';
  question: string;
  steps: string[];
}

export interface MatchQuestion {
  type: 'match';
  question: string;
  left: string[];
  right: string[];
}

export type LessonQuestion = SingleQuestion | OrderQuestion | MatchQuestion;

// La respuesta que se manda al backend depende del tipo:
//   single/boolean → número (índice elegido)
//   order          → número[] (orden en que el usuario dejó los pasos)
//   match          → número[] (para cada left[i], índice de right elegido)
export type LessonAnswer = number | number[];

export interface LessonDetail {
  _id: string;
  module: string;
  order: number;
  title: string;
  xpReward: number;
  requiredLevel?: number;
  questions: LessonQuestion[];
}

export interface CompleteLessonResult {
  results: { isCorrect: boolean; correctIndex?: number; correct?: unknown; explanation: string }[];
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

export type GoogleLoginResult =
  | { needsUsername: true; pendingToken: string; suggestedUsername: string }
  | { needsUsername: false; user: UserData };

export async function googleLogin(credential: string): Promise<GoogleLoginResult> {
  const data = await request('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });

  if (data.needsUsername) {
    return {
      needsUsername: true,
      pendingToken: data.pendingToken,
      suggestedUsername: data.suggestedUsername,
    };
  }

  saveSession(data.token, data.user);
  return { needsUsername: false, user: data.user };
}

export async function completeGoogleSignup(pendingToken: string, username: string): Promise<UserData> {
  const data = await request('/api/auth/google/complete', {
    method: 'POST',
    body: JSON.stringify({ pendingToken, username }),
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

export async function verifyEmail(token: string) {
  return request(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
}

export async function forgotPassword(email: string) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
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

export async function completeLesson(id: string, answers: LessonAnswer[]): Promise<CompleteLessonResult> {
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