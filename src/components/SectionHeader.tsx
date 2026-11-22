import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { SplitHeading } from "./SplitHeading";

export function SectionHeader({
  index,
  label,
  title,
  action,
}: {
  index: string;
  label: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <Reveal>
          <p className="label flex items-center gap-3">
            <span className="text-fg">{index}</span>
            <span className="h-px w-8 bg-line-strong" />
            {label}
          </p>
        </Reveal>
        <SplitHeading text={title} className="display-lg mt-5 max-w-3xl" />
      </div>
      {action && <Reveal delay={150}>{action}</Reveal>}
    </div>
  );
}
