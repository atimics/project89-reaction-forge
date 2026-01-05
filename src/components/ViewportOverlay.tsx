import { useState, useEffect } from 'react';
import { sceneManager } from '../three/sceneManager';

import { usePopOutViewport } from '../hooks/usePopOutViewport';
import { useUIStore } from '../state/useUIStore';
import { MultiplayerPanel } from './MultiplayerPanel';
import { notifySceneChange } from '../multiplayer/avatarBridge';

type AspectRatio = '16:9' | '1:1' | '9:16';

interface ViewportOverlayProps {
  mode: 'reactions' | 'poselab';
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onStop?: () => void;
}

export function ViewportOverlay({ mode, isPlaying, onPlayPause, onStop }: ViewportOverlayProps) {
  const { activeCssOverlay } = useUIStore();
  const { isPoppedOut, togglePopOut } = usePopOutViewport(activeCssOverlay);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  // Sync with sceneManager on mount
  useEffect(() => {
    setAspectRatio(sceneManager.getAspectRatio());
  }, []);

  const handleAspectRatioChange = (ratio: AspectRatio) => {
    setAspectRatio(ratio);
    sceneManager.setAspectRatio(ratio);
    notifySceneChange({ aspectRatio: ratio });
  };

  const handleResetCamera = () => {
    sceneManager.resetCamera();
  };

  const handleFrontView = () => {
    sceneManager.setCameraPreset('front');
  };

  const handleQuarterView = () => {
    sceneManager.setCameraPreset('quarter');
  };

  const handleSideView = () => {
    sceneManager.setCameraPreset('side');
  };

  return (
    <>
      {/* Camera controls - top left */}
      <div className="viewport-overlay top-left">
        <div className="camera-controls">
          <button
            className="icon-button"
            onClick={handleResetCamera}
            title="Reset camera to default"
            aria-label="Reset camera to default"
          >
            🏠
          </button>
          <button
            className="icon-button"
            onClick={handleFrontView}
            title="Front view"
            aria-label="Front view"
          >
            👤
          </button>
          <button
            className="icon-button"
            onClick={handleQuarterView}
            title="3/4 view"
            aria-label="Three quarter view"
          >
            📐
          </button>
          <button
            className="icon-button"
            onClick={handleSideView}
            title="Side view"
            aria-label="Side view"
          >
            👁️
          </button>
          
          {/* Pop Out Toggle */}
          <button
            className={`icon-button ${isPoppedOut ? 'active' : ''}`}
            onClick={togglePopOut}
            title={isPoppedOut ? "Restore viewport" : "Pop out viewport"}
            aria-label={isPoppedOut ? "Restore viewport" : "Pop out viewport"}
            style={{ marginLeft: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '0.5rem' }}
          >
            {isPoppedOut ? '🔙' : '↗️'}
          </button>
          
          {/* Aspect Ratio Toggle */}
          <div style={{ 
            marginLeft: '0.5rem', 
            borderLeft: '1px solid rgba(255,255,255,0.1)', 
            paddingLeft: '0.5rem',
            display: 'flex',
            gap: '2px'
          }}>
            <button
              className={`icon-button ${aspectRatio === '16:9' ? 'active' : ''}`}
              onClick={() => handleAspectRatioChange('16:9')}
              title="16:9 Landscape"
              aria-label="16:9 aspect ratio"
              style={{ fontSize: '0.65rem', padding: '0.25rem 0.4rem' }}
            >
              16:9
            </button>
            <button
              className={`icon-button ${aspectRatio === '1:1' ? 'active' : ''}`}
              onClick={() => handleAspectRatioChange('1:1')}
              title="1:1 Square"
              aria-label="1:1 aspect ratio"
              style={{ fontSize: '0.65rem', padding: '0.25rem 0.4rem' }}
            >
              1:1
            </button>
            <button
              className={`icon-button ${aspectRatio === '9:16' ? 'active' : ''}`}
              onClick={() => handleAspectRatioChange('9:16')}
              title="9:16 Portrait"
              aria-label="9:16 aspect ratio"
              style={{ fontSize: '0.65rem', padding: '0.25rem 0.4rem' }}
            >
              9:16
            </button>
          </div>
        </div>
      </div>

      {/* Playback controls - bottom center */}
      {mode === 'poselab' && onPlayPause && onStop && (
        <div className="viewport-overlay bottom-center">
          <div className="playback-controls">
            <button
              className="icon-button"
              onClick={onPlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button
              className="icon-button"
              onClick={onStop}
              title="Stop"
              aria-label="Stop animation"
            >
              ⏹️
            </button>
          </div>
        </div>
      )}

      {/* Multiplayer widget - top right */}
      <div className="viewport-overlay top-right">
        <MultiplayerPanel compact />
      </div>

      {/* Logo overlay - hidden but preserved for potential future use or reference */}
      {/* 
      <div className="viewport-overlay bottom-right">
        <img
          src="/logo/poselab.svg"
          alt="Logo"
          className="logo-overlay"
        />
      </div>
      */}
    </>
  );
}

