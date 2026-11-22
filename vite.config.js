import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

// Dev-only: serve api/*.ts (Vercel functions) from the Vite dev server so /api/leetcode works locally.
function devApi() {
  return {
    name: "dev-api",
    configureServer(server) {
      server.middlewares.use("/api/leetcode", async (req, res) => {
        try {
          const mod = await server.ssrLoadModule("/api/leetcode.ts");
          const shim = {
            setHeader: (k, v) => res.setHeader(k, v),
            status(c) {
              res.statusCode = c;
              return shim;
            },
            json(b) {
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(b));
            },
          };
          await mod.default(req, shim);
        } catch {
          res.statusCode = 500;
          res.end("{}");
        }
      });
    },
  };
}


// Scans public/sketches (and one level of subfolders) and exposes every image as `virtual:sketches`.
// Drop a file in, and it appears on /sketches — no manifest to edit. Subfolder name becomes the tag.
const IMG = /\.(jpe?g|png|webp|gif|avif|svg)$/i;
function sketchesPlugin() {
  const ID = "virtual:sketches";
  const RESOLVED = "\0" + ID;
  const dir = path.resolve("public/sketches");

  const scan = () => {
    const out = [];
    const walk = (folder, rel) => {
      if (!fs.existsSync(folder)) return;
      for (const ent of fs.readdirSync(folder, { withFileTypes: true })) {
        if (ent.name.startsWith(".")) continue;
        const full = path.join(folder, ent.name);
        if (ent.isDirectory()) {
          if (!rel) walk(full, ent.name);
          continue;
        }
        if (!IMG.test(ent.name)) continue;
        let w = 1000, h = 1000;
        try {
          const dim = imageSize(fs.readFileSync(full));
          w = dim.width || w;
          h = dim.height || h;
          if (dim.orientation && dim.orientation >= 5) [w, h] = [h, w];
        } catch {}
        const base = ent.name.replace(/\.[^.]+$/, "");
        const urlPath = (rel ? rel + "/" : "") + ent.name;
        out.push({
          id: (rel ? rel + "/" : "") + base,
          src: encodeURI("/sketches/" + urlPath),
          title: base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim(),
          tags: [rel ? rel.replace(/[-_]+/g, " ") : "Sketches"],
          w,
          h,
          date: fs.statSync(full).mtime.toISOString().slice(0, 10),
          _t: fs.statSync(full).mtimeMs,
        });
      }
    };
    walk(dir, "");
    out.sort((a, b) => b._t - a._t || a.id.localeCompare(b.id, undefined, { numeric: true }));
    return out.map(({ _t, ...rest }) => rest);
  };

  return {
    name: "sketches-auto",
    resolveId: (id) => (id === ID ? RESOLVED : null),
    load: (id) => (id === RESOLVED ? `export default ${JSON.stringify(scan())};` : null),
    configureServer(server) {
      server.watcher.add(dir);
      const refresh = (file) => {
        if (!path.resolve(file).startsWith(dir)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", refresh).on("unlink", refresh).on("change", refresh);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: "./src/routes", generatedRouteTree: "./src/routeTree.gen.ts" }),
    react(),
    tailwindcss(),
    devApi(),
    sketchesPlugin(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
