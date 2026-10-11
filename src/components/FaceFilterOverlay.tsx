import React from 'react';
import {
  FaceTrackerEngine,
  DetectedFace,
  HangyudonFaceFilter,
} from '../services/faceTrackerEngine';
import {
  HangyudonCharacter,
  SayuriOctopus,
  HangyudonHoodHeadband,
  RamenSticker,
} from './HangyudonArt';

interface FaceFilterOverlayProps {
  face: DetectedFace | null;
  filter: HangyudonFaceFilter;
  tracker: FaceTrackerEngine;
}

export const FaceFilterOverlay: React.FC<FaceFilterOverlayProps> = ({
  face,
  filter,
  tracker,
}) => {
  if (!face || filter === 'none') {
    return null;
  }

  const renderFilterGraphic = () => {
    switch (filter) {
      case 'full_mask': {
        const anchor = tracker.calculateAnchor(face, 'faceCenter');
        return (
          <div
            data-testid="face-filter-full_mask"
            style={{
              position: 'absolute',
              left: `${anchor.x}px`,
              top: `${anchor.y}px`,
              width: `${anchor.width}px`,
              height: `${anchor.height}px`,
              transform: `translate(-50%, -50%) rotate(${anchor.rotation}deg)`,
              transformOrigin: 'center center',
            }}
            className="pointer-events-none flex items-center justify-center transition-all duration-75"
          >
            <HangyudonCharacter size={anchor.width} mood="happy" />
          </div>
        );
      }

      case 'hood_headband': {
        const anchor = tracker.calculateAnchor(face, 'headTop');
        return (
          <div
            data-testid="face-filter-hood_headband"
            style={{
              position: 'absolute',
              left: `${anchor.x}px`,
              top: `${anchor.y}px`,
              width: `${anchor.width}px`,
              height: `${anchor.height}px`,
              transform: `translate(-50%, -70%) rotate(${anchor.rotation}deg)`,
              transformOrigin: 'bottom center',
            }}
            className="pointer-events-none flex items-center justify-center transition-all duration-75"
          >
            <HangyudonHoodHeadband size={anchor.width * 1.1} />
          </div>
        );
      }

      case 'sayuri_head': {
        const anchor = tracker.calculateAnchor(face, 'headTop');
        return (
          <div
            data-testid="face-filter-sayuri_head"
            style={{
              position: 'absolute',
              left: `${anchor.x}px`,
              top: `${anchor.y}px`,
              width: `${anchor.width * 0.75}px`,
              height: `${anchor.height}px`,
              transform: `translate(-50%, -85%) rotate(${anchor.rotation}deg)`,
              transformOrigin: 'bottom center',
            }}
            className="pointer-events-none flex items-center justify-center animate-wiggle transition-all duration-75"
          >
            <SayuriOctopus size={anchor.width * 0.7} />
          </div>
        );
      }

      case 'wavy_lips': {
        const anchor = tracker.calculateAnchor(face, 'mouth');
        return (
          <div
            data-testid="face-filter-wavy_lips"
            style={{
              position: 'absolute',
              left: `${anchor.x}px`,
              top: `${anchor.y}px`,
              width: `${anchor.width}px`,
              transform: `translate(-50%, -50%) rotate(${anchor.rotation}deg)`,
              transformOrigin: 'center center',
            }}
            className="pointer-events-none flex items-center justify-center transition-all duration-75"
          >
            <svg
              width={anchor.width}
              height={anchor.width * 0.45}
              viewBox="0 0 100 45"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Hangyudon's iconic wavy thick salmon lips */}
              <path
                d="M10 22 C22 10, 40 10, 50 16 C60 10, 78 10, 90 22 C94 34, 80 42, 50 40 C20 42, 6 34, 10 22 Z"
                fill="#ff8fab"
                stroke="#1e3a5f"
                strokeWidth="4"
              />
              <line
                x1="20"
                y1="23"
                x2="80"
                y2="23"
                stroke="#e11d48"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      }

      case 'big_eyes': {
        const anchor = tracker.calculateAnchor(face, 'eyes');
        return (
          <div
            data-testid="face-filter-big_eyes"
            style={{
              position: 'absolute',
              left: `${anchor.x}px`,
              top: `${anchor.y}px`,
              width: `${anchor.width}px`,
              transform: `translate(-50%, -50%) rotate(${anchor.rotation}deg)`,
              transformOrigin: 'center center',
            }}
            className="pointer-events-none flex items-center justify-center transition-all duration-75"
          >
            <div className="flex items-center justify-between w-full px-2">
              {/* Left Eye */}
              <div className="relative">
                <svg width={anchor.width * 0.35} height={anchor.width * 0.35} viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="23" fill="#ffffff" stroke="#1e3a5f" strokeWidth="4" />
                  <circle cx="26" cy="25" r="12" fill="#1e3a5f" />
                  <circle cx="29" cy="20" r="4.5" fill="#ffffff" />
                  <circle cx="21" cy="28" r="2" fill="#ffffff" />
                </svg>
                {/* Left Cheek Blush */}
                <div className="w-8 h-4 bg-rose-400/50 rounded-full blur-xs mt-1" />
              </div>

              {/* Right Eye */}
              <div className="relative">
                <svg width={anchor.width * 0.35} height={anchor.width * 0.35} viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="23" fill="#ffffff" stroke="#1e3a5f" strokeWidth="4" />
                  <circle cx="24" cy="25" r="12" fill="#1e3a5f" />
                  <circle cx="21" cy="20" r="4.5" fill="#ffffff" />
                  <circle cx="29" cy="28" r="2" fill="#ffffff" />
                </svg>
                {/* Right Cheek Blush */}
                <div className="w-8 h-4 bg-rose-400/50 rounded-full blur-xs mt-1" />
              </div>
            </div>
          </div>
        );
      }

      case 'ramen_feeder': {
        const anchor = tracker.calculateAnchor(face, 'chin');
        return (
          <div
            data-testid="face-filter-ramen_feeder"
            style={{
              position: 'absolute',
              left: `${anchor.x}px`,
              top: `${anchor.y}px`,
              width: `${anchor.width}px`,
              transform: `translate(-50%, -30%) rotate(${anchor.rotation}deg)`,
              transformOrigin: 'top center',
            }}
            className="pointer-events-none flex items-center justify-center transition-all duration-75"
          >
            <RamenSticker size={anchor.width * 0.9} />
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
      {renderFilterGraphic()}
    </div>
  );
};
