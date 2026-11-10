import type {
  Attempt,
  CoachMode,
  CoachReply,
  Placement,
  Prediction,
  Source,
  SessionSnapshot,
} from './types';
async function request<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch('/api' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => null);
    throw new Error(
      typeof e?.detail === 'string'
        ? e.detail
        : 'Không thể xử lý yêu cầu. Kiểm tra máy chủ và thử lại.',
    );
  }
  return r.json();
}
export const api = {
  create: (challenge_id: string) =>
    request<{ id: string; coach_configured: boolean }>('/sessions', { challenge_id }),
  read: (session: string) => request<SessionSnapshot>(`/sessions/${session}`),
  run: (
    session: string,
    request_id: string,
    placements: Placement[],
    prediction: Prediction,
    source: Source,
  ) =>
    request<Attempt>(`/sessions/${session}/attempts`, {
      request_id,
      placements,
      prediction,
      source,
    }),
  coach: (
    session: string,
    request_id: string,
    mode: CoachMode,
    question: string,
    source_ids: string[],
    hint_level: number,
  ) =>
    request<CoachReply>(`/sessions/${session}/coach`, {
      request_id,
      mode,
      question,
      source_ids,
      hint_level,
    }),
  complete: (session: string, selected_attempt_id: string, reflection: string) =>
    request<{ completed: boolean }>(`/sessions/${session}/complete`, {
      selected_attempt_id,
      reflection,
    }),
};
