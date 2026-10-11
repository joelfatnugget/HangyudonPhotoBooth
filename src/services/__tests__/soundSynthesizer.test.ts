import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SoundSynthesizer } from '../soundSynthesizer';

describe('SoundSynthesizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with unmuted state by default', () => {
    const sound = new SoundSynthesizer();
    expect(sound.isMuted()).toBe(false);
  });

  it('can toggle and set muted state', () => {
    const sound = new SoundSynthesizer();
    sound.setMuted(true);
    expect(sound.isMuted()).toBe(true);

    sound.toggleMute();
    expect(sound.isMuted()).toBe(false);
  });

  it('plays sounds safely without throwing errors', () => {
    const sound = new SoundSynthesizer();

    expect(() => sound.playBubblePop()).not.toThrow();
    expect(() => sound.playCountdownTick(false)).not.toThrow();
    expect(() => sound.playCountdownTick(true)).not.toThrow();
    expect(() => sound.playShutter()).not.toThrow();
    expect(() => sound.playFanfare()).not.toThrow();
  });

  it('does not trigger audio generation when muted', () => {
    const sound = new SoundSynthesizer({ initialMuted: true });
    expect(sound.isMuted()).toBe(true);

    // Should return false / early exit when muted
    const played = sound.playBubblePop();
    expect(played).toBe(false);
  });
});
