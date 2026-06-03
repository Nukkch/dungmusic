
import { useStore } from '../../store/useStore';
import { playlistsAPI } from '../../services/api';

export default function PlaylistView({ onBack }) {
    const { activePlaylist, removeTrackFromPlaylist, playTrack } = useStore(); // ← Добавь playTrack

  const handlePlay = (track) => {
    // Гарантируем, что передаём массив, а не undefined
    const trackList = activePlaylist?.tracks || [];
    playTrack(track, trackList);
  };

  const handleRemove = async (trackId) => {
    try {
      // Удаляем через API
      await playlistsAPI.removeTrack(activePlaylist.id, trackId);
      // Обновляем локальный стейт
      removeTrackFromPlaylist(activePlaylist.id, trackId);
    } catch (err) {
      console.error('❌ Remove failed:', err);
      alert('Не удалось удалить трек');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок плейлиста */}
      <div className="flex items-center justify-between mb-4" style={{padding:"14px"}}>
        <button 
          onClick={onBack}
          className="text-m text-muted hover:text-white flex items-center gap-1 transition-colors"
        >
          ← Back to search
        </button>
        <h2 className="text-m font-semibold text-primary truncate max-w-[140px]">
          {activePlaylist.name}
        </h2>
        <span className="text-m text-muted">{activePlaylist.tracks.length} tracks</span>
      </div>

      {/* Список треков */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar" style={{padding:"14px", paddingTop:"1px"}}>
        {activePlaylist.tracks.length > 0 ? (
          activePlaylist.tracks.map((track) => (
            <div 
              key={track.id} 
              className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"style={{margin: '6px',marginRight:"8px"}}
            >
              {/* Обложка + Play */}
              <div 
                className="relative w-10 h-10 flex-shrink-0 cursor-pointer" 
                onClick={() => handlePlay(track)}
              >
                <img 
                  src={track.coverUrl || 'https://via.placeholder.com/40/1e293b/64748b?text=♪'} 
                  alt={track.title}
                  className="w-full h-full rounded object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>

              {/* Инфо */}
              <div 
                className="flex-1 min-w-0 cursor-pointer" 
                onClick={() => handlePlay(track)}
              >
                <p className="font-medium text-m truncate text-text">{track.title}</p>
                <p className="text-sm text-muted text-gray-400 truncate">{track.artist}</p>
              </div>

              {/* Кнопка удаления */}
              <button 
                onClick={() => handleRemove(track.id)}
                className="p-1.5 text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Удалить из плейлиста"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-muted text-sm py-10">Playlist is empty</div>
        )}
      </div>
    </div>
  );
}