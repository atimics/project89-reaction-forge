import { useReactionStore } from '../state/useReactionStore';
import { useTimelineStore } from '../state/useTimelineStore';
import { useAvatarSource } from '../state/useAvatarSource';
import { sceneManager } from '../three/sceneManager';
import { avatarManager } from '../three/avatarManager';
import { PROJECT_VERSION, type ProjectState } from '../types/project';

export class ProjectManager {
  /**
   * Serialize the current application state into a Project object
   */
  serializeProject(name: string = 'Untitled Project'): ProjectState {
    const reactionState = useReactionStore.getState();
    const timelineState = useTimelineStore.getState();
    const avatarSource = useAvatarSource.getState();
    
    const camera = sceneManager.getCamera();
    const controls = sceneManager.getControls();
    
    // Get background ID from the active preset
    const backgroundId = reactionState.activePreset.background || 'midnight';

    // Get avatar URL - check if it's a remote URL (not a blob)
    const currentUrl = avatarManager.getCurrentUrl();
    const isRemoteUrl = currentUrl && !currentUrl.startsWith('blob:');
    
    return {
      version: PROJECT_VERSION,
      date: Date.now(),
      metadata: {
        name,
      },
      scene: {
        backgroundId,
        camera: {
          position: camera ? { x: camera.position.x, y: camera.position.y, z: camera.position.z } : { x: 0, y: 1.4, z: 1.6 },
          target: controls ? { x: controls.target.x, y: controls.target.y, z: controls.target.z } : { x: 0, y: 1.4, z: 0 },
        },
      },
      timeline: {
        sequence: timelineState.sequence,
        duration: timelineState.sequence.duration,
      },
      reaction: {
        animationMode: reactionState.animationMode,
        activePresetId: reactionState.activePreset.id,
      },
      avatar: {
        name: avatarSource.sourceLabel || 'Current Avatar',
        // Only save URL if it's a remote/persistent URL
        url: isRemoteUrl ? currentUrl : undefined
      }
    };
  }

  /**
   * Restore a project from a ProjectState object
   * @returns Object with load status and any warnings
   */
  async loadProject(project: ProjectState): Promise<{ success: boolean; avatarWarning?: string }> {
    console.log('[ProjectManager] Loading project:', project.metadata.name);

    if (project.version > PROJECT_VERSION) {
      console.warn('[ProjectManager] Project version is newer than supported. Some features may break.');
    }

    // 1. Restore Scene
    // Set Background
    try {
      await sceneManager.setBackground(project.scene.backgroundId);
    } catch (e) {
      console.warn('[ProjectManager] Failed to set background:', e);
    }
    
    // Set Camera
    const camera = sceneManager.getCamera();
    const controls = sceneManager.getControls();
    if (camera && controls) {
      camera.position.set(
        project.scene.camera.position.x,
        project.scene.camera.position.y,
        project.scene.camera.position.z
      );
      controls.target.set(
        project.scene.camera.target.x,
        project.scene.camera.target.y,
        project.scene.camera.target.z
      );
      controls.update();
    }

    // 2. Restore Timeline
    const timelineStore = useTimelineStore.getState();
    timelineStore.clearTimeline();
    // Set the full sequence state
    useTimelineStore.setState({
      sequence: project.timeline.sequence,
    });
    timelineStore.setDuration(project.timeline.duration);

    // 3. Restore Reaction State
    const reactionStore = useReactionStore.getState();
    reactionStore.setAnimationMode(project.reaction.animationMode);
    reactionStore.setPresetById(project.reaction.activePresetId);

    // 4. Avatar - Try to load if we have a valid URL
    let avatarWarning: string | undefined;
    if (project.avatar?.url) {
      try {
        const avatarSource = useAvatarSource.getState();
        avatarSource.setRemoteUrl(project.avatar.url, project.avatar.name || 'Project Avatar');
        console.log('[ProjectManager] Attempting to load avatar from:', project.avatar.url);
      } catch (e) {
        console.warn('[ProjectManager] Failed to load avatar:', e);
        avatarWarning = 'Could not load avatar. Please reload it manually.';
      }
    } else if (project.avatar?.name) {
      // Avatar was local file, can't restore
      avatarWarning = `Avatar "${project.avatar.name}" was a local file and needs to be reloaded.`;
      console.log('[ProjectManager] Avatar was local file, cannot auto-restore:', project.avatar.name);
    }

    console.log('[ProjectManager] Project loaded successfully:', project.metadata.name);
    return { success: true, avatarWarning };
  }

  /**
   * Export project to JSON file
   */
  downloadProject(name: string) {
    const project = this.serializeProject(name);
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_').toLowerCase()}.pose`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Parse a file input and load the project
   * @returns Object with success status and optional avatar warning
   */
  async loadFromFile(file: File): Promise<{ success: boolean; avatarWarning?: string }> {
    try {
      const text = await file.text();
      const project = JSON.parse(text) as ProjectState;
      const result = await this.loadProject(project);
      return result;
    } catch (e) {
      console.error('[ProjectManager] Failed to load project file:', e);
      return { success: false };
    }
  }
}

export const projectManager = new ProjectManager();

