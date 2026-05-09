import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type RevealDirection = "up" | "right" | "left";

type MotionStyle = CSSProperties & {
  "--motion-delay"?: string;
  "--motion-duration"?: string;
  "--motion-distance"?: string;
  "--typing-delay"?: string;
  "--typing-duration"?: string;
  "--typing-steps"?: number;
};

function toMs(value: number) {
  return `${value}ms`;
}

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 14,
  duration = 560
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
}) {
  const style: MotionStyle = {
    "--motion-delay": toMs(delay),
    "--motion-duration": toMs(duration),
    "--motion-distance": `${distance}px`
  };

  return (
    <div className={cn("motion-reveal", `motion-reveal-${direction}`, className)} style={style}>
      {children}
    </div>
  );
}

export function TypingText({
  text,
  className,
  delay = 0,
  duration = 900
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const style: MotionStyle = {
    "--typing-delay": toMs(delay),
    "--typing-duration": toMs(duration),
    "--typing-steps": Math.max(text.length, 1)
  };

  return (
    <span className={cn("motion-typewriter", className)} style={style}>
      {text}
    </span>
  );
}
