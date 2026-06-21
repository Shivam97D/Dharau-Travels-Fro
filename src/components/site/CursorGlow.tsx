import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setEnabled(false);
      return;
    }
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-[100] h-10 w-10 rounded-full mix-blend-screen"
      style={{
        background:
          "radial-gradient(circle, oklch(0.78 0.22 35 / 0.55), oklch(0.6 0.22 295 / 0.25) 60%, transparent 100%)",
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.6 }}
    />
  );
}
