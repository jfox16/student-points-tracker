import { createContext, useCallback, useContext } from "react";

import { pointSounds } from "../assets/sounds/sounds";
import { useDebounce } from "../utils/useDebounce";
import { useAppContext } from "./AppContext";
import { randomRange } from "../utils/randomRange";

export type PointSoundName = "none" | "pop" | "ding" | "bark" | "meow";
type SoundName = PointSoundName;

interface SoundContextType {
  playSound: (sound: SoundName, maxConcurrent?: number) => void;
  playPointSound: (maxConcurrent?: number) => void;
}

const CONCURRENT_WINDOW_MS = 60;
const activeSounds: Record<string, number> = {}; // Dynamically managed

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { appOptions } = useAppContext();

  const debouncedResetActiveSounds = useDebounce(() => {
    Object.keys(activeSounds).forEach((key) => {
      activeSounds[key] = 0;
    });
  }, CONCURRENT_WINDOW_MS);

  const playSound = useCallback(
    (sound: SoundName, maxConcurrent?: number) => {
      if (!pointSounds[sound] || sound === "none") return;

      if (!(sound in activeSounds)) {
        activeSounds[sound] = 0;
      }

      if (maxConcurrent && activeSounds[sound] >= maxConcurrent) return;

      const audioSrc = pointSounds[sound];
      if (!audioSrc) return;

      const audio = new Audio(audioSrc);
      audio.playbackRate = randomRange(0.5, 1.5);

      audio.addEventListener("ended", () => {
        activeSounds[sound] = Math.max(0, activeSounds[sound] - 1);
      });

      audio.play();
      activeSounds[sound] += 1;
      debouncedResetActiveSounds();
    },
    [debouncedResetActiveSounds]
  );

  const playPointSound = useCallback(
    (maxConcurrent?: number) => {
      const pointSound = appOptions.pointSound;
      if (pointSound && pointSound !== "none") {
        playSound(pointSound, maxConcurrent);
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
