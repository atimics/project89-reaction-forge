/**
 * ViewportEffectOverlay
 * ═══════════════════════════════════════════════════════════════════════════
 * Applies CSS-based visual effects to the 3D viewport
 * Effects: clean (none), scanlines, vhs, hologram
 */

import { useSettingsStore, type ViewportStyle } from '../state/useSettingsStore';

interface ViewportEffectOverlayProps {
  /** Override the style from settings */
  style?: ViewportStyle;
}

export function ViewportEffectOverlay({ style }: ViewportEffectOverlayProps) {
  const settingsStyle = useSettingsStore((state) => state.viewportStyle);
  const activeStyle = style ?? settingsStyle;

  // No overlay for clean style
  if (activeStyle === 'clean') {
    return null;
  }

  return (
    <div className={`viewport-effect-overlay ${activeStyle}`}>
      {/* VHS-specific layers */}
      {activeStyle === 'vhs' && (
        <>
          <div className="vhs-noise" />
          <div className="vhs-vignette" />
        </>
      )}

      {/* Hologram-specific layers */}
      {activeStyle === 'hologram' && (
        <>
          <div className="hologram-glow" />
          <div className="hologram-glitch" />
        </>
      )}
    </div>
  );
}
