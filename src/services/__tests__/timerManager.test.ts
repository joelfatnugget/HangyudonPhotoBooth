import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TimerManager } from '../timerManager';

describe('TimerManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default options and is inactive', () => {
    const timer = new TimerManager();
    expect(timer.isActive()).toBe(false);
    expect(timer.getCurrentShot()).toBe(0);
    expect(timer.getTotalShots()).toBe(1);
    expect(timer.getRemainingSeconds()).toBe(3);
  });

  it('runs countdown for a single shot and triggers callbacks', () => {
    const onTick = vi.fn();
    const onCapture = vi.fn();
    const onComplete = vi.fn();

    const timer = new TimerManager({
      countdownSeconds: 3,
      totalShots: 1,
      onTick,
      onCapture,
      onComplete,
    });

    timer.start();
    expect(timer.isActive()).toBe(true);
    expect(timer.getRemainingSeconds()).toBe(3);
    expect(onTick).toHaveBeenCalledWith(3, 1, 1);

    // Advance 1 second -> remaining: 2
    vi.advanceTimersByTime(1000);
    expect(timer.getRemainingSeconds()).toBe(2);
    expect(onTick).toHaveBeenCalledWith(2, 1, 1);

    // Advance 1 second -> remaining: 1
    vi.advanceTimersByTime(1000);
    expect(timer.getRemainingSeconds()).toBe(1);
    expect(onTick).toHaveBeenCalledWith(1, 1, 1);

    // Advance 1 second -> triggers capture
    vi.advanceTimersByTime(1000);
    expect(onCapture).toHaveBeenCalledWith(1, 1);
    expect(onComplete).toHaveBeenCalled();
    expect(timer.isActive()).toBe(false);
  });

  it('sequences multiple shots with delay between shots', () => {
    const onTick = vi.fn();
    const onCapture = vi.fn();
    const onComplete = vi.fn();

    const timer = new TimerManager({
      countdownSeconds: 2,
      totalShots: 4,
      intervalBetweenShotsMs: 1000,
      onTick,
      onCapture,
      onComplete,
    });

    timer.start();
    expect(timer.getCurrentShot()).toBe(1);

    // Shot 1 countdown: 2s -> 1s -> 0s capture
    vi.advanceTimersByTime(1000); // 1s
    vi.advanceTimersByTime(1000); // 0s capture
    expect(onCapture).toHaveBeenCalledWith(1, 4);
    expect(onComplete).not.toHaveBeenCalled();

    // Delay before next shot (1000ms)
    vi.advanceTimersByTime(1000);
    expect(timer.getCurrentShot()).toBe(2);

    // Shot 2 countdown: 2s
    vi.advanceTimersByTime(2000);
    expect(onCapture).toHaveBeenCalledWith(2, 4);

    // Delay (1000ms)
    vi.advanceTimersByTime(1000);
    expect(timer.getCurrentShot()).toBe(3);

    // Shot 3 countdown: 2s
    vi.advanceTimersByTime(2000);
    expect(onCapture).toHaveBeenCalledWith(3, 4);

    // Delay (1000ms)
    vi.advanceTimersByTime(1000);
    expect(timer.getCurrentShot()).toBe(4);

    // Shot 4 countdown: 2s
    vi.advanceTimersByTime(2000);
    expect(onCapture).toHaveBeenCalledWith(4, 4);
    expect(onComplete).toHaveBeenCalled();
    expect(timer.isActive()).toBe(false);
  });

  it('cancels countdown cleanly', () => {
    const onTick = vi.fn();
    const onCapture = vi.fn();
    const onComplete = vi.fn();

    const timer = new TimerManager({
      countdownSeconds: 5,
      totalShots: 2,
      onTick,
      onCapture,
      onComplete,
    });

    timer.start();
    expect(timer.isActive()).toBe(true);

    vi.advanceTimersByTime(2000);
    timer.cancel();

    expect(timer.isActive()).toBe(false);
    // Advancing more time should not trigger capture or complete
    vi.advanceTimersByTime(10000);
    expect(onCapture).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
