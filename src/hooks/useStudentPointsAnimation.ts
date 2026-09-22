import { useEffect, useState } from "react";

import { useSoundContext } from "../context/SoundContext";
import {
  studentIdsWithDelayedPointsAnimation,
  studentIdsWithNextPointsAnimation,
} from "../context/StudentContext";
import { Student } from "../types/student.type";
import { useDebounce } from "../utils/useDebounce";
import usePrevious from "./usePrevious";

export const useStudentPointsAnimation = (student: Student, index = 0) => {
  const { playPointSound } = useSoundContext();
  const [recentChange, setRecentChange] = useState<number | undefined>(
    undefined,
  );
  const prevPoints = usePrevious(student.points);
  const [animationTrigger, setAnimationTrigger] = useState(student.points);
  const [animationDirection, setAnimationDirection] = useState<"up" | "down">(
    "up",
  );

  const debouncedResetRecentChange = useDebounce(() => {
    setRecentChange(undefined);
  }, 2000);

  useEffect(() => {
    if (typeof prevPoints !== "number") return;

    const diff = student.points - prevPoints;
    if (diff === 0) return;

    const direction = diff < 0 ? "down" : "up";

    setRecentChange((currentChange) => (currentChange ?? 0) + diff);
    debouncedResetRecentChange();

    const playAnimation = () => {
      setAnimationDirection(direction);
      setAnimationTrigger(student.points);
    };

    if (studentIdsWithDelayedPointsAnimation.has(student.id)) {
      studentIdsWithDelayedPointsAnimation.delete(student.id);
      const delay = 8 * index;
      setTimeout(() => {
        playAnimation();
        playPointSound(1);
      }, delay);
    } else if (studentIdsWithNextPointsAnimation.has(student.id)) {
      studentIdsWithNextPointsAnimation.delete(student.id);
      playAnimation();
      playPointSound(5);
    }
  }, [
    debouncedResetRecentChange,
    index,
    playPointSound,
    prevPoints,
    student.id,
    student.points,
  ]);

  return { animationDirection, animationTrigger, recentChange };
};
