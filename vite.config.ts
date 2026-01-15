import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";


export default defineConfig({

  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./assets"),
    },
  },
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: true, // Enable source maps for debugging
  },
  server: {
    allowedHosts: ["omnishare.ai", "localhost", "www.omnishare.ai"],
    middlewares: [
      (req, res, next) => {
        // Content-Security-Policy header
        res.setHeader(
          "Content-Security-Policy",
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.facebook.com https://*.facebook.net https://*.linkedin.com https://accounts.google.com https://apis.google.com; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
          "img-src 'self' data: https: blob:; " +
          "font-src 'self' https://fonts.gstatic.com data:; " +
          "connect-src 'self' https: ws: wss:; " +
          "frame-src 'self' https://*.facebook.com https://*.facebook.net https://*.linkedin.com https://accounts.google.com; " +
          "object-src 'none'; " +
          "media-src 'self' https: blob:; " +
          "base-uri 'self'; " +
          "form-action 'self'; " +
          "trusted-types 'allow-duplicates'; " +
          "upgrade-insecure-requests"
        );

        // Strict-Transport-Security header
        res.setHeader(
          "Strict-Transport-Security",
          "max-age=31536000; includeSubDomains; preload"
        );

        // X-Content-Type-Options header
        res.setHeader("X-Content-Type-Options", "nosniff");

        // X-Frame-Options header
        res.setHeader("X-Frame-Options", "SAMEORIGIN");

        // X-XSS-Protection header
        res.setHeader("X-XSS-Protection", "1; mode=block");

        // Cross-Origin-Opener-Policy header
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

        // Cross-Origin-Embedder-Policy header
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

        // Referrer-Policy header
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Permissions-Policy header
        res.setHeader(
          "Permissions-Policy",
          "geolocation=(), " +
          "microphone=(), " +
          "camera=(), " +
          "payment=(), " +
          "usb=(), " +
          "magnetometer=(), " +
          "gyroscope=(), " +
          "accelerometer=()"
        );

        next();
      },
    ],
  },
});
