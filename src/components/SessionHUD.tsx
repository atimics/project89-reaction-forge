/**
 * SessionHUD - Social overlay for multiplayer sessions
 * 
 * Features:
 * - Chat panel
 * - Reaction bubbles
 * - Participant list
 * - Group photo controls
 * - Presence indicators
 */

import { useState, useEffect, useRef } from 'react';
import { useMultiplayerStore } from '../state/useMultiplayerStore';
import { useSessionStore } from '../state/useSessionStore';
import { socialManager } from '../multiplayer/socialManager';
import type { ReactionType } from '../types/multiplayer';
import './SessionHUD.css';
import { 
  Users, 
  Smiley, 
  Camera, 
  ChatCircle, 
  X, 
  PaperPlaneTilt,
  FloppyDisk,
  HandWaving,
  ThumbsUp,
  Check,
  Heart,
  Confetti,
  MaskHappy,
  WarningCircle,
  MusicNotes
} from '@phosphor-icons/react';

const REACTIONS: { type: ReactionType; icon: React.ReactNode; label: string; emoji: string }[] = [
  { type: 'wave', icon: <HandWaving size={18} weight="duotone" />, label: 'Wave', emoji: '👋' },
  { type: 'thumbsUp', icon: <ThumbsUp size={18} weight="duotone" />, label: 'Like', emoji: '👍' },
  { type: 'nod', icon: <Check size={18} weight="duotone" />, label: 'Nod', emoji: '👌' },
  { type: 'heart', icon: <Heart size={18} weight="duotone" />, label: 'Heart', emoji: '❤️' },
  { type: 'celebrate', icon: <Confetti size={18} weight="duotone" />, label: 'Party', emoji: '🎉' },
  { type: 'laugh', icon: <MaskHappy size={18} weight="duotone" />, label: 'Laugh', emoji: '😂' },
  { type: 'surprised', icon: <WarningCircle size={18} weight="duotone" />, label: 'Wow', emoji: '😲' },
  { type: 'dance', icon: <MusicNotes size={18} weight="duotone" />, label: 'Dance', emoji: '💃' },
];

export function SessionHUD() {
  const { isConnected, peers } = useMultiplayerStore();
  const {
    chatMessages,
    isChatOpen,
    unreadCount,
    reactionBubbles,
    isCountdownActive,
    countdownValue,
    showPhotoPreview,
    lastPhotoUrl,
    showReactionPicker,
    addChatMessage,
    setChatOpen,
    addReaction,
    setCountdown,
    setLastPhoto,
    setShowPhotoPreview,
    setShowReactionPicker,
  } = useSessionStore();

  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Initialize social manager listeners
  useEffect(() => {
    if (!isConnected) return;

    socialManager.initialize();

    const unsubChat = socialManager.onChat((msg: { id: string; peerId: string; displayName: string; text: string; timestamp: number; isLocal: boolean }) => {
      addChatMessage({
        id: msg.id,
        peerId: msg.peerId,
        displayName: msg.displayName,
        text: msg.text,
        timestamp: msg.timestamp,
        isLocal: msg.isLocal,
      });
    });

    const unsubReaction = socialManager.onReaction((reaction: { id: string; peerId: string; displayName: string; reaction: ReactionType; timestamp: number }) => {
      addReaction({
        id: reaction.id,
        peerId: reaction.peerId,
        displayName: reaction.displayName,
        reaction: reaction.reaction,
        emoji: socialManager.constructor.prototype.constructor.name === 'SocialManager' 
          ? REACTIONS.find(r => r.type === reaction.reaction)?.emoji || '✨'
          : '✨',
        timestamp: reaction.timestamp,
      });
    });

    const unsubCountdown = socialManager.onCountdown((count: number, _photoId: string) => {
      setCountdown(count > 0, count);
    });

    const unsubPhoto = socialManager.onPhotoCaptured((_photoId: string, dataUrl: string) => {
      setLastPhoto(dataUrl);
      setShowPhotoPreview(true);
      setCountdown(false);
    });

    return () => {
      unsubChat();
      unsubReaction();
      unsubCountdown();
      unsubPhoto();
    };
  }, [isConnected]);

  // Auto-scroll chat
  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen) {
      chatInputRef.current?.focus();
    }
  }, [isChatOpen]);

  // Don't render if not connected
  if (!isConnected) return null;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    socialManager.sendChat(chatInput);
    setChatInput('');
  };

  const handleReaction = (reaction: ReactionType) => {
    socialManager.sendReaction(reaction);
    setShowReactionPicker(false);
  };

  const handleGroupPhoto = () => {
    socialManager.requestGroupPhoto();
  };

  const downloadPhoto = () => {
    if (!lastPhotoUrl) return;
    
    const link = document.createElement('a');
    link.download = `poselab-group-${Date.now()}.png`;
    link.href = lastPhotoUrl;
    link.click();
  };

  const participantCount = peers.size;

  return (
    <div className="session-hud">
      {/* Reaction Bubbles (floating) */}
      <div className="reaction-bubbles">
        {reactionBubbles.map((bubble) => (
          <div key={bubble.id} className="reaction-bubble">
            <span className="reaction-icon-small">
              {REACTIONS.find(r => r.type === bubble.reaction)?.icon || bubble.emoji}
            </span>
            <span className="reaction-name">{bubble.displayName}</span>
          </div>
        ))}
      </div>

      {/* Countdown Overlay */}
      {isCountdownActive && (
        <div className="countdown-overlay">
          <div className="countdown-number">{countdownValue || <Camera size={48} weight="fill" />}</div>
          <div className="countdown-text">
            {countdownValue > 0 ? 'Get ready!' : 'Cheese!'}
          </div>
        </div>
      )}

      {/* Photo Preview */}
      {showPhotoPreview && lastPhotoUrl && (
        <div className="photo-preview-overlay" onClick={() => setShowPhotoPreview(false)}>
          <div className="photo-preview-content" onClick={(e) => e.stopPropagation()}>
            <img src={lastPhotoUrl} alt="Group Photo" />
            <div className="photo-preview-actions">
              <button onClick={downloadPhoto} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FloppyDisk size={16} weight="duotone" /> Save</button>
              <button onClick={() => setShowPhotoPreview(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><X size={16} weight="bold" /> Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="session-bar">
        {/* Participants */}
        <div className="session-participants">
          <span className="participant-count" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} weight="duotone" /> {participantCount}
          </span>
        </div>

        {/* Reactions */}
        <div className="session-reactions">
          <button 
            className="reaction-trigger"
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            title="Send Reaction"
          >
            <Smiley size={20} weight="duotone" />
          </button>
          
          {showReactionPicker && (
            <div className="reaction-picker">
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => handleReaction(r.type)}
                  title={r.label}
                  className="reaction-item"
                >
                  <span className="reaction-icon">{r.icon}</span>
                  <span className="reaction-label">{r.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Group Photo */}
        <button 
          className="group-photo-btn"
          onClick={handleGroupPhoto}
          disabled={isCountdownActive}
          title="Take Group Photo"
        >
          <Camera size={20} weight="duotone" />
        </button>

        {/* Chat Toggle */}
        <button 
          className={`chat-toggle ${isChatOpen ? 'active' : ''}`}
          onClick={() => setChatOpen(!isChatOpen)}
          title="Toggle Chat"
        >
          <ChatCircle size={20} weight="duotone" />
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </button>
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <span>Session Chat</span>
            <button onClick={() => setChatOpen(false)}><X size={16} weight="bold" /></button>
          </div>
          
          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="chat-empty">
                No messages yet. Say hi! 👋
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`chat-message ${msg.isLocal ? 'local' : 'remote'}`}
                >
                  <span className="chat-name">{msg.displayName}</span>
                  <span className="chat-text">{msg.text}</span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendChat}>
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              maxLength={200}
            />
            <button type="submit" disabled={!chatInput.trim()}>
              <PaperPlaneTilt size={16} weight="fill" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

