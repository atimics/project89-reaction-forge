# Streaming with PoseLab: OBS Browser Source Workflow

This guide explains how to use PoseLab directly within OBS Studio as a Browser Source. This allows you to have your avatar, animations, and transparent backgrounds rendered live in your stream without complex virtual camera setups or external capture windows.

## The "Virtual Camera" Workflow (Browser Source)

This method runs PoseLab directly inside OBS, keeping your main work environment free while streaming your avatar.

### Prerequisites
- OBS Studio installed
- PoseLab project set up locally

### Step-by-Step Setup

1. **Launch PoseLab Locally**
   - Open your project directory in your terminal (PowerShell, Command Prompt, or VS Code terminal).
   - Run the development server:
     ```bash
     npm run dev
     ```
   - Note the local address provided (usually `http://localhost:5173`).

2. **Add to OBS**
   - Open OBS Studio.
   - In your Scene, click the **+** icon under **Sources**.
   - Select **Browser**.
   - Name it (e.g., "PoseLab Avatar").
   - In the properties window:
     - **URL**: Paste your localhost link (e.g., `http://localhost:5173`).
     - **Width**: 1920 (or your desired canvas width).
     - **Height**: 1080 (or your desired canvas height).
     - **Control Audio via OBS**: Check this if you want sound from PoseLab.
     - **Custom CSS**: Clear this field (optional, but ensures no interference).
   - Click **OK**.

3. **Configure Transparency & Streamer Mode**
   - Right-click the new Browser Source in OBS and select **Interact**. This opens a window where you can click and control PoseLab just like in a browser.
   - **Streamer Mode**: 
     - Go to the **Scene** tab.
     - Toggle **Streamer Mode** ON. This hides the UI overlay, leaving only your avatar.
   - **Transparent Background**:
     - In the **Scene** tab, select the **Green Screen** background or enable **Transparent Background** if supported by your OBS version/setup (WebM export settings in Export tab can also help with creating assets with transparency).
     - *Tip*: If using "Green Screen" background, apply a **Chroma Key** filter to the Browser Source in OBS to key out the green.

4. **You're Good to Go!**
   - You can now control your avatar via the Interact window or set up Director Mode scripts to run automatically.
   - Your local work environment remains untouched, and the stream gets a clean, high-quality feed of your avatar.

---

### Why use this method?
- **Performance**: Renders directly in the composition pipeline.
- **Clean**: No window borders or desktop capturing required.
- **Independent**: You can minimize your code editor or browser without affecting the stream avatar.

---

## 🎥 Supported Tracking Methods

This streaming workflow supports all of PoseLab's tracking features:

### 1. Built-in Webcam & Audio
You can use PoseLab's native motion capture features directly in the OBS Browser Source.
- **Face & Body Tracking**: Enable webcam access in the Browser Source properties (or Interact window) to use MediaPipe tracking.
- **Voice Lip Sync**: Enable microphone access to drive mouth movements with your voice.

### 2. External VMC Senders
PoseLab supports the VMC (Virtual Motion Capture) protocol, allowing you to drive your avatar using external applications while streaming.
- **Compatible Software**: Works with **XR Animator**, **Warudo**, **VSeeFace**, **MocapGetAll**, and any other VMC-capable tool.
- **Setup**:
  1. Ensure your VMC sender is broadcasting to the correct port (default `39539`).
  2. In PoseLab (inside OBS), go to the **Mocap** tab.
  3. Connect to the local VMC bridge.
  
  👉 **[See the VMC Input Guide](VMC-INPUT.md)** for detailed port configuration and bridge setup.
