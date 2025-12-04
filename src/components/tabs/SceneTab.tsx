import { useState, useEffect, useRef } from 'react';
import { sceneManager } from '../../three/sceneManager';
import { backgroundOptions } from '../../three/backgrounds';
import { avatarManager } from '../../three/avatarManager';
import { useReactionStore } from '../../state/useReactionStore';
import type { BackgroundId } from '../../types/reactions';

type AspectRatio = '16:9' | '1:1' | '9:16';

export function SceneTab() {
  const { isAvatarReady, setAvatarReady } = useReactionStore();
  const [selectedBackground, setSelectedBackground] = useState('midnight-circuit');
  const [showLogo, setShowLogo] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const vrmInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize aspect ratio from sceneManager
    const currentRatio = sceneManager.getAspectRatio();
    setAspectRatio(currentRatio);
  }, []);

  const handleVRMUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAvatarReady(false);
    try {
      await avatarManager.load(url);
      setAvatarReady(true);
    } catch (error) {
      console.error('Failed to load VRM:', error);
      alert('Failed to load VRM file');
    }
  };

  const handleBackgroundSelect = async (backgroundId: string) => {
    setSelectedBackground(backgroundId);
    await sceneManager.setBackground(backgroundId as BackgroundId);
  };

  const handleAspectRatioChange = (ratio: AspectRatio) => {
    setAspectRatio(ratio);
    // Update the scene manager to adjust the camera aspect ratio
    sceneManager.setAspectRatio(ratio);
    console.log('[SceneTab] Aspect ratio changed to:', ratio);
  };

  return (
    <div className="tab-content">
      <div className="tab-section">
        <h3>Avatar</h3>
        <p className="muted small">Load or change the current VRM avatar</p>
        <button
          className={isAvatarReady ? 'secondary full-width' : 'primary full-width'}
          onClick={() => vrmInputRef.current?.click()}
        >
          {isAvatarReady ? '🔄 Change Avatar' : '📦 Load VRM Avatar'}
        </button>
        <input
          ref={vrmInputRef}
          type="file"
          accept=".vrm"
          onChange={handleVRMUpload}
          style={{ display: 'none' }}
        />
      </div>

      <div className="tab-section">
        <h3>Backgrounds</h3>
        <p className="muted small">Select a background for your scene</p>
        
        <div className="background-grid">
          {backgroundOptions.map((bg) => (
            <button
              key={bg.id}
              className={`background-thumbnail ${selectedBackground === bg.id ? 'active' : ''}`}
              onClick={() => handleBackgroundSelect(bg.id)}
              title={bg.label}
            >
              <div className="background-thumbnail__preview" style={{
                backgroundImage: bg.image ? `url(${bg.image})` : 'none',
                backgroundColor: bg.image ? 'transparent' : String(bg.color),
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
              <span className="background-thumbnail__name">{bg.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tab-section">
        <h3>Overlay Options</h3>
        <label className="checkbox-option">
          <input
            type="checkbox"
            checked={showLogo}
            onChange={(e) => setShowLogo(e.target.checked)}
          />
          <span>Show logo overlay</span>
        </label>
      </div>

      <div className="tab-section">
        <h3>Aspect Ratio</h3>
        <p className="muted small">Choose aspect ratio for export (applies to canvas framing)</p>
        <div className="button-group">
          <button 
            className={aspectRatio === '16:9' ? 'secondary active' : 'secondary'}
            onClick={() => handleAspectRatioChange('16:9')}
          >
            16:9
          </button>
          <button 
            className={aspectRatio === '1:1' ? 'secondary active' : 'secondary'}
            onClick={() => handleAspectRatioChange('1:1')}
          >
            1:1
          </button>
          <button 
            className={aspectRatio === '9:16' ? 'secondary active' : 'secondary'}
            onClick={() => handleAspectRatioChange('9:16')}
          >
            9:16
          </button>
        </div>
      </div>
    </div>
  );
}

