import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import worker from "./src/worker";
import { createInMemoryD1 } from "./src/db/inMemoryDb";

async function startServer() {
  const app = express();
  const PORT = 3000;

  const db = createInMemoryD1();
  const env = {
    DB: db,
    JWT_SECRET: process.env.JWT_SECRET || "lexextern_d1_secret_key_2026",
  };

  app.use(express.json());

  // API routes FIRST
  app.all("/api/*", async (req, res) => {
    try {
      const protocol = req.protocol || "http";
      const host = req.get("host") || `localhost:${PORT}`;
      const fullUrl = `${protocol}://${host}${req.originalUrl}`;

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
          } else {
            headers.set(key, String(value));
          }
        }
      }

      const init: RequestInit = {
        method: req.method,
        headers,
      };

      if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
        init.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      }

      const webRequest = new Request(fullUrl, init);
      const ctx = {
        waitUntil: () => {},
        passThroughOnException: () => {},
      };

      const webResponse = await worker.fetch(webRequest, env, ctx);

      res.status(webResponse.status);
      webResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "content-encoding" && key.toLowerCase() !== "transfer-encoding") {
          res.setHeader(key, value);
        }
      });

      const bodyText = await webResponse.text();
      res.send(bodyText);
    } catch (err: any) {
      console.error("API bridge error:", err);
      res.status(500).json({ error: err?.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
