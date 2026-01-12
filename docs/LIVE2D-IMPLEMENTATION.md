# 🖼️ Live2D Implementation Guide (v1.3)

> "2D characters, living in a 3D world."

PoseLab now supports **Live2D Cubism** models (`.moc3`) alongside standard 3D VRM avatars. This implementation uses `pixi.js` and `pixi-live2d-display` to render 2D models on a transparent layer above the 3D scene.

---

## ✨ Features

- **Cubism 2/3/4 Support**: Loads `.model3.json` or `.model.json` manifests.
- **Transparent Overlay**: Renders directly over the 3D scene, allowing for hybrid 2D/3D compositions (e.g., 3D background with 2D character).
- **Expression Control**: Trigger expressions defined in the model.
- **Motion Playback**: (Partially Implemented) Basic motion group triggering.
- **Physics**: Built-in Live2D physics (hair/clothes sway) enabled by default.

---

## 🛠️ Technical Architecture

### Tech Stack
- **Engine**: PixiJS v7 (Lightweight 2D WebGL renderer)
- **Library**: `pixi-live2d-display` (Handles Cubism Core integration)
- **Core SDK**: Loads `live2dcubismcore.min.js` from CDN at runtime to respect licensing.

### The `Live2DManager`
Located in `src/live2d/live2dManager.ts`, this singleton manages the lifecycle of the PixiJS application and the Live2D model.

1.  **Initialization**: Creates a transparent `<canvas>` element and overlays it on the main viewport.
2.  **Loading**: 
    -   Checks for global `Live2DCubismCore`. If missing, injects the script tag.
    -   Uses `Live2DModel.from(url)` to load the model asynchronously.
3.  **Rendering Loop**:
    -   Instead of using Pixi's internal ticker, we register a tick handler with our central `SceneManager` (or drive it manually) to ensure synchronization with the application's frame rate.
    -   `model.update(delta)` is called every frame with the time delta.

---

## 🚀 How to Use

### 1. Loading a Model
Live2D models usually consist of a folder of textures, physics files, and a central `.model3.json` manifest.

```typescript
import { live2dManager } from './live2d/live2dManager';

// Load from a URL (local or remote)
await live2dManager.load({
  manifestUrl: '/path/to/model/runtime.model3.json',
  manifestPath: 'model-name',
  label: 'My Live2D Model'
});
```

### 2. Controlling the Model

**Expressions:**
```typescript
// Set expression by ID (defined in the model.json)
live2dManager.setExpression('f01'); 
```

**Physics:**
```typescript
// Toggle hair/clothing physics
live2dManager.setPhysicsEnabled(true);
```

---

## ⚠️ Limitations & Constraints

1.  **Local Files**: Due to browser security sandbox, loading a complex Live2D model (folder structure) from a local disk drag-and-drop is difficult without a local server or strict file picking. Currently, we recommend using hosted URLs or bundling assets.
2.  **Motion Capture**: Webcam tracking currently only drives the 3D VRM. Live2D tracking is planned for a future update (mapping MediaPipe FaceMesh to Live2D Parameters).
3.  **Performance**: Running Three.js (3D) and PixiJS (2D) simultaneously can be heavy on low-end GPUs.

---

## 🔮 Future Roadmap

- **Face Tracking**: Drive Live2D parameters (HeadAngle, EyeOpen, MouthOpen) using the existing MediaPipe integration.
- **Hybrid Export**: Export video including both the 3D background and 2D character layers.
