import { useState, useEffect } from 'react';

export function useMediaDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const fetchDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      // If labels are empty, it means we don't have permission yet.
      // But we don't want to trigger permission prompt just by listing.
      if (videoDevices.length > 0 && videoDevices[0].label !== '') {
        setPermissionGranted(true);
      }
    } catch (e) {
      console.warn('Error enumerating devices:', e);
    }
  };

  useEffect(() => {
    fetchDevices();
    navigator.mediaDevices.addEventListener('devicechange', fetchDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', fetchDevices);
  }, []);

  return { devices, permissionGranted, fetchDevices };
}
