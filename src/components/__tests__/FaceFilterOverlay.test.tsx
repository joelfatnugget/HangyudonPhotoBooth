import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FaceFilterOverlay } from '../FaceFilterOverlay';
import { FaceTrackerEngine, DetectedFace } from '../../services/faceTrackerEngine';

describe('FaceFilterOverlay', () => {
  const tracker = new FaceTrackerEngine();
  const mockFace: DetectedFace = {
    x: 200,
    y: 150,
    width: 140,
    height: 160,
    rollAngle: 4,
  };

  it('renders nothing when filter is set to none', () => {
    const { container } = render(
      <FaceFilterOverlay
        face={mockFace}
        filter="none"
        tracker={tracker}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when face is null', () => {
    const { container } = render(
      <FaceFilterOverlay
        face={null}
        filter="full_mask"
        tracker={tracker}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders full face mask when filter is full_mask and face is detected', () => {
    const { getByTestId } = render(
      <FaceFilterOverlay
        face={mockFace}
        filter="full_mask"
        tracker={tracker}
      />
    );
    const filterElem = getByTestId('face-filter-full_mask');
    expect(filterElem).toBeInTheDocument();
  });

  it('renders headband when filter is hood_headband', () => {
    const { getByTestId } = render(
      <FaceFilterOverlay
        face={mockFace}
        filter="hood_headband"
        tracker={tracker}
      />
    );
    const filterElem = getByTestId('face-filter-hood_headband');
    expect(filterElem).toBeInTheDocument();
  });
});
