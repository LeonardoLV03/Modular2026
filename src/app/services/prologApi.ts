const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

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

// Circuit breaker — si hay 5 fallos seguidos, bloquea temporalmente
let consecutiveFailures = 0;
const MAX_FAILURES = 5;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function postWithRetry<T>(path: string, body: object): Promise<T> {
  if (consecutiveFailures >= MAX_FAILURES) {
    throw new Error('Servidor no disponible. Intenta de nuevo en unos momentos.');
  }

  let lastError: Error = new Error('Error desconocido');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000), // timeout de 8 segundos
      });

      if (!res.ok) throw new Error(`Error ${res.status} en ${path}`);

      consecutiveFailures = 0; // reset en éxito
      return res.json() as Promise<T>;

    } catch (error) {
      lastError = error as Error;

      if (attempt < MAX_RETRIES) {
        // Backoff exponencial: 1s → 2s → 4s
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt - 1));
      }
    }
  }

  consecutiveFailures++;
  throw lastError;
}

export async function startConsultation(module: string | null) {
  return postWithRetry<{ sessionId: string; totalQuestions: number; firstQuestion: string }>(
    '/api/start-consultation',
    { module, answers: [] }
  );
}

export async function getNextQuestion(
  sessionId: string,
  module: string | null,
  answers: string[]
) {
  return postWithRetry<{ question: string; questionNumber: number; shouldFinish: boolean }>(
    '/api/next-question',
    { sessionId, module, answers }
  );
}

export async function getDiagnosis(
  sessionId: string,
  module: string | null,
  answers: string[]
): Promise<DiagnosisResponse> {
  return postWithRetry<DiagnosisResponse>(
    '/api/diagnosis',
    { sessionId, module, answers }
  );
}

export async function endConsultation(sessionId: string) {
  return postWithRetry<{ success: boolean }>(
    '/api/end-consultation',
    { sessionId }
  );
}