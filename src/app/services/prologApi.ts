const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export interface DiagnosisResult {
  caseType: string;
  confidence: number;
  level: string;
  action: string;
}

export interface DiagnosisResponse {
  isEmergency: boolean;
  severity: string;
  recommendations: string[];
  caseType?: string;
  confidence?: number;
  action?: string;
  results?: DiagnosisResult[];
  exactOnly?: boolean;
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Error ${res.status} en ${path}`);
  return res.json() as Promise<T>;
}

export async function startConsultation(module: string | null) {
  return post<{ sessionId: string; totalQuestions: number; firstQuestion: string }>(
    '/api/start-consultation',
    { module, answers: [] }
  );
}

export async function getNextQuestion(
  sessionId: string,
  module: string | null,
  answers: string[]
) {
  return post<{ question: string; questionNumber: number; shouldFinish: boolean }>(
    '/api/next-question',
    { sessionId, module, answers }
  );
}

export async function getDiagnosis(
  sessionId: string,
  module: string | null,
  answers: string[]
): Promise<DiagnosisResponse> {
  return post<DiagnosisResponse>(
    '/api/diagnosis',
    { sessionId, module, answers }
  );
}

export async function endConsultation(sessionId: string) {
  return post<{ success: boolean }>(
    '/api/end-consultation',
    { sessionId }
  );
}