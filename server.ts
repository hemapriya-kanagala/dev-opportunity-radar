import express from "express";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import { Firestore } from "@google-cloud/firestore";
import { createServer as createViteServer } from "vite";
import {
  OPPORTUNITIES as STATIC_OPPORTUNITIES,
  EDITIONS as STATIC_EDITIONS,
  STATISTICS as STATIC_STATISTICS
} from "./src/data";

// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Assert and validate administrative environment variables.
// In production, ADMIN_PIN and ADMIN_EMAIL are strictly mandatory and missing values will halt startup.
// In development, standard fallback credentials are used to ensure frictionless local setup.
const isProduction = process.env.NODE_ENV === "production";
let adminPin = "";
let adminEmail = "";

if (isProduction) {
  const pin = process.env.ADMIN_PIN;
  const email = process.env.ADMIN_EMAIL;

  if (!pin || !pin.trim()) {
    console.error("FATAL ERROR: ADMIN_PIN environment variable is missing or empty in production. Server shutting down.");
    process.exit(1);
  }
  if (!email || !email.trim()) {
    console.error("FATAL ERROR: ADMIN_EMAIL environment variable is missing or empty in production. Server shutting down.");
    process.exit(1);
  }

  adminPin = pin.trim();
  adminEmail = email.trim();
} else {
  adminPin = (process.env.ADMIN_PIN && process.env.ADMIN_PIN.trim()) ? process.env.ADMIN_PIN.trim() : "123456";
  adminEmail = (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.trim()) ? process.env.ADMIN_EMAIL.trim() : "curator@domain.com";

  if (!process.env.ADMIN_PIN || !process.env.ADMIN_PIN.trim() || !process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL.trim()) {
    console.warn("\n====================================================================================");
    console.warn("[WARNING] ADMIN_PIN and/or ADMIN_EMAIL environment variables are missing.");
    console.warn("Using development default fallback credentials:");
    console.warn(`  - Admin PIN: ${adminPin}`);
    console.warn(`  - Admin Email: ${adminEmail}`);
    console.warn("Please configure these in your environment variables for production security.");
    console.warn("====================================================================================\n");
  }
}

// SECURE CONSTANT-TIME STRINGS COMPARISON HELPER
function timingSafeCompare(input: string, secret: string): boolean {
  // Hash both inputs using a fixed-key HMac to fixed 32-byte buffers to avoid leaking length info.
  // This is immune to both timing attacks and length disclosure.
  const inputHash = crypto.createHmac("sha256", "dor-secure-salt-key-2026").update(input).digest();
  const secretHash = crypto.createHmac("sha256", "dor-secure-salt-key-2026").update(secret).digest();
  return crypto.timingSafeEqual(inputHash, secretHash);
}

// FIRESTORE DB LAYER WITH LAZY INITIALIZATION & ROBUST IN-MEMORY FALLBACK
let firestoreInstance: Firestore | null = null;
let firestoreInitializationError: any = null;

function getFirestore(): Firestore | null {
  if (firestoreInitializationError) {
    return null;
  }
  if (!firestoreInstance) {
    try {
      // In Google Cloud Run, it automatically picks up the project ID and ADC
      firestoreInstance = new Firestore();
      console.log("[Firestore] Client initialized successfully.");
    } catch (err) {
      console.warn("[Firestore] Failed to initialize Firestore. Using in-memory fallback.", err);
      firestoreInitializationError = err;
      firestoreInstance = null;
    }
  }
  return firestoreInstance;
}

// Graceful error logging helper to avoid scary console traces when API is unconfigured
function logFirestoreError(context: string, err: any) {
  const errMsg = err?.message || String(err);
  if (errMsg.includes("API has not been used") || errMsg.includes("disabled") || errMsg.includes("PERMISSION_DENIED")) {
    console.warn(`[Firestore Fallback] ${context}: Cloud Firestore API is not enabled/configured yet. Falling back to robust in-memory database.`);
  } else {
    console.error(`[Firestore Fallback] ${context} failed:`, err);
  }
}

// In-Memory storage cache acting as local fallback when Firestore is offline/unconfigured
let memOpportunities = [...STATIC_OPPORTUNITIES];
let memEditions = [...STATIC_EDITIONS];
let memStats = { ...STATIC_STATISTICS };

async function fetchOpportunities() {
  const db = getFirestore();
  if (!db) return memOpportunities;

  try {
    const snapshot = await db.collection("opportunities").get();
    if (snapshot.empty) {
      console.log("[Firestore] Seeding opportunities collection...");
      const batch = db.batch();
      for (const opp of STATIC_OPPORTUNITIES) {
        const docRef = db.collection("opportunities").doc(opp.id);
        batch.set(docRef, opp);
      }
      await batch.commit();
      return STATIC_OPPORTUNITIES;
    } else {
      const opps: any[] = [];
      snapshot.forEach(doc => {
        opps.push(doc.data());
      });
      return opps;
    }
  } catch (err) {
    logFirestoreError("Fetching opportunities", err);
    return memOpportunities;
  }
}

async function fetchEditions() {
  const db = getFirestore();
  if (!db) return memEditions;

  try {
    const snapshot = await db.collection("editions").get();
    if (snapshot.empty) {
      console.log("[Firestore] Seeding editions collection...");
      const batch = db.batch();
      for (const ed of STATIC_EDITIONS) {
        const docRef = db.collection("editions").doc(String(ed.number));
        batch.set(docRef, ed);
      }
      await batch.commit();
      return STATIC_EDITIONS;
    } else {
      const eds: any[] = [];
      snapshot.forEach(doc => {
        eds.push(doc.data());
      });
      return eds;
    }
  } catch (err) {
    logFirestoreError("Fetching editions", err);
    return memEditions;
  }
}

async function fetchStats() {
  const db = getFirestore();
  if (!db) return memStats;

  try {
    const docRef = db.collection("statistics").doc("global");
    const doc = await docRef.get();
    if (!doc.exists) {
      console.log("[Firestore] Seeding statistics document...");
      await docRef.set(STATIC_STATISTICS);
      return STATIC_STATISTICS;
    } else {
      return doc.data();
    }
  } catch (err) {
    logFirestoreError("Fetching statistics", err);
    return memStats;
  }
}

async function saveOpportunity(opp: any) {
  const index = memOpportunities.findIndex(o => o.id === opp.id);
  if (index >= 0) {
    memOpportunities[index] = opp;
  } else {
    memOpportunities.unshift(opp);
  }

  const db = getFirestore();
  if (db) {
    try {
      await db.collection("opportunities").doc(opp.id).set(opp);
    } catch (err) {
      console.error("[Firestore] Error saving opportunity to Firestore:", err);
    }
  }
}

async function deleteOpportunity(id: string) {
  memOpportunities = memOpportunities.filter(o => o.id !== id);

  const db = getFirestore();
  if (db) {
    try {
      await db.collection("opportunities").doc(id).delete();
    } catch (err) {
      console.error("[Firestore] Error deleting opportunity from Firestore:", err);
    }
  }
}

async function saveEdition(ed: any) {
  const index = memEditions.findIndex(e => e.number === ed.number);
  if (index >= 0) {
    memEditions[index] = ed;
  } else {
    memEditions.unshift(ed);
  }

  const db = getFirestore();
  if (db) {
    try {
      await db.collection("editions").doc(String(ed.number)).set(ed);
    } catch (err) {
      console.error("[Firestore] Error saving edition to Firestore:", err);
    }
  }
}

async function deleteEdition(number: number) {
  memEditions = memEditions.filter(e => e.number !== number);

  const db = getFirestore();
  if (db) {
    try {
      await db.collection("editions").doc(String(number)).delete();
    } catch (err) {
      console.error("[Firestore] Error deleting edition from Firestore:", err);
    }
  }
}

async function saveStats(stats: any) {
  memStats = stats;

  const db = getFirestore();
  if (db) {
    try {
      await db.collection("statistics").doc("global").set(stats);
    } catch (err) {
      console.error("[Firestore] Error saving statistics to Firestore:", err);
    }
  }
}

async function resetAllData() {
  memOpportunities = [...STATIC_OPPORTUNITIES];
  memEditions = [...STATIC_EDITIONS];
  memStats = { ...STATIC_STATISTICS };

  const db = getFirestore();
  if (db) {
    try {
      const oppSnap = await db.collection("opportunities").get();
      const oppBatch = db.batch();
      oppSnap.forEach(doc => {
        oppBatch.delete(doc.ref);
      });
      for (const opp of STATIC_OPPORTUNITIES) {
        oppBatch.set(db.collection("opportunities").doc(opp.id), opp);
      }
      await oppBatch.commit();

      const edSnap = await db.collection("editions").get();
      const edBatch = db.batch();
      edSnap.forEach(doc => {
        edBatch.delete(doc.ref);
      });
      for (const ed of STATIC_EDITIONS) {
        edBatch.set(db.collection("editions").doc(String(ed.number)), ed);
      }
      await edBatch.commit();

      await db.collection("statistics").doc("global").set(STATIC_STATISTICS);
      console.log("[Firestore] Seeding and reset complete.");
    } catch (err) {
      console.error("[Firestore] Error resetting Firestore database:", err);
    }
  }
}

// STRINGS VALIDATORS AND SANITIZERS
function validateOpportunity(body: any): boolean {
  if (!body || typeof body !== "object") return false;
  const { id, title, organization, description, category, tags } = body;
  if (typeof id !== "string" || id.length === 0 || id.length > 100) return false;
  if (typeof title !== "string" || title.length === 0 || title.length > 200) return false;
  if (typeof organization !== "string" || organization.length === 0 || organization.length > 200) return false;
  if (typeof description !== "string" || description.length === 0 || description.length > 10000) return false;
  if (typeof category !== "string" || category.length === 0 || category.length > 100) return false;
  if (!Array.isArray(tags)) return false;
  return true;
}

function validateEdition(body: any): boolean {
  if (!body || typeof body !== "object") return false;
  const { number, date, introduction } = body;
  if (typeof number !== "number" || number < 0) return false;
  if (typeof date !== "string" || date.length === 0 || date.length > 100) return false;
  if (typeof introduction !== "string" || introduction.length === 0 || introduction.length > 10000) return false;
  return true;
}

function validateStats(body: any): boolean {
  if (!body || typeof body !== "object") return false;
  const { editionsCount, opportunitiesCount, communityFindsCount, contributorsCount } = body;
  if (typeof editionsCount !== "number" || editionsCount < 0) return false;
  if (typeof opportunitiesCount !== "number" || opportunitiesCount < 0) return false;
  if (typeof communityFindsCount !== "number" || communityFindsCount < 0) return false;
  if (typeof contributorsCount !== "number" || contributorsCount < 0) return false;
  return true;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. TRUST PROXY CONFIGURATION: Properly handle client IP extraction from behind Cloud Run/Nginx proxies
  app.set("trust proxy", 1);

  // 2. INFO DISCLOSURE MITIGATION: Disable express signature header
  app.disable("x-powered-by");

  // 3. PAYLOAD LIMIT DEFENSE: Restrict incoming JSON body payload size (protect from oversized payload attacks)
  app.use(express.json({ limit: "100kb" }));

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

  // SECURE SERVER-SIDE ROLE MIDDLEWARE (AUTHENTICATION & AUTHORIZATION GUARD)
  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const clientPin = req.headers["x-admin-pin"];
      const clientEmail = req.headers["x-admin-email"];

      if (typeof clientPin !== "string" || typeof clientEmail !== "string") {
        return res.status(401).json({
          success: false,
          error: "Unauthorized: Missing administrative credentials."
        });
      }

      const serverPin = adminPin;
      const serverEmail = adminEmail;

      const isPinCorrect = timingSafeCompare(clientPin.trim(), serverPin);
      const isEmailCorrect = timingSafeCompare(clientEmail.trim().toLowerCase(), serverEmail.toLowerCase());

      if (isPinCorrect && isEmailCorrect) {
        return next();
      } else {
        return res.status(401).json({
          success: false,
          error: "Unauthorized: Invalid administrative credentials."
        });
      }
    } catch (err) {
      next(err);
    }
  }

  // PUBLIC READ ENDPOINTS (READ-ONLY FOR EVERYONE)
  app.get("/api/opportunities", async (_req, res, next) => {
    try {
      const opps = await fetchOpportunities();
      res.json(opps);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/editions", async (_req, res, next) => {
    try {
      const eds = await fetchEditions();
      res.json(eds);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/statistics", async (_req, res, next) => {
    try {
      const stats = await fetchStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  });

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

      const serverPin = adminPin;
      const serverEmail = adminEmail;

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

  // SECURE WRITE ENDPOINTS (AUTHENTICATED & SANITIZED ADMIN CRUD ONLY)
  app.post("/api/opportunities", requireAdmin, async (req, res, next) => {
    try {
      if (!validateOpportunity(req.body)) {
        return res.status(400).json({ success: false, error: "Invalid opportunity request payload." });
      }
      await saveOpportunity(req.body);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/opportunities/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = req.params.id;
      if (typeof id !== "string" || id.length === 0 || id.length > 100) {
        return res.status(400).json({ success: false, error: "Invalid target opportunity ID." });
      }
      await deleteOpportunity(id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/editions", requireAdmin, async (req, res, next) => {
    try {
      if (!validateEdition(req.body)) {
        return res.status(400).json({ success: false, error: "Invalid edition request payload." });
      }
      await saveEdition(req.body);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/editions/:number", requireAdmin, async (req, res, next) => {
    try {
      const num = parseInt(req.params.number, 10);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({ success: false, error: "Invalid edition number." });
      }
      await deleteEdition(num);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/statistics", requireAdmin, async (req, res, next) => {
    try {
      if (!validateStats(req.body)) {
        return res.status(400).json({ success: false, error: "Invalid statistics request payload." });
      }
      await saveStats(req.body);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/reset", requireAdmin, async (_req, res, next) => {
    try {
      await resetAllData();
      res.json({ success: true });
    } catch (err) {
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
