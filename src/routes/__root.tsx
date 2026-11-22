import { useState, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useLocation,
  useRouter,
} from "@tanstack/react-router";

import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { CursorGlow } from "../components/CursorGlow";
import Loader from "../components/Loader";
import { animate, prefersReducedMotion } from "../lib/anim";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="label">Error · 404</p>
        <h1 className="display-xl mt-4">404</h1>
        <p className="mt-4 text-sm text-muted">
          This page doesn't exist, or it has moved.
        </p>
        <Link to="/" className="btn-square mt-8">
          Back to home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="label">Runtime error</p>
        <h1 className="display-md mt-4">Something went wrong</h1>
        <p className="font-data mt-3 text-xs">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="btn-outline-square mt-8"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const loc = useLocation();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  const [showLoader, setShowLoader] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("jv_booted");
    }
    return false;
  });

  const handleLoaderComplete = () => {
    sessionStorage.setItem("jv_booted", "true");
    setShowLoader(false);
  };

  // route-change transition (anime.js)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = main.current;
    if (!el || prefersReducedMotion()) return;
    const a = animate(el, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 650,
      ease: "outExpo",
      onComplete: () => {
        el.style.transform = "";
        el.style.opacity = "";
      },
    });
    return () => {
      a.cancel();
    };
  }, [loc.pathname]);

  // The contact page is a self-contained single-screen layout (Observe glass UI)
  const standalone = loc.pathname === "/contact";

  return (
    <QueryClientProvider client={queryClient}>
      {showLoader && <Loader onComplete={handleLoaderComplete} />}
      {standalone ? (
        <Outlet />
      ) : (
        <div className="relative min-h-screen">
          <CursorGlow />
          <Nav />
          <main ref={main} className="relative z-10">
            <Outlet />
          </main>
          <Footer />
        </div>
      )}
    </QueryClientProvider>
  );
}
