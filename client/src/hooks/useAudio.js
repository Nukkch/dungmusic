import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export function useAudio() {
  const audioRef = useRef(null);
  const repeatModeRef = useRef('off'); // ← Ref для отслеживания без перезапуска
  
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

  // 🔁 Синхронизируем ref с актуальным repeatMode
  useEffect(() => {
    repeatModeRef.current = repeatMode;
    console.log('🔄 Repeat mode changed to:', repeatMode);
  }, [repeatMode]);

  // 🎚️ Громкость
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // ⏯️ Play/Pause
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

  // 🎵 Загрузка трека и слушатели
  useEffect(() => {
    if (!currentTrack?.url) return;
    
    const audio = audioRef.current;
    if (!audio) {
      console.warn('⚠️ Audio element not found');
      return;
    }
    
    console.log('🎵 Loading track:', currentTrack.title);
    
    // Слушатели
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };
    
    const handleMetaLoaded = () => {
      console.log('📏 Duration:', audio.duration);
      setDuration(audio.duration);
      if (isPlaying) {
        audio.play().catch(e => console.error(e));
      }
    };
    
    const handleEnded = () => {
      const currentMode = repeatModeRef.current; // ← Берём из ref (не вызывает перезапуск)
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

    // Подключаем
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleMetaLoaded);
    audio.addEventListener('ended', handleEnded);
    
    // Загружаем
    audio.src = currentTrack.url;
    audio.load();

    // Cleanup
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleMetaLoaded);
      audio.removeEventListener('ended', handleEnded);
    };
    
  }, [
    currentTrack?.url,
    // repeatMode УБРАН из зависимостей!
    isPlaying,
    nextTrack,
    togglePlay,
    setProgress,
    setDuration
  ]); 

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