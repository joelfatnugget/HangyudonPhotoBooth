import { describe, it, expect } from 'vitest';
import {
  PhotoStripCompositor,
  FRAME_THEMES,
} from '../photoStripCompositor';

describe('PhotoStripCompositor', () => {
  it('provides predefined cute Hangyudon frame themes', () => {
    expect(FRAME_THEMES.mint).toBeDefined();
    expect(FRAME_THEMES.coral).toBeDefined();
    expect(FRAME_THEMES.navy).toBeDefined();
    expect(FRAME_THEMES.buttercup).toBeDefined();
    expect(FRAME_THEMES.lavender).toBeDefined();

    expect(FRAME_THEMES.mint.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(FRAME_THEMES.mint.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('computes layout geometry for a classic 4-photo vertical strip', () => {
    const compositor = new PhotoStripCompositor();
    const photoWidth = 400;
    const photoHeight = 300;

    const layout = compositor.computeLayout('strip_4', photoWidth, photoHeight);

    // Should have 4 photo slots
    expect(layout.photoSlots.length).toBe(4);
    // Vertical strip width should accommodate photo width + margins
    expect(layout.totalWidth).toBeGreaterThan(photoWidth);
    // Height should accommodate 4 photos + header + footer + spacing
    expect(layout.totalHeight).toBeGreaterThan(photoHeight * 4);

    // Each slot should have non-overlapping descending Y positions
    for (let i = 0; i < layout.photoSlots.length - 1; i++) {
      const current = layout.photoSlots[i];
      const next = layout.photoSlots[i + 1];
      expect(next.y).toBeGreaterThan(current.y + current.height);
      expect(current.width).toBe(photoWidth);
      expect(current.height).toBe(photoHeight);
    }
  });

  it('computes layout geometry for a single photo polaroid format', () => {
    const compositor = new PhotoStripCompositor();
    const photoWidth = 500;
    const photoHeight = 375;

    const layout = compositor.computeLayout('single', photoWidth, photoHeight);

    expect(layout.photoSlots.length).toBe(1);
    expect(layout.photoSlots[0].width).toBe(photoWidth);
    expect(layout.photoSlots[0].height).toBe(photoHeight);
    expect(layout.totalWidth).toBeGreaterThan(photoWidth);
    expect(layout.totalHeight).toBeGreaterThan(photoHeight);
  });

  it('computes layout geometry for a 2x2 grid format', () => {
    const compositor = new PhotoStripCompositor();
    const photoWidth = 320;
    const photoHeight = 240;

    const layout = compositor.computeLayout('grid_4', photoWidth, photoHeight);

    expect(layout.photoSlots.length).toBe(4);
    expect(layout.totalWidth).toBeGreaterThan(photoWidth * 2);
    expect(layout.totalHeight).toBeGreaterThan(photoHeight * 2);

    // Slot 0 (top-left) and Slot 1 (top-right) have same Y
    expect(layout.photoSlots[0].y).toBe(layout.photoSlots[1].y);
    expect(layout.photoSlots[1].x).toBeGreaterThan(layout.photoSlots[0].x);

    // Slot 2 (bottom-left) and Slot 3 (bottom-right)
    expect(layout.photoSlots[2].y).toBe(layout.photoSlots[3].y);
    expect(layout.photoSlots[2].y).toBeGreaterThan(layout.photoSlots[0].y);
  });
});
