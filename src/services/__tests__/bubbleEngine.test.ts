import { describe, it, expect } from 'vitest';
import { BubbleEngine } from '../bubbleEngine';

describe('BubbleEngine', () => {
  it('initializes with a specified pool of bubbles within bounds', () => {
    const engine = new BubbleEngine({
      width: 800,
      height: 600,
      initialBubbleCount: 15,
    });

    const bubbles = engine.getBubbles();
    expect(bubbles.length).toBe(15);
    bubbles.forEach((b) => {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x).toBeLessThanOrEqual(800);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeLessThanOrEqual(600);
      expect(b.radius).toBeGreaterThan(0);
      expect(b.popped).toBe(false);
    });
  });

  it('updates bubble positions upward on tick', () => {
    const engine = new BubbleEngine({
      width: 800,
      height: 600,
      initialBubbleCount: 5,
    });

    const initialY = engine.getBubbles().map((b) => b.y);
    engine.update(100); // 100ms
    const updatedY = engine.getBubbles().map((b) => b.y);

    // All bubbles should have moved upwards (smaller y value)
    for (let i = 0; i < initialY.length; i++) {
      expect(updatedY[i]).toBeLessThan(initialY[i]);
    }
  });

  it('spawns new bubble at specified coordinates on user click/interaction', () => {
    const engine = new BubbleEngine({
      width: 800,
      height: 600,
      initialBubbleCount: 0,
    });

    expect(engine.getBubbles().length).toBe(0);
    const newBubble = engine.spawnBubbleAt(350, 420, 'ramen');

    expect(engine.getBubbles().length).toBe(1);
    expect(newBubble.x).toBe(350);
    expect(newBubble.y).toBe(420);
    expect(newBubble.itemType).toBe('ramen');
  });

  it('pops a bubble by ID, marks it popped, and spawns particle burst', () => {
    const engine = new BubbleEngine({
      width: 800,
      height: 600,
      initialBubbleCount: 0,
    });

    const bubble = engine.spawnBubbleAt(200, 200, 'sayuri');
    expect(engine.getParticles().length).toBe(0);

    const popped = engine.popBubble(bubble.id);
    expect(popped).not.toBeNull();
    expect(popped?.id).toBe(bubble.id);

    // Popped bubble should no longer be in active bubbles list
    const remainingBubbles = engine.getBubbles();
    expect(remainingBubbles.find((b) => b.id === bubble.id)).toBeUndefined();

    // Burst particles should be spawned
    expect(engine.getParticles().length).toBeGreaterThan(0);
  });

  it('finds bubble under click coordinate with hit testing', () => {
    const engine = new BubbleEngine({
      width: 800,
      height: 600,
      initialBubbleCount: 0,
    });

    const b = engine.spawnBubbleAt(300, 300, 'plain', 40);
    // Click inside the bubble radius (within 40px)
    const hit = engine.findBubbleAt(310, 305);
    expect(hit?.id).toBe(b.id);

    // Click outside bubble radius
    const miss = engine.findBubbleAt(400, 400);
    expect(miss).toBeNull();
  });

  it('spawns and updates water ripples', () => {
    const engine = new BubbleEngine({
      width: 800,
      height: 600,
      initialBubbleCount: 0,
    });

    engine.spawnRippleAt(400, 300);
    expect(engine.getRipples().length).toBe(1);

    const initialRadius = engine.getRipples()[0].radius;
    const initialOpacity = engine.getRipples()[0].opacity;

    engine.update(50);
    const updatedRipple = engine.getRipples()[0];
    expect(updatedRipple.radius).toBeGreaterThan(initialRadius);
    expect(updatedRipple.opacity).toBeLessThan(initialOpacity);
  });
});
