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
  const progress = Math.min((calibrationStep + 1) / STEPS.length, 1);

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
        setCalibrationStep(Math.min(calibrationStep + 1, STEPS.length - 1));
      } else if (currentStep.type === 'face') {
        console.log('[CalibrationWizard] Triggering Face Calibration');
        manager.calibrateFace();
        addToast("Face/Gaze center captured!", "success");
        setCalibrationStep(Math.min(calibrationStep + 1, STEPS.length - 1));
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
    <div className="modal-overlay" onClick={endCalibration}>
      <div className="modal-content calibration-wizard" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={endCalibration} aria-label="Close calibration wizard">
          &times;
        </button>

        <div className="calibration-wizard__meta">
          <span className="calibration-wizard__eyebrow">
            Tracking Calibration
          </span>
          <span className="calibration-wizard__step">
            Step {Math.min(calibrationStep + 1, STEPS.length)}/{STEPS.length}
          </span>
        </div>

        <div className="progress-bar" aria-hidden="true">
          <div className="progress-bar__fill" style={{ width: `${progress * 100}%` }} />
        </div>

        <h2 className="calibration-wizard__title">{currentStep.title}</h2>
        <p className="calibration-wizard__instruction">{currentStep.instruction}</p>

        <div className="onboarding-actions">
          <button
            className="primary large full-width"
            onClick={handleAction}
            disabled={!manager}
          >
            {manager ? currentStep.actionLabel : "Camera Not Active"}
          </button>
        </div>

        {calibrationStep === 0 && (
          <p className="muted small calibration-wizard__tip">
            Tip: Lighting is key. Ensure your environment is well-lit.
          </p>
        )}
      </div>
    </div>
  );
}
