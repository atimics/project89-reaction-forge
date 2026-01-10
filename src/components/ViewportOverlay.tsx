import { useState, useEffect } from 'react';
import { sceneManager } from '../three/sceneManager';

import { usePopOutViewport } from '../hooks/usePopOutViewport';
import { useUIStore } from '../state/useUIStore';
import { MultiplayerPanel } from './MultiplayerPanel';
import { notifySceneChange } from '../multiplayer/avatarBridge';
import { 
  House, 
  User, 
  Cube, 
  Eye, 
  EyeSlash,
  ArrowSquareOut, 
  ArrowSquareIn,
  Play,
  Pause,
  Stop
} from '@phosphor-icons/react';

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
  const [showClock, setShowClock] = useState(true);
  const [now, setNow] = useState(() => new Date());

  // Sync with sceneManager on mount
  useEffect(() => {
    setAspectRatio(sceneManager.getAspectRatio());
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleAspectRatioChange = (ratio: AspectRatio) => {
    setAspectRatio(ratio);
    sceneManager.setAspectRatio(ratio);
    notifySceneChange({ aspectRatio: ratio });
  };

  const handleResetCamera = () => {
    sceneManager.resetCamera();
  };

  const handleHeadshotView = () => {
    sceneManager.setCameraPreset('headshot');
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
            onClick={handleHeadshotView}
            title="Headshot view [1]"
            aria-label="Headshot view"
          >
            <User size={18} weight="duotone" />
          </button>
          <button
            className="icon-button"
            onClick={handleQuarterView}
            title="3/4 view [3]"
            aria-label="Three quarter view"
          >
            <Cube size={18} weight="duotone" />
          </button>
          <button
            className="icon-button"
            onClick={handleSideView}
            title="Side view [5]"
            aria-label="Side view"
          >
            <Eye size={18} weight="duotone" />
          </button>
          <button
            className="icon-button"
            onClick={handleResetCamera}
            title="Home view [7]"
            aria-label="Home view"
          >
            <House size={18} weight="duotone" />
          </button>
          
          {/* Pop Out Toggle */}
          <button
            className={`icon-button ${isPoppedOut ? 'active' : ''}`}
            onClick={togglePopOut}
            title={isPoppedOut ? "Restore viewport" : "Pop out viewport"}
            aria-label={isPoppedOut ? "Restore viewport" : "Pop out viewport"}
            style={{ marginLeft: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '0.5rem' }}
          >
            {isPoppedOut ? <ArrowSquareIn size={18} weight="duotone" /> : <ArrowSquareOut size={18} weight="duotone" />}
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
              {isPlaying ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
            </button>
            <button
              className="icon-button"
              onClick={onStop}
              title="Stop"
              aria-label="Stop animation"
            >
              <Stop size={18} weight="fill" />
            </button>
          </div>
        </div>
      )}

      {/* Multiplayer widget - top right */}
      <div className="viewport-overlay top-right">
        <MultiplayerPanel compact />
      </div>

      {/* Clock widget - bottom left */}
      <div className="viewport-overlay bottom-left">
        <div className="clock-widget">
          <span className={`clock-time ${showClock ? '' : 'is-hidden'}`} aria-live="polite">
            {showClock ? now.toLocaleTimeString() : 'Clock off'}
          </span>
          <button
            className={`icon-button clock-toggle ${showClock ? 'active' : ''}`}
            onClick={() => setShowClock((prev) => !prev)}
            title={showClock ? 'Hide clock' : 'Show clock'}
            aria-label={showClock ? 'Hide clock' : 'Show clock'}
          >
            {showClock ? <EyeSlash size={18} weight="duotone" /> : <Eye size={18} weight="duotone" />}
          </button>
        </div>
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
