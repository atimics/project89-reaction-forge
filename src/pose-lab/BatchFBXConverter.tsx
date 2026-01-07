/**
 * BatchFBXConverter - Converts FBX files to VRM pose JSON format
 * 
 * This component provides a UI to batch convert FBX animations from src/poses/fbx/
 * to proper VRM pose JSON files that can be used in the app.
 * 
 * Usage: Access via PoseLab when a VRM is loaded
 */

import { useState } from 'react';
import type { VRM } from '@pixiv/three-vrm';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { getMixamoAnimation } from './getMixamoAnimation';
import { poseFromClip } from './poseFromClip';
import { convertAnimationToScenePaths } from './convertAnimationToScenePaths';
import { serializeAnimationClip } from '../poses/animationClipSerializer';

// FBX files available for conversion
const FBX_FILES = [
  { file: 'Cheering.fbx', id: 'cheering', label: 'Cheering' },
  { file: 'Clapping.fbx', id: 'clapping-fbx', label: 'Clapping' },
  { file: 'Climbing To Top.fbx', id: 'climbing', label: 'Climbing' },
  { file: 'Defeat.fbx', id: 'defeat', label: 'Defeat' },
  { file: 'Focus.fbx', id: 'focus', label: 'Focus' },
  { file: 'Happy Idle.fbx', id: 'happy-idle', label: 'Happy Idle' },
  { file: 'Offensive Idle.fbx', id: 'offensive-idle', label: 'Offensive Idle' },
  { file: 'Pointing.fbx', id: 'pointing-mixamo', label: 'Pointing' },
  { file: 'Rope Climb.fbx', id: 'rope-climb', label: 'Rope Climb' },
  { file: 'Silly Dancing.fbx', id: 'silly-dancing', label: 'Silly Dancing' },
  { file: 'Standing Thumbs Up.fbx', id: 'thumbs-up', label: 'Thumbs Up' },
  { file: 'Taunt.fbx', id: 'taunt-mixamo', label: 'Taunt' },
  { file: 'Treading Water.fbx', id: 'treading-water', label: 'Treading Water' },
  { file: 'Waking.fbx', id: 'waking', label: 'Waking' },
];

interface ConversionResult {
  id: string;
  label: string;
  success: boolean;
  error?: string;
  poseJson?: string;
  animationJson?: string;
}

interface BatchFBXConverterProps {
  vrm: VRM;
}

export function BatchFBXConverter({ vrm }: BatchFBXConverterProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [currentFile, setCurrentFile] = useState('');

  const convertFBX = async (fileInfo: typeof FBX_FILES[0]): Promise<ConversionResult> => {
    try {
      const loader = new FBXLoader();
      // Load from public folder (accessible at runtime)
      const fbxPath = `/poses/fbx/${fileInfo.file}`;
      
      // Load FBX
      const group = await loader.loadAsync(fbxPath);
      const animations = group.animations;

      if (!animations?.length) {
        return {
          id: fileInfo.id,
          label: fileInfo.label,
          success: false,
          error: 'No animations found in FBX',
        };
      }

      // Retarget to VRM
      const vrmClip = getMixamoAnimation(animations, group, vrm);
      if (!vrmClip) {
        return {
          id: fileInfo.id,
          label: fileInfo.label,
          success: false,
          error: 'Failed to retarget animation to VRM',
        };
      }

      // Extract pose from first frame
      const pose = poseFromClip(vrmClip);
      if (!pose || Object.keys(pose).length === 0) {
        return {
          id: fileInfo.id,
          label: fileInfo.label,
          success: false,
          error: 'No pose data extracted',
        };
      }

      // Create pose JSON
      const posePayload = {
        sceneRotation: { y: 180 },
        vrmPose: pose,
      };

      // Convert to scene paths for animation
      const scenePathClip = convertAnimationToScenePaths(vrmClip, vrm);
      const serializedClip = serializeAnimationClip(scenePathClip);

      return {
        id: fileInfo.id,
        label: fileInfo.label,
        success: true,
        poseJson: JSON.stringify(posePayload, null, 2),
        animationJson: JSON.stringify(serializedClip, null, 2),
      };
    } catch (error) {
      return {
        id: fileInfo.id,
        label: fileInfo.label,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const runBatchConversion = async () => {
    setIsConverting(true);
    setResults([]);
    setProgress(0);

    const newResults: ConversionResult[] = [];

    for (let i = 0; i < FBX_FILES.length; i++) {
      const fileInfo = FBX_FILES[i];
      setCurrentFile(fileInfo.label);
      setProgress(((i + 1) / FBX_FILES.length) * 100);

      const result = await convertFBX(fileInfo);
      newResults.push(result);
      setResults([...newResults]);

      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsConverting(false);
    setCurrentFile('');
  };

  const downloadResult = (result: ConversionResult) => {
    if (!result.success) return;

    // Download pose JSON
    if (result.poseJson) {
      const blob = new Blob([result.poseJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    // Download animation JSON
    if (result.animationJson) {
      setTimeout(() => {
        const blob = new Blob([result.animationJson!], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${result.id}-animation.json`;
        a.click();
        URL.revokeObjectURL(url);
      }, 300);
    }
  };

  const downloadAll = () => {
    const successfulResults = results.filter(r => r.success);
    successfulResults.forEach((result, index) => {
      setTimeout(() => downloadResult(result), index * 600);
    });
  };

  return (
    <div style={{ padding: '1rem', background: '#1a1a2e', borderRadius: '8px', marginTop: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#00ff88' }}>FBX Batch Converter</h3>
      
      <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '1rem' }}>
        Converts FBX files from <code>src/poses/fbx/</code> to VRM pose format.
        Make sure a VRM is loaded first.
      </p>

      <button
        onClick={runBatchConversion}
        disabled={isConverting}
        style={{
          padding: '0.75rem 1.5rem',
          background: isConverting ? '#444' : '#00ff88',
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          cursor: isConverting ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          marginRight: '0.5rem',
        }}
      >
        {isConverting ? `Converting... ${Math.round(progress)}%` : 'Start Batch Conversion'}
      </button>

      {results.length > 0 && results.some(r => r.success) && (
        <button
          onClick={downloadAll}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#4488ff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Download All ({results.filter(r => r.success).length} files)
        </button>
      )}

      {currentFile && (
        <p style={{ marginTop: '0.5rem', color: '#00ff88' }}>
          Processing: {currentFile}
        </p>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem', color: '#888' }}>File</th>
                <th style={{ textAlign: 'left', padding: '0.5rem', color: '#888' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '0.5rem', color: '#888' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '0.5rem', color: '#fff' }}>{result.label}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {result.success ? (
                      <span style={{ color: '#00ff88' }}>✓ Success</span>
                    ) : (
                      <span style={{ color: '#ff4444' }}>✗ {result.error}</span>
                    )}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                    {result.success && (
                      <button
                        onClick={() => downloadResult(result)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#333',
                          color: '#fff',
                          border: '1px solid #555',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

