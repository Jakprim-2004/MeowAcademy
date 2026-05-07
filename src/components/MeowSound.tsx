"use client";

import { useEffect } from "react";

const MeowSound = () => {
  // Global Meow Sound Effect 🐱🔊
  useEffect(() => {
    const playMeow = () => {
      try {
        const audio = new Audio("/sounds/meow.mp3");
        audio.volume = 0.3;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Silence autoplay errors
          });
        }
      } catch (error) {
        // Ignore errors
      }
    };

    window.addEventListener("click", playMeow);
    return () => window.removeEventListener("click", playMeow);
  }, []);

  return null;
};

export default MeowSound;
