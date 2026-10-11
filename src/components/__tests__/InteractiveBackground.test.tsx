import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { InteractiveBackground } from '../InteractiveBackground';
import { BubbleEngine } from '../../services/bubbleEngine';
import { SoundSynthesizer } from '../../services/soundSynthesizer';

describe('InteractiveBackground', () => {
  it('renders canvas element and attaches interaction handlers', () => {
    const bubbleEngine = new BubbleEngine({ width: 640, height: 480 });
    const soundSynth = new SoundSynthesizer({ initialMuted: true });

    const { container } = render(
      <InteractiveBackground
        engine={bubbleEngine}
        sound={soundSynth}
        width={640}
        height={480}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas?.width).toBe(640);
    expect(canvas?.height).toBe(480);
  });

  it('handles click to spawn or pop bubbles', () => {
    const bubbleEngine = new BubbleEngine({ width: 640, height: 480, initialBubbleCount: 0 });
    const soundSynth = new SoundSynthesizer({ initialMuted: true });
    const onPopSpy = vi.fn();

    const { container } = render(
      <InteractiveBackground
        engine={bubbleEngine}
        sound={soundSynth}
        width={640}
        height={480}
        onBubblePop={onPopSpy}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();

    // Clicking canvas spawns a new bubble
    fireEvent.pointerDown(canvas!, { clientX: 250, clientY: 200 });
    expect(bubbleEngine.getBubbles().length).toBeGreaterThan(0);
  });
});
