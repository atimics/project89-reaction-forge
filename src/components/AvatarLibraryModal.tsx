import { useEffect, useState } from 'react';
import { X, MagnifyingGlass, DownloadSimple, DiceFive } from '@phosphor-icons/react';
import { useAvatarListStore, type AvatarEntry } from '../state/useAvatarListStore';
import { useAvatarSource } from '../state/useAvatarSource';
import { useToastStore } from '../state/useToastStore';
import './AvatarLibraryModal.css';

interface AvatarLibraryModalProps {
  onClose: () => void;
}

export function AvatarLibraryModal({ onClose }: AvatarLibraryModalProps) {
  const { avatars, fetchAvatars, isLoading, error, getRandomAvatar } = useAvatarListStore();
  const { setRemoteUrl } = useAvatarSource();
  const { addToast } = useToastStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  const handleSelectAvatar = (avatar: AvatarEntry) => {
    try {
      setRemoteUrl(avatar.model_file_url, avatar.name);
      addToast(`Loading avatar: ${avatar.name}`, 'info');
      onClose();
    } catch (e) {
      console.error(e);
      addToast('Failed to load avatar URL', 'error');
    }
  };

  const handleRandomAvatar = () => {
    const randomAvatar = getRandomAvatar();
    if (randomAvatar) {
      handleSelectAvatar(randomAvatar);
    }
  };

  const filteredAvatars = avatars.filter((avatar) => {
    const matchesSearch = avatar.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (avatar.description && avatar.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h2>Avatar Library</h2>
          <button className="icon-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <MagnifyingGlass size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search avatars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                  borderRadius: '8px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            
            <button 
              className="secondary" 
              onClick={handleRandomAvatar}
              title="Pick a random avatar"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <DiceFive size={20} />
              <span>Random</span>
            </button>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <div className="spinner" />
            </div>
          ) : error ? (
            <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '2rem' }}>
              Error loading avatars: {error}
            </div>
          ) : (
            <div className="avatar-library-grid">
              {filteredAvatars.map((avatar) => (
                <div 
                  key={avatar.id}
                  className="avatar-card"
                  onClick={() => handleSelectAvatar(avatar)}
                >
                  <div className="avatar-thumbnail">
                    <img 
                      src={avatar.thumbnail_url} 
                      alt={avatar.name}
                      loading="lazy"
                    />
                    <div className="avatar-overlay">
                      <DownloadSimple size={24} color="#fff" />
                    </div>
                  </div>
                  <div>
                    <div className="avatar-info">
                      {avatar.name}
                    </div>
                    {avatar.metadata?.series && (
                      <div className="avatar-meta">
                        {avatar.metadata.series} {avatar.metadata.number ? `#${avatar.metadata.number}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
