import { useState, useRef, useEffect } from 'react';
import { useReactionStore } from '../../state/useReactionStore';
import { avatarManager } from '../../three/avatarManager';
import { sceneManager } from '../../three/sceneManager';
import { postProcessingManager } from '../../three/postProcessingManager';
import { useToastStore } from '../../state/useToastStore';
import { batchConfigs, applyMixamoBuffer } from '../../pose-lab/batchUtils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  Aperture, 
  XCircle,
  CircleNotch,
  CaretDown
} from '@phosphor-icons/react';
import * as THREE from 'three';

// Custom Select Component to match UI styling
function CustomSelect({ 
  value, 
  options, 
  onChange 
}: { 
  value: string; 
  options: { value: string; label: string }[]; 
  onChange: (value: string) => void; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          background: 'var(--color-surface)',
          border: isOpen ? '1px solid var(--accent)' : '1px solid var(--border-default)',
          color: 'var(--text-primary)',
          fontSize: '0.9rem',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
      >
        <span>{selectedLabel}</span>
        <CaretDown size={14} weight="bold" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: isOpen ? 'var(--accent)' : 'var(--text-secondary)' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          width: '100%',
          background: 'var(--color-elevated)', // Use elevated background for dropdowns
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          overflow: 'hidden',
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="custom-option"
              style={{
                padding: '0.6rem 0.75rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                background: value === opt.value ? 'rgba(0, 255, 214, 0.1)' : 'transparent',
                color: value === opt.value ? 'var(--accent)' : 'var(--text-primary)',
                borderLeft: value === opt.value ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'background 0.1s'
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TrainingTab() {
  const { isAvatarReady } = useReactionStore();
  const { addToast } = useToastStore();
  
  // Settings
  const [resolution, setResolution] = useState<512 | 1024>(1024);
  const [backgroundType, setBackgroundType] = useState<'transparent' | 'white' | 'green'>('white');
  const [angleMode, setAngleMode] = useState<'turntable' | 'random' | 'front-side'>('turntable');
  const [angleCount, setAngleCount] = useState(8);
  const [useLibraryPoses, setUseLibraryPoses] = useState(false);
  
  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const abortRef = useRef(false);

  const generateDataset = async () => {
    if (!isAvatarReady) {
      addToast('Please load an avatar first', 'warning');
      return;
    }

    const vrm = avatarManager.getVRM();
    const scene = sceneManager.getScene();
    const camera = sceneManager.getCamera();
    const renderer = sceneManager.getRenderer();

    if (!vrm || !scene || !camera || !renderer) {
      addToast('Scene not fully initialized', 'error');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    abortRef.current = false;
    setStatusMessage('Initializing...');

    try {
      const zip = new JSZip();
      const poses = useLibraryPoses ? batchConfigs : [{ id: 'current', label: 'Current Pose', source: '', fileName: '' }];
      const totalSteps = poses.length * angleCount;
      let currentStep = 0;

      // Pause main loop to prevent rendering conflicts
      sceneManager.setRunning(false);

      // Save original state
      const originalBackground = scene.background;
      const originalCameraPos = camera.position.clone();
      const originalCameraRot = camera.rotation.clone();
      const originalAspect = camera.aspect;
      const originalSize = new THREE.Vector2();
      renderer.getSize(originalSize);
      
      const controls = sceneManager.getControls();
      const originalTarget = controls ? controls.target.clone() : new THREE.Vector3();

      // Setup background
      if (backgroundType === 'transparent') {
        scene.background = null; // Will result in transparent if renderer alpha is true
        renderer.setClearColor(0x000000, 0);
      } else if (backgroundType === 'white') {
        scene.background = new THREE.Color(0xffffff);
      } else if (backgroundType === 'green') {
        scene.background = new THREE.Color(0x00ff00);
      }

      // Center camera on avatar hips approx
      const hips = vrm.humanoid?.getNormalizedBoneNode('hips');
      const targetPos = hips ? hips.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(0, 1, 0);
      
      if (controls) {
        controls.target.copy(targetPos);
        controls.update();
      }

      // Generation Loop
      for (const poseConfig of poses) {
        if (abortRef.current) break;

        // Apply Pose
        if (useLibraryPoses && poseConfig.source) {
          setStatusMessage(`Loading pose: ${poseConfig.label}...`);
          try {
            const response = await fetch(poseConfig.source);
            if (!response.ok) throw new Error('Failed to fetch pose');
            const buffer = await response.arrayBuffer();
            
            // Retarget and apply
            // Note: This might be heavy. We skip full animation and just take the first frame pose.
            const { pose } = await applyMixamoBuffer(buffer, poseConfig.fileName, vrm);
            if (pose) {
               vrm.humanoid?.setNormalizedPose(pose);
               vrm.update(0);
            }
          } catch (e) {
            console.error(`Failed to load pose ${poseConfig.label}`, e);
            continue; // Skip failed pose
          }
        } else {
          setStatusMessage(`Capturing current pose...`);
        }

        // Capture Angles
        for (let i = 0; i < angleCount; i++) {
          if (abortRef.current) break;
          setStatusMessage(`Rendering ${poseConfig.label} (${i + 1}/${angleCount})...`);

          // Position Camera
          const radius = 2.5; // Distance from target
          let theta = 0;
          let phi = Math.PI / 2; // Vertical angle (90 deg = equator)

          if (angleMode === 'turntable') {
            theta = (i / angleCount) * Math.PI * 2;
            phi = Math.PI / 2 - 0.2; // Slightly looking down
          } else if (angleMode === 'random') {
             theta = Math.random() * Math.PI * 2;
             phi = Math.PI / 3 + Math.random() * (Math.PI / 3); // Random height
          } else if (angleMode === 'front-side') {
             // 0=Front, 1=Side, 2=Back, etc.
             const angles = [0, Math.PI/2, Math.PI, -Math.PI/2];
             theta = angles[i % angles.length];
             phi = Math.PI / 2;
          }

          const x = targetPos.x + radius * Math.sin(phi) * Math.sin(theta);
          const y = targetPos.y + radius * Math.cos(phi);
          const z = targetPos.z + radius * Math.sin(phi) * Math.cos(theta);

          camera.position.set(x, y, z);
          camera.lookAt(targetPos);
          camera.updateMatrixWorld();

          // Wait a frame for updates?
          await new Promise(r => setTimeout(r, 50));

          const currentSize = new THREE.Vector2();
          renderer.getSize(currentSize);
          
          // Store original aspect
          // const originalAspect = camera.aspect; // Already stored at start
          
          // Resize
          renderer.setSize(resolution, resolution);
          camera.aspect = 1.0; // Square
          camera.updateProjectionMatrix();
          
          if (postProcessingManager.isEnabled()) {
            postProcessingManager.resize(resolution, resolution);
          }

          // Use post-processing composer if enabled
          const composer = postProcessingManager.getComposer();
          if (postProcessingManager.isEnabled() && composer) {
            composer.render();
          } else {
            renderer.render(scene, camera);
          }

          // Capture
          const dataUrl = renderer.domElement.toDataURL('image/png');
          const base64Data = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
          
          const filename = `${poseConfig.id}_${i.toString().padStart(3, '0')}.png`;
          zip.file(filename, base64Data, { base64: true });

          // Restore size
          renderer.setSize(originalSize.width, originalSize.height);
          camera.aspect = originalAspect;
          camera.updateProjectionMatrix();
          
          if (postProcessingManager.isEnabled()) {
            postProcessingManager.resize(originalSize.width, originalSize.height);
          }

          currentStep++;
          setProgress((currentStep / totalSteps) * 100);
          
          // Yield to UI
          await new Promise(r => setTimeout(r, 10));
        }
      }

      if (!abortRef.current) {
        if (Object.keys(zip.files).length === 0) {
          addToast('No images were generated. Check console for details.', 'error');
        } else {
          setStatusMessage('Compressing dataset...');
          const content = await zip.generateAsync({ type: "blob" });
          saveAs(content, `training_dataset_${Date.now()}.zip`);
          addToast(`Dataset generated successfully! (${Object.keys(zip.files).length} images)`, 'success');
        }
      } else {
        addToast('Generation cancelled', 'info');
      }

      // Restore State
      scene.background = originalBackground;
      
      camera.aspect = originalAspect;
      camera.position.copy(originalCameraPos);
      camera.rotation.copy(originalCameraRot);
      camera.updateProjectionMatrix();
      
      renderer.setSize(originalSize.width, originalSize.height);
      if (postProcessingManager.isEnabled()) {
        postProcessingManager.resize(originalSize.width, originalSize.height);
      }

      if (controls) {
        controls.target.copy(originalTarget);
        controls.update();
      }

    } catch (error) {
      console.error(error);
      addToast('Failed to generate dataset', 'error');
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
      sceneManager.setRunning(true);
    }
  };

  const cancelGeneration = () => {
    abortRef.current = true;
  };

  return (
    <div className="tab-content">
      <div className="tab-section">
        <h3>Training Dataset Generator</h3>
        <p className="muted small">Generate synthetic image datasets for LoRA training</p>
        
        {/* Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          
          {/* Resolution */}
          <div>
             <label className="small-label">Resolution</label>
             <div className="button-group">
               <button 
                 className={resolution === 512 ? 'secondary active' : 'secondary'}
                 onClick={() => setResolution(512)}
               >512x512</button>
               <button 
                 className={resolution === 1024 ? 'secondary active' : 'secondary'}
                 onClick={() => setResolution(1024)}
               >1024x1024</button>
             </div>
          </div>

          {/* Background */}
          <div>
             <label className="small-label">Background</label>
             <div className="button-group">
               <button 
                 className={backgroundType === 'white' ? 'secondary active' : 'secondary'}
                 onClick={() => setBackgroundType('white')}
               >White</button>
               <button 
                 className={backgroundType === 'green' ? 'secondary active' : 'secondary'}
                 onClick={() => setBackgroundType('green')}
               >Green</button>
               <button 
                 className={backgroundType === 'transparent' ? 'secondary active' : 'secondary'}
                 onClick={() => setBackgroundType('transparent')}
               >Transparent</button>
             </div>
          </div>

          {/* Poses */}
          <label className="checkbox-option">
            <input 
              type="checkbox"
              checked={useLibraryPoses}
              onChange={(e) => setUseLibraryPoses(e.target.checked)}
            />
            <span>Use Mixamo Pose Library ({batchConfigs.length} poses)</span>
          </label>
          {!useLibraryPoses && <p className="muted x-small">Will only use the current avatar pose.</p>}

          {/* Angle Mode */}
          <div>
             <label className="small-label">Camera Angles</label>
             <CustomSelect 
               value={angleMode} 
               onChange={(val) => setAngleMode(val as any)}
               options={[
                 { value: 'turntable', label: 'Turntable (360°)' },
                 { value: 'random', label: 'Randomized' },
                 { value: 'front-side', label: 'Front/Side/Back' }
               ]}
             />
          </div>

          {/* Angle Count */}
          <div>
             <label className="small-label">Images per Pose: {angleCount}</label>
             <input 
               type="range" 
               min="1" 
               max="24" 
               value={angleCount} 
               onChange={(e) => setAngleCount(parseInt(e.target.value))} 
             />
          </div>

        </div>

        {/* Generate Button */}
        <div style={{ marginTop: '1.5rem' }}>
          {!isGenerating ? (
            <button 
              className="primary full-width"
              onClick={generateDataset}
              disabled={!isAvatarReady}
            >
              <Aperture size={20} weight="duotone" style={{ marginRight: '8px' }} />
              Generate Dataset ({useLibraryPoses ? batchConfigs.length * angleCount : angleCount} images)
            </button>
          ) : (
             <div style={{ textAlign: 'center' }}>
               <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--accent)' }}>
                 <CircleNotch size={20} className="spin" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                 {statusMessage}
               </div>
               <div className="progress-bar">
                 <div className="progress-fill" style={{ width: `${progress}%` }}></div>
               </div>
               <button 
                 className="secondary full-width" 
                 onClick={cancelGeneration}
                 style={{ marginTop: '0.75rem', borderColor: '#ff6b6b', color: '#ff6b6b' }}
               >
                 <XCircle size={16} weight="bold" style={{ marginRight: '6px' }} /> Cancel
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
