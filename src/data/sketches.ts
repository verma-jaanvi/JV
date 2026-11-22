/**
 * SKETCHBOOK DATA
 *
 * Every image in  public/sketches/  is picked up automatically (jpg, png, webp, gif, avif, svg).
 *  - Newest files first.
 *  - Put images in a subfolder (public/sketches/portraits/…) to tag them with the folder name.
 *  - Optional: customise a piece below in `overrides`, keyed by its id (file name without extension,
 *    prefixed with "folder/" if it's in a subfolder).
 *
 * Sketches added via the "Add sketch" button (edit mode) are stored only in YOUR browser.
 */
import auto from "virtual:sketches";

export interface Sketch {
  id: string;
  title: string;
  src: string;
  w: number;
  h: number;
  tags: string[];
  /** ISO date, e.g. "2026-11-02" */
  date?: string;
  /** true when stored in this browser only */
  local?: boolean;
}

export const overrides: Record<string, Partial<Pick<Sketch, "title" | "tags" | "date">>> = {
  // "sample-9": { title: "Eye study", tags: ["Studies"], date: "2026-11-02" },
};

export const sketches: Sketch[] = auto.map((s) => ({ ...s, ...overrides[s.id] }));
