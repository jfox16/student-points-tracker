import { createContext, useContext, useEffect, useState } from "react";

import pointSound from "../assets/audio/ding.wav"; // Add more sounds later
import { clamp } from "../utils/clamp";
import { useDebounce } from "../utils/useDebounce";
import { useAppContext } from "./AppContext";

type SoundName = "point";

const sounds: Record<SoundName, string> = {
  point: pointSound,
} as const;

interface SoundContextType {
  play: (sound: SoundName, pitch?: number) => void;
}

const MAX_CONCURRENT_SOUNDS = 1; // Dynamically adjusted for performance
let activeSounds = 0;

const SoundContext = createContext<SoundContextType>({
  play: () => {},
});

export const SoundContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { appOptions } = useAppContext();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [buffers, setBuffers] = useState<Record<string, AudioBuffer>>({});

  // Debounce to reset active sounds periodically
  const debouncedResetActiveSounds = useDebounce(() => {
    activeSounds = 0;
  }, 30);

  useEffect(() => {
    const ctx = new AudioContext();
    setAudioContext(ctx);

    const loadSounds = async () => {
      const buffersData: Record<string, AudioBuffer> = {};

      for (const [key, soundUrl] of Object.entries(sounds)) {
        const response = await fetch(soundUrl);
        const arrayBuffer = await response.arrayBuffer();
        buffersData[key] = await ctx.decodeAudioData(arrayBuffer);
      }

      setBuffers(buffersData);
    };

    loadSounds();

    return () => {
      ctx.close();
    };
  }, []);

  const play = async (sound: SoundName, pitch: number = 0.5) => {
    if (!appOptions.enableDingSound) return;
    if (!audioContext || !buffers[sound]) return;
    if (activeSounds >= MAX_CONCURRENT_SOUNDS) return; // Prevents too many concurrent sounds

    activeSounds += 1;
    debouncedResetActiveSounds();

    // Ensure `AudioContext` is running (some browsers auto-suspend it)
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const buffer = buffers[sound];

    if (!buffer) return;

    // **Optimized: Reuse the preloaded buffer across nodes**
    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    // Use a GainNode for consistency
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1;

    // Apply pitch variation
    source.playbackRate.value = 0.95 + clamp(pitch, 0, 1) * 0.1;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start();

    // Clean up after the sound finishes playing
    source.onended = () => {
      activeSounds = Math.max(0, activeSounds - 1);
    };
  };

  return <SoundContext.Provider value={{ play }}>{children}</SoundContext.Provider>;
};

export const useSoundContext = () => useContext(SoundContext);
