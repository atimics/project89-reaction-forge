import { useState, useRef, useEffect, type DragEvent } from 'react';
import { useMusicStore } from '../state/useMusicStore';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  VinylRecord,
  DownloadSimple
} from '@phosphor-icons/react';

export function MusicPlayer() {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    volume,
    isMuted,
    addTracks,
    nextTrack,
    prevTrack,
    setIsPlaying,
    setVolume
  } = useMusicStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Audio play failed:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, tracks]); // Re-run when track changes

  // Handle volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle track end -> next track
  const handleEnded = () => {
    if (tracks.length > 0) {
      nextTrack();
    }
  };

  const currentTrack = tracks[currentTrackIndex];

  // Drag and Drop handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Helper to scan files/folders recursively
  const scanFiles = async (item: FileSystemEntry, audioFiles: File[]) => {
    if (item.isFile) {
      const fileEntry = item as FileSystemFileEntry;
      return new Promise<void>((resolve) => {
        fileEntry.file((file) => {
          if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(file.name)) {
            audioFiles.push(file);
          }
          resolve();
        });
      });
    } else if (item.isDirectory) {
      const dirEntry = item as FileSystemDirectoryEntry;
      const reader = dirEntry.createReader();
      return new Promise<void>((resolve) => {
        const readEntries = () => {
          reader.readEntries(async (entries) => {
            if (entries.length === 0) {
              resolve();
            } else {
              await Promise.all(entries.map(entry => scanFiles(entry, audioFiles)));
              readEntries(); // Continue reading (some browsers return in chunks)
            }
          });
        };
        readEntries();
      });
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const newTracks: { id: string; title: string; url: string; isLocal: boolean; file?: File }[] = [];

    // 1. Handle Files & Folders
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const audioFiles: File[] = [];
      const promises: Promise<void>[] = [];

      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i].webkitGetAsEntry();
        if (item) {
          promises.push(scanFiles(item, audioFiles));
        }
      }

      await Promise.all(promises);

      if (audioFiles.length > 0) {
        audioFiles.forEach(file => {
          newTracks.push({
            id: crypto.randomUUID(),
            title: file.name.replace(/\.[^/.]+$/, ""),
            url: URL.createObjectURL(file),
            isLocal: true,
            file
          });
        });
      }
    } 
    // Fallback for browsers without webkitGetAsEntry or plain file drops
    else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
       // ... existing logic ...
       Array.from(e.dataTransfer.files).forEach(file => {
         if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(file.name)) {
            newTracks.push({
              id: crypto.randomUUID(),
              title: file.name.replace(/\.[^/.]+$/, ""),
              url: URL.createObjectURL(file),
              isLocal: true,
              file
            });
         }
       });
    }

    // 2. Handle URLs (Direct MP3 links)
    const droppedUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (droppedUrl && /\.(mp3|wav|ogg|m4a)$/i.test(droppedUrl)) {
        // Basic check to see if it's a direct audio link
        const fileName = droppedUrl.split('/').pop() || 'Streamed Audio';
        newTracks.push({
          id: crypto.randomUUID(),
          title: decodeURIComponent(fileName).replace(/\.[^/.]+$/, ""),
          url: droppedUrl,
          isLocal: false
        });
    }

    if (newTracks.length > 0) {
      addTracks(newTracks);
    }
  };

  return (
    <div
      className={`music-player-widget ${dragActive ? 'drag-active' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        position: 'relative',
        transition: 'all 0.3s ease',
        marginLeft: '1rem',
        paddingLeft: '1rem',
        borderLeft: '1px solid var(--border-subtle)',
        height: '32px',
        color: dragActive ? 'var(--accent)' : 'inherit'
      }}
    >
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        hidden
      />

      {/* Icon / Status */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        color: isPlaying ? 'var(--accent)' : 'var(--text-muted)',
        transition: 'color 0.3s ease',
        cursor: 'pointer'
      }}
      onClick={() => tracks.length > 0 && setIsPlaying(!isPlaying)}
      >
        {dragActive ? (
          <DownloadSimple size={20} weight="bold" className="animate-bounce" />
        ) : (
          <VinylRecord 
            size={20} 
            weight={isPlaying ? "duotone" : "regular"} 
            className={isPlaying ? "spin-slow" : ""} 
            style={{ 
              animation: isPlaying ? 'spin 3s linear infinite' : 'none',
              opacity: tracks.length === 0 ? 0.5 : 1
            }}
          />
        )}
      </div>

      {/* Info / Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: isHovered || isPlaying ? '400px' : '0px',
        opacity: isHovered || isPlaying ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        whiteSpace: 'nowrap'
      }}>
        
        {/* Track Name */}
        <div style={{
          fontSize: '0.85rem',
          color: 'var(--text-primary)',
          maxWidth: '150px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          cursor: 'default'
        }} title={currentTrack?.title}>
          {currentTrack ? currentTrack.title : (dragActive ? "Drop to add tracks" : "Drag & drop audio files")}
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <button 
            onClick={prevTrack} 
            className="icon-button" 
            style={{ width: '24px', height: '24px', padding: 0 }}
            disabled={!tracks.length}
          >
            <SkipBack size={14} weight="fill" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="icon-button"
            style={{ width: '24px', height: '24px', padding: 0 }}
            disabled={!tracks.length}
          >
            {isPlaying ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
          </button>
          
          <button 
            onClick={nextTrack} 
            className="icon-button"
            style={{ width: '24px', height: '24px', padding: 0 }}
            disabled={!tracks.length}
          >
            <SkipForward size={14} weight="fill" />
          </button>
        </div>

        {/* Volume */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: isHovered ? '60px' : '0', 
            overflow: 'hidden',
            transition: 'width 0.3s ease',
            marginLeft: '0.25rem'
          }}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ 
              width: '100%', 
              height: '4px', 
              accentColor: 'var(--accent)',
              cursor: 'pointer' 
            }}
          />
        </div>

      </div>
      
      {/* Global Spin Keyframe if needed, though usually available */}
      <style>{`
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
}
