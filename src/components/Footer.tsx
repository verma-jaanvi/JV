import { Link } from "@tanstack/react-router";
import { Aurora } from "./Aurora";
import { Reveal } from "./Reveal";
import { StatusPill } from "./StatusPill";
import { SITE } from "../data/site";

export function Footer() {
  return (
    <footer className="relative z-10 mt-32 overflow-hidden border-t border-line">
      <Aurora
        className="[mask-image:linear-gradient(to_bottom,transparent,black_45%)]"
        intensity={0.9}
      />
      <div className="container-x relative py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <Reveal>
            <div>
              <p className="display-sm">Jahnvi Verma</p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
                Creative technologist building AI-driven software, interactive
                interfaces and full-stack products.
              </p>
              <Link to="/contact" className="btn-square mt-6">
                Start a conversation
              </Link>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <p className="label">Navigate</p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                ["/", "Home"],
                ["/about", "About"],
                ["/projects", "Projects"],
                ["/sketches", "Sketches"],
                ["/writings", "Writing"],
                ["/contact", "Contact"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-white/80 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={160}>
            <p className="label">Elsewhere</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={SITE.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/80 transition-colors hover:text-white"
                >
                  GitHub ↗
                </a>
              </li>
              <li>
                <a
                  href={SITE.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/80 transition-colors hover:text-white"
                >
                  LinkedIn ↗
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-white/80 transition-colors hover:text-white"
                >
                  Email ↗
                </a>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={240}>
            <p className="label">Status</p>
            <div className="mt-4 space-y-3">
              <StatusPill tone="ok" pulse>
                Available for collaboration
              </StatusPill>
              <p className="font-data text-xs">async · remote-friendly</p>
            </div>
          </Reveal>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 font-data text-xs sm:flex-row sm:items-center">
          <span>
            © {new Date().getFullYear()} Jahnvi Verma. All rights reserved.
          </span>
          <span>Built with React · Tailwind · anime.js</span>
        </div>
      </div>
    </footer>
  );
}
