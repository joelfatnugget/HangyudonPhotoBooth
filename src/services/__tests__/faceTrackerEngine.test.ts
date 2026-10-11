import { describe, it, expect } from 'vitest';
import {
  FaceTrackerEngine,
  DetectedFace,
} from '../faceTrackerEngine';

describe('FaceTrackerEngine', () => {
  it('initializes with default smoothing alpha', () => {
    const engine = new FaceTrackerEngine();
    expect(engine.getSmoothingAlpha()).toBeGreaterThan(0);
    expect(engine.getSmoothingAlpha()).toBeLessThanOrEqual(1);
  });

  it('smooths facial bounding box coordinates between frames using lerp', () => {
    const engine = new FaceTrackerEngine({ smoothingAlpha: 0.5 });

    const prevFace: DetectedFace = {
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rollAngle: 0,
    };

    const newRawFace: DetectedFace = {
      x: 120,
      y: 120,
      width: 220,
      height: 220,
      rollAngle: 10,
    };

    const smoothed = engine.smoothFace(newRawFace, prevFace);

    // With alpha 0.5: 100 + (120 - 100) * 0.5 = 110
    expect(smoothed.x).toBeCloseTo(110);
    expect(smoothed.y).toBeCloseTo(110);
    expect(smoothed.width).toBeCloseTo(210);
    expect(smoothed.height).toBeCloseTo(210);
    expect(smoothed.rollAngle).toBeCloseTo(5);
  });

  it('calculates accurate anchor coordinates for each face region', () => {
    const engine = new FaceTrackerEngine();
    const face: DetectedFace = {
      x: 200,
      y: 150,
      width: 100,
      height: 120,
      rollAngle: 5,
    };

    // headTop: above forehead
    const headTop = engine.calculateAnchor(face, 'headTop');
    expect(headTop.x).toBe(250); // center X
    expect(headTop.y).toBeLessThan(face.y); // above face top
    expect(headTop.width).toBeGreaterThan(face.width * 0.8);
    expect(headTop.rotation).toBe(5);

    // faceCenter: centered on face
    const center = engine.calculateAnchor(face, 'faceCenter');
    expect(center.x).toBe(250);
    expect(center.y).toBe(210); // 150 + 60
    expect(center.rotation).toBe(5);

    // mouth: lower third of face
    const mouth = engine.calculateAnchor(face, 'mouth');
    expect(mouth.x).toBe(250);
    expect(mouth.y).toBeGreaterThan(center.y);
    expect(mouth.y).toBeLessThan(face.y + face.height);

    // eyes: upper third of face
    const eyes = engine.calculateAnchor(face, 'eyes');
    expect(eyes.x).toBe(250);
    expect(eyes.y).toBeLessThan(center.y);
    expect(eyes.y).toBeGreaterThan(face.y);

    // chin: bottom of face
    const chin = engine.calculateAnchor(face, 'chin');
    expect(chin.x).toBe(250);
    expect(chin.y).toBeGreaterThanOrEqual(face.y + face.height * 0.85);
  });

  it('returns previous face when raw detection is momentarily null to prevent flicker', () => {
    const engine = new FaceTrackerEngine({ maxLostFrames: 3 });
    const prevFace: DetectedFace = {
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rollAngle: 0,
    };

    // Frame 1 lost: should preserve previous face
    const result1 = engine.processFrame(null, prevFace);
    expect(result1).not.toBeNull();
    expect(result1?.x).toBe(100);

    // Frame 2 lost: should preserve
    const result2 = engine.processFrame(null, result1);
    expect(result2).not.toBeNull();

    // Frame 3 lost: should preserve
    const result3 = engine.processFrame(null, result2);
    expect(result3).not.toBeNull();

    // Frame 4 lost: exceeds maxLostFrames, resets to null
    const result4 = engine.processFrame(null, result3);
    expect(result4).toBeNull();
  });

  it('maps normalized face coordinates accurately to container dimensions with object-cover and mirror support', () => {
    const engine = new FaceTrackerEngine();
    const face: DetectedFace = {
      x: 320,
      y: 180,
      width: 640,
      height: 360,
      rollAngle: 4,
      normalized: {
        x: 0.25,
        y: 0.25,
        width: 0.5,
        height: 0.5,
      },
    };

    // Video 1280x720, container 640x480 (4:3 aspect ratio)
    const mapped = engine.mapFaceToContainer({
      face,
      videoWidth: 1280,
      videoHeight: 720,
      containerWidth: 640,
      containerHeight: 480,
      isMirrored: false,
    });

    expect(mapped.width).toBeGreaterThan(0);
    expect(mapped.height).toBeGreaterThan(0);
    expect(mapped.x).toBeGreaterThanOrEqual(0);
    expect(mapped.y).toBeGreaterThanOrEqual(0);
    expect(mapped.rollAngle).toBe(4);

    // Mirrored mode should flip X coordinate and invert roll angle
    const mirrored = engine.mapFaceToContainer({
      face,
      videoWidth: 1280,
      videoHeight: 720,
      containerWidth: 640,
      containerHeight: 480,
      isMirrored: true,
    });
    expect(mirrored.rollAngle).toBe(-4);
    expect(mirrored.width).toBe(mapped.width);
  });

  it('calculates cheek blush anchors that do not obstruct the center of the face', () => {
    const engine = new FaceTrackerEngine();
    const face: DetectedFace = {
      x: 200,
      y: 150,
      width: 100,
      height: 120,
      rollAngle: 0,
    };

    const leftCheek = engine.calculateAnchor(face, 'blushLeft');
    const rightCheek = engine.calculateAnchor(face, 'blushRight');

    // Left cheek must be on the left side of the face
    expect(leftCheek.x).toBeLessThan(250);
    // Right cheek must be on the right side of the face
    expect(rightCheek.x).toBeGreaterThan(250);
    // Both cheeks should sit below eye level
    expect(leftCheek.y).toBeGreaterThan(150 + 40);
    expect(rightCheek.y).toBeGreaterThan(150 + 40);
  });
});
