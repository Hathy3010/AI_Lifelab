import type { ObjectId, Cursor } from './types';
export interface HandSample {
  x: number;
  y: number;
  pinch: number;
}
interface Track extends HandSample {
  id: string;
  seen: number;
  closed: number;
  opened: number;
  holding: ObjectId | null;
  cooldown: number;
}
export interface HandActions {
  hit: (x: number, y: number) => ObjectId | null;
  grab: (id: ObjectId) => void;
  move: (id: ObjectId, x: number, y: number) => void;
  drop: (id: ObjectId, x: number, y: number) => void;
  cancel: (id: ObjectId) => void;
}
/** Independent of Three.js and MediaPipe: synthetic trajectories can verify ownership. */
export class HandsController {
  private tracks: Track[] = [];
  private serial = 0;
  constructor(private actions: HandActions) {}
  reset() {
    for (const t of this.tracks) if (t.holding) this.actions.cancel(t.holding);
    this.tracks = [];
  }
  feed(samples: HandSample[], now: number): Cursor[] {
    // Crossing/overlapping hands are ambiguous; do not silently transfer object ownership.
    if (
      samples.length === 2 &&
      Math.hypot(samples[0].x - samples[1].x, samples[0].y - samples[1].y) < 0.1
    ) {
      this.reset();
      return [];
    }
    const unmatched = new Set(this.tracks),
      matched: Track[] = [];
    for (const p of samples.slice(0, 2)) {
      let t = [...unmatched].sort(
        (a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y),
      )[0];
      if (t && Math.hypot(t.x - p.x, t.y - p.y) > 0.28) t = undefined as unknown as Track;
      if (t) unmatched.delete(t);
      else
        t = {
          ...p,
          id: `hand-${++this.serial}`,
          seen: now,
          closed: 0,
          opened: 0,
          holding: null,
          cooldown: 0,
        };
      Object.assign(t, p, { seen: now });
      t.closed = p.pinch < 0.25 ? t.closed + 1 : 0;
      t.opened = p.pinch > 0.45 ? t.opened + 1 : 0;
      if (!t.holding && now >= t.cooldown && t.closed >= 3) {
        const id = this.actions.hit(p.x, p.y);
        if (
          id &&
          !this.tracks.some((o) => o !== t && o.holding === id) &&
          !matched.some((o) => o !== t && o.holding === id)
        ) {
          t.holding = id;
          this.actions.grab(id);
        }
      }
      if (t.holding) {
        this.actions.move(t.holding, p.x, p.y);
        if (t.opened >= 3) {
          this.actions.drop(t.holding, p.x, p.y);
          t.holding = null;
          t.cooldown = now + 400;
          t.closed = 0;
        }
      }
      matched.push(t);
    }
    for (const t of unmatched) {
      if (now - t.seen >= 300) {
        if (t.holding) this.actions.cancel(t.holding);
      } else matched.push(t);
    }
    this.tracks = matched;
    return matched
      .filter((t) => t.seen === now)
      .map((t) => ({ id: t.id, x: t.x, y: t.y, holding: t.holding }));
  }
}
