import React, { useState, useEffect, useRef } from "react";
import { Compass, Search, Menu, X, ChevronDown } from "lucide-react";

interface HeaderProps {
  currentPath: string;
  onNavigate: (hash: string) => void;
  isAdminAuthorized?: boolean;
}

export function Header({ currentPath, onNavigate, isAdminAuthorized: _isAdminAuthorized }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menus on path changes or window resize
  useEffect(() => {
    setMobileMenuOpen(false);
    setNavDropdownOpen(false);
  }, [currentPath]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNavDropdownOpen(false);
      }
    }

    if (navDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navDropdownOpen]);

  const navItems = [
    { label: "Home", hash: "#" },
    { label: "Start Here", hash: "#start-here" },
    { label: "Opportunities", hash: "#opportunities" },
    { label: "Editions", hash: "#editions" },
  ];

  const communityItems = [
    { label: "Community Finds", hash: "#community-finds" },
    { label: "Reader Updates", hash: "#reader-updates" },
  ];

  const otherItems = [
    { label: "My Philosophy", hash: "#philosophy" },
    { label: "FAQ", hash: "#faq" },
    { label: "About", hash: "#about" },
  ];

  const isActive = (hash: string) => {
    if (hash === "#") {
      return currentPath === "" || currentPath === "home";
    }
    return currentPath === hash.replace("#", "");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-warm-border bg-warm-cream/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => onNavigate("#")}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-2 focus-visible:outline-charcoal-deep"
            id="logo-btn"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-charcoal-deep text-warm-cream transition-transform group-hover:scale-[1.02]">
              <Compass className="h-5 w-5 animate-pulse" style={{ animationDuration: "3s" }} />
              <div className="absolute inset-0 rounded-lg border border-charcoal-deep animate-ping opacity-15" style={{ animationDuration: "2s" }}></div>
            </div>
            <div>
              <span className="block font-display text-base font-semibold tracking-tight text-charcoal-deep">
                Dev Opportunity Radar
              </span>
              <span className="block font-mono text-[10px] text-charcoal-light">
                Curated by Hemapriya
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {/* Explore Radar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setNavDropdownOpen(!navDropdownOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 focus-visible:outline-charcoal-deep ${
                  navDropdownOpen
                    ? "bg-charcoal-deep text-warm-cream border-charcoal-deep shadow-sm"
                    : "bg-warm-soft border-warm-border text-charcoal-medium hover:text-charcoal-deep hover:bg-warm-soft"
                }`}
                aria-expanded={navDropdownOpen}
                aria-haspopup="true"
              >
                <span>Explore Radar</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${navDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {navDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-[540px] rounded-2xl border border-warm-border bg-warm-cream p-5 shadow-lg z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Section 1: Radar Directory */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono tracking-wider text-charcoal-light uppercase font-bold border-b border-warm-border pb-1">Radar Directory</p>
                      <div className="space-y-1">
                        {navItems.map((item) => {
                          const active = isActive(item.hash);
                          return (
                            <button
                              key={item.label}
                              onClick={() => {
                                onNavigate(item.hash);
                                setNavDropdownOpen(false);
                              }}
                              className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                                active
                                  ? "bg-charcoal-deep text-warm-cream font-medium"
                                  : "text-charcoal-medium hover:bg-warm-soft hover:text-charcoal-deep"
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 2: Community Hub */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono tracking-wider text-charcoal-light uppercase font-bold border-b border-warm-border pb-1">Community Hub</p>
                      <div className="space-y-1">
                        {communityItems.map((item) => {
                          const active = isActive(item.hash);
                          return (
                            <button
                              key={item.label}
                              onClick={() => {
                                onNavigate(item.hash);
                                setNavDropdownOpen(false);
                              }}
                              className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                                active
                                  ? "bg-charcoal-deep text-warm-cream font-medium"
                                  : "text-charcoal-medium hover:bg-warm-soft hover:text-charcoal-deep"
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 3: About & Info */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono tracking-wider text-charcoal-light uppercase font-bold border-b border-warm-border pb-1">About & Philosophy</p>
                      <div className="space-y-1">
                        {otherItems.map((item) => {
                          const active = isActive(item.hash);
                          return (
                            <button
                              key={item.label}
                              onClick={() => {
                                onNavigate(item.hash);
                                setNavDropdownOpen(false);
                              }}
                              className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                                active
                                  ? "bg-charcoal-deep text-warm-cream font-medium"
                                  : "text-charcoal-medium hover:bg-warm-soft hover:text-charcoal-deep"
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Search Button and Mobile Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("#search")}
              className={`p-2 rounded-lg border transition-all focus-visible:outline-charcoal-deep ${
                currentPath === "search"
                  ? "bg-charcoal-deep text-warm-cream border-charcoal-deep"
                  : "border-warm-border text-charcoal-medium hover:text-charcoal-deep hover:bg-warm-soft"
              }`}
              aria-label="Universal Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-warm-border text-charcoal-medium hover:text-charcoal-deep hover:bg-warm-soft focus-visible:outline-charcoal-deep"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-warm-border bg-warm-cream px-4 py-4 space-y-2 shadow-inner animate-in fade-in duration-200">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-mono tracking-wider text-charcoal-light uppercase">Explore</p>
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.hash)}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.hash) ? "bg-charcoal-deep text-warm-cream" : "text-charcoal-medium hover:bg-warm-soft hover:text-charcoal-deep"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-1 pt-2 border-t border-warm-border/40">
            <p className="px-3 text-[10px] font-mono tracking-wider text-charcoal-light uppercase">Community Hub</p>
            {communityItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.hash)}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.hash) ? "bg-charcoal-deep text-warm-cream" : "text-charcoal-medium hover:bg-warm-soft hover:text-charcoal-deep"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-1 pt-2 border-t border-warm-border/40">
            <p className="px-3 text-[10px] font-mono tracking-wider text-charcoal-light uppercase">About & Philosophy</p>
            {otherItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.hash)}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.hash) ? "bg-charcoal-deep text-warm-cream" : "text-charcoal-medium hover:bg-warm-soft hover:text-charcoal-deep"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
