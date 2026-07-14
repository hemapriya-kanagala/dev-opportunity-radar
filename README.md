# Dev Opportunity Radar

Dev Opportunity Radar is a highly polished, curated dashboard designed to help developers discover grants, hackathons, fellowships, and other technical or financial opportunities. The platform acts as a curated newsletter and resource directory, complete with rich filtering, community-driven submissions, and a secure administration area (Creator Console).

---

## Project Overview

Built as a modern full-stack web application, Dev Opportunity Radar bridges the gap between opportunities and developers. It features a responsive grid interface allowing users to explore opportunities by edition, category, or direct keyword search. It also features a "Community Finds" area where readers can recommend resources, and a private "Creator Console" where administrators can manage entries securely.

---

## Key Features

- **Categorized Directory**: Explore curated developer opportunities structured by categories (e.g., *Funding*, *Hackathons*, *Learning*, *AI*).
- **Edition-Based Archiving**: Browse through newsletter-style historical editions highlighting specific curated clusters.
- **Universal Search & Filtering**: Fast, responsive keyword searching across titles, descriptions, organizations, and tags, with dynamic tag-filtering.
- **Community Recommendations**: Allows readers to submit resource finds directly (persisted locally on the client's device as a fallback).
- **Secure Creator Console (Admin)**: Protected management dashboard accessible via administrative credentials.
- **Advanced Hardening & Protection**:
  - **Server-Authoritative Authentication**: Login verification is executed entirely on the server-side to prevent bypasses.
  - **Rate Limiting & Lockouts**: Automatically locks out IP addresses after five failed access attempts to mitigate brute-force attempts.
  - **Timing-Safe Credentials Matching**: Uses HMAC hashes combined with cryptographic constant-time comparison to prevent side-channel timing analysis.
  - **Strict Content Security Policy (CSP)**: Robust, defense-in-depth security headers, specifically configuring safe iframe nesting to support embeddings on platforms like **DEV.to** while blocking Clickjacking attacks on unauthorized domains.

---

## Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite 6](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/) (layout animations and dynamic component transitions)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend Framework**: [Express 4](https://expressjs.com/) (Node.js server acting as static host and API proxy)
- **Development Tools**: [tsx](https://github.com/privatenumber/tsx) (executes TypeScript backend server natively in development), [esbuild](https://esbuild.github.io/) (bundles/compiles the server file into high-performance CommonJS for production)

---

## Project Structure

```
.
├── server.ts              # Custom Express server (rate limiting, secure API, CSP, static file serving)
├── vite.config.ts         # Vite configuration & build setup
├── package.json           # Application dependencies and build scripts
├── metadata.json          # Platform metadata (permissions, app name, description)
├── tsconfig.json          # TypeScript configuration
├── src/
│   ├── main.tsx           # Client entry point
│   ├── App.tsx            # Primary application component & routing logic
│   ├── index.css          # Global Tailwind CSS imports & theme configurations
│   ├── data.ts            # Curated local dataset (Opportunities, FAQs, Editions, Categories)
│   ├── types.ts           # Shared TypeScript interfaces (Opportunity, Edition, CommunityFind)
│   └── components/        # Reusable user-interface components
│       ├── Header.tsx     # Responsive main navigation bar
│       ├── Footer.tsx     # Informational footer
│       └── Notification.tsx # Toast notification module
└── dist/                  # Compiled output (generated during build phase)
```

---

## Prerequisites

- **Node.js**: Version 18.x or later is recommended.
- **npm** (or yarn/pnpm package manager).

---

## Installation

1. Clone or download the repository to your environment.
2. Navigate to the project root and install dependencies:
   ```bash
   npm install
   ```

---

## Environment Variables

Sensitive credentials are kept server-side and should be defined in a `.env` file during development, or populated via environment variables in production. 

A `.env.example` file is included in the repository containing only descriptions and placeholders. **Do not commit actual secrets to the repository.**

- `ADMIN_PIN`: The secure passcode to access the Creator Console (server-only). Fallback value is `1707`.
- `ADMIN_EMAIL`: The secure registered email address authorized to log in. Fallback value is `hemapriyakanagala@gmail.com`.
- `APP_URL`: The fully qualified URL of your deployed application (used for references).
- `NODE_ENV`: Set to `"production"` in cloud deployments to optimize build parameters and activate production-grade static file serving.

---

## Running the Project Locally

To boot up the application in local development mode:
```bash
npm run dev
```
This script runs the custom Express server inside `server.ts` using `tsx`. It integrates the Vite middleware to serve the React source files, support live asset compilation, and proxy client-side calls to `/api/*` endpoints under a single port (`3000`).

---

## Building for Production

To compile both the frontend client and backend server for highly-optimized production deployment:
```bash
npm run build
```
This dual-stage build script:
1. Compiles the frontend assets via `vite build`, writing optimized static files inside `dist/`.
2. Packages the server-side `server.ts` code into a single, bundled, self-contained CommonJS file (`dist/server.cjs`) using `esbuild`. This bypasses module resolution overhead and enhances runtime start speeds in containerized environments.

To run the compiled production bundle locally:
```bash
npm start
```

---

## Deployment

The application is fully compatible with containerized hosting platforms such as **Google Cloud Run**. 
- It binds securely to port `3000` on host `0.0.0.0` (required for container ingress routing).
- In production (`NODE_ENV=production`), the custom Express backend serves compiled assets directly from the `dist/` directory, while protecting `/api/*` endpoints from external interception.

---

## Security Overview

The platform implements an absolute separation of concerns between public frontend resources and administrative administrative capabilities:

- **Server-Authoritative Authentication**: All authentication tasks are performed on the Express backend (`/api/verify-admin`). No secrets are ever exposed in Vite bundles, browser memory, local storage, cookies, network payloads, or client logs.
- **Timing-Safe Passcode Comparison**: Direct comparison of strings can leak match length or validity through character-by-character timing variations. The application routes passwords through HMAC SHA-256 digests and employs `crypto.timingSafeEqual` to verify keys in constant-time.
- **Brute-Force & DoS Safeguards**: 
  - Restricts payload parsing size strictly to `5kb` to prevent resource exhaustion attacks.
  - Automatically isolates and locks out IP addresses for 15 minutes after 5 consecutive incorrect credentials entries.
- **Security Headers & Clickjacking Prevention**:
  - Sets `X-Content-Type-Options: nosniff` and a clean `Referrer-Policy`.
  - Configures a strict `Content-Security-Policy` with `frame-ancestors` restricted exclusively to authorized environments. This allows embedding directly into **DEV.to** (via `https://dev.to` and `https://*.dev.to`) and **Google AI Studio** preview screens, but stops clickjacking attacks on arbitrary malicious sites.

---

## Configuration Notes

- **Port Mapping**: The application port is hardcoded to `3000`. Do not override this port, as the reverse proxy container routing relies on port `3000` exclusively.

---

## Known Limitations

- **Transient State Fallback**: Since no persistent external SQL database or cloud database integration (like Firestore) is currently mapped for community recommended items or reader story updates, user-generated submissions are saved in standard client-side `localStorage`. Consequently, submitted finds are only visible to the user who entered them and will be cleared if browser caches are wiped.

---

## Future Improvements

- **Durable Database Integration**: Add a Firebase Firestore or Cloud SQL database layer to persist reader-submitted "Community Finds" and curator-entered opportunities in a shared, multi-user database.
- **Session Auth Tokens**: Transition the simple validation state into temporary session-based tokens (such as secure, HTTP-only, SameSite cookies) to persist Creator Console state without client state flags.

---

## License

No license has been specified for this project. All rights reserved by the original author.
