import { useUIStore } from '../state/useUIStore';
import { PresetsTab } from './tabs/PresetsTab';
import { PoseExpressionTab } from './tabs/PoseExpressionTab';
import { SceneTab } from './tabs/SceneTab';
import { ExportTab } from './tabs/ExportTab';
import { PosesTab } from './tabs/PosesTab';
import { MocapTab } from './tabs/MocapTab';
import { AnimationsTab } from './tabs/AnimationsTab';

interface ControlPanelProps {
  mode: 'reactions' | 'poselab';
}

export function ControlPanel({ mode }: ControlPanelProps) {
  const { reactionTab, setReactionTab, poseLabTab, setPoseLabTab } = useUIStore();

  if (mode === 'reactions') {
    return (
      <aside className="control-panel">
        <div className="control-panel__tabs">
          <button
            className={reactionTab === 'presets' ? 'active' : ''}
            onClick={() => setReactionTab('presets')}
          >
            Presets
          </button>
          <button
            className={reactionTab === 'pose' ? 'active' : ''}
            onClick={() => setReactionTab('pose')}
          >
            Pose & Expression
          </button>
          <button
            className={reactionTab === 'scene' ? 'active' : ''}
            onClick={() => setReactionTab('scene')}
          >
            Scene
          </button>
          <button
            className={reactionTab === 'export' ? 'active' : ''}
            onClick={() => setReactionTab('export')}
          >
            Export
          </button>
        </div>

        <div className="control-panel__content">
          {reactionTab === 'presets' && <PresetsTab />}
          {reactionTab === 'pose' && <PoseExpressionTab />}
          {reactionTab === 'scene' && <SceneTab />}
          {reactionTab === 'export' && <ExportTab />}
        </div>
      </aside>
    );
  }

  // Pose Lab mode
  return (
    <aside className="control-panel">
      <div className="control-panel__tabs" data-tutorial-id="poselab-tabs">
        <button
          className={poseLabTab === 'animations' ? 'active' : ''}
          onClick={() => setPoseLabTab('animations')}
        >
          Anims
        </button>
        <button
          className={poseLabTab === 'poses' ? 'active' : ''}
          onClick={() => setPoseLabTab('poses')}
        >
          Poses
        </button>
        <button
          className={poseLabTab === 'mocap' ? 'active' : ''}
          onClick={() => setPoseLabTab('mocap')}
        >
          Mocap
        </button>
        <button
          className={poseLabTab === 'export' ? 'active' : ''}
          onClick={() => setPoseLabTab('export')}
        >
          Save
        </button>
      </div>

      <div className="control-panel__content">
        {poseLabTab === 'animations' && <AnimationsTab />}
        {poseLabTab === 'poses' && <PosesTab />}
        {poseLabTab === 'mocap' && <MocapTab />}
        {poseLabTab === 'export' && <ExportTab mode="poselab" />}
      </div>
    </aside>
  );
}

