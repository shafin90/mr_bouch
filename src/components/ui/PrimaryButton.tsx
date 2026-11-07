import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}

export function PrimaryButton({ href, children, className, external }: ButtonProps) {
  const cls = cn(
    "inline-flex h-12 items-center justify-center gap-2 bg-navy px-7 text-sm font-medium tracking-wide text-ivory transition-all duration-300 hover:bg-bronze hover:shadow-soft focus-visible:outline-none",
    className
  );
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
