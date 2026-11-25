import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "full" | "compact" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
  showBadge?: boolean;
}

export function BrandLogo({
  variant = "full",
  size = "md",
  className,
  showBadge = true
}: BrandLogoProps) {
  const iconDimensions = {
    sm: { width: 32, height: 16 },
    md: { width: 44, height: 22 },
    lg: { width: 64, height: 32 }
  }[size];

  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 group transition-transform duration-150 active:scale-95 focus:outline-none",
        className
      )}
    >
      {/* Official BrightLoop Infinity Circuit Logo Artwork */}
      <div className="relative flex items-center justify-center shrink-0">
        <Image
          src="/brand/brightloop-logo.png"
          alt="BrightLoop Technology Logo"
          width={iconDimensions.width}
          height={iconDimensions.height}
          priority
          className="object-contain drop-shadow-xs"
        />
      </div>

      {variant !== "icon" && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-slate-900 text-sm">
              BRIGHT
            </span>
            <span className="text-[11px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-sky-50 to-amber-50 text-sky-700 border border-sky-200/80 tracking-wider">
              AI
            </span>
          </div>
          {variant === "full" && (
            <span className="text-[10px] text-slate-500 font-medium tracking-tight">
              BrightLoop Technology
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
