export type ObjectId = 'A' | 'B';
export type Outcome = 'LEFT_DOWN' | 'RIGHT_DOWN' | 'BALANCED';
export type Source = 'pointer' | 'keyboard' | 'gesture';
export interface Placement {
  object_id: ObjectId;
  slot: number;
}
export type Plan = Record<ObjectId, number | null>;
export interface Prediction {
  outcome: Outcome;
  explanation: string;
}
export interface SimulationResult {
  left_torque_nm: number;
  right_torque_nm: number;
  net_torque_nm: number;
  outcome: Outcome;
}
export interface Attempt {
  id: string;
  number: number;
  placements: Placement[];
  prediction: Prediction;
  result: SimulationResult;
  source: Source;
  created_at: string;
}
export type CoachMode = 'PREDICT' | 'HINT' | 'EXPLAIN' | 'COMPARE' | 'REFLECT';
export interface CoachReply {
  message: string;
  question: string;
  hint_level: number;
  referenced_attempt_ids: string[];
  ui_action: { type: 'NONE' | 'HIGHLIGHT_OBJECT'; object_id?: ObjectId };
  fallback: boolean;
  reason?: string;
}
export interface ChatMessage {
  id: string;
  role: 'student' | 'coach';
  text: string;
  reply?: CoachReply;
}
export interface SessionSnapshot {
  id: string;
  challenge_id: string;
  attempts: Attempt[];
  completed: boolean;
  reflection: string;
  selected_attempt_id: string;
  turns: { question: string; answer: string; mode: CoachMode; reply?: CoachReply }[];
}
export interface Cursor {
  id: string;
  x: number;
  y: number;
  holding: ObjectId | null;
}
export const OUTCOMES: Record<Outcome, string> = {
  LEFT_DOWN: 'Bên trái hạ',
  RIGHT_DOWN: 'Bên phải hạ',
  BALANCED: 'Cân bằng',
};
export const SLOTS = [-4, -3, -2, -1, 1, 2, 3, 4];
export const MASSES: Record<ObjectId, number> = { A: 1, B: 2 };
export const INITIAL_PLAN: Plan = { A: null, B: null };
export function placements(plan: Plan): Placement[] {
  return (['A', 'B'] as const).flatMap((object_id) =>
    plan[object_id] === null ? [] : [{ object_id, slot: plan[object_id]! }],
  );
}
export function validPlan(plan: Plan) {
  return (
    plan.A !== null &&
    plan.B !== null &&
    SLOTS.includes(plan.A) &&
    SLOTS.includes(plan.B) &&
    plan.A * plan.B < 0
  );
}
export function planKey(plan: Plan) {
  return `${plan.A}:${plan.B}`;
}
