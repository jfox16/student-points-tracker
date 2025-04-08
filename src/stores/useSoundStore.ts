import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PointSoundName } from '../types/sound.type';
import { pointSounds } from '../assets/sounds/sounds';
import { randomRange } from '../utils/randomRange';

const CONCURRENT_WINDOW_MS = 60;
const activeSounds: Record<string, number> = {};

interface SoundState {
  pointSoundEnabled: boolean;
  setPointSoundEnabled: (enabled: boolean) => void;
  playPointSound: (maxConcurrent?: number) => void;
  togglePointSound: () => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      pointSoundEnabled: true,
      setPointSoundEnabled: (enabled) => set({ pointSoundEnabled: enabled }),
      playPointSound: (maxConcurrent?: number) => {
        const { pointSoundEnabled } = get();
        if (!pointSoundEnabled) return;

        const sound: PointSoundName = 'ding';
        if (!pointSounds[sound]) return;

        if (!(sound in activeSounds)) {
          activeSounds[sound] = 0;
        }

        if (maxConcurrent && activeSounds[sound] >= maxConcurrent) return;

        const audioSrc = pointSounds[sound];
        if (!audioSrc) return;

        const audio = new Audio(audioSrc);
        audio.playbackRate = randomRange(0.5, 1.5);

        audio.addEventListener('ended', () => {
          activeSounds[sound] = Math.max(0, activeSounds[sound] - 1);
        });

        audio.play();
        activeSounds[sound] += 1;

        // Reset active sounds after delay
        setTimeout(() => {
          Object.keys(activeSounds).forEach((key) => {
            activeSounds[key] = 0;
          });
        }, CONCURRENT_WINDOW_MS);
      },
      togglePointSound: () => set(state => ({ pointSoundEnabled: !state.pointSoundEnabled })),
    }),
    {
      name: 'sound-settings',
    }
  )
); 