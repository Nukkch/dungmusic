import { useStore } from '../../store/useStore';
import { useAudio } from '../../hooks/useAudio';

export default function PlayerCenter() {
  const { audioRef, seek } = useAudio();
  
  const { 
    currentTrack, 
    isPlaying, 
    progress, 
    duration, 
    volume, 
    setVolume, 
    repeatMode, 
    toggleRepeat, 
    nextTrack, 
    prevTrack, 
    togglePlay 
  } = useStore();

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    seek(time);
  };

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted">
        <div className="w-64 h-64 bg-bg rounded-3xl mb-6 flex items-center justify-center border border-border">
          <span className="text-6xl">🎵</span>
        </div>
        <p className="text-xl font-semibold">Select a track</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4">
      <audio ref={audioRef} className="hidden" preload="metadata" />

      <div className="w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-2xl mb-8 bg-bg border border-border relative">
        <img 
          src={currentTrack.coverUrl || 'https://via.placeholder.com/400x400/1e293b/64748b?text=♪'} 
          alt={currentTrack.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="text-center mb-6 w-full">
        <h2 className="text-2xl font-bold text-text truncate">{currentTrack.title}</h2>
        <p className="text-muted text-lg mt-1 truncate">{currentTrack.artist}</p>
      </div>

      <div className="w-full max-w-md mb-8 px-4">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={progress || 0}
          onChange={handleSeek}
          className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-indigo-500
                   [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="flex items-center gap-8">
           <button onClick={prevTrack} className="p-3 text-muted hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
           </button>
           
           <button 
             onClick={togglePlay}
             className="p-5 bg-primary rounded-full hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/30"
           >
             {isPlaying ? (
               <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                 <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                 <rect x="14" y="4" width="4" height="16" rx="1"></rect>
               </svg>
             ) : (
               <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-1">
                 <polygon points="8,5 19,12 8,19"></polygon>
               </svg>
             )}
           </button>

           <button onClick={nextTrack} className="p-3 text-muted hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
           </button>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={toggleRepeat}
             className={`p-2 rounded-full transition-colors ${repeatMode !== 'off' ? 'text-primary bg-primary/10' : 'text-muted hover:text-white'}`}
             title={repeatMode === 'off' ? 'Повтор выключен' : repeatMode === 'track' ? 'Повтор трека' : 'Повтор очереди'}
           >
             {repeatMode === 'track' ? (
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <path d="M17 1l4 4-4 4"></path>
                 <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                 <path d="M7 23l-4-4 4-4"></path>
                 <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                 <text x="12" y="14.5" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none" fontWeight="bold">1</text>
               </svg>
             ) : repeatMode === 'queue' ? (
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <path d="M17 1l4 4-4 4"></path>
                 <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                 <path d="M7 23l-4-4 4-4"></path>
                 <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
               </svg>
             ) : (
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <path d="M17 1l4 4-4 4"></path>
                 <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                 <path d="M7 23l-4-4 4-4"></path>
                 <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                 <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" opacity="0.7"></line>
               </svg>
             )}
           </button>

           <div className="flex items-center gap-2 bg-surface/60 px-3 py-1.5 rounded-full border border-white/5">
              <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)} className="text-muted hover:text-white transition-colors">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                   <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                 </svg>
              </button>
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer 
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-3
                         [&::-webkit-slider-thumb]:h-3
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-white
                         [&::-webkit-slider-thumb]:cursor-pointer"
              />
           </div>
        </div>

      </div>
    </div>
  );
}