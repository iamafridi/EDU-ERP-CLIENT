"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#624FDA] via-[#8C7BE8] to-[#5E9B7D] origin-left z-[100] pointer-events-none shadow-[0_0_8px_rgba(140,123,232,0.8)]"
    />
  );
}
