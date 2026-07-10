import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND_NAME, BRAND_TAGLINE, LOGO_PATH } from "@/lib/constants";

interface BrandLogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  inverted?: boolean;
}

const sizes = {
  sm: { icon: 32, text: "text-sm", tagline: "text-[10px]" },
  md: { icon: 40, text: "text-base sm:text-lg", tagline: "text-xs" },
  lg: { icon: 48, text: "text-xl", tagline: "text-sm" },
};

export default function BrandLogo({
  showTagline = true,
  size = "md",
  className,
  href = "/",
  inverted = false,
}: BrandLogoProps) {
  const s = sizes[size];

  const content = (
    <>
      <div className="relative shrink-0 rounded-full overflow-hidden shadow-sm ring-1 ring-[var(--border)] animate-scale-in">
        <Image
          src={LOGO_PATH}
          alt={BRAND_NAME}
          width={s.icon}
          height={s.icon}
          className="object-cover"
          priority
        />
      </div>
      <div className="min-w-0">
        <span
          className={cn(
            s.text,
            "font-bold block leading-tight",
            inverted ? "text-white" : "text-[var(--foreground)]"
          )}
        >
          {BRAND_NAME}
        </span>
        {showTagline && (
          <span
            className={cn(
              s.tagline,
              "block -mt-0.5 truncate",
              inverted ? "text-white/70" : "text-[var(--text-muted)]"
            )}
          >
            {BRAND_TAGLINE}
          </span>
        )}
      </div>
    </>
  );

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 group shrink-0 transition-opacity hover:opacity-90",
        className
      )}
    >
      {content}
    </Link>
  );
}
