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
        filter="hood_headband"
        tracker={tracker}
      />
    );
    expect(container.firstChild).toBeNull();
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

  it('renders sayuri companion when filter is sayuri_head', () => {
    const { getByTestId } = render(
      <FaceFilterOverlay
        face={mockFace}
        filter="sayuri_head"
        tracker={tracker}
      />
    );
    const filterElem = getByTestId('face-filter-sayuri_head');
    expect(filterElem).toBeInTheDocument();
  });

  it('renders cheek blush and sparkles when filter is blush_sparkles', () => {
    const { getByTestId } = render(
      <FaceFilterOverlay
        face={mockFace}
        filter="blush_sparkles"
        tracker={tracker}
      />
    );
    const filterElem = getByTestId('face-filter-blush_sparkles');
    expect(filterElem).toBeInTheDocument();
  });

  it('renders sailor beret when filter is sailor_beret', () => {
    const { getByTestId } = render(
      <FaceFilterOverlay
        face={mockFace}
        filter="sailor_beret"
        tracker={tracker}
      />
    );
    const filterElem = getByTestId('face-filter-sailor_beret');
    expect(filterElem).toBeInTheDocument();
  });

  it('renders corner buddies frame when filter is corner_buddies', () => {
    const { getByTestId } = render(
      <FaceFilterOverlay
        face={mockFace}
        filter="corner_buddies"
        tracker={tracker}
      />
    );
    const filterElem = getByTestId('face-filter-corner_buddies');
    expect(filterElem).toBeInTheDocument();
  });
});
