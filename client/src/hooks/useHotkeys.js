import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useHotkeys() {
  const { togglePlay, setVolume, volume, toggleRepeat, setIsShuffle, isShuffle } = useStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Игнорируем нажатия в полях ввода
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch(e.code) {
        case 'Space':
          e.preventDefault(); // Чтобы страница не скроллилась
          togglePlay();
          break;
        case 'KeyM':
          setVolume(volume === 0 ? 0.5 : 0);
          break;
        case 'KeyR':
          toggleRepeat();
          break;
        case 'KeyS':
          setIsShuffle(!isShuffle);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, isShuffle, togglePlay, setVolume, toggleRepeat, setIsShuffle]);
}