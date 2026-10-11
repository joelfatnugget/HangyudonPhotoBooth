import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Photobooth } from '../Photobooth';

describe('Photobooth', () => {
  beforeEach(() => {
    // Mock getUserMedia
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockImplementation(() =>
          Promise.resolve({
            getTracks: () => [{ stop: vi.fn() }],
          })
        ),
        enumerateDevices: vi.fn().mockResolvedValue([]),
      },
      writable: true,
      configurable: true,
    });
  });

  it('renders the Hangyudon photobooth title and initial controls', async () => {
    await act(async () => {
      render(<Photobooth />);
    });

    expect(
      screen.getByRole('heading', { level: 1, name: /HANGYUDON PHOTOBOOTH/i })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /start camera/i })[0]
    ).toBeInTheDocument();
    expect(screen.getByText(/4-Cut Strip/i)).toBeInTheDocument();
    expect(screen.getByText(/Single Snap/i)).toBeInTheDocument();
  });

  it('allows changing countdown duration setting', async () => {
    await act(async () => {
      render(<Photobooth />);
    });

    const timer5sBtn = screen.getByRole('button', { name: /5s/i });
    await act(async () => {
      fireEvent.click(timer5sBtn);
    });

    expect(timer5sBtn).toHaveClass('bg-teal-500');
  });

  it('allows switching between 4-cut strip and single photo modes', async () => {
    await act(async () => {
      render(<Photobooth />);
    });

    const singleModeBtn = screen.getByText(/Single Snap/i);
    await act(async () => {
      fireEvent.click(singleModeBtn);
    });

    expect(singleModeBtn.closest('button')).toHaveClass('bg-teal-500');
  });

  it('allows muting and unmuting audio', async () => {
    await act(async () => {
      render(<Photobooth />);
    });

    const soundToggle = screen.getByTitle(/Mute Sound|Unmute Sound/i);
    expect(soundToggle).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(soundToggle);
    });
    expect(screen.getByTitle(/Unmute Sound/i)).toBeInTheDocument();
  });

  it('allows selecting a Hangyudon face filter', async () => {
    await act(async () => {
      render(<Photobooth />);
    });

    const fullMaskBtn = screen.getByRole('button', { name: /Full Face Mask/i });
    expect(fullMaskBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(fullMaskBtn);
    });

    expect(fullMaskBtn).toHaveClass('border-teal-400');
  });

  it('does not render floating bubbles or face tracking badge when camera is off', async () => {
    let renderedContainer: HTMLElement;
    await act(async () => {
      const { container } = render(<Photobooth />);
      renderedContainer = container;
    });

    // When camera is off, interactive background canvas should not be present
    const interactiveCanvas = renderedContainer!.querySelector('canvas[title*="bubbles"]');
    expect(interactiveCanvas).toBeNull();

    // Face tracking badge should not be present
    expect(screen.queryByText(/Face Tracked|Searching Face/i)).toBeNull();
  });
});
