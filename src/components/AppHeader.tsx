import { useRef, useState } from 'react';
import { useAvatarSource } from '../state/useAvatarSource';
import { useReactionStore } from '../state/useReactionStore';
import { useToastStore } from '../state/useToastStore';
import { AboutModal } from './AboutModal';
import { SettingsModal } from './SettingsModal';
import { projectManager } from '../persistence/projectManager';
import { 
  GearSix, 
  FloppyDisk, 
  FolderOpen, 
  Question,
  Atom,
  Flask
} from '@phosphor-icons/react';

interface AppHeaderProps {
  mode: 'reactions' | 'poselab';
  onModeChange: (mode: 'reactions' | 'poselab') => void;
}

export function AppHeader({ mode, onModeChange }: AppHeaderProps) {
  const vrmInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { currentUrl, setFileSource, sourceLabel } = useAvatarSource();
  const isAvatarReady = useReactionStore((state) => state.isAvatarReady);
  const { addToast } = useToastStore();

  const handleVRMUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.vrm')) {
      addToast('Please select a VRM file', 'error');
      return;
    }
    
    setFileSource(file);
  };

  const handleProjectLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      
      const result = await projectManager.loadFromFile(file);
      if (result.success) {
          addToast("Project loaded", "success");
          // Show avatar warning if needed
          if (result.avatarWarning) {
            setTimeout(() => addToast(result.avatarWarning!, "warning"), 500);
          }
      } else {
          addToast("Failed to load project", "error");
      }
      // Reset input value to allow reloading same file
      event.target.value = '';
  };

  const handleProjectSave = () => {
      projectManager.downloadProject("My Project");
      addToast("Project saved", "success");
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header__left">
          <div className="app-header__logo">
            <img src="/logo/poselab.svg" alt="PoseLab" />
            <span>PoseLab</span>
          </div>
          <div className="mode-switch" data-tutorial-id="mode-switch">
            <button
              className={mode === 'reactions' ? 'active' : ''}
              onClick={() => onModeChange('reactions')}
            >
              <Atom size={16} weight="duotone" />
              <span>Reactions</span>
            </button>
            <button
              className={mode === 'poselab' ? 'active' : ''}
              onClick={() => onModeChange('poselab')}
            >
              <Flask size={16} weight="duotone" />
              <span>Pose Lab</span>
            </button>
          </div>
        </div>

        <div className="app-header__center">
          {currentUrl ? (
            <div className="avatar-selector">
              <span className="avatar-selector__label">{sourceLabel}</span>
              <button
                className="avatar-selector__button"
                onClick={() => vrmInputRef.current?.click()}
                title="Change avatar"
              >
                Change Avatar
              </button>
            </div>
          ) : (
            <button
              className="avatar-selector__button primary"
              onClick={() => vrmInputRef.current?.click()}
            >
              Load VRM Avatar
            </button>
          )}
          <input
            ref={vrmInputRef}
            type="file"
            accept=".vrm"
            onChange={handleVRMUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div className="app-header__right">
          <div className="status-indicator">
            <span className={`status-dot ${isAvatarReady ? 'ready' : 'loading'}`} />
            <span className="status-text">{isAvatarReady ? 'Ready' : 'Loading...'}</span>
          </div>
          <button 
            className="icon-button"
            style={{ width: '32px', height: '32px', marginLeft: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            <GearSix size={20} weight="duotone" />
          </button>
          
          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 0.5rem' }}></div>

          <button 
            className="icon-button"
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleProjectSave}
            title="Save Project"
          >
            <FloppyDisk size={20} weight="duotone" />
          </button>
          <button 
            className="icon-button"
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => projectInputRef.current?.click()}
            title="Load Project"
          >
            <FolderOpen size={20} weight="duotone" />
          </button>
          
          <input
            ref={projectInputRef}
            type="file"
            accept=".pose,.json"
            onChange={handleProjectLoad}
            style={{ display: 'none' }}
          />

          <button 
            className="icon-button"
            style={{ width: '32px', height: '32px', marginLeft: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowAbout(true)}
            title="About PoseLab"
          >
            <Question size={20} weight="duotone" />
          </button>
        </div>
      </header>
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
