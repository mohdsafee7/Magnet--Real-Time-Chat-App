import { useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query
 */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}


/*This code defines a custom hook called useMediaQuery that subscribes to a CSS media query. 
It returns a boolean value indicating whether the media query matches or not. */