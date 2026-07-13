import React from "react";
import { Compass, Globe } from "lucide-react";

interface FooterProps {
  onNavigate: (hash: string) => void;
  isAdminAuthorized?: boolean;
}

export function Footer({ onNavigate, isAdminAuthorized: _isAdminAuthorized }: FooterProps) {
  return (
    <footer className="border-t border-warm-border bg-warm-soft/70 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-2">
            <button
              onClick={() => onNavigate("#")}
              className="flex items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-charcoal-deep"
              id="footer-logo-btn"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-charcoal-deep text-warm-cream">
                <Compass className="h-4.5 w-4.5" />
              </div>
              <span className="font-display text-base font-semibold tracking-tight text-charcoal-deep">
                Dev Opportunity Radar
              </span>
            </button>
            <p className="text-sm text-charcoal-medium font-sans leading-relaxed max-w-md">
              Helping developers discover grants, fellowships, hackathons, open-source programs, communities, and learning resources they otherwise might have missed. Curated entirely by hand, with absolute care.
            </p>
            <div className="pt-2 text-xs font-mono text-charcoal-light flex flex-wrap gap-x-4 gap-y-1">
              <span>Started May 29, 2026</span>
              <span>•</span>
              <span>New editions every Friday on DEV</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="text-xs font-mono tracking-wider text-charcoal-light uppercase font-semibold">Project Links</h3>
            <ul className="mt-4 space-y-2.5" role="list">
              <li>
                <button
                  onClick={() => onNavigate("#")}
                  className="text-sm text-charcoal-medium hover:text-charcoal-deep hover:underline transition-all text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("#start-here")}
                  className="text-sm text-charcoal-medium hover:text-charcoal-deep hover:underline transition-all text-left"
                >
                  Start Here
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("#opportunities")}
                  className="text-sm text-charcoal-medium hover:text-charcoal-deep hover:underline transition-all text-left"
                >
                  Opportunities
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("#editions")}
                  className="text-sm text-charcoal-medium hover:text-charcoal-deep hover:underline transition-all text-left"
                >
                  Weekly Editions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("#community-finds")}
                  className="text-sm text-charcoal-medium hover:text-charcoal-deep hover:underline transition-all text-left"
                >
                  Community Finds
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("#reader-updates")}
                  className="text-sm text-charcoal-medium hover:text-charcoal-deep hover:underline transition-all text-left"
                >
                  Reader Updates
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: About & Policies */}
          <div>
            <h3 className="text-xs font-mono tracking-wider text-charcoal-light uppercase font-semibold">About & Policies</h3>
            <ul className="mt-4 space-y-2.5" role="list">
              <li>
                <button
                  onClick={() => onNavigate("#about")}
                  className="text-sm text-charcoal-medium hover:text-charcoal-deep hover:underline transition-all text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("#philosophy")}
                  className="text-sm text-charcoal-medium hover:text-charcoal-deep hover:underline transition-all text-left"
                >
                  My Philosophy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("#faq")}
                  className="text-sm text-charcoal-medium hover:text-charcoal-deep hover:underline transition-all text-left"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("#accessibility")}
                  className="text-sm text-charcoal-medium hover:text-charcoal-deep hover:underline transition-all text-left"
                >
                  Accessibility
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("#privacy")}
                  className="text-sm text-charcoal-medium hover:text-charcoal-deep hover:underline transition-all text-left"
                >
                  Privacy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("#contact")}
                  className="text-sm text-charcoal-medium hover:text-charcoal-deep hover:underline transition-all text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider and External Profiles / Credit */}
        <div className="mt-12 pt-8 border-t border-warm-border/60 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <a
              href="https://dev.to/hemapriya_kanagala"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-charcoal-medium hover:text-charcoal-deep hover:underline flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              Follow on DEV
            </a>
            <span className="text-warm-border hidden sm:inline">|</span>
            <a
              href="https://github.com/hemapriya-kanagala/dev-opportunity-radar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-charcoal-medium hover:text-charcoal-deep hover:underline flex items-center gap-1"
            >
              GitHub Project
            </a>
            <span className="text-warm-border hidden sm:inline">|</span>
            <a
              href="https://www.linkedin.com/in/hemapriya-kanagala/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-charcoal-medium hover:text-charcoal-deep hover:underline"
            >
              LinkedIn 
            </a>
          </div>

          <div className="text-center sm:text-right">
            <p className="text-xs text-charcoal-medium font-sans">
              Made with ❤️ by <span className="font-semibold text-charcoal-deep">Hemapriya Kanagala</span>
            </p>
          </div>
        </div>

        {/* Small footer text */}
        <div className="mt-6 text-center">
          <p className="text-[10px] font-mono text-charcoal-light/60">
            © 2026 Dev Opportunity Radar. All Rights Reserved. Curated to help people discover opportunities they otherwise might have missed.
          </p>
        </div>
      </div>
    </footer>
  );
}
