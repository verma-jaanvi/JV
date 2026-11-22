import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { animate, stagger, onScroll, prefersReducedMotion } from "../lib/anim";
import { NAV_LINKS, RESUMES, type Resume } from "../data/site";
import { ResumeMenu } from "./ResumeMenu";
import { ResumeViewer } from "./ResumeViewer";
import { bootDelay } from "../lib/boot";

const Arrow = ({ size = 10 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 10L10 2M10 2H3.5M10 2V8.5"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
);

export function Nav() {
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [stuck, setStuck] = useState(false);
  const progress = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  const isActive = (to: string) =>
    to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to);

  // sticky header: compact glass bar once the page is scrolled
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // scroll progress hairline (fixed)
  useEffect(() => {
    const el = progress.current;
    if (!el || prefersReducedMotion()) return;
    const a = animate(el, {
      scaleX: [0, 1],
      ease: "linear",
      autoplay: onScroll({
        sync: true,
        enter: "top top",
        leave: "bottom bottom",
      }),
    });
    return () => {
      a.revert();
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const a = animate("[data-nav-in]", {
      opacity: [0, 1],
      translateY: [-10, 0],
      duration: 800,
      delay: stagger(70, { start: bootDelay() }),
      ease: "outExpo",
    });
    return () => {
      a.cancel();
    };
  }, []);

  // full-screen mobile menu
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open || !menu.current || prefersReducedMotion()) return;
    const a1 = animate(menu.current, {
      opacity: [0, 1],
      duration: 300,
      ease: "outQuad",
    });
    const a2 = animate(menu.current.querySelectorAll("[data-m]"), {
      opacity: [0, 1],
      translateY: [28, 0],
      duration: 700,
      delay: stagger(70, { start: 100 }),
      ease: "outExpo",
    });
    return () => {
      a1.cancel();
      a2.cancel();
    };
  }, [open]);

  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <>
      <div
        ref={progress}
        className="fixed inset-x-0 top-0 z-[70] h-px origin-left bg-accent"
        style={{ transform: "scaleX(0)" }}
      />
      <header
        className={`fixed inset-x-0 top-0 z-50 px-6 transition-[padding,background-color,border-color,backdrop-filter] duration-500 md:px-14 ${
          stuck
            ? "border-b border-line bg-black/65 pb-3 pt-3 backdrop-blur-xl"
            : "border-b border-transparent pb-0 pt-[38px]"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link
            to="/"
            data-nav-in
            className="hidden-until-anim flex items-center gap-3"
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="1"
                y="1"
                width="24"
                height="24"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <path
                d="M8 7v8a3 3 0 0 0 6 0M17 7l-3 12"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </svg>
            <span className="text-[20px] font-medium tracking-[-0.02em]">
              Jahnvi Verma
            </span>
          </Link>

          <nav
            data-nav-in
            className="hidden-until-anim hidden items-center gap-9 md:flex"
            aria-label="Primary"
          >
            {NAV_LINKS.filter((l) => l.to !== "/contact").map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-base transition-opacity hover:opacity-100 ${isActive(l.to) ? "opacity-100" : "opacity-70"}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div
            data-nav-in
            className="hidden-until-anim flex items-center gap-3"
          >
            <ResumeMenu onPick={setResume} />
            <Link
              to="/contact"
              className="btn-square hidden !h-auto !gap-2 !px-3 !py-2 !text-base md:inline-flex"
            >
              Get in touch <Arrow />
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="btn-outline-square !h-10 !px-4 !text-sm md:!hidden"
              aria-label="Open menu"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          ref={menu}
          className="fixed inset-0 z-[80] flex flex-col bg-black px-6 pb-10 pt-[38px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[20px] font-medium tracking-[-0.02em]">
              Jahnvi Verma
            </span>
            <button
              onClick={() => setOpen(false)}
              className="btn-outline-square !h-10 !px-4 !text-sm"
              aria-label="Close menu"
            >
              Close
            </button>
          </div>
          <div className="mt-16 flex flex-1 flex-col">
            {NAV_LINKS.map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                data-m
                className="flex items-baseline gap-4 border-b border-line py-5"
              >
                <span className="font-data text-xs">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[40px] leading-none tracking-[-2px]">
                  {l.label}
                </span>
              </Link>
            ))}
          </div>
          <div data-m className="mt-6">
            <p className="label mb-3">Resume</p>
            <div className="flex flex-wrap gap-2">
              {RESUMES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setOpen(false);
                    setResume(r);
                  }}
                  className="btn-outline-square !h-10 !px-4 !text-sm"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <Link to="/contact" data-m className="btn-square mt-8 !h-14 !text-lg">
            Get in touch <Arrow size={12} />
          </Link>
        </div>
      )}

      {resume && (
        <ResumeViewer resume={resume} onClose={() => setResume(null)} />
      )}
    </>
  );
}
