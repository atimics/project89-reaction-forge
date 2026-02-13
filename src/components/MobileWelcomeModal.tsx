import { useState, useEffect } from 'react';
import { DeviceMobile, HandTap, X } from '@phosphor-icons/react';

export function MobileWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if mobile
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches;
    
    // Check if already seen in this session
    const hasSeen = sessionStorage.getItem('poselab_mobile_welcome_seen');

    if (isMobile && !hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('poselab_mobile_welcome_seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <button className="modal-close" onClick={handleClose}>
          <X size={24} />
        </button>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '1.5rem',
          color: 'var(--accent)'
        }}>
          <DeviceMobile size={64} weight="duotone" />
        </div>

        <h2 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          color: 'var(--text-primary)'
        }}>
          Mobile Mode Active
        </h2>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          We've optimized performance for your device.
        </p>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: '12px', 
          padding: '1rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '12px',
            color: 'var(--text-primary)',
            fontSize: '0.9rem'
          }}>
            <HandTap size={24} weight="fill" style={{ color: 'var(--accent)' }} />
            <strong>Gestures</strong>
          </div>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '2rem', 
            color: 'var(--text-secondary)', 
            fontSize: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <li><strong>One Finger:</strong> Rotate Camera</li>
            <li><strong>Two Fingers:</strong> Pan & Zoom</li>
          </ul>
        </div>

        <button 
          className="primary full-width large" 
          onClick={handleClose}
        >
          Start Creating
        </button>
      </div>
    </div>
  );
}
