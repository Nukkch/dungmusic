import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useAudio } from '../../hooks/useAudio';

export default function AudioPlayer() {
  const { currentTrack, isPlaying, progress, duration, volume, setVolume } = useStore();
  const { audioRef, seek, toggle } = useAudio(); // ← Добавили audioRef
  
  const [showVolume, setShowVolume] = useState(false);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    console.log('🎚️ Seek to:', time);
    seek(time);
  };

  const handleVolume = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  if (!currentTrack) {
    return (
      <>
      <audio ref={audioRef} className="hidden" preload="metadata" />
      <div className="fixed bottom-0 left-0 right-0 bg-darker/95 backdrop-blur border-t border-white/10 p-4">
        <p className="text-center text-gray-400">Выберите трек для воспроизведения</p>
      </div>
    </>
      
    );
  }

  return (
    <>
    <audio ref={audioRef} className="hidden" preload="metadata" />
    <div className="fixed bottom-0 left-0 right-0 bg-darker/95 backdrop-blur border-t border-white/10 p-3 md:p-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img 
            src={currentTrack.coverUrl || 'https://via.placeholder.com/60x60/1e293b/64748b?text=♪'} 
            alt={currentTrack.title}
            className="w-12 h-12 md:w-14 md:h-14 rounded object-cover bg-gray-800"
          />
          <div className="min-w-0">
            <p className="font-medium truncate">{currentTrack.title}</p>
            <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex-1 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(progress)}
            </span>
            <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={progress || 0}
                      onChange={handleSeek}  // ← onChange, не onClick!
                      className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-primary
                    [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex justify-center items-center gap-4">
            <button 
              onClick={toggle}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary hover:bg-primary/90 
                       flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="relative hidden md:block">
          <button 
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
            className="p-2 hover:bg-white/10 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
            </svg>
          </button>
          
          {showVolume && (
            <div className="absolute bottom-full right-0 mb-2 p-3 bg-gray-800 rounded-lg shadow-xl border border-white/10">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolume}
                className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-3
                         [&::-webkit-slider-thumb]:h-3
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}