import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define sound types
export type SoundType = 'ding' | 'bubble' | 'bark' | 'meow';
export type SoundMap = Record<SoundType, HTMLAudioElement>;

// Create audio elements (lazy-loaded)
const createSounds = (): SoundMap => {
  const sounds: Partial<SoundMap> = {};
  
  const loadSound = (type: SoundType, path: string) => {
    const audio = new Audio(path);
    audio.preload = 'auto';
    sounds[type] = audio;
  };
  
  // Load sound files
  loadSound('ding', '/assets/ding.wav');
  loadSound('bubble', '/assets/bubble.wav');
  loadSound('bark', '/assets/bark.wav');
  loadSound('meow', '/assets/meow.wav');
  
  return sounds as SoundMap;
};

interface SoundState {
  // State
  sounds: SoundMap;
  soundEnabled: boolean;
  
  // Actions
  playSound: (sound: SoundType) => void;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      // Initial state
      sounds: createSounds(),
      soundEnabled: true,
      
      // Actions
      playSound: (sound) => {
        const { sounds, soundEnabled } = get();
        if (soundEnabled) {
          // Stop and reset the sound before playing
          const audio = sounds[sound];
          audio.pause();
          audio.currentTime = 0;
          audio.play().catch(error => console.error('Error playing sound:', error));
        }
      },
      
      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },
      
      setSoundEnabled: (enabled) => {
        set({ soundEnabled: enabled });
      },
    }),
    {
      name: 'sound-settings',
      partialize: (state) => ({ soundEnabled: state.soundEnabled }),
    }
  )
); 