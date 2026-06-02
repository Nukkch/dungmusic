import { useState } from 'react';
import { tracksAPI } from '../../services/api';
import { useStore } from '../../store/useStore';
import TrackCard from '../../components/TrackCard/TrackCard';
import PlayerCenter from '../../components/Player/PlayerCenter';
import PlaylistsColumn from '../../components/Playlists/PlaylistsColumn';
import PlaylistView from '../../components/Playlists/PlaylistView';

export default function Home() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { searchQuery, setSearchQuery, activePlaylist, clearActivePlaylist } = useStore();

  const handleParse = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const { data } = await tracksAPI.parse(searchQuery);
      if (Array.isArray(data)) {
        setTracks(data);
      } else if (data?.tracks) {
        console.warn('tracksAPI.parse returned object with tracks field, using data.tracks');
        setTracks(Array.isArray(data.tracks) ? data.tracks : []);
      } else {
        console.warn('tracksAPI.parse returned unexpected response:', data);
        setTracks([]);
      }
      setHasSearched(true);
    } catch (err) {
      console.error('Parse error:', err);
      setTracks([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
      <div className="flex-1 bg-surface border border-border rounded-2xl overflow-hidden p-6">
        <div className="flex flex-col h-full">
          {activePlaylist ? (
            <PlaylistView onBack={clearActivePlaylist} />
          ) : (
            <>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Search for tracks</h3>
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Search for tracks"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleParse(e)}
                  className="flex-1 bg-bg border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary"
                />
                <button 
                  onClick={handleParse}
                  disabled={loading}
                  className="px-6 py-2 bg-primary rounded-lg text-white font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="text-center text-muted py-10">
                    Searching... Please wait.
                  </div>
                ) : tracks.length > 0 ? (
                  tracks.map((track) => (
                    <TrackCard key={track.id} track={track} trackList={tracks} />
                  ))
                ) : (
                  <div className="text-center text-muted py-10">
                    {hasSearched ? 'Ничего не найдено' : 'Введите запрос'}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex-[2] bg-surface border border-border rounded-2xl overflow-hidden">
        <PlayerCenter />
      </div>
      <div className="flex-1 bg-surface border border-border rounded-2xl overflow-hidden p-6">
        <PlaylistsColumn />
      </div>
    </div>
  );
}