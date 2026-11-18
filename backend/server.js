import express from "express";
import dotenv from "dotenv";
import { corsConfig, helmetConfig } from "./config/securityConfig.js";
import { generalLimiter, uploadLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmetConfig);
app.use(corsConfig);

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "100kb" }));

// ─── Rate Limiters ────────────────────────────────────────────────────────────
app.use("/api/", generalLimiter);
app.use("/api/documents/upload", uploadLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Secure Document Upload API is running!",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    environment: process.env.NODE_ENV || "development"
  });
});

// Security info
app.get("/api/security-info", (req, res) => {
  res.status(200).json({
    success: true,
    security: {
      helmet: "✅ HTTP security headers enabled",
      cors: `✅ CORS restricted to: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
      rateLimiting: {
        general: "✅ 100 requests per 15 minutes",
        upload: "✅ 25 uploads per 15 minutes"
      },
      bodyLimit: "✅ JSON body capped at 100kb",
      errorHandling: "✅ Centralized error middleware active"
    }
  });
});

// Rate limit demo
app.get("/api/rate-limit-demo", uploadLimiter, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Request accepted! Hit this 25+ times to trigger rate limiting.",
    requestAt: new Date().toISOString()
  });
});

// Error demo (for testing error middleware)
app.get("/api/error-demo", (req, res, next) => {
  const error = new Error("This is a test error from the server.");
  error.statusCode = 500;
  next(error);
});

// ─── Error Handling (must be LAST) ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("─────────────────────────────────────────────");
  console.log(` ✅ Server running at http://localhost:${PORT}`);
  console.log("─────────────────────────────────────────────");
  console.log(" 📋 Available Endpoints:");
  console.log(`    GET  /api/health`);
  console.log(`    GET  /api/security-info`);
  console.log(`    GET  /api/rate-limit-demo`);
  console.log(`    GET  /api/error-demo`);
  console.log("─────────────────────────────────────────────");
});
