import { describe, expect, it, vi } from 'vitest';
import { HandsController } from './hands';

function setup() {
  const actions = {
    hit: vi.fn(() => 'A' as const),
    grab: vi.fn(),
    move: vi.fn(),
    drop: vi.fn(),
    cancel: vi.fn(),
  };
  return { actions, controller: new HandsController(actions) };
}
describe('hand interaction lifecycle', () => {
  it('requires stable pinch, moves, then releases after stable opening', () => {
    const { actions, controller } = setup();
    for (const time of [0, 90]) controller.feed([{ x: 0.4, y: 0.5, pinch: 0.1 }], time);
    expect(actions.grab).not.toHaveBeenCalled();
    controller.feed([{ x: 0.4, y: 0.5, pinch: 0.1 }], 180);
    expect(actions.grab).toHaveBeenCalledExactlyOnceWith('A');
    for (const time of [270, 360, 450]) controller.feed([{ x: 0.5, y: 0.5, pinch: 0.8 }], time);
    expect(actions.move).toHaveBeenCalledWith('A', 0.5, 0.5);
    expect(actions.drop).toHaveBeenCalledExactlyOnceWith('A', 0.5, 0.5);
  });
  it('cancels ownership after tracking is lost or camera resets', () => {
    const { actions, controller } = setup();
    for (const time of [0, 90, 180]) controller.feed([{ x: 0.4, y: 0.5, pinch: 0.1 }], time);
    controller.feed([], 400);
    expect(actions.cancel).not.toHaveBeenCalled();
    controller.feed([], 490);
    expect(actions.cancel).toHaveBeenCalledExactlyOnceWith('A');
    controller.reset();
    expect(controller.feed([], 600)).toEqual([]);
  });
});
