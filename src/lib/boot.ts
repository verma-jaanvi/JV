/** Delay (ms) page-load animations while the boot loader is still covering the screen. */
export function bootDelay(): number {
  if (typeof window === "undefined") return 0;
  try {
    return sessionStorage.getItem("jv_booted") ? 0 : 1900;
  } catch {
    return 0;
  }
}
