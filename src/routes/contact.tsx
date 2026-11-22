import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import { submitContact } from "@/lib/content.functions";
import { SITE } from "../data/site";
import { Aurora } from "../components/Aurora";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Jahnvi Verma (JV)" },
      {
        name: "description",
        content:
          "Get in touch with Jahnvi Verma. Collaborations, freelance projects and opportunities welcome.",
      },
      { property: "og:title", content: "Contact — Jahnvi Verma (JV)" },
      {
        property: "og:description",
        content: "Let's build something extraordinary together.",
      },
    ],
  }),
  component: Contact,
});

/* Primary clip from the Observe spec; falls back to a bundled loop if it can't load. */
const VIDEO_SRC =
  "https://designerstephen.github.io/public-assets/videos/observe-hero.mp4";
const VIDEO_FALLBACK = "/videos/contact-loop.mp4";

const intents = [
  "A collaboration",
  "A commission",
  "An opportunity",
  "Just saying hi",
] as const;

const HEADLINE_SHADOW =
  "0 0 72px rgba(0, 0, 0, 0.42), 0 4px 28px rgba(0, 0, 0, 0.28)";
const SUBLINE_SHADOW =
  "0 0 30px rgba(0, 0, 0, 0.32), 0 1px 10px rgba(0, 0, 0, 0.20)";

function Contact() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [intent, setIntent] =
    useState<(typeof intents)[number]>("A collaboration");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playbackRate = 0.5;
    v.play().catch(() => {});
  }, []);

  const onVideoError = () => {
    const v = videoRef.current;
    if (!v || v.src.endsWith(VIDEO_FALLBACK)) return;
    v.src = VIDEO_FALLBACK;
    v.playbackRate = 0.5;
    v.play().catch(() => {});
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();

    if (!name || !email || !message) {
      setError("Please fill in your name, email and a message.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("That email address doesn't look right.");
      return;
    }

    setSubmitting(true);
    try {
      await submitContact({
        name,
        email,
        intent,
        message,
        honeypot: String(form.get("b_address_uid") || ""),
        userAgent:
          typeof navigator !== "undefined"
            ? navigator.userAgent.slice(0, 500)
            : undefined,
      });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        {/* Background video — full opacity, no scrim, no filter */}
        <video
          ref={videoRef}
          id="hero-video"
          className="absolute inset-0 h-full w-full object-cover object-bottom"
          src={VIDEO_SRC}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          onError={onVideoError}
        />

        {/* Slow drifting violet/blue light */}
        <Aurora />

        {/* Navbar — fixed so it stays put while scrolling */}
        <nav className="fixed inset-x-0 top-0 z-30 px-6 py-6">
          <div className="liquid-glass mx-auto flex max-w-5xl items-center justify-between rounded-full py-1.5 pl-6 pr-1.5">
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="h-6 w-6"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              </svg>
              <span className="text-lg font-semibold tracking-tight">
                Jahnvi Verma
              </span>
              <div className="ml-8 hidden gap-8 md:flex">
                {[
                  ["/", "Home"],
                  ["/about", "About"],
                  ["/projects", "Projects"],
                  ["/sketches", "Sketches"],
                  ["/writings", "Writing"],
                ].map(([to, label]) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-sm font-medium text-white/80 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noreferrer"
                className="hidden text-sm font-medium text-white sm:block"
              >
                LinkedIn
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="whitespace-nowrap rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
              >
                Email me
              </a>
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-28 text-center md:-translate-y-[4%]">
          <h1
            className="font-serif-instrument mb-4 text-5xl tracking-tight md:text-6xl lg:whitespace-nowrap lg:text-7xl"
            style={{ textShadow: HEADLINE_SHADOW }}
          >
            Let's build something <em className="italic">extraordinary</em>
          </h1>
          <p
            className="mb-8 max-w-2xl text-sm leading-relaxed text-white/70 md:whitespace-nowrap"
            style={{ textShadow: SUBLINE_SHADOW }}
          >
            Collaborations, freelance projects, opportunities — I read every
            message and reply within a few days.
          </p>

          <div className="w-full max-w-xl">
            {sent ? (
              <div className="liquid-glass rounded-[28px] px-8 py-10">
                <p className="text-lg font-medium tracking-tight">
                  Message received.
                </p>
                <p className="mt-2 text-sm text-white/80">
                  Thanks for reaching out — I'll get back to you soon.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform duration-300 hover:scale-105"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-3 text-left"
              >
                {/* Honeypot — hidden from humans; bots fill it and get silently dropped */}
                <input
                  name="b_address_uid"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ display: "none" }}
                />

                <div
                  className="flex flex-wrap justify-center gap-2"
                  role="group"
                  aria-label="I'm reaching out about"
                >
                  {intents.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIntent(i)}
                      aria-pressed={intent === i}
                      className={
                        intent === i
                          ? "whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
                          : "liquid-glass whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
                      }
                    >
                      {i}
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="liquid-glass rounded-full px-6 py-3.5">
                    <input
                      name="name"
                      type="text"
                      required
                      maxLength={200}
                      placeholder="Your name"
                      aria-label="Your name"
                      className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-white/90"
                    />
                  </div>
                  <div className="liquid-glass rounded-full px-6 py-3.5">
                    <input
                      name="email"
                      type="email"
                      required
                      maxLength={320}
                      placeholder="Enter your email"
                      aria-label="Your email"
                      className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-white/90"
                    />
                  </div>
                </div>

                <div className="liquid-glass rounded-[28px] pb-1.5 pl-6 pr-1.5 pt-4">
                  <textarea
                    name="message"
                    required
                    rows={3}
                    maxLength={5000}
                    placeholder="Tell me about your idea…"
                    aria-label="Your message"
                    className="w-full resize-none border-none bg-transparent pr-4 text-sm text-white outline-none placeholder:text-white/90"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="text-xs text-white/60"
                      role={error ? "alert" : undefined}
                    >
                      {error ?? ""}
                    </span>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform duration-300 hover:scale-105 disabled:cursor-wait disabled:opacity-70"
                    >
                      {submitting ? "Sending…" : "Send message"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Social row */}
        <div className="relative z-10 flex justify-center gap-4 pb-12">
          {[
            {
              href: `mailto:${SITE.email}`,
              label: "Email",
              Icon: Mail,
              ext: false,
            },
            { href: SITE.github, label: "GitHub", Icon: Github, ext: true },
            {
              href: SITE.linkedin,
              label: "LinkedIn",
              Icon: Linkedin,
              ext: true,
            },
          ].map(({ href, label, Icon, ext }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              {...(ext ? { target: "_blank", rel: "noreferrer" } : {})}
              className="liquid-glass-circle flex h-14 w-14 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/5 hover:text-white"
            >
              <Icon size={20} />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
