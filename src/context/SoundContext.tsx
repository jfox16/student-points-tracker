import { createContext, useCallback, useContext } from "react";

import { pointSounds } from "../assets/sounds/sounds";
import { clamp } from "../utils/clamp";
import { useDebounce } from "../utils/useDebounce";
import { useAppContext } from "./AppContext";
import { randomRange } from "../utils/randomRange";

export type PointSoundName = "none" | "pop" | "ding" | "bark" | "meow";
type SoundName = PointSoundName;

interface SoundContextType {
  playSound: (sound: SoundName, pitch?: number, maxConcurrent?: number) => void;
  playPointSound: (points?: number, maxConcurrent?: number) => void;
}

const CONCURRENT_WINDOW_MS = 50;
let activeSounds = 0;

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { appOptions } = useAppContext();
  
  const debouncedResetActiveSounds = useDebounce(() => {
    activeSounds = 0;
  }, CONCURRENT_WINDOW_MS);

  const playSound = useCallback(
    (sound: SoundName, pitch: number = 0.5, maxConcurrent?: number) => {
      if (maxConcurrent && activeSounds >= maxConcurrent) return;

      let soundSrc = pointSounds[sound];
      if (!soundSrc || typeof soundSrc !== "string") return;

      const audio = new Audio(soundSrc);

      // Apply slight randomization to pitch and speed
      const rate = randomRange(0.5, 1.5);     
      console.log({rate}) 
      // audio.playbackRate = rate;
      audio.playbackRate = 2;

      activeSounds += 1;
      debouncedResetActiveSounds();

      audio.play();
      audio.onended = () => {
        activeSounds = Math.max(0, activeSounds - 1);
      };
    },
    [debouncedResetActiveSounds]
  );

  const playPointSound = useCallback(
    (points: number = 0, maxConcurrent?: number) => {
      const pointSound = appOptions.pointSound;
      if (pointSound && pointSound !== "none") {
        playSound(pointSound, points * 0.01, maxConcurrent);
      }
    },
    [appOptions.pointSound, playSound]
  );

  return (
    <SoundContext.Provider value={{ playSound, playPointSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSoundContext = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSoundContext must be used within a SoundContextProvider");
  }
  return context;
};
