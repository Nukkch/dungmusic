import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { playlistsAPI } from '../../services/api';

export default function PlaylistsColumn() {
    
const { 
    playlists = [], 
    setPlaylists, 
    createPlaylist, 
    deletePlaylist, 
    addTrackToPlaylist, 
    setActivePlaylist  // ← ОБЯЗАТЕЛЬНО!
  } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  // Загружаем плейлисты с бэкенда при монтировании
    useEffect(() => {
        loadPlaylists();
    }, []);

  const loadPlaylists = async () => {
    try {
      console.log('📥 Загрузка плейлистов...');
      const { data } = await playlistsAPI.getAll();
      console.log('✅ Получено:', data);
      setPlaylists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Failed to load playlists:', err);
      setPlaylists([]); // На случай ошибки
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const { data } = await playlistsAPI.create({ name: newName });
      setPlaylists([...playlists, data]);
      setNewName('');
      setIsCreating(false);
    } catch (err) {
      console.error('❌ Failed to create playlist:', err);
      alert('Не удалось создать плейлист');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить плейлист?')) return;

    try {
      await playlistsAPI.delete(id);
      deletePlaylist(id);
    } catch (err) {
      console.error('❌ Failed to delete playlist:', err);
      alert('Не удалось удалить плейлист');
    }
  };

  if (loading) {
    return <div className="text-center text-muted py-10">Загрузка...</div>;
  }

  return (
    <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Playlists</h3>
                <button 
                onClick={() => setIsCreating(!isCreating)}
                className="text-m text-primary hover:text-white transition-colors"
                >
                 {isCreating ? 'Cancel' : '+ New'}
                </button>
        </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="mb-4 flex gap-2">
          <input
            autoFocus
            type="text"
            placeholder="Playlist name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 bg-bg border border-border rounded px-2 py-1 text-sm text-text focus:border-primary outline-none"
          />
          <button type="submit" className="text-primary hover:text-white">✓</button>
        </form>
      )}

            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 content-start pr-1"style={{marginTop:"12px"}}>
        {playlists && playlists.length > 0 ? (
          playlists.map((playlist) => (
            <div 
              key={playlist.id} 
              className="group relative flex flex-col gap-2 cursor-pointer "
              onClick={() => {
                console.log('📀 Click on playlist:', playlist);
                setActivePlaylist(playlist);
              }}
            >
              <div className="aspect-square bg-bg rounded-xl border border-border transition-colors relative overflow-hidden cursor-pointer">
                <button 
                  onClick={() => handleDelete(playlist.id)}
                  className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs z-10"style={{padding:"8px", paddingLeft:"12px", paddingRight:"12px",  marginRight:"8px", marginTop:"4px"}}
                >
                   X
                </button>
                <div className="w-full h-full flex items-center justify-center text-3xl text-muted/50">
                  ♫
                </div>
              </div>
              
              <span className="text-m text-text font-medium truncate px-1">
                {playlist.name}
              </span>
              <span className="text-[14px] text-muted px-1">
                {playlist.tracks ? playlist.tracks.length : 0} tracks
              </span>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center text-muted text-sm py-4">
            No playlists yet
          </div>
        )}
      </div>
    </div>
  );
}