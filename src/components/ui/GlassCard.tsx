import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: "neon" | "electric" | "coral" | "amber" | "none";
  hoverEffect?: boolean;
}

export function GlassCard({ children, glowColor = "none", hoverEffect = false, className, ...props }: GlassCardProps) {
  const glowClasses = {
    neon: "shadow-neon-sm border-neon/20",
    electric: "shadow-[0_0_8px_rgba(0,229,255,0.4)] border-electric/20",
    coral: "shadow-[0_0_8px_rgba(255,58,58,0.4)] border-coral/20",
    amber: "shadow-[0_0_8px_rgba(255,184,0,0.4)] border-amber-sports/20",
    none: "shadow-card border-white/5",
  };

  return (
    <div
      className={cn(
        "bg-pitch-card backdrop-blur-[14px] rounded-2xl overflow-hidden transition-all duration-300",
        hoverEffect ? "hover:bg-pitch-elevated hover:shadow-glass hover:-translate-y-1 hover:border-white/10" : "",
        glowClasses[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
