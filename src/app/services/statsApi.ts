const STATS_URL = import.meta.env.VITE_STATS_URL ?? 'http://localhost:3001';

export interface ConsultationRecord {
  module: string;
  severity: string;
  isEmergency: boolean;
  answers: string[];
  recommendations: string[];
  sessionId: string;
}

export interface StatsData {
  total: number;
  byModule: Record<string, number>;
  bySeverity: Record<string, number>;
  emergencies: number;
  byDate: Record<string, number>;
  recentConsultations: any[];
}

export async function saveConsultation(record: ConsultationRecord): Promise<void> {
  await fetch(`${STATS_URL}/api/consultations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
}

export async function getStats(): Promise<StatsData> {
  const res = await fetch(`${STATS_URL}/api/stats`);
  return res.json();
}

export async function getAllConsultations() {
  const res = await fetch(`${STATS_URL}/api/consultations`);
  return res.json();
}