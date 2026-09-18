import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { performStockSync, getParsedProductsFromSheets } from "./src/server/syncService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Direct live fetch from Google Sheets with rate limit and in-memory cache protection
  app.get("/api/products", async (req, res) => {
    try {
      const forceRefresh = req.query.force === 'true';
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');

      const products = await getParsedProductsFromSheets(undefined, undefined, forceRefresh);

      res.json({ success: true, products, count: products.length });
    } catch (err: any) {
      console.error("Error during /api/products:", err);
      res.status(500).json({ success: false, error: err.message || "Error al leer planilla de Google Sheets" });
    }
  });

  app.post("/api/sync-stock", async (_req, res) => {
    try {
      console.log("Received manual sync request via /api/sync-stock");
      const stats = await performStockSync();
      res.json({ success: true, ...stats });
    } catch (err: any) {
      console.error("Error during /api/sync-stock:", err);
      res.status(500).json({ success: false, error: err.message || "Error al sincronizar stock" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
