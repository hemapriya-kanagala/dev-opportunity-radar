import express from "express";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// SECURE CONSTANT-TIME STRINGS COMPARISON HELPER
function timingSafeCompare(input: string, secret: string): boolean {
  // Hash both inputs using a fixed-key HMac to fixed 32-byte buffers to avoid leaking length info.
  // This is immune to both timing attacks and length disclosure.
  const inputHash = crypto.createHmac("sha256", "dor-secure-salt-key-2026").update(input).digest();
  const secretHash = crypto.createHmac("sha256", "dor-secure-salt-key-2026").update(secret).digest();
  return crypto.timingSafeEqual(inputHash, secretHash);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. TRUST PROXY CONFIGURATION: Properly handle client IP extraction from behind Cloud Run/Nginx proxies
  app.set("trust proxy", 1);

  // 2. INFO DISCLOSURE MITIGATION: Disable express signature header
  app.disable("x-powered-by");

  // 3. PAYLOAD LIMIT DEFENSE: Restrict incoming JSON body payload size (prevent DoS)
  app.use(express.json({ limit: "5kb" }));

  // 4. SECURITY HARDENING HEADERS & MODERN CONTENT SECURITY POLICY (CSP)
  app.use((_req, res, next) => {
    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    // Referrer control
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Standard secure session transport upgrade (HSTS)
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

    // Modern Content Security Policy:
    // Allows Vite development assets and standard static loads while fully restricting unauthorized domains.
    // Includes frame-ancestors to prevent Clickjacking while supporting AI Studio's preview iframe framing and DEV.to embeds.
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https: wss:; " +
      "frame-ancestors 'self' https://ai.studio https://*.google.com https://*.run.app https://*.googleusercontent.com https://dev.to https://*.dev.to;"
    );
    
    next();
  });

  // 5. BRUTE-FORCE RATE LIMITER ENGINE (In-Memory IP tracking)
  const failedAttempts = new Map<string, { count: number; lockUntil: number }>();

  // Clean stale entries periodically (once an hour) to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of failedAttempts.entries()) {
      if (now > record.lockUntil) {
        failedAttempts.delete(ip);
      }
    }
  }, 3600000);

  // SECURE BACKEND API: Validate curator credentials with protection
  app.post("/api/verify-admin", (req, res, next) => {
    // Safely extract client IP from trusted proxy setup
    const clientIp = req.ip || "unknown-ip";
    const now = Date.now();

    // Check if IP is currently locked out
    const record = failedAttempts.get(clientIp);
    if (record && now < record.lockUntil) {
      const waitMinutes = Math.ceil((record.lockUntil - now) / 60000);
      return res.status(429).json({
        success: false,
        error: `Too many failed login attempts. Out of abundance of safety, access from your device has been temporarily suspended. Please try again in ${waitMinutes} minute(s).`
      });
    }

    try {
      const { pin, email } = req.body;
      
      // Strict parameter schema validation (prevents object injection or buffer attacks)
      if (typeof pin !== "string" || typeof email !== "string") {
        return res.status(400).json({ 
          success: false, 
          error: "Malicious payload detected: inputs must be valid text characters." 
        });
      }

      // Length restrictions (prevent resource exhaustion or buffer overflow vectors)
      if (pin.length > 20 || email.length > 100) {
        return res.status(400).json({ 
          success: false, 
          error: "Validation failed: credentials exceed normal length bounds." 
        });
      }

      const serverPin = process.env.ADMIN_PIN || "1707";
      const serverEmail = process.env.ADMIN_EMAIL || "hemapriyakanagala@gmail.com";

      const trimmedPin = pin.trim();
      const trimmedEmail = email.trim().toLowerCase();

      // Constant-time execution prevents character-by-character timing leak vector
      const isPinCorrect = timingSafeCompare(trimmedPin, serverPin);
      const isEmailCorrect = timingSafeCompare(trimmedEmail, serverEmail.toLowerCase());

      if (isPinCorrect && isEmailCorrect) {
        // Clear failed attempts on successful validation
        failedAttempts.delete(clientIp);
        return res.json({ success: true });
      } else {
        // Increment and track failed attempt
        const currentRecord = failedAttempts.get(clientIp) || { count: 0, lockUntil: 0 };
        currentRecord.count += 1;
        
        if (currentRecord.count >= 5) {
          // Lockout for 15 minutes
          currentRecord.lockUntil = now + 15 * 60 * 1000;
          failedAttempts.set(clientIp, currentRecord);
          return res.status(429).json({
            success: false,
            error: "Too many failed attempts. Secure lockout initiated for 15 minutes."
          });
        } else {
          failedAttempts.set(clientIp, currentRecord);
          const attemptsLeft = 5 - currentRecord.count;
          return res.status(401).json({ 
            success: false, 
            error: `Incorrect passcode or unregistered email. You have ${attemptsLeft} attempts remaining before secure lockout.` 
          });
        }
      }
    } catch (err) {
      // Direct unexpected errors to centralized Express error handler
      next(err);
    }
  });

  // Serve static assets/frontend
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static files from dist.");
  }

  // 6. GLOBAL CENTRALIZED EXPRESS ERROR HANDLER
  // Prevents node server crashes and avoids leaking internal stack traces or server paths.
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Internal Server Error:", err);
    res.status(500).json({
      success: false,
      error: "An unexpected internal server error occurred. Please try again later."
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running securely on http://localhost:${PORT}`);
  });
}

startServer();
