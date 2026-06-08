// src/app/services/prologApi.ts
// Servicio de conexión con el backend Prolog

const BASE_URL = import.meta.env.VITE_PROLOG_API_URL || 'http://localhost:5000';

export type Module = 'desmayo' | 'hemorragia' | 'asfixia' | 'quemadura';
export type Severity = 'high' | 'medium' | 'low';

// Tipos de respuesta 

export interface StartConsultationResponse {
  sessionId: string;
  totalQuestions: number;
  firstQuestion: string;
}

export interface NextQuestionResponse {
  question: string;
  questionNumber: number;
  shouldFinish?: boolean;
}

export interface DiagnosisResponse {
  isEmergency: boolean;
  severity: Severity;
  recommendations: string[];
  caseType?: string;
  confidence?: number;
  action?: string;
  results?: {
    caseType: string;
    confidence: number;
    action: string;
    level: string;
  }[];
  exactOnly?: boolean;
}

export interface EndConsultationResponse {
  success: boolean;
}

// Helper fetch con headers CORS 

async function apiPost<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// ── API pública ───────────────────────────────────────────────


// Inicia una nueva consulta y retorna la primera pregunta.
 
export async function startConsultation(
  module: Module
): Promise<StartConsultationResponse> {
  return apiPost<StartConsultationResponse>('/api/start-consultation', {
    module,
  });
}


// Obtiene la siguiente pregunta dado el historial de respuestas.

export async function getNextQuestion(
  sessionId: string,
  module: Module,
  answers: string[]
): Promise<NextQuestionResponse> {
  return apiPost<NextQuestionResponse>('/api/next-question', {
    sessionId,
    module,
    answers,
  });
}


// Solicita el diagnóstico final con todas las respuestas.

export async function getDiagnosis(
  sessionId: string,
  module: Module,
  answers: string[]
): Promise<DiagnosisResponse> {
  return apiPost<DiagnosisResponse>('/api/diagnosis', {
    sessionId,
    module,
    answers,
  });
}

// Finaliza y limpia la sesión en el backend.

export async function endConsultation(
  sessionId: string
): Promise<EndConsultationResponse> {
  return apiPost<EndConsultationResponse>('/api/end-consultation', {
    sessionId,
  });
}
