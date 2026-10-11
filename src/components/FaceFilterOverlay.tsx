import React from 'react';
import {
  FaceTrackerEngine,
  DetectedFace,
  HangyudonFaceFilter,
} from '../services/faceTrackerEngine';
import {
  SayuriOctopus,
  HangyudonHoodHeadband,
  HangyudonSailorCap,
  CornerBuddies,
} from './HangyudonArt';

interface FaceFilterOverlayProps {
  face: DetectedFace | null;
  filter: HangyudonFaceFilter;
  tracker: FaceTrackerEngine;
  containerWidth?: number;
  containerHeight?: number;
  videoWidth?: number;
  videoHeight?: number;
  isMirrored?: boolean;
}

export const FaceFilterOverlay: React.FC<FaceFilterOverlayProps> = ({
  face,
  filter,
  tracker,
  containerWidth,
  containerHeight,
  videoWidth,
  videoHeight,
  isMirrored = false,
}) => {
  if (filter === 'none') {
    return null;
  }

  // Corner buddies do not require face tracking
  if (filter === 'corner_buddies') {
    return (
      <div
        data-testid="face-filter-corner_buddies"
        className="absolute inset-0 pointer-events-none z-25 overflow-hidden"
      >
        <CornerBuddies />
      </div>
    );
  }

  if (!face) {
    return null;
  }

  // Map face coordinates to display container
  const mappedFace =
    containerWidth && containerHeight && videoWidth && videoHeight
      ? tracker.mapFaceToContainer({
          face,
          videoWidth,
          videoHeight,
          containerWidth,
          containerHeight,
          isMirrored,
        })
      : face;

  const renderFilterGraphic = () => {
    switch (filter) {
      case 'hood_headband': {
        const anchor = tracker.calculateAnchor(mappedFace, 'headTop');
        return (
          <div
            data-testid="face-filter-hood_headband"
            style={{
              position: 'absolute',
              left: `${anchor.x}px`,
              top: `${anchor.y}px`,
              transform: `translate(-50%, -100%) rotate(${anchor.rotation}deg)`,
              transformOrigin: 'bottom center',
            }}
            className="pointer-events-none flex items-center justify-center transition-all duration-75"
          >
            <HangyudonHoodHeadband size={anchor.width} />
          </div>
        );
      }

      case 'sayuri_head': {
        const anchor = tracker.calculateAnchor(mappedFace, 'headTop');
        return (
          <div
            data-testid="face-filter-sayuri_head"
            style={{
              position: 'absolute',
              left: `${anchor.x}px`,
              top: `${anchor.y}px`,
              transform: `translate(-50%, -95%) rotate(${anchor.rotation}deg)`,
              transformOrigin: 'bottom center',
            }}
            className="pointer-events-none flex items-center justify-center animate-wiggle transition-all duration-75"
          >
            <SayuriOctopus size={anchor.width * 0.55} />
          </div>
        );
      }

      case 'sailor_beret': {
        const anchor = tracker.calculateAnchor(mappedFace, 'sailorTop');
        return (
          <div
            data-testid="face-filter-sailor_beret"
            style={{
              position: 'absolute',
              left: `${anchor.x}px`,
              top: `${anchor.y}px`,
              transform: `translate(-50%, -100%) rotate(${anchor.rotation}deg)`,
              transformOrigin: 'bottom center',
            }}
            className="pointer-events-none flex items-center justify-center transition-all duration-75"
          >
            <HangyudonSailorCap size={anchor.width} />
          </div>
        );
      }

      case 'blush_sparkles': {
        const leftAnchor = tracker.calculateAnchor(mappedFace, 'blushLeft');
        const rightAnchor = tracker.calculateAnchor(mappedFace, 'blushRight');
        return (
          <div
            data-testid="face-filter-blush_sparkles"
            className="pointer-events-none"
          >
            {/* Left Cheek Blush */}
            <div
              style={{
                position: 'absolute',
                left: `${leftAnchor.x}px`,
                top: `${leftAnchor.y}px`,
                transform: `translate(-50%, -50%) rotate(${leftAnchor.rotation - 6}deg)`,
              }}
              className="relative flex items-center justify-center"
            >
              <div className="w-12 h-6 bg-rose-400/40 rounded-full blur-[2px]" />
              <span className="absolute -top-2 -right-1 text-yellow-300 text-xs animate-pulse">✦</span>
              <span className="absolute -bottom-1 -left-1 text-teal-300 text-[9px]">★</span>
            </div>

            {/* Right Cheek Blush */}
            <div
              style={{
                position: 'absolute',
                left: `${rightAnchor.x}px`,
                top: `${rightAnchor.y}px`,
                transform: `translate(-50%, -50%) rotate(${rightAnchor.rotation + 6}deg)`,
              }}
              className="relative flex items-center justify-center"
            >
              <div className="w-12 h-6 bg-rose-400/40 rounded-full blur-[2px]" />
              <span className="absolute -top-2 -left-1 text-yellow-300 text-xs animate-pulse">✦</span>
              <span className="absolute -bottom-1 -right-1 text-teal-300 text-[9px]">★</span>
            </div>
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
