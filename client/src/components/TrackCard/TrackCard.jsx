import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { playlistsAPI } from '../../services/api';

export default function TrackCard({ track, trackList = [] }) {
  const { playTrack, currentTrack, playlists, addTrackToPlaylist } = useStore();
  const [showMenu, setShowMenu] = useState(false);

  const handlePlay = () => {
    console.log('▶️ TrackCard handlePlay called for:', track.title);
    console.log('📋 trackList received:', trackList);
    
    if (!trackList || trackList.length === 0) {
      console.warn('⚠️ trackList is empty! Passing single track as array');
      playTrack(track, [track]);
    } else {
      playTrack(track, trackList);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await playlistsAPI.addTrack(playlistId, track);
      addTrackToPlaylist(playlistId, track);
      setShowMenu(false);
    } catch (err) {
      console.error('❌ Add to playlist failed:', err);
      alert(err.response?.data?.error || 'Не удалось добавить трек');
    }
  };

  const isCurrent = currentTrack?.id === track.id;

  return (
    <div className="relative">
      <div 
        className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                   ${isCurrent ? 'bg-primary/20 border border-primary/50' : 'hover:bg-white/5'}`} style={{marginBottom:"6px"}}
        onClick={handlePlay}
      >
        <div className="relative w-12 h-12 flex-shrink-0 m-1 mr-2">
          <img 
            src={track.coverUrl || 'https://via.placeholder.com/48x48/1e293b/64748b?text=♪'} 
            alt={track.title}
            className="w-full h-full rounded object-cover bg-gray-800"
          />
          <div className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded
                         opacity-0 group-hover:opacity-100 transition-opacity ${isCurrent ? 'opacity-100' : ''}`}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${isCurrent ? 'text-primary' : ''}`}>
            {track.title}
          </p>
          <p className="text-sm text-gray-400 truncate">{track.artist}</p>
        </div>

        <span className="text-sm text-gray-400 w-12 text-right">
          {track.duration ? `${Math.floor(track.duration/60)}:${(track.duration%60).toString().padStart(2,'0')}` : '--:--'}
        </span>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-2 text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
      </div>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setShowMenu(false)}
          ></div>

          <div 
            className="absolute right-0 top-12 z-[9999] border border-border rounded-lg shadow-2xl min-w-[220px] overflow-hidden"
            style={{ backgroundColor: '#0b1120' }}
          >
            <div className="px-4 py-2.5 text-xs font-semibold text-muted border-b border-border"
                 style={{ backgroundColor: '#0b1120' }}>
              Add to playlist
            </div>
            
            {playlists.length > 0 ? (
              <div className="max-h-64 overflow-y-auto py-1">
                {playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    className="w-full text-left px-4 py-2.5 text-sm text-text bg-surface hover:bg-surface/90 hover:text-primary transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{playlist.name}</span>
                    <span className="text-[10px] text-muted bg-surface px-1.5 py-0.5 rounded-full group-hover:bg-primary/20">
                      {playlist.tracks.length}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-muted text-center">
                No playlists yet
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}