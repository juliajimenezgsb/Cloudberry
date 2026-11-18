import { useRef, useEffect } from "react";
import { drawCharacter } from "../characterArt";
import type { Equipment } from "../catalog";
export default function CharacterPreview({
  equipment,
  small = false,
  animate = true,
}: {
  equipment: Equipment;
  small?: boolean;
  animate?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let frame = 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = (t: number) => {
      const c = canvas.current?.getContext("2d");
      if (!c) return;
      c.clearRect(0, 0, 280, 280);
      const time = t / 1000;
      drawCharacter(
        c,
        140,
        (small ? 159 : 167) +
          (animate && !reduced ? Math.sin(time * 2) * 2.5 : 0),
        equipment,
        small ? 2 : 2.25,
        animate && !reduced ? (Math.sin(time * 2) + 1) * 0.04 : 0,
        time,
      );
      if (animate && !reduced) frame = requestAnimationFrame(draw);
    };
    draw(0);
    return () => cancelAnimationFrame(frame);
  }, [equipment, small, animate]);
  return (
    <canvas
      ref={canvas}
      width="280"
      height="280"
      className={"character-preview-canvas" + (small ? " small" : "")}
      aria-label="Character outfit preview"
    />
  );
}
