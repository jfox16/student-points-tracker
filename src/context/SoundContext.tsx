import { createContext, useCallback, useContext, useEffect, useState } from "react";

import popSound from "../assets/audio/bubble.wav";
import dingSound from "../assets/audio/ding.wav";
import { clamp } from "../utils/clamp";
import { useDebounce } from "../utils/useDebounce";

import { useAppContext } from "./AppContext";

export type PointSoundName = "none" | "pop" | "ding";

type SoundName = PointSoundName;

const pointSounds: Record<SoundName, string> = {
  none: "",
  pop: popSound,
  ding: dingSound,
} as const;

interface SoundContextType {
  playSound: (sound: SoundName, pitch?: number) => void;
  playPointSound: (points?: number) => void;
}

const MAX_CONCURRENT_SOUNDS = 1;
const CONCURRENT_WINDOW_MS = 36;
let activeSounds = 0;

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { appOptions } = useAppContext();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [buffers, setBuffers] = useState<Record<string, AudioBuffer>>({});
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  // Debounce to reset active sounds periodically
  const debouncedResetActiveSounds = useDebounce(() => {
    activeSounds = 0;
  }, CONCURRENT_WINDOW_MS);

  useEffect(() => {
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.8; // Set default volume to 80%
    gain.connect(ctx.destination);

    setAudioContext(ctx);
    setGainNode(gain);

    const loadSounds = async () => {
      const buffersData: Record<string, AudioBuffer> = {};

      for (const [key, soundUrl] of Object.entries(pointSounds)) {
        if (soundUrl) {
          const response = await fetch(soundUrl);
          const arrayBuffer = await response.arrayBuffer();
          buffersData[key] = await ctx.decodeAudioData(arrayBuffer);
        }
      }

      setBuffers(buffersData);
    };

    loadSounds();

    return () => {
      ctx.close();
    };
  }, []);

  const playSound = useCallback(
    async (sound: SoundName, pitch: number = 0.5) => {
      if (!audioContext || !buffers[sound] || !gainNode) return;
      if (activeSounds >= MAX_CONCURRENT_SOUNDS) return;

      activeSounds += 1;
      debouncedResetActiveSounds();

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const buffer = buffers[sound];
      if (!buffer) return;

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 1.1 + clamp(pitch, 0, 10) * 0.1;

      source.connect(gainNode);
      source.start();

      source.onended = () => {
        activeSounds = Math.max(0, activeSounds - 1);
      };
    },
    [audioContext, buffers, gainNode, debouncedResetActiveSounds]
  );

  const playPointSound = useCallback(
    (points: number = 0) => {
      const pointSound = appOptions.pointSound;
      if (pointSound && pointSound !== "none") {
        playSound(pointSound, points * 0.01);
      }
    },
    [appOptions.pointSound, playSound]
  );

  return (
    <SoundContext.Provider
      value={{
        playSound,
        playPointSound,
      }}
    >
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
