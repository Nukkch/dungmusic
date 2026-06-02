import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export function useAudio() {
  const audioRef = useRef(null);
  const repeatModeRef = useRef('off');
  
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    repeatMode,
    nextTrack, 
    setProgress, 
    setDuration,
    togglePlay 
  } = useStore();

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.url) return;
    
    if (isPlaying) {
      audio.play().catch(e => {
        if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
          console.error('Play error:', e);
        }
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack?.url]);

  // Эффект для загрузки трека (когда меняется трек)
  useEffect(() => {
    if (!currentTrack?.url) return;
    
    const audio = audioRef.current;
    if (!audio) {
      console.warn('⚠️ Audio element not found');
      return;
    }
    
    console.log('🎵 Loading track:', currentTrack.title);
    
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };
    
    const handleMetaLoaded = () => {
      console.log('📏 Duration:', audio.duration);
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      const currentMode = repeatModeRef.current;
      console.log('🔁 Track ended. Mode:', currentMode);
      
      if (currentMode === 'track') {
        console.log('🔂 Repeating track');
        audio.currentTime = 0;
        audio.play().catch(e => console.error(e));
      } else if (currentMode === 'queue') {
        console.log('🔁 Next track from queue');
        nextTrack();
      } else {
        console.log('⏹️ Stopping (repeat off)');
        setProgress(0);
        togglePlay(); 
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleMetaLoaded);
    audio.addEventListener('ended', handleEnded);
    
    audio.src = currentTrack.url;
    audio.load();

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleMetaLoaded);
      audio.removeEventListener('ended', handleEnded);
    };
    
  }, [currentTrack?.url, nextTrack, togglePlay, setProgress, setDuration]);

  // Отдельный эффект для play/pause (без перезагрузки трека!)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.url) return;
    
    if (isPlaying) {
      audio.play().catch(e => {
        if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
          console.error('Play error:', e);
        }
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack?.url]); 

  return {
    audioRef,
    seek: (time) => {
      const audio = audioRef.current;
      if (audio && !isNaN(time)) {
        console.log('⏩ Seeking to:', time);
        audio.currentTime = time;
        setProgress(time);
      }
    },
    toggle: () => togglePlay()
  };
}