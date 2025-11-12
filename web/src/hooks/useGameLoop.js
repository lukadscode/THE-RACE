import { useEffect, useRef } from "react";

export default function useGameLoop(callback, fps = 30) {
  const ref = useRef();
  useEffect(() => {
    let h;
    const step = () => {
      callback();
      h = setTimeout(step, 1000 / fps);
    };
    step();
    return () => clearTimeout(h);
  }, [callback, fps]);
}
