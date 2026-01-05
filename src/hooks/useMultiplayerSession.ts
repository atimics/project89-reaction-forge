import { useEffect, useState, useCallback } from 'react';
import { useMultiplayerStore } from '../state/useMultiplayerStore';
import { peerManager } from '../multiplayer/peerManager';
import { syncManager } from '../multiplayer/syncManager';
import { useToastStore } from '../state/useToastStore';

/**
 * Hook to manage multiplayer session lifecycle
 * Handles URL-based room joining and session state
 */
export function useMultiplayerSession() {
  const {
    roomId,
    role,
    isConnected,
    isConnecting,
    localDisplayName,
    peers,
    error,
    localPeerId,
  } = useMultiplayerStore();

  const addToast = useToastStore((s) => s.addToast);
  const [urlRoomId, setUrlRoomId] = useState<string | null>(null);
  const [hasCheckedUrl, setHasCheckedUrl] = useState(false);

  // Check URL for room parameter on mount
  useEffect(() => {
    if (hasCheckedUrl) return;

    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    
    if (room) {
      console.log('[useMultiplayerSession] Found room in URL:', room);
      setUrlRoomId(room);
      addToast(`Session invite: ${room}`, 'info');
    }
    
    setHasCheckedUrl(true);
  }, [hasCheckedUrl, addToast]);

  // Auto-join if there's a URL room and we're not already connected
  const autoJoin = useCallback(async () => {
    if (!urlRoomId || isConnected || isConnecting) return;

    try {
      // Initialize syncManager BEFORE joining so it can receive messages immediately
      syncManager.initialize();
      await peerManager.joinSession(urlRoomId, localDisplayName);
      
      // Clear room from URL after joining
      clearRoomFromUrl();
      setUrlRoomId(null);
      
      addToast(`Joined session: ${urlRoomId}`, 'success');
    } catch (err) {
      console.error('[useMultiplayerSession] Auto-join failed:', err);
      syncManager.stop(); // Clean up on failure
      addToast(`Failed to join session: ${(err as Error).message}`, 'error');
      // Clear the URL room ID so we don't keep trying
      setUrlRoomId(null);
      clearRoomFromUrl();
    }
  }, [urlRoomId, isConnected, isConnecting, localDisplayName, addToast]);

  // Create a new session
  const createSession = useCallback(async () => {
    try {
      const id = await peerManager.createSession(localDisplayName);
      syncManager.initialize();
      addToast('Session created! Share the link to invite others.', 'success');
      return id;
    } catch (err) {
      console.error('[useMultiplayerSession] Create failed:', err);
      addToast(`Failed to create session: ${(err as Error).message}`, 'error');
      throw err;
    }
  }, [localDisplayName, addToast]);

  // Join an existing session
  const joinSession = useCallback(async (targetRoomId: string) => {
    try {
      // Initialize syncManager BEFORE joining so it can receive messages immediately
      syncManager.initialize();
      await peerManager.joinSession(targetRoomId, localDisplayName);
      clearRoomFromUrl();
      addToast(`Joined session: ${targetRoomId}`, 'success');
    } catch (err) {
      console.error('[useMultiplayerSession] Join failed:', err);
      syncManager.stop(); // Clean up on failure
      addToast(`Failed to join: ${(err as Error).message}`, 'error');
      throw err;
    }
  }, [localDisplayName, addToast]);

  // Leave the current session
  const leaveSession = useCallback(() => {
    syncManager.stop();
    peerManager.leaveSession();
    addToast('Left session', 'info');
  }, [addToast]);

  // Get shareable session URL
  const getSessionUrl = useCallback(() => {
    return peerManager.getSessionUrl();
  }, []);

  // Copy session link to clipboard
  const copySessionLink = useCallback(async () => {
    const url = getSessionUrl();
    if (!url) return false;

    try {
      await navigator.clipboard.writeText(url);
      addToast('Session link copied!', 'success');
      return true;
    } catch {
      addToast('Failed to copy link', 'error');
      return false;
    }
  }, [getSessionUrl, addToast]);

  return {
    // State
    roomId,
    role,
    isConnected,
    isConnecting,
    localPeerId,
    peers: Array.from(peers.values()),
    peerCount: peers.size,
    error,
    urlRoomId,
    isHost: role === 'host',
    isGuest: role === 'guest',
    
    // Actions
    createSession,
    joinSession,
    leaveSession,
    autoJoin,
    getSessionUrl,
    copySessionLink,
  };
}

/**
 * Clear room parameter from URL without page reload
 */
function clearRoomFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('room');
  window.history.replaceState({}, '', url.toString());
}

