import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // 👤 Авторизация
      user: null,
      isAuthenticated: false,
      accessToken: null,
      
      setUser: (user, token) => {
        if (token) {
          localStorage.setItem('accessToken', token);
        }
        set({ 
          user, 
          isAuthenticated: !!user,
          accessToken: token || localStorage.getItem('accessToken')
        });
      },
      
      clearUser: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, isAuthenticated: false, accessToken: null });
      },

           // 🎵 Плеер
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
      volume: 0.5,
      isShuffle: false,
      // 🟢 Режимы повтора: 'off' | 'track' | 'queue'
      repeatMode: 'off',
      // 🟢 Переключение режима повтора
      toggleRepeat: () => set((state) => {
        const modes = ['off', 'track', 'queue'];
        const currentIndex = modes.indexOf(state.repeatMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        return { repeatMode: nextMode };
      }),
      // 🟢 Очередь треков (Queue)
      trackQueue: [],
      queueIndex: 0,

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setProgress: (val) => set({ progress: val }),
      setDuration: (val) => set({ duration: val }),
      setVolume: (val) => set({ volume: val }),
      setRepeat: (val) => set({ repeat: val }),
      setIsShuffle: (val) => set({ isShuffle: val }),

      // 🟢 Запуск трека в контексте списка
            // 🟢 Запуск трека в контексте списка
      playTrack: (track, trackList = []) => {
  if (!track || !Array.isArray(trackList) || trackList.length === 0) {
    console.warn('⚠️ playTrack: Empty or invalid trackList');
    return;
  }
  
  const index = trackList.findIndex(t => 
    String(t.id) === String(track.id) || 
    (t.sourceId && String(t.sourceId) === String(track.sourceId))
  );
  
  const safeIndex = index >= 0 ? index : 0;
  console.log('📥 playTrack -> queueIndex:', safeIndex, 'queueLength:', trackList.length);
  
  set({
    trackQueue: trackList,
    queueIndex: safeIndex,
    currentTrack: track,
    isPlaying: true  // ← ОБЯЗАТЕЛЬНО должно быть true!
  });
},
      // 🔔 Toast уведомления
      toasts: [],
      
      addToast: (message, type = 'info') => {
        const id = Date.now();
        set((state) => ({ 
          toasts: [...state.toasts, { id, message, type }] 
        }));
        // Автоудаление через 3 секунды
        setTimeout(() => {
          set((state) => ({ 
            toasts: state.toasts.filter(t => t.id !== id) 
          }));
        }, 3000);
      },

      removeToast: (id) => {
        set((state) => ({ 
          toasts: state.toasts.filter(t => t.id !== id) 
        }));
      },
      // 🟢 Следующий трек
      nextTrack: () => set((state) => {
        if (state.trackQueue.length === 0) {
          console.warn('⚠️ nextTrack: Empty queue');
          return state;
        }
        const nextIdx = (state.queueIndex + 1) % state.trackQueue.length;
        console.log('⏭️ nextTrack -> new index:', nextIdx);
        return { 
          queueIndex: nextIdx, 
          currentTrack: state.trackQueue[nextIdx], 
          isPlaying: true 
        };
      }),

      //  Предыдущий трек
      prevTrack: () => set((state) => {
        if (state.trackQueue.length === 0) return state;
        const prevIdx = state.queueIndex === 0 ? state.trackQueue.length - 1 : state.queueIndex - 1;
        console.log('️ prevTrack -> new index:', prevIdx);
        return { 
          queueIndex: prevIdx, 
          currentTrack: state.trackQueue[prevIdx], 
          isPlaying: true 
        };
      }),

      // 🔍 Поиск
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      // 📂 Плейлисты (будут привязаны к userId)
      playlists: [],
      activePlaylist: null,  // ← Обязательно!
    
      
      setPlaylists: (playlists) => set({ playlists }),
      setActivePlaylist: (playlist) => set({ activePlaylist: playlist }),  // ← ЭТА ФУНКЦИЯ!
      clearActivePlaylist: () => set({ activePlaylist: null }),
      
      createPlaylist: (name) => {
        const newPlaylist = {
          id: Date.now().toString(),
          name: name,
          tracks: [],
          userId: get().user?.id
        };
        set((state) => ({ playlists: [...state.playlists, newPlaylist] }));
      },

      deletePlaylist: (id) => {
        set((state) => ({ 
          playlists: state.playlists.filter(p => p.id !== id),
          activePlaylist: state.activePlaylist?.id === id ? null : state.activePlaylist
        }));
      },

      addTrackToPlaylist: (playlistId, track) => {
        set((state) => {
          // Защита от undefined
          const currentPlaylists = state.playlists || [];
          
          return {
            playlists: currentPlaylists.map(p => {
              if (p.id === playlistId) {
                // Защита от undefined tracks
                const currentTracks = p.tracks || [];
                // Проверка на дубликаты
                const exists = currentTracks.some(t => 
                  t.id === track.id || t.sourceId === track.sourceId
                );
                if (exists) return p;
                
                return { ...p, tracks: [...currentTracks, track] };
              }
              return p;
            })
          };
        });
      },
      removeTrackFromPlaylist: (playlistId, trackId) => {
        set((state) => {
          const updatedPlaylists = state.playlists.map(p => {
            if (p.id === playlistId) {
              return {
                ...p,
                tracks: (p.tracks || []).filter(
                  (t) => String(t.id) !== String(trackId) && String(t.sourceId) !== String(trackId)
                ),
              };
            }
            return p;
          });

          const updatedActivePlaylist = state.activePlaylist?.id === playlistId
            ? {
                ...state.activePlaylist,
                tracks: (state.activePlaylist.tracks || []).filter(
                  (t) => String(t.id) !== String(trackId) && String(t.sourceId) !== String(trackId)
                ),
              }
            : state.activePlaylist;

          return {
            playlists: updatedPlaylists,
            activePlaylist: updatedActivePlaylist,
          };
        });
      }
    }),
    
    {
      name: 'dungemusic-storage',
      storage: createJSONStorage(() => localStorage),
      // Сохраняем только плейлисты и токен
      partialize: (state) => ({ 
        playlists: state.playlists,
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);