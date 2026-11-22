import type { ReactNode } from "react";

export function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="marquee relative flex w-full overflow-hidden">
      <div className="marquee-track flex shrink-0 items-center gap-10 pr-10">
        {children}
        {children}
      </div>
    </div>
  );
}
