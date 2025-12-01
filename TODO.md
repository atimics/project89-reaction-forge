# Project 89 Reaction Forge - TODO List

**Current Version**: v1.0.0  
**Next Target**: v1.1.0 (Visual Polish)  
**Updated**: December 1, 2025

---

## 🔥 Immediate Actions (This Week)

### Repository Housekeeping
- [x] Rename repository to `project89-reaction-forge`
- [ ] Update local git remote URL
  ```bash
  git remote set-url origin https://github.com/0xQuan93/project89-reaction-forge.git
  ```
- [ ] Verify push/pull works with new URL
- [ ] Update any external links/bookmarks

---

## 🎨 Phase 2.1: Custom Backgrounds (Week 1-2)

### Design Assets
- [ ] Create 6 background designs
  - [ ] Midnight gradient (dark purple → deep blue)
  - [ ] Dawn gradient (orange → pink → purple)
  - [ ] Loom pattern (geometric, teal/purple)
  - [ ] Nebula (space, stars, purple/blue)
  - [ ] Matrix (falling code, green/black)
  - [ ] Cyber grid (neon lines, blue/pink)
- [ ] Export as CSS gradients or images
- [ ] Store in `public/backgrounds/` (if images)

### Code Implementation
- [ ] Update `src/three/backgrounds.ts`
  ```typescript
  export const backgrounds = {
    midnight: { type: 'gradient', colors: ['#1a0033', '#000428'] },
    dawn: { type: 'gradient', colors: ['#ff6b6b', '#c44569', '#4a148c'] },
    loom: { type: 'pattern', url: '/backgrounds/loom.png' },
    // ... etc
  };
  ```
- [ ] Add background application to `SceneManager`
  ```typescript
  setBackground(backgroundId: BackgroundId) {
    const bg = getBackgroundDefinition(backgroundId);
    if (bg.type === 'gradient') {
      this.scene.background = new THREE.Color(bg.colors[0]);
      // Apply gradient to canvas CSS
    } else {
      // Load texture
    }
  }
  ```
- [ ] Update `src/types/reactions.ts`
  ```typescript
  export type BackgroundId = 
    | 'midnight' 
    | 'dawn' 
    | 'loom' 
    | 'nebula' 
    | 'matrix' 
    | 'cyber-grid';
  ```
- [ ] Add to `ReactionPreset` type
  ```typescript
  export interface ReactionPreset {
    // ... existing fields
    background: BackgroundId;
  }
  ```

### UI Updates
- [ ] Add background selector to `ReactionPanel.tsx`
  ```tsx
  <select 
    value={background} 
    onChange={(e) => setBackground(e.target.value)}
  >
    <option value="midnight">Midnight</option>
    <option value="dawn">Dawn</option>
    {/* ... etc */}
  </select>
  ```
- [ ] Add preview thumbnails (optional)
- [ ] Update randomize to include backgrounds
- [ ] Test on all backgrounds

### Documentation
- [ ] Update README with background info
- [ ] Add screenshots of each background
- [ ] Document how to add custom backgrounds

---

## 🏷️ Phase 2.2: Logo & Watermark (Week 2)

### Design Assets
- [ ] Create Project 89 logo
  - [ ] Full logo (text + icon)
  - [ ] Icon only
  - [ ] Horizontal layout
  - [ ] Vertical layout
- [ ] Export in multiple formats
  - [ ] SVG (preferred, scalable)
  - [ ] PNG (transparent, 512x512)
  - [ ] PNG (transparent, 256x256)
  - [ ] PNG (transparent, 128x128)
- [ ] Create color variations
  - [ ] White (for dark backgrounds)
  - [ ] Black (for light backgrounds)
  - [ ] Purple (brand color)
  - [ ] Gradient version
- [ ] Store in `public/branding/`

### Code Implementation
- [ ] Create `src/utils/watermark.ts`
  ```typescript
  export function applyWatermark(
    canvas: HTMLCanvasElement,
    options: WatermarkOptions
  ): HTMLCanvasElement {
    const ctx = canvas.getContext('2d');
    const logo = new Image();
    logo.src = options.logoUrl;
    
    logo.onload = () => {
      ctx.globalAlpha = options.opacity;
      ctx.drawImage(
        logo,
        options.x,
        options.y,
        options.width,
        options.height
      );
    };
    
    return canvas;
  }
  ```
- [ ] Update PNG export in `CanvasStage.tsx`
  ```typescript
  const exportPNG = () => {
    renderer.render(scene, camera);
    const canvas = renderer.domElement;
    const watermarked = applyWatermark(canvas, {
      logoUrl: '/branding/logo-white.png',
      position: 'bottom-right',
      opacity: 0.7,
      size: 'small'
    });
    // ... download logic
  };
  ```
- [ ] Add watermark toggle (for Pro users later)
- [ ] Test on different canvas sizes

### UI Updates
- [ ] Add watermark preview in UI
- [ ] Add position selector (optional)
- [ ] Add opacity slider (optional)
- [ ] Show "Watermark: ON" indicator

### Documentation
- [ ] Document watermark system
- [ ] Add branding guidelines
- [ ] Logo usage terms

---

## 😊 Phase 2.3: Facial Expressions (Week 3)

### Research
- [ ] Study VRM expression system
  ```typescript
  // Test code
  vrm.expressionManager?.setValue('happy', 1.0);
  vrm.expressionManager?.setValue('neutral', 0.0);
  ```
- [ ] List available expressions in test VRM
- [ ] Document expression names and ranges
- [ ] Test blending multiple expressions

### Code Implementation
- [ ] Update `src/three/avatarManager.ts`
  ```typescript
  applyExpression(expression: ExpressionId) {
    if (!this.vrm?.expressionManager) return;
    
    // Reset all expressions
    this.vrm.expressionManager.setValue('neutral', 1.0);
    
    // Apply target expression
    const expressionMap = {
      happy: 'happy',
      surprised: 'surprised',
      angry: 'angry',
      sad: 'sad',
      // ... map ExpressionId to VRM expression names
    };
    
    const vrmExpression = expressionMap[expression];
    if (vrmExpression) {
      this.vrm.expressionManager.setValue(vrmExpression, 1.0);
    }
    
    this.vrm.update(0);
  }
  ```
- [ ] Update `src/types/reactions.ts`
  ```typescript
  export type ExpressionId = 
    | 'neutral'
    | 'happy'
    | 'surprised'
    | 'angry'
    | 'sad'
    | 'wink'
    | 'serious'
    | 'concerned';
  ```
- [ ] Add to `ReactionPreset`
- [ ] Update `src/data/reactions.ts` with expression combos

### UI Updates
- [ ] Add expression selector to `ReactionPanel.tsx`
- [ ] Create expression preview icons
- [ ] Update randomize to include expressions
- [ ] Test all expression + pose combinations

### Documentation
- [ ] Document expression system
- [ ] Add expression examples
- [ ] Troubleshooting guide

---

## 🎨 Phase 2.4: UI/UX Polish (Week 4)

### Design System
- [ ] Define Project 89 color palette
  ```css
  :root {
    --p89-purple: #8b5cf6;
    --p89-blue: #3b82f6;
    --p89-pink: #ec4899;
    --p89-dark: #0f172a;
    --p89-light: #f8fafc;
  }
  ```
- [ ] Choose typography
  - [ ] Heading font (bold, futuristic)
  - [ ] Body font (readable, clean)
  - [ ] Monospace font (code, data)
- [ ] Create component library
  - [ ] Buttons (primary, secondary, danger)
  - [ ] Inputs (text, select, checkbox)
  - [ ] Cards, panels, modals
  - [ ] Loading states, spinners

### Layout Improvements
- [ ] Make responsive
  - [ ] Mobile (< 640px)
  - [ ] Tablet (640px - 1024px)
  - [ ] Desktop (> 1024px)
- [ ] Improve canvas sizing
  - [ ] Auto-resize on window resize
  - [ ] Maintain aspect ratio
  - [ ] Full-screen mode (optional)
- [ ] Collapsible panels
  - [ ] Hide controls when not needed
  - [ ] Keyboard shortcut to toggle
- [ ] Add keyboard shortcuts
  - [ ] Space: Randomize
  - [ ] S: Save PNG
  - [ ] R: Reset
  - [ ] 1-8: Select pose

### Visual Feedback
- [ ] Add loading states
  - [ ] VRM loading spinner
  - [ ] "Applying pose..." indicator
  - [ ] Progress bars
- [ ] Add success/error toasts
  - [ ] "Saved!" toast on export
  - [ ] "Error loading VRM" toast
  - [ ] Auto-dismiss after 3s
- [ ] Smooth transitions
  - [ ] Fade in/out
  - [ ] Slide animations
  - [ ] Pose change transition
- [ ] Hover effects
  - [ ] Button hover states
  - [ ] Card hover lift
  - [ ] Tooltip on hover

### Accessibility
- [ ] Add ARIA labels
  ```tsx
  <button aria-label="Randomize reaction">
    Randomize
  </button>
  ```
- [ ] Keyboard navigation
  - [ ] Tab through controls
  - [ ] Enter to activate
  - [ ] Escape to close modals
- [ ] Screen reader support
  - [ ] Announce state changes
  - [ ] Describe images
- [ ] Color contrast
  - [ ] Test with WCAG checker
  - [ ] Ensure 4.5:1 ratio minimum

### Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile Chrome
- [ ] Test on mobile Safari
- [ ] Test with keyboard only
- [ ] Test with screen reader

---

## 🧪 Testing & Quality

### Manual Testing
- [ ] Test all 8 poses
- [ ] Test all backgrounds (when added)
- [ ] Test all expressions (when added)
- [ ] Test randomize 20+ times
- [ ] Test PNG export
- [ ] Test with different VRM files
- [ ] Test on slow connection
- [ ] Test with no internet (cached)

### Performance Testing
- [ ] Measure load time (target: <2s)
- [ ] Measure FPS (target: 60 FPS)
- [ ] Check bundle size (target: <1.5MB)
- [ ] Profile with Chrome DevTools
- [ ] Test on low-end device

### Bug Fixes
- [ ] Fix any linting errors
- [ ] Fix TypeScript errors
- [ ] Fix console warnings
- [ ] Fix mobile layout issues
- [ ] Fix Safari-specific bugs

---

## 📚 Documentation Updates

### README Updates
- [ ] Add screenshots of new features
- [ ] Update feature list
- [ ] Add background examples
- [ ] Add expression examples
- [ ] Update roadmap section

### Code Documentation
- [ ] Add JSDoc comments to new functions
- [ ] Document complex algorithms
- [ ] Add inline comments for clarity
- [ ] Update type definitions

### User Guide
- [ ] Create user guide (optional)
- [ ] Video tutorial (optional)
- [ ] FAQ section
- [ ] Troubleshooting guide

---

## 🚀 Deployment

### Pre-Deployment Checklist
- [ ] Run full build
  ```bash
  npm run build
  ```
- [ ] Test production build locally
  ```bash
  npm run preview
  ```
- [ ] Check for console errors
- [ ] Verify all assets load
- [ ] Test on multiple browsers

### Deployment Steps
- [ ] Commit all changes
- [ ] Tag release
  ```bash
  git tag -a v1.1.0 -m "Release v1.1.0: Visual Polish"
  git push origin v1.1.0
  ```
- [ ] Deploy to hosting (Vercel/Netlify/etc)
- [ ] Verify production URL works
- [ ] Update beta.project89.org links

### Post-Deployment
- [ ] Announce on Discord/Twitter
- [ ] Gather user feedback
- [ ] Monitor analytics
- [ ] Watch for bug reports

---

## 🎯 Success Criteria for v1.1.0

### Must Have
- [x] 6+ custom backgrounds
- [x] Logo/watermark on exports
- [x] 8+ facial expressions
- [x] Responsive UI (mobile + desktop)
- [x] No console errors
- [x] <2s load time

### Nice to Have
- [ ] Smooth animations
- [ ] Keyboard shortcuts
- [ ] Dark/light mode toggle
- [ ] User preferences saved
- [ ] Share button (Twitter/Discord)

### Metrics to Track
- [ ] User engagement (reactions per user)
- [ ] Export count
- [ ] Most popular poses/backgrounds
- [ ] Load time
- [ ] Error rate

---

## 📝 Notes

### Design Inspiration
- Look at VTuber apps (VSeeFace, VTube Studio)
- Check avatar platforms (Ready Player Me, VRoid Hub)
- Study Project 89 branding
- Cyberpunk/futuristic aesthetic

### Technical Considerations
- Keep bundle size under control
- Optimize images (WebP format)
- Lazy load heavy components
- Use CSS for simple animations
- Cache assets aggressively

### Community Feedback
- Ask Discord for background ideas
- Get feedback on logo designs
- Test with beta users
- Iterate based on usage data

---

**Next Review**: December 8, 2025  
**Sprint Duration**: 2 weeks  
**Team**: Project 89 Development

---

*Check off items as you complete them. Update this file regularly.*

