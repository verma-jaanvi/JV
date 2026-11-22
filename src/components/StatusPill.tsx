export type Tone = "ok" | "warn" | "accent" | "err" | "neutral";

export function StatusPill({
  tone = "neutral",
  children,
  pulse = false,
  className = "",
}: {
  tone?: Tone;
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}) {
  const toneClass =
    tone === "ok" ? "pill-ok" : tone === "warn" ? "pill-warn" : tone === "accent" ? "pill-accent" : tone === "err" ? "pill-err" : "";
  return (
    <span className={`pill ${toneClass} ${className}`}>
      <span className={`pill-dot ${pulse ? "animate-pulse" : ""}`} />
      {children}
    </span>
  );
}
