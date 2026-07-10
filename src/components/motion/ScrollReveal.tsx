import { cn } from "@/lib/utils";
import { ReactNode, ElementType } from "react";

type RevealVariant = "up" | "scale" | "fade" | "left" | "right";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  as?: ElementType;
}

const variantClass: Record<RevealVariant, string> = {
  up: "scroll-reveal-up",
  scale: "scroll-reveal-scale",
  fade: "scroll-reveal-fade",
  left: "scroll-reveal-left",
  right: "scroll-reveal-right",
};

export default function ScrollReveal({
  children,
  variant = "up",
  delay,
  className,
  as: Tag = "div",
}: ScrollRevealProps) {
  return (
    <Tag
      className={cn("scroll-reveal", variantClass[variant], className)}
      style={delay != null ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
