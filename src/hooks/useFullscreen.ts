import { useCallback, useEffect, useRef, useState } from "react";

export const useFullscreen = (targetRef: React.RefObject<HTMLElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
      return;
    }
    targetRef.current?.requestFullscreen?.().catch(() => undefined);
  }, [targetRef]);

  return { isFullscreen, toggle, supported: typeof document !== "undefined" && Boolean(document.documentElement.requestFullscreen) };
};
