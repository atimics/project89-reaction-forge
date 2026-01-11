import { useUIStore } from '../state/useUIStore';
import { useToastStore } from '../state/useToastStore';
import { MotionCaptureManager } from '../utils/motionCapture';

interface CalibrationWizardProps {
  manager: MotionCaptureManager | null;
}

const STEPS = [
  {
    title: "Step 1: Body Alignment",
    instruction: "Stand straight in a T-Pose. Ensure your arms are horizontal and your feet are shoulder-width apart.",
    actionLabel: "Capture T-Pose",
    type: 'body'
  },
  {
    title: "Step 2: Eye Calibration",
    instruction: "Look directly at the center of your screen (at your avatar's face). Keep your head neutral.",
    actionLabel: "Capture Gaze Center",
    type: 'face'
  },
  {
    title: "Step 3: Ready!",
    instruction: "Your tracking is now calibrated. You can now move naturally.",
    actionLabel: "Finish Wizard",
    type: 'finish'
  }
];

export function CalibrationWizard({ manager }: CalibrationWizardProps) {
  const { isCalibrationActive, calibrationStep, setCalibrationStep, endCalibration } = useUIStore();
  const { addToast } = useToastStore();

  if (!isCalibrationActive) return null;

  const currentStep = STEPS[calibrationStep] || STEPS[0];

  const handleAction = () => {
    if (!manager) {
      addToast("Error: Motion Capture Manager not found.", "error");
      return;
    }

    try {
      if (currentStep.type === 'body') {
        console.log('[CalibrationWizard] Triggering Body Calibration');
        manager.calibrateBody();
        addToast("Body offsets captured!", "success");
        setCalibrationStep(calibrationStep + 1);
      } else if (currentStep.type === 'face') {
        console.log('[CalibrationWizard] Triggering Face Calibration');
        manager.calibrateFace();
        addToast("Face/Gaze center captured!", "success");
        setCalibrationStep(calibrationStep + 1);
      } else {
        console.log('[CalibrationWizard] Finishing Calibration');
        endCalibration();
        addToast("Calibration complete!", "success");
      }
    } catch (e) {
      console.error('[CalibrationWizard] Calibration failed:', e);
      addToast("Calibration failed. Check console.", "error");
    }
  };

  return (
    <div className="onboarding-overlay" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      <div className="onboarding-card" style={{ width: '450px', border: '1px solid #00ffd6', background: 'var(--bg-panel)', padding: '2rem', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ color: '#00ffd6', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            Tracking Calibration: Step {calibrationStep + 1}/3
          </span>
          <button onClick={endCalibration} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>

        <h2 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)' }}>{currentStep.title}</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
          {currentStep.instruction}
        </p>

        <div className="onboarding-actions">
          <button 
            className="primary large full-width" 
            onClick={handleAction}
            disabled={!manager}
            style={{ opacity: manager ? 1 : 0.5, cursor: manager ? 'pointer' : 'not-allowed' }}
          >
            {manager ? currentStep.actionLabel : "Camera Not Active"}
          </button>
        </div>

        {calibrationStep === 0 && (
          <p className="muted small" style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tip: Lighting is key. Ensure your environment is well-lit.
          </p>
        )}
      </div>
    </div>
  );
}
