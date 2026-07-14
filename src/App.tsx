import React, { useState, useEffect, useMemo } from "react";
import {
  Compass, Search, X, ChevronDown, Award, CircleDollarSign, BookOpen, Sparkles,
  Users, Calendar, Briefcase, Clock, Heart, ExternalLink,
  Bookmark, ChevronRight, AlertCircle, Check, ArrowRight,
  ArrowLeft, Shield, Mail, Smile, BookOpenCheck, HelpCircle, GraduationCap,
  Rocket, Microscope, Terminal, Handshake, Sprout, Gift, History, Globe, PenTool, Pin,
  Linkedin, MessageSquare, RefreshCw, Sliders, Lock
} from "lucide-react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Toast } from "./components/Notification";
import { useTheme } from "./hooks/useTheme";
import {
  OPPORTUNITIES as STATIC_OPPORTUNITIES, EDITIONS as STATIC_EDITIONS, COMMUNITY_FINDS, FAQS, PHILOSOPHY, STATISTICS, CATEGORIES, FAQ_TLDR, FAQ_CLOSING, ABOUT_CONTENT, CONTACT_CONTENT
} from "./data";
import { Opportunity, Edition, CommunityFind } from "./types";

function renderFormattedText(text: string): React.ReactNode {
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {boldParts.map((part, i) => {
        const isBold = part.startsWith("**") && part.endsWith("**");
        const rawContent = isBold ? part.slice(2, -2) : part;

        // Parse markdown links [Label](URL) inside
        const linkParts = rawContent.split(/(\[[^\]]+\]\([^)]+\))/g);
        const processedParts = linkParts.map((linkPart, j) => {
          if (linkPart.startsWith("[") && linkPart.includes("](")) {
            const label = linkPart.slice(1, linkPart.indexOf("]("));
            const url = linkPart.slice(linkPart.indexOf("](") + 2, -1);
            return (
              <a
                key={j}
                href={url}
                target={url.startsWith("mailto:") ? undefined : "_blank"}
                rel={url.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="font-semibold text-charcoal-deep underline hover:text-charcoal-light transition-colors"
              >
                {label}
              </a>
            );
          }
          
          // Parse italics inside non-link text
          const italicParts = linkPart.split(/(\*[^*]+\*|_[^_]+_)/g);
          return (
            <React.Fragment key={j}>
              {italicParts.map((itPart, k) => {
                if ((itPart.startsWith("*") && itPart.endsWith("*")) || (itPart.startsWith("_") && itPart.endsWith("_"))) {
                  return <em key={k} className="italic text-charcoal-deep">{itPart.slice(1, -1)}</em>;
                }
                return itPart;
              })}
            </React.Fragment>
          );
        });

        if (isBold) {
          return <strong key={i} className="font-semibold text-charcoal-deep">{processedParts}</strong>;
        }
        return <React.Fragment key={i}>{processedParts}</React.Fragment>;
      })}
    </>
  );
}

function getOpportunityDeadlineStatus(opp: Opportunity): "Closed" | "Rolling/Ongoing" | "Upcoming" {
  const statusLower = (opp.status || "").toLowerCase();
  const deadlineLower = (opp.deadline || "").toLowerCase();

  if (statusLower.includes("closed") || deadlineLower.includes("closed")) {
    return "Closed";
  }
  
  if (
    statusLower.includes("ongoing") ||
    statusLower.includes("rolling") ||
    statusLower.includes("free") ||
    deadlineLower.includes("ongoing") ||
    deadlineLower.includes("rolling")
  ) {
    return "Rolling/Ongoing";
  }

  // Parse deadline date to determine if it is in the past
  const cleanStr = deadlineLower.split("(")[0].trim();
  if (cleanStr && cleanStr !== "closed" && cleanStr !== "ongoing" && cleanStr !== "rolling") {
    try {
      const timestamp = Date.parse(cleanStr);
      if (!isNaN(timestamp)) {
        // July 12, 2026 is today
        const todayTimestamp = Date.parse("2026-07-12");
        if (timestamp < todayTimestamp) {
          return "Closed";
        }
      }
    } catch {
      // ignore
    }
  }

  return "Upcoming";
}

export default function App() {
  // Light/dark theme (follows the OS until the reader picks one)
  const { theme, toggleTheme } = useTheme();

  // Navigation State (using URL Hash)
  const [hash, setHash] = useState(window.location.hash || "#");
  
  // Use a ref to store current history to prevent stale closure in event listener
  const navHistoryRef = React.useRef<string[]>([window.location.hash || "#"]);

  // Core App States (Favorites/Bookmarks and user-submitted data)
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("dor_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [userFinds] = useState<CommunityFind[]>(() => {
    try {
      const saved = localStorage.getItem("dor_user_finds");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic array lists for site management (backed by localStorage with static data as fallback)
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    try {
      const saved = localStorage.getItem("dor_opportunities");
      return saved ? JSON.parse(saved) : STATIC_OPPORTUNITIES;
    } catch {
      return STATIC_OPPORTUNITIES;
    }
  });

  const [editions, setEditions] = useState<Edition[]>(() => {
    try {
      const saved = localStorage.getItem("dor_editions");
      return saved ? JSON.parse(saved) : STATIC_EDITIONS;
    } catch {
      return STATIC_EDITIONS;
    }
  });

  // Creator authentication states
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("dor_admin_authorized") === "true";
    } catch {
      return false;
    }
  });
  const [enteredPin, setEnteredPin] = useState("");
  const [enteredEmail, setEnteredEmail] = useState("");
  const [pinError, setPinError] = useState("");

  // Double Safety Curation Safeguard states
  const [isSafeguardActive, setIsSafeguardActive] = useState<boolean>(true);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete-opp" | "delete-ed" | "reset" | "save-opp" | "save-ed" | "save-stats";
    payload: any;
    message: string;
  } | null>(null);
  const [safetyInput, setSafetyInput] = useState("");
  const [safetyError, setSafetyError] = useState("");

  // Creator Console states
  const [consoleTab, setConsoleTab] = useState<"dashboard" | "opportunities" | "editions">("dashboard");
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [editingEd, setEditingEd] = useState<Edition | null>(null);

  // Form states for Opportunity
  const [oppTitle, setOppTitle] = useState("");
  const [oppOrg, setOppOrg] = useState("");
  const [oppCategoryField, setOppCategoryField] = useState("Funding & Grants");
  const [oppDesc, setOppDesc] = useState("");
  const [oppWhyFeatured, setOppWhyFeatured] = useState("");
  const [oppDeadline, setOppDeadline] = useState("");
  const [oppStatus, setOppStatus] = useState("Open");
  const [oppLink, setOppLink] = useState("");
  const [oppSectionLink, setOppSectionLink] = useState("");
  const [oppTags, setOppTags] = useState("");
  const [oppWhoItsFor, setOppWhoItsFor] = useState("");
  const [oppSharedBy, setOppSharedBy] = useState("");
  const [oppFeaturedInEd, setOppFeaturedInEd] = useState<number | "">("");

  // Form states for Edition
  const [edNumber, setEdNumber] = useState<number | "">("");
  const [edDate, setEdDate] = useState("");
  const [edIntroduction, setEdIntroduction] = useState("");
  const [edHighlights, setEdHighlights] = useState("");
  const [edClosing, setEdClosing] = useState("");
  const [edDevToLink, setEdDevToLink] = useState("");

  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem("dor_statistics");
      return saved ? JSON.parse(saved) : {
        editionsCount: STATISTICS.editionsCount,
        opportunitiesCount: STATISTICS.opportunitiesCount,
        communityFindsCount: STATISTICS.communityFindsCount,
        contributorsCount: STATISTICS.contributorsCount
      };
    } catch {
      return {
        editionsCount: STATISTICS.editionsCount,
        opportunitiesCount: STATISTICS.opportunitiesCount,
        communityFindsCount: STATISTICS.communityFindsCount,
        contributorsCount: STATISTICS.contributorsCount
      };
    }
  });

  const latestEdition = useMemo(() => {
    if (editions.length === 0) return null;
    return [...editions].sort((a, b) => b.number - a.number)[0];
  }, [editions]);

  const startEditOpp = (opp: Opportunity) => {
    setEditingOpp(opp);
    setOppTitle(opp.title);
    setOppOrg(opp.organization);
    setOppCategoryField(opp.category);
    setOppDesc(opp.description);
    setOppWhyFeatured(opp.whyFeatured);
    setOppDeadline(opp.deadline);
    setOppStatus(opp.status || "Open");
    setOppLink(opp.officialWebsite || "");
    setOppSectionLink(opp.editionSectionLink || "");
    setOppTags(opp.tags.join(", "));
    setOppWhoItsFor(opp.whoItsFor || "");
    setOppSharedBy(opp.sharedBy || "");
    setOppFeaturedInEd(opp.featuredInEdition || "");
    setConsoleTab("opportunities");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const resetOppForm = () => {
    setEditingOpp(null);
    setOppTitle("");
    setOppOrg("");
    setOppCategoryField("Funding & Grants");
    setOppDesc("");
    setOppWhyFeatured("");
    setOppDeadline("");
    setOppStatus("Open");
    setOppLink("");
    setOppSectionLink("");
    setOppTags("");
    setOppWhoItsFor("");
    setOppSharedBy("");
    setOppFeaturedInEd("");
  };

  const startEditEd = (ed: Edition) => {
    setEditingEd(ed);
    setEdNumber(ed.number);
    setEdDate(ed.publishedDate || "");
    setEdIntroduction(ed.introduction || "");
    setEdHighlights(ed.highlights.join("\n"));
    setEdClosing(ed.closing || "");
    setEdDevToLink(ed.devToLink || "");
    setConsoleTab("editions");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const resetEdForm = () => {
    setEditingEd(null);
    setEdNumber("");
    setEdDate("");
    setEdIntroduction("");
    setEdHighlights("");
    setEdClosing("");
    setEdDevToLink("");
  };

  // UI Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  // FAQ Page States
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({});
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({ "daniel-nwaneri": true });
  const [expandedEditions, setExpandedEditions] = useState<Record<number, boolean>>({});

  // Listen for hash changes to perform simulated routing
  useEffect(() => {
    const handleHashChange = () => {
      const nextHash = window.location.hash || "#";
      
      // If it's a category specific route, intercept and redirect to opportunities with category selected
      if (nextHash.startsWith("#category/")) {
        const catId = decodeURIComponent(nextHash.replace("#category/", ""));
        const matchedCat = CATEGORIES.find((c) => c.id === catId);
        if (matchedCat) {
          setOppCategory(matchedCat.id);
          setOppPage(1);
          setOppSearch("");
          window.location.hash = "#opportunities";
          return;
        }
      }

      const currentStack = navHistoryRef.current;
      
      let newStack: string[];
      
      if (currentStack[currentStack.length - 1] === nextHash) {
        newStack = currentStack;
      } else if (currentStack.length > 1 && currentStack[currentStack.length - 2] === nextHash) {
        newStack = currentStack.slice(0, -1);
      } else {
        newStack = [...currentStack, nextHash];
      }
      
      navHistoryRef.current = newStack;
      setHash(nextHash);
      
      // Accessibility: Scroll to top on navigation to make user focus logical
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Sync Bookmarks to LocalStorage
  useEffect(() => {
    localStorage.setItem("dor_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Sync User Community Finds to LocalStorage
  useEffect(() => {
    localStorage.setItem("dor_user_finds", JSON.stringify(userFinds));
  }, [userFinds]);

  // Sync core opportunities to LocalStorage
  useEffect(() => {
    localStorage.setItem("dor_opportunities", JSON.stringify(opportunities));
  }, [opportunities]);

  // Sync core editions to LocalStorage
  useEffect(() => {
    localStorage.setItem("dor_editions", JSON.stringify(editions));
  }, [editions]);

  // Sync core statistics to LocalStorage
  useEffect(() => {
    localStorage.setItem("dor_statistics", JSON.stringify(stats));
  }, [stats]);

  // Security Feature: Inactivity Auto-Lock (Locks session after 10 minutes of complete inactivity)
  useEffect(() => {
    if (!isAdminAuthorized) return;

    let timeoutId: any;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      // 10 minutes auto lock
      timeoutId = setTimeout(() => {
        setIsAdminAuthorized(false);
        try {
          sessionStorage.removeItem("dor_admin_authorized");
        } catch {}
        showToast("Curation session locked due to inactivity.", "info");
      }, 10 * 60 * 1000);
    };

    // Listen to user activity to refresh session timer
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimeout);
    });

    resetTimeout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [isAdminAuthorized]);

  // Route Parser
  const route = useMemo(() => {
    const currentHash = hash || "#";
    if (currentHash === "#" || currentHash === "#home" || currentHash === "") {
      return { view: "home" };
    }

    if (currentHash.startsWith("#opportunity/")) {
      const id = currentHash.replace("#opportunity/", "");
      return { view: "opportunity", id };
    }

    if (currentHash.startsWith("#edition/")) {
      const num = parseInt(currentHash.replace("#edition/", ""), 10);
      return { view: "edition", number: num };
    }

    if (currentHash.startsWith("#category/")) {
      const categoryId = currentHash.replace("#category/", "");
      return { view: "category", categoryId };
    }

    const path = currentHash.replace("#", "");
    return { view: path };
  }, [hash]);

  // Navigate utility
  const navigateTo = (newHash: string) => {
    window.location.hash = newHash;
  };

  const goBack = (fallback: string) => {
    const currentStack = navHistoryRef.current;
    if (currentStack.length > 1) {
      const previous = currentStack[currentStack.length - 2];
      navigateTo(previous);
    } else {
      navigateTo(fallback);
    }
  };

  // Toast helper
  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message, type });
  };

  // Double safety curation actions
  const executeSafeAction = (type: string, payload: any) => {
    switch (type) {
      case "save-opp": {
        const { updatedOpp, editingOppId, oppTitle } = payload;
        if (editingOppId) {
          setOpportunities((prev) =>
            prev.map((o) => (o.id === editingOppId ? updatedOpp : o))
          );
          showToast(`Successfully updated opportunity "${oppTitle}"!`, "success");
        } else {
          setOpportunities((prev) => [updatedOpp, ...prev]);
          showToast(`Successfully added new opportunity "${oppTitle}"!`, "success");
        }
        resetOppForm();
        break;
      }
      case "save-ed": {
        const { updatedEd, editingEdNumber, edNumber } = payload;
        if (editingEdNumber !== undefined && editingEdNumber !== null && editingEdNumber !== "") {
          setEditions((prev) =>
            prev.map((ed) => (ed.number === editingEdNumber ? updatedEd : ed))
          );
          showToast(`Successfully updated Edition #${edNumber}!`, "success");
        } else {
          setEditions((prev) => [updatedEd, ...prev]);
          showToast(`Successfully published Edition #${edNumber}!`, "success");
        }
        resetEdForm();
        break;
      }
      case "delete-opp": {
        const { oppId, oppTitle } = payload;
        setOpportunities((prev) => prev.filter((o) => o.id !== oppId));
        showToast(`Deleted opportunity "${oppTitle}"`, "info");
        break;
      }
      case "delete-ed": {
        const { edNumber } = payload;
        setEditions((prev) => prev.filter((e) => e.number !== edNumber));
        showToast(`Deleted Edition #${edNumber}`, "info");
        break;
      }
      case "reset": {
        localStorage.removeItem("dor_opportunities");
        localStorage.removeItem("dor_editions");
        localStorage.removeItem("dor_statistics");
        setOpportunities(STATIC_OPPORTUNITIES);
        setEditions(STATIC_EDITIONS);
        setStats({
          editionsCount: STATISTICS.editionsCount,
          opportunitiesCount: STATISTICS.opportunitiesCount,
          communityFindsCount: STATISTICS.communityFindsCount,
          contributorsCount: STATISTICS.contributorsCount
        });
        showToast("All data successfully restored to factory defaults!", "success");
        break;
      }
      case "save-stats": {
        setStats(payload);
        showToast("Platform statistics successfully updated!", "success");
        break;
      }
    }
  };

  const handleRequestAction = (
    type: "delete-opp" | "delete-ed" | "reset" | "save-opp" | "save-ed" | "save-stats",
    payload: any,
    message: string,
    directExecution: () => void
  ) => {
    if (!isSafeguardActive) {
      directExecution();
    } else {
      setConfirmAction({ type, payload, message });
      setSafetyInput("");
      setSafetyError("");
    }
  };

  // Toggle bookmark function
  const toggleBookmark = (id: string, name: string) => {
    if (bookmarks.includes(id)) {
      setBookmarks((prev) => prev.filter((bId) => bId !== id));
      showToast(`Removed "${name}" from your bookmarks.`, "info");
    } else {
      setBookmarks((prev) => [...prev, id]);
      showToast(`Saved "${name}" to your bookmarks!`, "success");
    }
  };

  // Dynamic lists merging local user submissions with initial dataset
  const allCommunityFinds = useMemo(() => {
    return [...COMMUNITY_FINDS, ...userFinds];
  }, [userFinds]);

  const communityOpportunities = useMemo(() => {
    return opportunities.filter(
      (opp) => opp.sharedBy || opp.tags.includes("Community Find")
    );
  }, [opportunities]);

  // Get Category Icon Element
  const getCategoryIcon = (catId: string, className = "w-5 h-5") => {
    switch (catId) {
      case "Funding & Grants": return <CircleDollarSign className={className} />;
      case "Fellowships": return <GraduationCap className={className} />;
      case "Startup & Founder Programs": return <Rocket className={className} />;
      case "Research Programs": return <Microscope className={className} />;
      case "Hackathons & Challenges": return <Terminal className={className} />;
      case "Communities": return <Users className={className} />;
      case "Open Source": return <Heart className={className} />;
      case "Ambassador Programs": return <Sprout className={className} />;
      case "Mentorship": return <Handshake className={className} />;
      case "Career & Professional Development": return <Briefcase className={className} />;
      case "Volunteer & Internships": return <Smile className={className} />;
      case "Learning Resources": return <BookOpen className={className} />;
      default: return <Compass className={className} />;
    }
  };

  // Get Philosophy Icon Element
  const getPhilosophyIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case "Clock": return <Clock className={className} />;
      case "Compass": return <Compass className={className} />;
      case "Search": return <Search className={className} />;
      case "Shield": return <Shield className={className} />;
      case "Award": return <Award className={className} />;
      case "Users": return <Users className={className} />;
      case "Smile": return <Smile className={className} />;
      case "Sparkles": return <Sparkles className={className} />;
      case "Mail": return <Mail className={className} />;
      case "Heart": return <Heart className={className} />;
      default: return <Compass className={className} />;
    }
  };

  // Filter & Search parameters for the Opportunities page
  const [oppSearch, setOppSearch] = useState("");
  const [oppCategory, setOppCategory] = useState("All");
  const [oppDeadlineFilter, setOppDeadlineFilter] = useState("All"); // All, Upcoming, Rolling/Ongoing, Closed
  const [oppSort, setOppSort] = useState("added-desc"); // added-desc, added-asc, deadline-asc, title-asc
  const [oppPage, setOppPage] = useState(1);
  const [oppShowBookmarksOnly, setOppShowBookmarksOnly] = useState(false);
  const [oppExcludeLearning, setOppExcludeLearning] = useState(false);

  // Universal search page parameters
  const [universalSearchQuery, setUniversalSearchQuery] = useState("");

  const itemsPerPage = 8;

  // Filtered Opportunities calculation
  const filteredOpportunities = useMemo(() => {
    const parseDeadlineDate = (deadlineStr: string, statusStr: string): number => {
      const cleanStr = (deadlineStr || "").split("(")[0].trim().toLowerCase();
      const statusLower = (statusStr || "").toLowerCase();
      
      if (statusLower.includes("closed") || cleanStr.includes("closed")) {
        return Infinity; // closed at the bottom
      }
      if (
        cleanStr === "ongoing" || 
        cleanStr === "rolling" || 
        statusLower.includes("ongoing") || 
        statusLower.includes("rolling") || 
        statusLower.includes("free")
      ) {
        return Infinity - 1; // rolling/ongoing above closed but below specific future dates
      }
      try {
        const timestamp = Date.parse(cleanStr);
        if (!isNaN(timestamp)) {
          return timestamp;
        }
      } catch {
        // Ignore
      }
      return Infinity - 2; // general open/unknown below specific dates
    };

    return opportunities.filter((opp) => {
      // Bookmarks filter
      if (oppShowBookmarksOnly && !bookmarks.includes(opp.id)) {
        return false;
      }

      // Exclude Learning Resources
      if (oppExcludeLearning && opp.category === "Learning Resources") {
        return false;
      }

      // Search Query
      const query = oppSearch.toLowerCase();
      const matchesSearch =
        opp.title.toLowerCase().includes(query) ||
        opp.organization.toLowerCase().includes(query) ||
        opp.description.toLowerCase().includes(query) ||
        opp.whyFeatured.toLowerCase().includes(query) ||
        opp.tags.some((t) => t.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Category filter
      if (oppCategory !== "All" && opp.category !== oppCategory) {
        return false;
      }

      // Deadline filter
      const deadlineStatus = getOpportunityDeadlineStatus(opp);
      if (oppDeadlineFilter !== "All") {
        if (oppDeadlineFilter === "Upcoming" && deadlineStatus !== "Upcoming") {
          return false;
        }
        if (oppDeadlineFilter === "Rolling/Ongoing" && deadlineStatus !== "Rolling/Ongoing") {
          return false;
        }
        if (oppDeadlineFilter === "Closed" && deadlineStatus !== "Closed") {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sorting options
      if (oppSort === "added-desc") {
        return b.dateAdded.localeCompare(a.dateAdded);
      } else if (oppSort === "added-asc") {
        return a.dateAdded.localeCompare(b.dateAdded);
      } else if (oppSort === "title-asc") {
        return a.title.localeCompare(b.title);
      } else if (oppSort === "org-asc") {
        return a.organization.localeCompare(b.organization);
      } else if (oppSort === "deadline-asc") {
        const dateA = parseDeadlineDate(a.deadline, a.status || "");
        const dateB = parseDeadlineDate(b.deadline, b.status || "");
        
        if (dateA !== dateB) {
          return dateA - dateB;
        }
        // If they are equal, sort alphabetically by title
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [oppSearch, oppCategory, oppDeadlineFilter, oppSort, oppShowBookmarksOnly, oppExcludeLearning, bookmarks, opportunities]);

  // Paginated Opportunities
  const paginatedOpportunities = useMemo(() => {
    const start = (oppPage - 1) * itemsPerPage;
    return filteredOpportunities.slice(start, start + itemsPerPage);
  }, [filteredOpportunities, oppPage]);

  const totalPages = Math.max(1, Math.ceil(filteredOpportunities.length / itemsPerPage));

  // Reset pagination on filter changes
  useEffect(() => {
    setOppPage(1);
  }, [oppSearch, oppCategory, oppDeadlineFilter, oppSort, oppShowBookmarksOnly]);

  // Universal Search result calculation
  const universalSearchResults = useMemo(() => {
    if (!universalSearchQuery.trim()) {
      return { opportunities: [], editions: [], finds: [] };
    }
    const q = universalSearchQuery.toLowerCase();

    const opportunitiesList = opportunities.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.organization.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q))
    );

    const editionsList = editions.filter(
      (e) =>
        e.number.toString().includes(q) ||
        e.highlights.some((h) => h.toLowerCase().includes(q)) ||
        (e.introduction && e.introduction.toLowerCase().includes(q))
    );

    const finds = allCommunityFinds.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        f.sharedBy.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
    );

    return { opportunities: opportunitiesList, editions: editionsList, finds };
  }, [universalSearchQuery, allCommunityFinds, opportunities, editions]);

  // Let's render the requested pages beautifully
  return (
    <div className="min-h-screen flex flex-col bg-warm-cream text-charcoal-deep font-sans selection:bg-charcoal-deep selection:text-warm-cream">
      {/* Dynamic Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Skip Navigation Link for Screen Readers (WCAG AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-charcoal-deep focus:text-warm-cream focus:rounded-md focus:border focus:border-warm-border"
      >
        Skip to content
      </a>

      {/* Header component */}
      <Header currentPath={route.view} onNavigate={navigateTo} theme={theme} onToggleTheme={toggleTheme} isAdminAuthorized={isAdminAuthorized} />

      {/* Main Content Area */}
      <main id="main-content" className="flex-grow" tabIndex={-1}>
        {/* VIEW: HOME */}
        {route.view === "home" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Hero Section */}
            <section className="mx-auto max-w-7xl px-4 pt-8 sm:pt-10 pb-12 sm:pb-16 sm:px-6 lg:px-8 text-center" aria-labelledby="hero-title">
              <div className="mx-auto max-w-3xl space-y-5">
                <h1
                  id="hero-title"
                  className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                >
                  Help people discover opportunities they otherwise might have missed.
                </h1>
                <p className="text-lg sm:text-xl text-charcoal-medium leading-relaxed max-w-2xl mx-auto font-sans">
                  Dev Opportunity Radar is a community project where I share grants, fellowships, hackathons, learning resources, open-source programs, and other opportunities I come across while researching.
                </p>
                <div className="max-w-2xl mx-auto p-3.5 sm:p-4 rounded-xl border border-warm-border bg-warm-soft/40 text-xs sm:text-sm text-charcoal-medium leading-relaxed font-sans text-left space-y-1.5">
                  <p className="font-semibold text-charcoal-deep">
                    ⚡ This website isn't replacing the weekly DEV editions.
                  </p>
                  <p className="text-charcoal-medium/90">
                    They're still the heart of Dev Opportunity Radar. This simply makes everything easier to search, browse, and revisit over time. Every Friday, a new edition is published on DEV, and sometimes I add time-sensitive opportunities here mid-week.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => navigateTo("#opportunities")}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-charcoal-deep text-warm-cream font-medium shadow-md hover:bg-opacity-90 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal-deep"
                  >
                    Browse Opportunities
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => navigateTo("#start-here")}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-warm-border bg-warm-soft/40 hover:bg-warm-soft text-charcoal-deep font-medium transition-all text-sm flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal-deep"
                  >
                    Start Here
                  </button>
                </div>
              </div>
            </section>

            {/* Statistics Row */}
            <section className="border-y border-warm-border bg-warm-soft/30 py-8" aria-label="Radar series statistics">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="space-y-1">
                    <p className="font-display text-3xl font-bold tracking-tight text-charcoal-deep">{stats.editionsCount}</p>
                    <p className="text-xs font-mono text-charcoal-light uppercase tracking-wider">Editions Published</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-3xl font-bold tracking-tight text-charcoal-deep">{stats.opportunitiesCount}+</p>
                    <p className="text-xs font-mono text-charcoal-light uppercase tracking-wider">Opportunities & Resources Shared</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-3xl font-bold tracking-tight text-charcoal-deep">{stats.communityFindsCount}</p>
                    <p className="text-xs font-mono text-charcoal-light uppercase tracking-wider">Community Finds</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-3xl font-bold tracking-tight text-charcoal-deep">{stats.contributorsCount}</p>
                    <p className="text-xs font-mono text-charcoal-light uppercase tracking-wider">Contributors Credited</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Latest Edition Section */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="latest-edition-heading">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-warm-border/50 pb-5">
                <div className="max-w-3xl">
                  <h2 id="latest-edition-heading" className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                    Latest Weekly Edition
                  </h2>
                  <p className="text-sm text-charcoal-medium font-sans mt-1 leading-relaxed">
                    Every Friday, a new edition is published on DEV. The website keeps everything organized, but the weekly editions are still the heart of Dev Opportunity Radar.
                  </p>
                </div>
                <button
                  onClick={() => navigateTo("#editions")}
                  className="text-sm font-medium text-charcoal-deep hover:underline flex items-center gap-1 group shrink-0 focus-visible:outline-none"
                >
                  View Past Editions ({editions.length})
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Edition Display Card */}
              {latestEdition && (
                <div className="rounded-2xl border border-warm-border bg-warm-cream shadow-sm p-6 sm:p-8 space-y-6 hover:border-charcoal-deep/20 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-warm-border pb-5">
                    <div>
                      <h3 className="font-display text-xl sm:text-2xl font-semibold">
                        Edition #{latestEdition.number}
                      </h3>
                      <p className="text-xs font-mono text-charcoal-light mt-0.5">
                        Published {latestEdition.publishedDate || "Recently"}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-charcoal-deep text-warm-cream font-mono text-xs">
                      Featured Weekly Edition
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-charcoal-light font-semibold">
                      Featured in this edition:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(() => {
                        const featuredOpps = opportunities.filter(
                          (opp) => opp.featuredInEdition === latestEdition.number || latestEdition.opportunityIds?.includes(opp.id)
                        );
                        if (featuredOpps.length === 0) {
                          return (
                            <p className="text-xs text-charcoal-light italic py-4 col-span-2 text-center border border-dashed border-warm-border rounded-xl">
                              No opportunities currently cataloged for this edition.
                            </p>
                          );
                        }
                        return featuredOpps.map((opp) => (
                          <div
                            key={opp.id}
                            className="p-4 rounded-xl border border-warm-border bg-warm-soft/30 hover:bg-warm-soft/60 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-mono font-medium text-charcoal-light flex items-center gap-1">
                                  {getCategoryIcon(opp.category, "w-3.5 h-3.5")}
                                  {opp.category}
                                </span>
                                <span className="text-[10px] font-mono text-charcoal-medium px-2 py-0.5 rounded border border-warm-border bg-warm-cream">
                                  {opp.deadline === "Ongoing" || opp.deadline === "Rolling" ? "Rolling" : `Ends ${opp.deadline}`}
                                </span>
                              </div>
                              <h5 className="font-semibold text-sm text-charcoal-deep mt-1">{opp.title}</h5>
                              <p className="text-xs text-charcoal-medium mt-1 line-clamp-2">{opp.description}</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-warm-border/40 flex items-center justify-between">
                              <button
                                onClick={() => navigateTo(`#opportunity/${opp.id}`)}
                                className="text-xs font-medium text-charcoal-deep hover:underline flex items-center gap-1 focus-visible:outline-none"
                              >
                                Explore Details
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => toggleBookmark(opp.id, opp.title)}
                                className="p-1 rounded text-charcoal-medium hover:bg-warm-border/40 hover:text-charcoal-deep"
                                aria-label={bookmarks.includes(opp.id) ? "Remove Bookmark" : "Bookmark Opportunity"}
                              >
                                <Bookmark className={`w-3.5 h-3.5 ${bookmarks.includes(opp.id) ? "fill-current text-charcoal-deep" : ""}`} />
                              </button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-warm-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    {latestEdition.closing && (
                      <p className="text-xs text-charcoal-light italic font-sans">
                        "{latestEdition.closing}"
                      </p>
                    )}
                    <a
                      href={latestEdition.devToLink || `https://dev.to/hemapriya_kanagala/edition-${latestEdition.number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-charcoal-deep text-xs font-medium text-charcoal-deep hover:bg-charcoal-deep hover:text-warm-cream transition-all focus-visible:outline-2 focus-visible:outline-charcoal-deep"
                    >
                      Read Full Edition on DEV
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </section>

            {/* Recently Added (Opportunities shared between main editions) */}
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-t border-warm-border">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-warm-border/50 pb-5">
                <div className="max-w-3xl">
                  <h2 className="font-display text-2xl font-bold tracking-tight">Recently Added Highlights</h2>
                  <p className="text-sm text-charcoal-medium mt-1 leading-relaxed">
                    Sometimes I discover an opportunity that simply can't wait until Friday. Rather than holding onto it until the next edition, I'll add it here so people can discover it sooner.
                  </p>
                </div>
                <button
                  onClick={() => navigateTo("#opportunities")}
                  className="text-sm font-medium text-charcoal-deep hover:underline flex items-center gap-1 group shrink-0 focus-visible:outline-none"
                >
                  View All Opportunities
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["solo-grants", "claude-open-source", "midnight-hackathon"]
                  .map(id => opportunities.find(opp => opp.id === id))
                  .filter((opp): opp is typeof opportunities[number] => !!opp)
                  .map((opp) => (
                  <div
                    key={opp.id}
                    className="group rounded-xl border border-warm-border bg-warm-cream p-5 hover:border-charcoal-deep/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => {
                            setOppCategory(opp.category);
                            setOppPage(1);
                            setOppSearch("");
                            navigateTo("#opportunities");
                          }}
                          className="text-[11px] font-mono text-charcoal-light hover:text-charcoal-deep hover:underline uppercase tracking-wider flex items-center gap-1 transition-all"
                        >
                          {getCategoryIcon(opp.category, "w-3.5 h-3.5")}
                          {opp.category}
                        </button>
                        <span className="text-[10px] font-mono text-charcoal-medium">
                          {opp.deadline === "Ongoing" || opp.deadline === "Rolling" ? "Ongoing" : `Ends ${opp.deadline}`}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-base text-charcoal-deep leading-snug group-hover:text-opacity-80">
                        {opp.title}
                      </h3>
                      <p className="text-xs font-mono text-charcoal-light mt-0.5">{opp.organization}</p>
                      <p className="text-xs text-charcoal-medium mt-2 leading-relaxed line-clamp-3">
                        {opp.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-warm-border/50 flex items-center justify-between">
                      <button
                        onClick={() => navigateTo(`#opportunity/${opp.id}`)}
                        className="text-xs font-medium text-charcoal-deep hover:underline flex items-center gap-0.5 focus-visible:outline-none"
                      >
                        Read Why Featured
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleBookmark(opp.id, opp.title)}
                        className="p-1 rounded text-charcoal-medium hover:bg-warm-soft hover:text-charcoal-deep"
                        aria-label={bookmarks.includes(opp.id) ? "Remove Bookmark" : "Save Bookmark"}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${bookmarks.includes(opp.id) ? "fill-current text-charcoal-deep" : ""}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Browse Categories (Visual Cards Grid) */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-warm-border" aria-labelledby="categories-heading">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 id="categories-heading" className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                  Looking for something specific?
                </h2>
                <p className="text-sm text-charcoal-medium font-sans mt-1.5">
                  Browse opportunities by category, whether you're searching for grants, fellowships, hackathons, learning resources, communities, or something else.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {CATEGORIES.map((cat) => {
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setOppCategory(cat.id);
                        setOppPage(1);
                        setOppSearch("");
                        navigateTo("#opportunities");
                      }}
                      className="group text-left p-5 rounded-2xl border border-warm-border bg-warm-cream hover:border-charcoal-deep/30 hover:shadow-sm transition-all flex gap-4 focus-visible:outline-2 focus-visible:outline-charcoal-deep"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-warm-border bg-warm-soft text-charcoal-deep group-hover:bg-charcoal-deep group-hover:text-warm-cream transition-all">
                        {getCategoryIcon(cat.id, "w-5.5 h-5.5")}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display font-semibold text-sm text-charcoal-deep group-hover:underline">
                            Explore {cat.name}
                          </h3>
                        </div>
                        <p className="text-xs text-charcoal-medium leading-relaxed font-sans line-clamp-2">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Built together with the community */}
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-t border-warm-border" aria-labelledby="community-heading">
              <div className="rounded-2xl border border-warm-border bg-warm-soft/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-3 max-w-2xl text-center md:text-left">
                  <h2 id="community-heading" className="font-display text-2xl font-bold tracking-tight text-charcoal-deep">
                    Built together with the community
                  </h2>
                  <div className="space-y-3 text-sm text-charcoal-medium leading-relaxed font-sans">
                    <p>
                      One of my favorite parts of writing Dev Opportunity Radar has been seeing readers recommend opportunities, share resources, suggest improvements, and celebrate one another's wins.
                    </p>
                    <p>
                      If you've discovered something worth sharing, I'd love to hear about it. Every Community Find starts with someone deciding to help another developer.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => navigateTo("#community-finds")}
                    className="px-5 py-2.5 rounded-lg bg-charcoal-deep text-warm-cream text-xs font-semibold hover:bg-opacity-90 transition-all text-center"
                  >
                    View Community Finds
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Start Guide Banner */}
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="rounded-2xl border border-warm-border bg-warm-soft/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-2xl text-center md:text-left">
                  <h3 className="font-display font-semibold text-lg">New here?</h3>
                  <p className="text-sm text-charcoal-medium">
                    If this is your first visit, the Start Here page explains what Dev Opportunity Radar is, how the website works, where to begin, and how you can share opportunities or Reader Updates with the community.
                  </p>
                </div>
                <button
                  onClick={() => navigateTo("#start-here")}
                  className="shrink-0 px-5 py-2.5 rounded-lg bg-charcoal-deep text-warm-cream text-xs font-medium hover:bg-opacity-90 transition-all focus-visible:outline-2 focus-visible:outline-charcoal-deep"
                >
                  Go to Start Here
                </button>
              </div>
            </section>

            {/* Humble Handcrafted Thank You / Heart Section */}
            <section className="mx-auto max-w-4xl px-4 py-16 text-center border-t border-warm-border/50 space-y-4">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-500 animate-pulse">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <h3 className="font-display text-2xl font-bold tracking-tight text-charcoal-deep">Built with love for the developer community</h3>
              <div className="text-sm text-charcoal-medium max-w-2xl mx-auto leading-relaxed space-y-3 font-sans">
                <p>
                  Dev Opportunity Radar is written and maintained by one person, but it has never felt like a one-person project.
                </p>
                <p>
                  Every opportunity someone shares... Every correction... Every thoughtful comment... Every Reader Update... has helped shape what this has become.
                </p>
                <p className="font-semibold text-charcoal-deep">
                  Thank you for reading, sharing, encouraging one another, and helping more developers discover opportunities they otherwise might have missed.
                </p>
                <p className="font-semibold text-charcoal-deep text-base">
                  This project wouldn't exist without you. 💙
                </p>
              </div>
              <p className="text-xs font-mono text-charcoal-light">— Hemapriya Kanagala</p>
            </section>
          </div>
        )}

        {/* VIEW: START HERE */}
        {route.view === "start-here" && (
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300">
            {/* Header / TL;DR section */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal-deep text-warm-cream text-xs font-mono">
                <Pin className="w-3.5 h-3.5 rotate-45" />
                Start Guide
              </div>
              
              <div className="p-6 sm:p-8 rounded-2xl border-2 border-charcoal-deep bg-warm-cream relative overflow-hidden space-y-4 shadow-sm">
                <div className="absolute right-3 top-3 opacity-10">
                  <Pin className="w-16 h-16 rotate-45 text-charcoal-deep" />
                </div>
                <h2 className="font-display text-xl font-bold text-charcoal-deep flex items-center gap-2">
                  📌 TL;DR
                </h2>
                <div className="space-y-3 text-sm text-charcoal-medium leading-relaxed">
                  <p className="font-semibold text-charcoal-deep">
                    Welcome to Dev Opportunity Radar.
                  </p>
                  <p>
                    If this is your first visit, you're in the right place.
                  </p>
                  <p>
                    This website is designed to make it easy to discover grants, fellowships, hackathons, internships, communities, learning resources, and other opportunities without feeling overwhelmed.
                  </p>
                  <p>
                    Everything here is organized so you can quickly find what matters to you, save time, and get back to building.
                  </p>
                  <p>
                    If you'd like to learn more about why this project exists, you can always visit the{" "}
                    <button onClick={() => navigateTo("#about")} className="font-semibold underline text-charcoal-deep hover:text-charcoal-light">About page</button>{" "}
                    later. For now, here's the quickest way to get started.
                  </p>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="p-6 rounded-2xl border border-warm-border bg-warm-soft/30 space-y-4">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-charcoal-deep">
                Table of Contents
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <li>
                  <button
                    onClick={() => document.getElementById("welcome")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="flex items-center gap-2 text-charcoal-medium hover:text-charcoal-deep hover:underline text-left"
                  >
                    <span className="text-charcoal-light">01.</span> Welcome
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("start-opportunities")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="flex items-center gap-2 text-charcoal-medium hover:text-charcoal-deep hover:underline text-left"
                  >
                    <span className="text-charcoal-light">02.</span> Start with the Opportunities
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("browse-editions")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="flex items-center gap-2 text-charcoal-medium hover:text-charcoal-deep hover:underline text-left"
                  >
                    <span className="text-charcoal-light">03.</span> Browse Every Edition
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("community-updates")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="flex items-center gap-2 text-charcoal-medium hover:text-charcoal-deep hover:underline text-left"
                  >
                    <span className="text-charcoal-light">04.</span> Community Finds & Reader Updates
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("learn-more")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="flex items-center gap-2 text-charcoal-medium hover:text-charcoal-deep hover:underline text-left"
                  >
                    <span className="text-charcoal-light">05.</span> Learn More About the Project
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("things-to-know")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="flex items-center gap-2 text-charcoal-medium hover:text-charcoal-deep hover:underline text-left"
                  >
                    <span className="text-charcoal-light">06.</span> A Few Things to Know
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => document.getElementById("welcome-again")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="flex items-center gap-2 text-charcoal-medium hover:text-charcoal-deep hover:underline text-left"
                  >
                    <span className="text-charcoal-light">07.</span> Welcome Again
                  </button>
                </li>
              </ul>
            </div>

            {/* Content Sections */}
            <div className="space-y-12">
              {/* SECTION 1: Welcome */}
              <section id="welcome" className="space-y-4 scroll-mt-24">
                <h2 className="font-display text-2xl font-bold text-charcoal-deep flex items-center gap-2">
                  👋 Welcome
                </h2>
                <div className="space-y-4 text-sm text-charcoal-medium leading-relaxed">
                  <p>
                    I'm really glad you're here.
                  </p>
                  <p>
                    Whether you found this website through one of the weekly DEV editions, a recommendation from someone else, or simply stumbled across it while searching for opportunities, I hope it helps you discover something valuable.
                  </p>
                  <p>
                    This website isn't meant to replace the weekly editions published on DEV. Those are still the heart of Dev Opportunity Radar and where every Friday's edition is published.
                  </p>
                  <p>
                    Instead, this website exists to make everything easier to explore. As the number of editions grows, I wanted a place where you could quickly search, filter, and revisit opportunities without needing to remember which edition they originally appeared in.
                  </p>
                  <p>
                    Think of it as the library for Dev Opportunity Radar, while the weekly DEV editions remain the place where each new chapter is published.
                  </p>
                </div>
              </section>

              {/* SECTION 2: Start with the Opportunities */}
              <section id="start-opportunities" className="p-6 sm:p-8 rounded-2xl border border-warm-border bg-warm-cream space-y-5 scroll-mt-24">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-light font-semibold">Step One</span>
                  <h2 className="font-display text-xl font-bold text-charcoal-deep">
                    Start with the Opportunities
                  </h2>
                </div>
                <div className="space-y-4 text-sm text-charcoal-medium leading-relaxed">
                  <p>
                    If your goal is simply to find something worth applying for, this is usually the best place to begin.
                  </p>
                  <p>
                    The Opportunities page brings together everything that's been featured across every edition in one searchable place.
                  </p>
                  <p>
                    You can browse by category if you're looking for something specific, or filter opportunities based on their current status.
                  </p>
                  <p>
                    For example, you can view only opportunities that are still accepting applications, explore programs with rolling applications, or hide opportunities that have already closed.
                  </p>
                  <p>
                    Whether you're searching for grants, fellowships, hackathons, internships, startup programs, conferences, learning resources, or communities, the goal is to make finding them as simple as possible.
                  </p>
                  <p>
                    Instead of reading through every edition one by one, you can quickly narrow things down to what's most relevant to you.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => navigateTo("#opportunities")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-charcoal-deep text-warm-cream text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm"
                  >
                    Go to Opportunities Directory
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>

              {/* SECTION 3: Browse Every Edition */}
              <section id="browse-editions" className="p-6 sm:p-8 rounded-2xl border border-warm-border bg-warm-cream space-y-5 scroll-mt-24">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-light font-semibold">Step Two</span>
                  <h2 className="font-display text-xl font-bold text-charcoal-deep">
                    Browse Every Edition
                  </h2>
                </div>
                <div className="space-y-4 text-sm text-charcoal-medium leading-relaxed">
                  <p>
                    Sometimes context matters.
                  </p>
                  <p>
                    Every Friday, I publish a new edition of Dev Opportunity Radar on DEV, where I explain why I decided to feature each opportunity instead of simply listing links.
                  </p>
                  <p>
                    If you enjoy reading the weekly editions or want to see opportunities exactly as they were originally shared, you'll probably enjoy the Editions page.
                  </p>
                  <p>
                    From there, you can browse every edition published so far and jump directly to the original DEV article whenever you'd like.
                  </p>
                  <p>
                    The website makes everything easier to organize, but the weekly editions are still where this project lives and continues to grow.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => navigateTo("#editions")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-charcoal-deep text-warm-cream text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm"
                  >
                    Browse Weekly Editions
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>

              {/* SECTION 4: Community Finds & Reader Updates */}
              <section id="community-updates" className="p-6 sm:p-8 rounded-2xl border border-warm-border bg-warm-cream space-y-5 scroll-mt-24">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-light font-semibold">Step Three</span>
                  <h2 className="font-display text-xl font-bold text-charcoal-deep">
                    Community Finds & Reader Updates
                  </h2>
                </div>
                <div className="space-y-4 text-sm text-charcoal-medium leading-relaxed">
                  <p>
                    One of my favorite parts of this project has nothing to do with me.
                  </p>
                  <p>
                    It's seeing people help one another.
                  </p>
                  <p>
                    The Community Finds page celebrates opportunities shared by readers. If someone recommends something that I feature, they'll always receive credit because they were the one who discovered it.
                  </p>
                  <p>
                    The Reader Updates page is where I celebrate people who found something through Dev Opportunity Radar.
                  </p>
                  <p>
                    Maybe they applied for a grant. Maybe they joined a community. Maybe they attended a hackathon. Or maybe they simply discovered a resource they hadn't seen before.
                  </p>
                  <p>
                    Those stories remind me why this project exists, and I hope they'll encourage others to take a chance on opportunities they come across too.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => navigateTo("#community-finds")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-charcoal-deep text-warm-cream text-xs font-semibold hover:bg-opacity-90 transition-all shadow-sm"
                  >
                    Explore Community Finds
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigateTo("#reader-updates")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-charcoal-deep text-charcoal-deep text-xs font-semibold hover:bg-charcoal-deep hover:text-warm-cream transition-all"
                  >
                    View Reader Success Stories
                  </button>
                </div>
              </section>

              {/* SECTION 5: Learn More About the Project */}
              <section id="learn-more" className="p-6 sm:p-8 rounded-2xl border border-warm-border bg-warm-cream space-y-5 scroll-mt-24">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-light font-semibold">Step Four</span>
                  <h2 className="font-display text-xl font-bold text-charcoal-deep">
                    Learn More About the Project
                  </h2>
                </div>
                <div className="space-y-4 text-sm text-charcoal-medium leading-relaxed">
                  <p>
                    If you're curious about how Dev Opportunity Radar started or why I spend so much time putting it together, I'd recommend visiting the About page.
                  </p>
                  <p>
                    If you'd like to understand the values that guide every decision I make, you'll probably enjoy the My Philosophy page.
                  </p>
                  <p>
                    And if you have questions about how everything works, chances are you'll find the answer in the FAQ.
                  </p>
                  <p>
                    Those pages aren't required reading, but they're there if you'd like to get to know the project a little better.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => navigateTo("#about")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-warm-border text-xs font-medium text-charcoal-deep hover:bg-warm-soft"
                  >
                    About Project
                  </button>
                  <button
                    onClick={() => navigateTo("#philosophy")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-warm-border text-xs font-medium text-charcoal-deep hover:bg-warm-soft"
                  >
                    My Philosophy
                  </button>
                  <button
                    onClick={() => navigateTo("#faq")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-warm-border text-xs font-medium text-charcoal-deep hover:bg-warm-soft"
                  >
                    FAQ Directory
                  </button>
                </div>
              </section>

              {/* SECTION 6: A Few Things to Know */}
              <section id="things-to-know" className="space-y-4 scroll-mt-24">
                <h2 className="font-display text-2xl font-bold text-charcoal-deep flex items-center gap-2">
                  🔑 A Few Things to Know
                </h2>
                <div className="space-y-4 text-sm text-charcoal-medium leading-relaxed">
                  <p>
                    This website is designed to grow alongside the weekly editions.
                  </p>
                  <p>
                    As new opportunities are discovered, new editions are published, and more people share Community Finds and Reader Updates, you'll see everything continue to grow here as well.
                  </p>
                  <p>
                    Because this project is maintained by one person, some features may evolve over time, and I'll continue improving the experience whenever I find ways to make it genuinely more useful.
                  </p>
                  <p>
                    My goal isn't to add more features simply because I can.
                  </p>
                  <p>
                    It's to build something that respects your time and makes discovering opportunities a little easier every week.
                  </p>
                </div>
              </section>

              {/* SECTION 7: Welcome Again */}
              <section id="welcome-again" className="space-y-4 border-t border-warm-border pt-8 scroll-mt-24">
                <h2 className="font-display text-2xl font-bold text-charcoal-deep flex items-center gap-2">
                  💙 Welcome Again
                </h2>
                <div className="space-y-4 text-sm text-charcoal-medium leading-relaxed">
                  <p>
                    Thank you for stopping by.
                  </p>
                  <p>
                    Whether you're here for five minutes or you become someone who visits every Friday, I truly appreciate you being here.
                  </p>
                  <p>
                    I hope you discover an opportunity that helps your journey.
                  </p>
                  <p>
                    And if you ever come across something you think other developers should know about, I'd love to hear from you.
                  </p>
                  <p>
                    After all, the goal of Dev Opportunity Radar has always been simple:
                  </p>
                  <p className="font-display text-base font-bold text-charcoal-deep pl-4 border-l-2 border-charcoal-deep italic">
                    Help people discover opportunities they otherwise might have missed.
                  </p>
                  <p>
                    I hope this website makes that a little easier. 💙
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* VIEW: OPPORTUNITIES DIRECTORY */}
        {route.view === "opportunities" && (
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="mb-8 space-y-2">
              <h1 className="font-display text-3xl font-bold tracking-tight">Opportunity Directory</h1>
            </div>

            {/* Filter controls panel */}
            <div className="p-5 rounded-2xl border border-warm-border bg-warm-soft/40 mb-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search input */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-charcoal-light" />
                  <input
                    type="text"
                    placeholder="Search by keyword, organization, or tag..."
                    value={oppSearch}
                    onChange={(e) => setOppSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-warm-border bg-warm-cream text-sm focus:outline-none focus:border-charcoal-deep"
                    aria-label="Search opportunities"
                  />
                  {oppSearch && (
                    <button
                      onClick={() => setOppSearch("")}
                      className="absolute right-3 top-3 text-charcoal-light hover:text-charcoal-deep"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category filter */}
                <div>
                  <select
                    value={oppCategory}
                    onChange={(e) => setOppCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream text-sm focus:outline-none focus:border-charcoal-deep"
                    aria-label="Filter by category"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sorting filter */}
                <div>
                  <select
                    value={oppSort}
                    onChange={(e) => setOppSort(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream text-sm focus:outline-none focus:border-charcoal-deep"
                    aria-label="Sort opportunities"
                  >
                    <option value="added-desc">Recently Shared First</option>
                    <option value="added-asc">Oldest Shared First</option>
                    <option value="deadline-asc">Deadline (Soonest First)</option>
                    <option value="title-asc">Title (Alphabetical)</option>
                    <option value="org-asc">Organization (Alphabetical)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-warm-border/30">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Deadline toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-charcoal-light">Deadlines:</span>
                    <div className="inline-flex rounded-lg border border-warm-border p-0.5 bg-warm-cream">
                      {["All", "Upcoming", "Rolling/Ongoing", "Closed"].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setOppDeadlineFilter(mode)}
                          className={`px-2.5 py-1 text-xs rounded-md transition-all font-medium ${
                            oppDeadlineFilter === mode
                              ? "bg-charcoal-deep text-warm-cream"
                              : "text-charcoal-medium hover:text-charcoal-deep"
                          }`}
                        >
                          {mode === "Rolling/Ongoing" ? "Rolling" : mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exclude Learning Resources checkbox */}
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-warm-border bg-warm-cream hover:bg-warm-soft cursor-pointer transition-all text-xs font-medium text-charcoal-medium select-none">
                    <input
                      type="checkbox"
                      checked={oppExcludeLearning}
                      onChange={(e) => setOppExcludeLearning(e.target.checked)}
                      className="rounded border-warm-border text-charcoal-deep focus:ring-charcoal-deep w-3.5 h-3.5 cursor-pointer accent-charcoal-deep"
                    />
                    Exclude Learning Resources
                  </label>
                </div>

                {/* Bookmarks toggle button */}
                <button
                  onClick={() => setOppShowBookmarksOnly(!oppShowBookmarksOnly)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
                    oppShowBookmarksOnly
                      ? "bg-charcoal-deep text-warm-cream border-charcoal-deep"
                      : "border-warm-border bg-warm-cream text-charcoal-medium hover:bg-warm-soft"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${oppShowBookmarksOnly ? "fill-current" : ""}`} />
                  Bookmarked Only ({bookmarks.length})
                </button>
              </div>

              {/* Reset Filters Option (Shown only if any filter is active) */}
              {(oppSearch !== "" || oppCategory !== "All" || oppDeadlineFilter !== "All" || oppExcludeLearning || oppShowBookmarksOnly) && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-warm-border/30 animate-in fade-in duration-200">
                  <p className="text-xs text-charcoal-medium font-sans">
                    ✨ This reset option is shown because filters are selected.
                  </p>
                  <button
                    onClick={() => {
                      setOppSearch("");
                      setOppCategory("All");
                      setOppDeadlineFilter("All");
                      setOppShowBookmarksOnly(false);
                      setOppExcludeLearning(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-charcoal-deep text-warm-cream text-xs font-semibold rounded-lg hover:bg-opacity-95 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Opportunities List or Empty States */}
            {filteredOpportunities.length === 0 ? (
              <div className="text-center py-16 px-4 border border-dashed border-warm-border rounded-2xl max-w-xl mx-auto space-y-4">
                <AlertCircle className="w-10 h-10 text-charcoal-light mx-auto" />
                <h3 className="font-display font-semibold text-lg">We couldn't find anything matching your search.</h3>
                <p className="text-sm text-charcoal-medium leading-relaxed font-sans">
                  You might have better luck exploring one of the categories below, or resetting your active filters to see other resources.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => {
                      setOppSearch("");
                      setOppCategory("All");
                      setOppDeadlineFilter("All");
                      setOppShowBookmarksOnly(false);
                      setOppExcludeLearning(false);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-charcoal-deep text-warm-cream text-xs font-medium"
                  >
                    Reset All Filters
                  </button>
                </div>
                <p className="text-[11px] font-mono text-charcoal-light/60">
                  New opportunities are added regularly, so it's always worth checking back again.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-xs font-mono text-charcoal-light">
                  Showing {filteredOpportunities.length} opportunities matching your criteria.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedOpportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="rounded-xl border border-warm-border bg-warm-cream p-6 hover:border-charcoal-deep/30 hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-medium text-charcoal-medium px-2 py-0.5 border border-warm-border rounded bg-warm-soft/40 flex items-center gap-1">
                              {getCategoryIcon(opp.category, "w-3.5 h-3.5")}
                              {opp.category}
                            </span>
                            {opp.status && (
                              <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                opp.status.toLowerCase().includes("closed")
                                  ? "bg-rose-50/80 text-rose-700 border-rose-200/50"
                                  : "bg-emerald-50/80 text-emerald-700 border-emerald-200/50"
                              }`}>
                                {opp.status}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-charcoal-light flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {opp.deadline === "Ongoing" || opp.deadline === "Rolling" ? "Rolling Submission" : `Ends ${opp.deadline}`}
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-lg text-charcoal-deep leading-snug mt-2">
                          {opp.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-mono text-charcoal-medium mt-0.5">
                          <span>{opp.organization}</span>
                          {opp.sharedBy && (
                            <>
                              <span className="text-charcoal-light/40">•</span>
                              <span className="text-indigo-600 font-semibold text-[11px] flex items-center gap-0.5">
                                💙 {opp.sharedBy}
                              </span>
                            </>
                          )}
                        </div>

                        <p className="text-xs text-charcoal-medium mt-3 leading-relaxed line-clamp-3">
                          {opp.description}
                        </p>

                        {/* Why featured preview */}
                        <div className="mt-4 p-3 rounded-lg bg-warm-soft/40 border-l-2 border-charcoal-deep/40 text-xs italic text-charcoal-medium">
                          <span className="font-semibold block font-mono text-[10px] uppercase text-charcoal-light tracking-wide not-italic">Why it's featured:</span>
                          "{opp.whyFeatured}"
                        </div>

                        <div className="flex flex-wrap gap-1 mt-4">
                          {opp.tags.map((tag) => (
                            <span key={tag} className="text-[10px] font-mono text-charcoal-light px-2 py-0.5 rounded-full border border-warm-border/60 bg-warm-soft/30">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-warm-border/50 flex items-center justify-between">
                        <button
                          onClick={() => navigateTo(`#opportunity/${opp.id}`)}
                          className="text-xs font-medium text-charcoal-deep hover:underline flex items-center gap-1 focus-visible:outline-none"
                        >
                          Explore Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleBookmark(opp.id, opp.title)}
                            className="p-1.5 rounded-lg border border-warm-border text-charcoal-medium hover:text-charcoal-deep hover:bg-warm-soft"
                            aria-label={bookmarks.includes(opp.id) ? "Remove Bookmark" : "Save Bookmark"}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${bookmarks.includes(opp.id) ? "fill-current text-charcoal-deep" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pt-8 flex items-center justify-between border-t border-warm-border">
                    <button
                      onClick={() => setOppPage((p) => Math.max(1, p - 1))}
                      disabled={oppPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-warm-border bg-warm-cream text-xs font-semibold text-charcoal-medium hover:bg-warm-soft disabled:opacity-40 disabled:hover:bg-warm-cream transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Previous
                    </button>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <span className="text-xs font-mono text-charcoal-medium">
                        Page {oppPage} of {totalPages}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-charcoal-light uppercase tracking-wider">Jump to page:</span>
                        <input
                          type="number"
                          min="1"
                          max={totalPages}
                          value={oppPage || ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 1 : parseInt(e.target.value);
                            if (!isNaN(val)) {
                              const clamped = Math.max(1, Math.min(totalPages, val));
                              setOppPage(clamped);
                            }
                          }}
                          className="w-12 px-1.5 py-1 text-center text-xs font-mono font-semibold rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setOppPage((p) => Math.min(totalPages, p + 1))}
                      disabled={oppPage === totalPages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-warm-border bg-warm-cream text-xs font-semibold text-charcoal-medium hover:bg-warm-soft disabled:opacity-40 disabled:hover:bg-warm-cream transition-all"
                    >
                      Next
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW: CATEGORY SPECIFIC VIEW */}
        {route.view === "category" && (
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-in fade-in duration-300">
            {(() => {
              const cat = CATEGORIES.find((c) => c.id === route.categoryId);
              const opportunitiesInCat = opportunities.filter((o) => o.category === route.categoryId);

              if (!cat) {
                return (
                  <div className="text-center py-16 space-y-4">
                    <AlertCircle className="w-10 h-10 text-charcoal-light mx-auto" />
                    <h3 className="font-display font-semibold text-lg">Category not found.</h3>
                    <button onClick={() => navigateTo("#")} className="px-4 py-1.5 rounded-lg bg-charcoal-deep text-warm-cream text-xs">Return Home</button>
                  </div>
                );
              }

              return (
                <div className="space-y-8">
                  {/* Category Details Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-warm-border pb-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal-deep text-warm-cream">
                        {getCategoryIcon(cat.id, "w-6 h-6")}
                      </div>
                      <div className="space-y-1">
                        <h1 className="font-display text-3xl font-bold tracking-tight">{cat.name} Directory</h1>
                        <p className="text-sm text-charcoal-medium max-w-2xl">{cat.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigateTo("#opportunities")}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-warm-border text-xs font-medium text-charcoal-medium hover:bg-warm-soft"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      All Categories
                    </button>
                  </div>

                  {/* Opportunities display or category empty state */}
                  {opportunitiesInCat.length === 0 ? (
                    <div className="text-center py-16 px-4 border border-dashed border-warm-border rounded-2xl max-w-xl mx-auto space-y-4">
                      <HelpCircle className="w-10 h-10 text-charcoal-light mx-auto" />
                      <h3 className="font-display font-semibold text-lg">No opportunities here yet</h3>
                      <p className="text-sm text-charcoal-medium leading-relaxed font-sans">
                        There aren't any opportunities in this category just yet. Rather than filling categories just to make the website look complete, I'd rather wait until there's something genuinely worth sharing.
                      </p>
                      <button onClick={() => navigateTo("#opportunities")} className="px-4 py-1.5 rounded-lg bg-charcoal-deep text-warm-cream text-xs">
                        Browse Active Categories
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {opportunitiesInCat.map((opp) => (
                        <div
                          key={opp.id}
                          className="rounded-xl border border-warm-border bg-warm-cream p-6 hover:border-charcoal-deep/30 hover:shadow-sm transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-charcoal-light uppercase tracking-wider">
                                  {opp.organization}
                                </span>
                                {opp.sharedBy && (
                                  <span className="text-indigo-600 font-mono text-[9px] font-semibold uppercase tracking-wider">
                                    • 💙 {opp.sharedBy}
                                  </span>
                                )}
                                {opp.status && (
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                    opp.status.toLowerCase().includes("closed")
                                      ? "bg-rose-50/80 text-rose-700 border-rose-200/50"
                                      : "bg-emerald-50/80 text-emerald-700 border-emerald-200/50"
                                  }`}>
                                    {opp.status}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-mono text-charcoal-light flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {opp.deadline === "Ongoing" || opp.deadline === "Rolling" ? "Rolling" : `Ends ${opp.deadline}`}
                              </span>
                            </div>

                            <h3 className="font-display font-bold text-lg text-charcoal-deep leading-snug">
                              {opp.title}
                            </h3>

                            <p className="text-xs text-charcoal-medium mt-3 leading-relaxed line-clamp-3">
                              {opp.description}
                            </p>

                            <div className="mt-4 p-3 rounded-lg bg-warm-soft/40 border-l-2 border-charcoal-deep/40 text-xs italic text-charcoal-medium">
                              "{opp.whyFeatured}"
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-warm-border/50 flex items-center justify-between">
                            <button
                              onClick={() => navigateTo(`#opportunity/${opp.id}`)}
                              className="text-xs font-medium text-charcoal-deep hover:underline flex items-center gap-1 focus-visible:outline-none"
                            >
                              Explore Details
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleBookmark(opp.id, opp.title)}
                              className="p-1.5 rounded-lg border border-warm-border text-charcoal-medium hover:text-charcoal-deep hover:bg-warm-soft"
                              aria-label={bookmarks.includes(opp.id) ? "Remove Bookmark" : "Save Bookmark"}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${bookmarks.includes(opp.id) ? "fill-current text-charcoal-deep" : ""}`} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* VIEW: INDIVIDUAL OPPORTUNITY DETAIL PAGE */}
        {route.view === "opportunity" && (
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 animate-in fade-in duration-300">
            {(() => {
              const opp = opportunities.find((o) => o.id === route.id);
              if (!opp) {
                return (
                  <div className="text-center py-16 space-y-4">
                    <AlertCircle className="w-10 h-10 text-charcoal-light mx-auto" />
                    <h2 className="font-display text-xl font-bold">This page seems to have wandered off.</h2>
                    <p className="text-sm text-charcoal-medium">Let's help you find something else instead.</p>
                    <button onClick={() => navigateTo("#opportunities")} className="px-4 py-1.5 rounded-lg bg-charcoal-deep text-warm-cream text-xs">
                      Back to Directory
                    </button>
                  </div>
                );
              }

              // Related opportunities
              const related = opportunities.filter((r) => opp.relatedIds.includes(r.id));

              return (
                <div className="space-y-8">
                  {/* Back button */}
                  <button
                    onClick={() => goBack("#opportunities")}
                    className="inline-flex items-center gap-1 text-xs font-medium text-charcoal-medium hover:text-charcoal-deep"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Go Back
                  </button>

                  {/* Main specs box */}
                  <div className="rounded-2xl border border-warm-border bg-warm-cream p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-warm-border pb-5">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              setOppCategory(opp.category);
                              setOppPage(1);
                              setOppSearch("");
                              navigateTo("#opportunities");
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-charcoal-medium px-2.5 py-0.5 border border-warm-border rounded-md bg-warm-soft/40 font-medium hover:bg-warm-soft hover:text-charcoal-deep hover:border-charcoal-deep/30 transition-all text-left"
                          >
                            {getCategoryIcon(opp.category, "w-3.5 h-3.5")}
                            {opp.category}
                          </button>
                          {opp.status && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                              opp.status.toLowerCase().includes("closed")
                                ? "bg-rose-50 text-rose-700 border-rose-200/60"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${opp.status.toLowerCase().includes("closed") ? "bg-rose-500" : "bg-emerald-500"}`} />
                              {opp.status}
                            </span>
                          )}
                        </div>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-deep leading-tight">
                          {opp.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-mono">
                          <span className="text-charcoal-medium">{opp.organization}</span>
                          {opp.sharedBy && (
                            <>
                              <span className="text-charcoal-light/40">•</span>
                              <span className="text-indigo-600 bg-indigo-50/50 border border-indigo-100 px-1.5 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                                💙 {opp.sharedBy}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleBookmark(opp.id, opp.title)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-warm-border text-xs font-medium text-charcoal-medium hover:text-charcoal-deep hover:bg-warm-soft transition-all"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${bookmarks.includes(opp.id) ? "fill-current text-charcoal-deep" : ""}`} />
                        {bookmarks.includes(opp.id) ? "Bookmarked" : "Save Bookmark"}
                      </button>
                    </div>

                    {/* Quick Facts Section */}
                    {opp.quickFacts && (
                      <div className="bg-warm-soft/20 border border-warm-border/50 p-4 rounded-xl space-y-2">
                        <span className="text-charcoal-light font-mono text-[10px] uppercase tracking-wider block font-semibold">Key Highlights & Quick Facts</span>
                        <div className="flex flex-wrap gap-2">
                          {opp.quickFacts.split("•").map((fact, idx) => (
                            <span key={idx} className="inline-flex items-center text-xs font-sans font-medium text-charcoal-deep bg-warm-cream px-2.5 py-1 rounded-md border border-warm-border/60">
                              {fact.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-warm-soft/30 p-4 rounded-xl border border-warm-border text-xs font-sans">
                      <div className="space-y-0.5">
                        <span className="text-charcoal-light font-mono text-[10px] uppercase tracking-wider block">Application Deadline</span>
                        <span className="font-semibold text-charcoal-deep flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-charcoal-medium" />
                          {opp.deadline === "Ongoing" || opp.deadline === "Rolling" ? "Rolling / Ongoing" : opp.deadline}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-charcoal-light font-mono text-[10px] uppercase tracking-wider block">Featured in Weekly Edition</span>
                        <button
                          onClick={() => {
                            setExpandedEditions((prev) => ({
                              ...prev,
                              [opp.featuredInEdition]: true,
                            }));
                            navigateTo("#editions");
                            setTimeout(() => {
                              const el = document.getElementById(`edition-${opp.featuredInEdition}`);
                              if (el) {
                                el.scrollIntoView({ behavior: "smooth", block: "start" });
                              }
                            }, 100);
                          }}
                          className="font-semibold text-charcoal-deep hover:underline flex items-center gap-1.5 text-left"
                        >
                          <Calendar className="w-4 h-4 text-charcoal-medium" />
                          Edition #{opp.featuredInEdition}
                        </button>
                      </div>
                    </div>

                    {/* Who it's for */}
                    {opp.whoItsFor && (
                      <div className="space-y-1.5 p-4 rounded-xl border border-warm-border bg-warm-soft/10">
                        <h2 className="text-xs font-mono uppercase tracking-wider text-charcoal-light font-semibold">Who this is for:</h2>
                        <p className="text-sm text-charcoal-deep font-sans font-medium leading-relaxed">
                          {opp.whoItsFor}
                        </p>
                      </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                      <h2 className="text-xs font-mono uppercase tracking-wider text-charcoal-light font-semibold">About this resource:</h2>
                      <p className="text-sm text-charcoal-medium leading-relaxed font-sans">
                        {opp.description}
                      </p>
                    </div>

                    {/* Why Featured (Highlight of curation) */}
                    <div className="space-y-3 p-5 rounded-xl border border-amber-200/50 bg-amber-50/20">
                      <h2 className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-amber-600 fill-current" />
                        Why I featured it:
                      </h2>
                      <p className="text-sm text-charcoal-deep leading-relaxed italic font-sans">
                        "{opp.whyFeatured}"
                      </p>
                    </div>

                    {/* Action Links */}
                    <div className="pt-5 border-t border-warm-border flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {opp.tags.map((tag) => (
                          <span key={tag} className="text-[10px] font-mono text-charcoal-light px-2.5 py-0.5 rounded-full border border-warm-border bg-warm-soft/10">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3 items-center">
                        {opp.editionSectionLink && (
                          <a
                            href={opp.editionSectionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-warm-border text-charcoal-medium text-xs font-semibold hover:bg-warm-soft hover:text-charcoal-deep active:scale-[0.98] transition-all"
                          >
                            Read in Edition #{opp.featuredInEdition}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <a
                          href={opp.officialWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-charcoal-deep text-warm-cream text-xs font-semibold hover:bg-opacity-90 active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-charcoal-deep shadow-sm"
                        >
                          Visit Official Website
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Related opportunities */}
                  {related.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-warm-border">
                      <h3 className="font-display font-semibold text-lg">Related Opportunities</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {related.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => navigateTo(`#opportunity/${item.id}`)}
                            className="text-left p-4 rounded-xl border border-warm-border bg-warm-cream hover:border-charcoal-deep/20 transition-all flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-charcoal-deep"
                          >
                            <div>
                              <span className="text-[10px] font-mono text-charcoal-light uppercase">{item.category}</span>
                              <h4 className="font-semibold text-sm text-charcoal-deep line-clamp-1 mt-0.5">{item.title}</h4>
                              <p className="text-xs text-charcoal-medium line-clamp-2 mt-1">{item.description}</p>
                            </div>
                            <span className="text-xs font-medium text-charcoal-deep hover:underline flex items-center gap-0.5 mt-3">
                              View resource
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* VIEW: EDITIONS ARCHIVE */}
        {route.view === "editions" && (
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2 border-b border-warm-border pb-6">
              <h1 className="font-display text-3xl font-bold tracking-tight">Weekly Edition Archives</h1>
              <p className="text-sm text-charcoal-medium">
                Browse through my hand-composed weekly newsletter publications, published every Friday on DEV.to.
              </p>
            </div>

            <div className="space-y-6">
              {editions.map((ed) => (
                <div
                  key={ed.number}
                  id={`edition-${ed.number}`}
                  className="p-6 rounded-2xl border border-warm-border bg-warm-cream hover:border-charcoal-deep/20 transition-all space-y-4 scroll-mt-24"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-warm-border/60 pb-3">
                    <div>
                      <h2 className="font-display text-lg font-bold text-charcoal-deep">Edition #{ed.number}</h2>
                      <p className="text-xs font-mono text-charcoal-light">{ed.publishedDate}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={ed.devToLink || `https://dev.to/hemapriya_kanagala/edition-${ed.number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-charcoal-deep text-xs font-medium text-charcoal-deep hover:bg-charcoal-deep hover:text-warm-cream transition-all"
                      >
                        Read on DEV
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => {
                          setExpandedEditions((prev) => ({
                            ...prev,
                            [ed.number]: !prev[ed.number],
                          }));
                        }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                          expandedEditions[ed.number]
                            ? "bg-charcoal-deep text-warm-cream border-charcoal-deep"
                            : "border-warm-border text-charcoal-medium hover:border-charcoal-deep/30 hover:text-charcoal-deep"
                        }`}
                      >
                        {expandedEditions[ed.number] ? "Hide opportunities" : "See opportunities in this edition"}
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            expandedEditions[ed.number] ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>



                  <div className="space-y-2">
                    <h3 className="text-[11px] font-mono uppercase tracking-wider text-charcoal-light">Key featured highlights:</h3>
                    <div className="flex flex-wrap gap-2">
                      {ed.highlights.map((hl) => (
                        <span key={hl} className="inline-flex items-center gap-1 text-xs font-sans font-medium text-charcoal-medium px-2.5 py-1 rounded bg-warm-soft/60 border border-warm-border">
                          <Check className="w-3.5 h-3.5 text-charcoal-light" />
                          {hl}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expanded opportunities list for this edition */}
                  {expandedEditions[ed.number] && (
                    <div className="mt-4 pt-4 border-t border-warm-border/60 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="p-4 rounded-xl bg-warm-soft/30 border border-warm-border/50 text-xs text-charcoal-medium leading-relaxed">
                        Please read the full publication on DEV by clicking{" "}
                        <a
                          href={ed.devToLink || `https://dev.to/hemapriya_kanagala/edition-${ed.number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-charcoal-deep underline hover:text-opacity-80 inline-flex items-center gap-0.5 inline-block"
                        >
                          here <ExternalLink className="w-3 h-3" />
                        </a>
                        . Here are the featured opportunities in Edition #{ed.number} that you can explore directly:
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {(() => {
                          const opps = opportunities.filter(
                            (opp) => opp.featuredInEdition === ed.number || ed.opportunityIds?.includes(opp.id)
                          );

                          if (opps.length === 0) {
                            return (
                              <p className="text-xs text-charcoal-light italic text-center py-4 border border-dashed border-warm-border rounded-xl">
                                No registered opportunities found in our local directory for this edition.
                              </p>
                            );
                          }

                          return opps.map((opp) => (
                            <div
                              key={opp.id}
                              className="p-4 rounded-xl border border-warm-border/80 bg-warm-cream/50 hover:border-charcoal-deep/20 hover:bg-warm-cream transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[9px] font-mono uppercase tracking-wider text-charcoal-light bg-warm-soft px-1.5 py-0.5 border border-warm-border rounded-md">
                                    {opp.category}
                                  </span>
                                  {opp.sharedBy && (
                                    <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50/60 px-1.5 py-0.5 border border-emerald-200/60 rounded-md">
                                      Community Find
                                    </span>
                                  )}
                                  {opp.status === "Closed" && (
                                    <span className="text-[9px] font-mono text-rose-800 bg-rose-50/60 px-1.5 py-0.5 border border-rose-200/60 rounded-md">
                                      Closed
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-display font-semibold text-sm text-charcoal-deep">
                                  {opp.title}
                                </h4>
                                <p className="text-xs text-charcoal-medium leading-relaxed max-w-2xl line-clamp-2">
                                  <span className="font-mono text-[11px] text-charcoal-deep font-semibold">{opp.organization}</span> — {opp.description}
                                </p>
                              </div>

                              <button
                                onClick={() => navigateTo(`#opportunity/${opp.id}`)}
                                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-warm-border text-xs font-semibold text-charcoal-deep hover:bg-warm-soft hover:border-charcoal-deep/30 shrink-0 self-end sm:self-center transition-all"
                              >
                                View Specs
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: COMMUNITY FINDS */}
        {route.view === "community-finds" && (
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300">
            {/* Header section */}
            <div className="space-y-4 text-center max-w-3xl mx-auto">
              <span className="text-xs font-mono uppercase tracking-widest text-charcoal-light bg-warm-soft px-3 py-1.5 rounded-full border border-warm-border inline-block">
                Crowdsourced Insights
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-charcoal-deep">
                Community Finds
              </h1>
              <p className="text-sm text-charcoal-medium leading-relaxed max-w-xl mx-auto">
                Discovering and sharing valuable opportunities together as a global developer community.
              </p>
            </div>

            {/* TL;DR Highlight Card */}
            <div className="max-w-3xl mx-auto">
              <section className="p-6 sm:p-8 rounded-2xl border border-warm-border bg-warm-soft/25 text-charcoal-deep space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2 border-b border-warm-border/60 pb-2">
                  <span className="text-xl">📌</span>
                  <h2 className="font-display text-sm uppercase tracking-wider font-extrabold text-charcoal-medium">
                    TL;DR
                  </h2>
                </div>
                <div className="text-sm text-charcoal-medium leading-relaxed font-sans space-y-3">
                  <p className="font-medium text-charcoal-deep text-base">
                    Community Finds are one of my favorite parts of Dev Opportunity Radar.
                  </p>
                  <p>
                    They're opportunities, resources, communities, and events shared by readers who simply wanted other developers to discover something they found valuable. If I feature something you shared, I'll always make sure to credit you.
                  </p>
                </div>
              </section>
            </div>

            {/* Table of Contents */}
            <div className="max-w-3xl mx-auto p-6 rounded-2xl border border-warm-border/60 bg-warm-cream/50 space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-charcoal-light font-bold">
                Table of Contents
              </p>
              <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-sans" aria-label="Table of contents">
                {[
                  { label: "What are Community Finds?", id: "what-are-community-finds" },
                  { label: "Why this page exists", id: "why-this-page-exists" },
                  { label: "What can be shared?", id: "what-can-be-shared" },
                  { label: "A small request", id: "a-small-request" },
                  { label: "How to share a Community Find", id: "how-to-share" },
                  { label: "Featured Community Finds", id: "featured-community-finds" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="flex items-center gap-2 text-charcoal-medium hover:text-charcoal-deep hover:underline text-left group transition-all"
                  >
                    <span className="text-charcoal-light group-hover:text-charcoal-deep transition-all">→</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Core Narrative / Essays */}
            <div className="max-w-3xl mx-auto space-y-12 text-charcoal-deep font-sans">
              
              {/* Section: What are Community Finds? */}
              <section id="what-are-community-finds" className="space-y-4 scroll-mt-24">
                <h2 className="font-display text-2xl font-bold tracking-tight text-charcoal-deep border-b border-warm-border pb-2">
                  What are Community Finds?
                </h2>
                <div className="text-sm leading-relaxed text-charcoal-medium space-y-4">
                  <p>
                    When I published the first edition of Dev Opportunity Radar, I assumed every opportunity would come from my own research.
                  </p>
                  <p>
                    It didn't take long for that to change.
                  </p>
                  <p>
                    People started leaving comments recommending grants, hackathons, communities, learning resources, fellowships, conferences, and all kinds of opportunities I'd never come across before. Some were well known, while others were things I probably wouldn't have discovered on my own.
                  </p>
                  <p className="italic border-l-2 border-warm-border pl-4 text-charcoal-deep">
                    Those conversations gradually became one of my favorite parts of writing this series.
                  </p>
                  <p>
                    Community Finds are simply my way of celebrating those discoveries and making sure more people get to benefit from them.
                  </p>
                </div>
              </section>

              {/* Section: Why this page exists */}
              <section id="why-this-page-exists" className="space-y-4 scroll-mt-24">
                <h2 className="font-display text-2xl font-bold tracking-tight text-charcoal-deep border-b border-warm-border pb-2">
                  Why this page exists
                </h2>
                <div className="text-sm leading-relaxed text-charcoal-medium space-y-4">
                  <p>
                    One person can only discover so much.
                  </p>
                  <p>
                    There are thousands of organizations, communities, universities, startups, and open-source projects creating opportunities for developers every single year. No matter how much time I spend researching, I'm always going to miss something.
                  </p>
                  <p className="font-medium text-charcoal-deep">
                    That's where the community comes in.
                  </p>
                  <p>
                    Every recommendation has the chance to help someone discover something they otherwise might never have seen.
                  </p>
                  <p>
                    Over time, Dev Opportunity Radar has become more than a weekly roundup. It's slowly becoming something we're building together, and Community Finds are a big part of that.
                  </p>
                </div>
              </section>

              {/* Section: What can be shared? */}
              <section id="what-can-be-shared" className="space-y-4 scroll-mt-24">
                <h2 className="font-display text-2xl font-bold tracking-tight text-charcoal-deep border-b border-warm-border pb-2">
                  What can be shared?
                </h2>
                <div className="text-sm leading-relaxed text-charcoal-medium space-y-4">
                  <p>
                    If you've come across something that genuinely helped you, or something you believe more developers should know about, I'd love to hear about it.
                  </p>
                  <p>
                    It could be a grant, fellowship, hackathon, internship, conference, startup program, open-source initiative, developer community, mentorship program, learning resource, or something that doesn't fit neatly into a category at all.
                  </p>
                  <p>
                    It doesn't need to be brand new, and it doesn't need to be widely known.
                  </p>
                  <p className="font-medium text-charcoal-deep">
                    If you think someone else could benefit from discovering it, it's worth sharing.
                  </p>
                </div>
              </section>

              {/* Section: A small request */}
              <section id="a-small-request" className="space-y-4 scroll-mt-24">
                <h2 className="font-display text-2xl font-bold tracking-tight text-charcoal-deep border-b border-warm-border pb-2">
                  A small request
                </h2>
                <div className="text-sm leading-relaxed text-charcoal-medium space-y-4">
                  <p>
                    I read every recommendation personally before deciding whether to feature it.
                  </p>
                  <p>
                    If you're sharing something, a short explanation about what it is and why you think it's worth sharing really helps me understand it.
                  </p>
                  <p className="font-semibold text-charcoal-deep">
                    I also have one small request.
                  </p>
                  <p>
                    Please only share opportunities or resources that you genuinely believe would benefit the community.
                  </p>
                  <p>
                    I completely respect the time, effort, and passion people put into building their own projects, but this page isn't intended for self-promotion or advertising. My goal is to keep Community Finds focused on helping readers discover opportunities they otherwise might have missed, and I hope you'll understand why that's important.
                  </p>
                  <p className="text-charcoal-deep font-semibold">
                    If I feature something you shared, I'll always make sure to credit you. If you discovered it, that recognition belongs to you.
                  </p>
                </div>
              </section>

              {/* Section: How to share a Community Find */}
              <section id="how-to-share" className="space-y-4 scroll-mt-24">
                <h2 className="font-display text-2xl font-bold tracking-tight text-charcoal-deep border-b border-warm-border pb-2">
                  How to share a Community Find
                </h2>
                <div className="text-sm leading-relaxed text-charcoal-medium space-y-4">
                  <p>
                    The easiest way is to leave a comment under the latest edition on DEV.
                  </p>
                  <p>
                    I'm very active there, and it's usually the quickest way for me to see recommendations while I'm preparing the next edition.
                  </p>
                  <p>
                    If you prefer, you're also welcome to send me a message on LinkedIn or reach out by email. You'll find all of those contact details on the{" "}
                    <button
                      onClick={() => navigateTo("#contact")}
                      className="font-bold text-charcoal-deep underline hover:text-opacity-80"
                    >
                      Contact page
                    </button>.
                  </p>
                  <p className="font-medium text-charcoal-deep">
                    However you choose to get in touch, thank you for taking the time to share something that might help someone else.
                  </p>
                  <p>
                    Every Community Find starts with one person deciding to help another developer, and I hope we continue building that culture together.
                  </p>
                </div>
              </section>

              {/* Section: Featured Community Finds */}
              <section id="featured-community-finds" className="space-y-6 scroll-mt-24 pt-4">
                <div className="space-y-2 border-b border-warm-border pb-4">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-charcoal-deep">
                    Featured Community Finds
                  </h2>
                  <p className="text-xs font-mono uppercase tracking-wider text-charcoal-light">
                    Active Directory ({communityOpportunities.length})
                  </p>
                </div>
                
                <div className="text-sm leading-relaxed text-charcoal-medium space-y-4 font-sans">
                  <p>
                    Every Community Find that has appeared in Dev Opportunity Radar is collected below.
                  </p>
                  <p>
                    Each one was originally shared by a member of the community before being featured in a weekly edition, and every contributor has been credited for their discovery.
                  </p>
                  <p>
                    I'm incredibly grateful to everyone who has taken the time to share opportunities over the past few months. Your recommendations have helped people discover communities, hackathons, fellowships, and other opportunities they might never have found otherwise.
                  </p>
                  <p className="font-semibold text-charcoal-deep">
                    Thank you for helping make Dev Opportunity Radar a little better with every recommendation. 💙
                  </p>
                </div>

                {/* Grid list of Community Finds */}
                {communityOpportunities.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-dashed border-warm-border rounded-xl bg-warm-cream/50">
                    <p className="text-sm text-charcoal-medium">No community finds currently featured.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {communityOpportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className="rounded-xl border border-warm-border bg-warm-cream p-6 hover:border-charcoal-deep/30 hover:shadow-sm transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-medium text-charcoal-medium px-2 py-0.5 border border-warm-border rounded bg-warm-soft/40 flex items-center gap-1">
                                {getCategoryIcon(opp.category, "w-3.5 h-3.5")}
                                {opp.category}
                              </span>
                              {opp.status && (
                                <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                  opp.status.toLowerCase().includes("closed")
                                    ? "bg-rose-50/80 text-rose-700 border-rose-200/50"
                                    : "bg-emerald-50/80 text-emerald-700 border-emerald-200/50"
                                }`}>
                                  {opp.status}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-mono text-charcoal-light flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {opp.deadline === "Ongoing" || opp.deadline === "Rolling" ? "Rolling Submission" : `Ends ${opp.deadline}`}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-lg text-charcoal-deep leading-snug mt-2">
                            {opp.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-mono text-charcoal-medium mt-1">
                            <span>{opp.organization}</span>
                            {opp.sharedBy && (
                              <>
                                <span className="text-charcoal-light/40">•</span>
                                <span className="text-indigo-600 font-semibold text-[11px] flex items-center gap-0.5">
                                  💙 {opp.sharedBy}
                                </span>
                              </>
                            )}
                          </div>

                          <p className="text-xs text-charcoal-medium mt-3 leading-relaxed font-sans line-clamp-3">
                            {opp.description}
                          </p>

                          {/* Why featured preview */}
                          {opp.whyFeatured && (
                            <div className="mt-4 p-3 rounded-lg bg-warm-soft/40 border-l-2 border-charcoal-deep/40 text-xs italic text-charcoal-medium font-sans">
                              <span className="font-semibold block font-mono text-[10px] uppercase text-charcoal-light tracking-wide not-italic">Why it's featured:</span>
                              "{opp.whyFeatured}"
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1 mt-4">
                            {opp.tags.map((tag) => (
                              <span key={tag} className="text-[10px] font-mono text-charcoal-light px-2 py-0.5 rounded-full border border-warm-border/60 bg-warm-soft/30">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-warm-border/50 flex items-center justify-between">
                          <button
                            onClick={() => navigateTo(`#opportunity/${opp.id}`)}
                            className="text-xs font-semibold text-charcoal-deep hover:underline flex items-center gap-1.5 group focus-visible:outline-none"
                          >
                            Explore Details
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleBookmark(opp.id, opp.title)}
                              className="p-1.5 rounded-lg border border-warm-border text-charcoal-medium hover:text-charcoal-deep hover:bg-warm-soft"
                              aria-label={bookmarks.includes(opp.id) ? "Remove Bookmark" : "Save Bookmark"}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${bookmarks.includes(opp.id) ? "fill-current text-charcoal-deep" : ""}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>
          </div>
        )}

        {/* VIEW: READER UPDATES */}
        {route.view === "reader-updates" && (
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300">
            {/* Header section */}
            <div className="space-y-4 text-center max-w-3xl mx-auto">
              <span className="text-xs font-mono uppercase tracking-widest text-charcoal-light bg-warm-soft px-3 py-1.5 rounded-full border border-warm-border inline-block">
                Celebrating Community Wins
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-charcoal-deep">
                💙 Reader Updates
              </h1>
              <p className="text-sm text-charcoal-medium leading-relaxed">
                Celebrating developers in our community who discovered something valuable through Dev Opportunity Radar.
              </p>
            </div>

            {/* TL;DR Highlight Card */}
            <div className="max-w-4xl mx-auto">
              <section className="p-6 sm:p-8 rounded-2xl border border-warm-border bg-warm-soft/25 text-charcoal-deep space-y-4 relative overflow-hidden">
                <div className="flex items-center gap-2 border-b border-warm-border/60 pb-2">
                  <span className="text-xl">📌</span>
                  <h2 className="font-display text-sm uppercase tracking-wider font-extrabold text-charcoal-medium">
                    TL;DR
                  </h2>
                </div>
                <div className="text-sm text-charcoal-medium leading-relaxed font-sans space-y-4">
                  <p>
                    One of my favorite parts of Dev Opportunity Radar isn't publishing each Friday. It's hearing back from people who discovered an opportunity, applied, joined a community, started learning something new, or simply found a resource they didn't know existed.
                  </p>
                  <p className="font-medium text-charcoal-deep">
                    This page is where I celebrate those stories.
                  </p>
                </div>
              </section>
            </div>

            {/* Main Content Layout with Sticky Sidebar */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start max-w-6xl mx-auto">
              {/* Left side: Sticky Sidebar Table of Contents */}
              <aside className="hidden lg:block lg:col-span-4 sticky top-28 self-start space-y-6">
                <div className="p-6 rounded-2xl border border-warm-border bg-warm-cream shadow-sm space-y-4">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-light border-b border-warm-border pb-2">
                    Table of Contents
                  </h3>
                  <nav className="space-y-2" aria-label="Reader Updates Navigation">
                    <button
                      onClick={() => {
                        const el = document.getElementById("why-reader-updates-exist");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="w-full text-left flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-charcoal-medium hover:bg-warm-soft hover:text-charcoal-deep transition-all duration-200 group cursor-pointer"
                    >
                      <span className="text-charcoal-light/80 group-hover:scale-110 transition-transform">
                        <Heart className="w-4 h-4" />
                      </span>
                      <span className="font-medium group-hover:translate-x-0.5 transition-transform">
                        Why Reader Updates exist
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        const el = document.getElementById("featured-stories");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="w-full text-left flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-charcoal-medium hover:bg-warm-soft hover:text-charcoal-deep transition-all duration-200 group cursor-pointer"
                    >
                      <span className="text-charcoal-light/80 group-hover:scale-110 transition-transform">
                        <Award className="w-4 h-4" />
                      </span>
                      <span className="font-medium group-hover:translate-x-0.5 transition-transform">
                        Featured Stories
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        const el = document.getElementById("share-your-story");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="w-full text-left flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-charcoal-medium hover:bg-warm-soft hover:text-charcoal-deep transition-all duration-200 group cursor-pointer"
                    >
                      <span className="text-charcoal-light/80 group-hover:scale-110 transition-transform">
                        <Users className="w-4 h-4" />
                      </span>
                      <span className="font-medium group-hover:translate-x-0.5 transition-transform">
                        Share Your Story
                      </span>
                    </button>
                  </nav>
                </div>

                <div className="p-5 rounded-2xl border border-warm-border bg-warm-soft/20 text-center space-y-2">
                  <p className="text-xs text-charcoal-medium">
                    Have a story to share?
                  </p>
                  <button
                    onClick={() => {
                      const el = document.getElementById("share-your-story");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="text-xs font-semibold text-charcoal-deep underline hover:text-charcoal-light transition-all cursor-pointer"
                  >
                    Find out how to submit
                  </button>
                </div>
              </aside>

              {/* Right side: Sections Flow */}
              <div className="lg:col-span-8 w-full space-y-12">
                {/* Mobile Categories Jump List */}
                <section className="block lg:hidden p-5 rounded-2xl border border-warm-border bg-warm-cream space-y-3">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-light border-b border-warm-border pb-1.5">
                    Jump to Section
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        const el = document.getElementById("why-reader-updates-exist");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="text-left flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-xs text-charcoal-medium hover:bg-warm-soft cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 text-charcoal-light" />
                      <span className="font-medium">Why Reader Updates exist</span>
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById("featured-stories");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="text-left flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-xs text-charcoal-medium hover:bg-warm-soft cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-charcoal-light" />
                      <span className="font-medium">Featured Stories</span>
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById("share-your-story");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="text-left flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-xs text-charcoal-medium hover:bg-warm-soft cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-charcoal-light" />
                      <span className="font-medium">Share Your Story</span>
                    </button>
                  </div>
                </section>

                {/* Section 1: Why Reader Updates exist */}
                <article id="why-reader-updates-exist" className="scroll-mt-24 space-y-5 border-b border-warm-border/45 pb-10">
                  <div className="flex items-center gap-3 border-b border-warm-border pb-3">
                    <div className="p-2 rounded-lg bg-warm-soft border border-warm-border text-charcoal-deep">
                      <Heart className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-charcoal-deep">
                      Why Reader Updates exist
                    </h2>
                  </div>

                  <div className="space-y-4 text-sm sm:text-base text-charcoal-medium font-sans leading-relaxed">
                    <p>
                      When I started Dev Opportunity Radar, I had one simple goal: help people discover opportunities they otherwise might have missed.
                    </p>
                    <p>
                      Publishing a new edition every Friday is only one part of that journey. The part I enjoy the most happens afterwards, when someone reaches out to tell me they discovered an opportunity through the radar, decided to apply for something, joined a community, or finally started learning something they had been putting off.
                    </p>
                    <p className="font-medium text-charcoal-deep italic border-l-2 border-charcoal-light/30 pl-3">
                      Those moments remind me why I started this project in the first place.
                    </p>
                    <p>
                      I hope this page slowly grows into a collection of those stories. Not because every story needs to end with someone receiving a grant or getting accepted into a fellowship, but because every step forward is worth celebrating. Sometimes simply finding the right opportunity at the right time is already a win.
                    </p>
                  </div>
                </article>

                {/* Section 2: Featured Stories Accordion */}
                <article id="featured-stories" className="scroll-mt-24 space-y-5 border-b border-warm-border/45 pb-10">
                  <div className="flex items-center gap-3 border-b border-warm-border pb-3">
                    <div className="p-2 rounded-lg bg-warm-soft border border-warm-border text-charcoal-deep">
                      <Award className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-charcoal-deep">
                      Featured Stories
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Story 1: Daniel Nwaneri */}
                    <div className="border border-warm-border rounded-xl bg-warm-cream overflow-hidden hover:border-charcoal-deep/25 hover:shadow-sm transition-all duration-200">
                      <button
                        onClick={() => setExpandedStories(prev => ({ ...prev, "daniel-nwaneri": !prev["daniel-nwaneri"] }))}
                        className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-warm-soft/20 focus:outline-none transition-colors cursor-pointer"
                      >
                        <div className="space-y-1">
                          <h3 className="font-display font-bold text-sm sm:text-base text-charcoal-deep">
                            Daniel Nwaneri
                          </h3>
                          <p className="text-xs text-charcoal-light font-mono">
                            Applied to FR8 Residency (Edition #2)
                          </p>
                        </div>
                        <span
                          className={`p-1 rounded-full bg-warm-soft shrink-0 transition-all duration-300 ${
                            expandedStories["daniel-nwaneri"]
                              ? "rotate-180 bg-charcoal-deep text-warm-cream"
                              : "text-charcoal-medium"
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </span>
                      </button>

                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          expandedStories["daniel-nwaneri"]
                            ? "max-h-[1000px] border-t border-warm-border/50 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-5 sm:p-6 bg-warm-cream text-xs sm:text-sm text-charcoal-medium font-sans leading-relaxed space-y-4">
                          <p>
                            One of the very first Reader Updates came from Daniel Nwaneri.
                          </p>
                          <p>
                            After reading Edition #2, Daniel shared that he had discovered the FR8 Residency through Dev Opportunity Radar and decided to apply that very same day.
                          </p>
                          <p className="font-medium text-charcoal-deep italic">
                            Reading that genuinely made my week.
                          </p>
                          <p>
                            Daniel also shared something that has stayed with me ever since. He said the series doesn't just collect links, it explains why an opportunity is worth paying attention to.
                          </p>
                          <p>
                            That meant a lot because it's exactly what I've always hoped this series would do.
                          </p>
                          <p>
                            There are already plenty of places that list opportunities. My goal has never been to collect the biggest list. Instead, I want to provide enough context that you can quickly decide whether something is actually worth your time.
                          </p>
                          <p className="font-semibold text-charcoal-deep pt-2 border-t border-warm-border/40">
                            Thank you again, Daniel, for sharing your experience and for allowing me to feature it here. I'm wishing you all the very best with your application and wherever your journey takes you next. 💙
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Story 2: More stories are on the way... */}
                    <div className="border border-warm-border rounded-xl bg-warm-cream overflow-hidden hover:border-charcoal-deep/25 hover:shadow-sm transition-all duration-200">
                      <button
                        onClick={() => setExpandedStories(prev => ({ ...prev, "more-stories": !prev["more-stories"] }))}
                        className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-warm-soft/20 focus:outline-none transition-colors cursor-pointer"
                      >
                        <div className="space-y-1">
                          <h3 className="font-display font-bold text-sm sm:text-base text-charcoal-deep">
                            More stories are on the way...
                          </h3>
                          <p className="text-xs text-charcoal-light font-mono">
                            Future Community Updates
                          </p>
                        </div>
                        <span
                          className={`p-1 rounded-full bg-warm-soft shrink-0 transition-all duration-300 ${
                            expandedStories["more-stories"]
                              ? "rotate-180 bg-charcoal-deep text-warm-cream"
                              : "text-charcoal-medium"
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </span>
                      </button>

                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          expandedStories["more-stories"]
                            ? "max-h-[800px] border-t border-warm-border/50 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-5 sm:p-6 bg-warm-cream text-xs sm:text-sm text-charcoal-medium font-sans leading-relaxed space-y-4">
                          <p>
                            There are already a few more Reader Updates that I'd love to feature here in the future.
                          </p>
                          <p>
                            Some readers have shared that they discovered opportunities through Dev Opportunity Radar and even applied after reading an edition. Messages like those genuinely make me smile because they're exactly why this project exists.
                          </p>
                          <p>
                            Before featuring anyone's story here, though, I always ask for permission first. I think people should have complete control over whether their experience is shared, and I want this page to be something the community feels comfortable being part of.
                          </p>
                          <p>
                            As more readers say yes, this page will continue to grow, one story at a time.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Section 3: Share Your Story */}
                <article id="share-your-story" className="scroll-mt-24 space-y-5">
                  <div className="flex items-center gap-3 border-b border-warm-border pb-3">
                    <div className="p-2 rounded-lg bg-warm-soft border border-warm-border text-charcoal-deep">
                      <Users className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-charcoal-deep">
                      Share Your Story
                    </h2>
                  </div>

                  <div className="space-y-4 text-sm sm:text-base text-charcoal-medium font-sans leading-relaxed">
                    <p>
                      If you've discovered something through Dev Opportunity Radar, I'd genuinely love to hear about it.
                    </p>
                    <p>
                      You don't need to have been accepted into a fellowship, won a grant, or achieved something huge. Maybe you applied. Maybe you joined a community. Maybe you started a course. Or maybe you simply discovered something you otherwise would have missed. Those moments matter too, and I'd love to celebrate them with you.
                    </p>
                    <div className="p-6 sm:p-8 rounded-2xl border border-warm-border bg-warm-cream shadow-xs my-6 space-y-4">
                      <h4 className="font-display font-bold text-sm text-charcoal-deep flex items-center gap-2">
                        <span>💬</span> How to get in touch:
                      </h4>
                      <p className="text-sm leading-relaxed">
                        The easiest way to share an update is by leaving a comment under the latest edition on {renderFormattedText("[DEV](https://dev.to/hemapriya_kanagala)")} or sending me a message on {renderFormattedText("[LinkedIn](https://www.linkedin.com/in/hemapriya-kanagala/)")}.
                      </p>
                    </div>
                    <p>
                      If you're happy for me to feature your story here, I'll always ask for your permission first.
                    </p>
                    <p className="font-semibold text-charcoal-deep italic pt-2">
                      My hope is that, over time, this page becomes a celebration of the community and the opportunities we've discovered together. 💙
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: MY PHILOSOPHY */}
        {route.view === "philosophy" && (
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="space-y-6 text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-mono uppercase tracking-widest text-charcoal-light bg-warm-soft px-3 py-1.5 rounded-full border border-warm-border inline-block">
                Curation Manifesto
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-charcoal-deep">
                {PHILOSOPHY.title}
              </h1>
              
              {/* Living Document Callout */}
              <div className="relative p-6 sm:p-8 rounded-2xl border border-warm-border bg-warm-soft/30 italic text-charcoal-deep font-sans text-base max-w-2xl mx-auto leading-relaxed shadow-sm">
                <span className="absolute -top-3 left-6 px-3 bg-warm-cream text-[10px] font-mono uppercase tracking-wider text-charcoal-medium border border-warm-border rounded-md">
                  Living Document
                </span>
                <p>
                  "{PHILOSOPHY.livingDocumentQuote}"
                </p>
                <p className="text-xs font-mono text-charcoal-light mt-3 not-italic">— Hemapriya Kanagala</p>
              </div>
            </div>

            {/* Main Content Layout with Sticky Sidebar on Desktop */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
              
              {/* Sidebar: Table of Contents */}
              <aside className="hidden lg:block lg:col-span-4 sticky top-28 self-start space-y-6">
                <div className="p-6 rounded-2xl border border-warm-border bg-warm-cream shadow-sm space-y-4">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-light border-b border-warm-border pb-2">
                    Table of Contents
                  </h3>
                  <nav className="space-y-2" aria-label="Philosophy Table of Contents">
                    {PHILOSOPHY.principles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          const el = document.getElementById(p.id);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                        className="w-full text-left flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-charcoal-medium hover:bg-warm-soft hover:text-charcoal-deep transition-all duration-200 group cursor-pointer"
                      >
                        <span className="font-mono text-xs text-charcoal-light/60 group-hover:text-charcoal-deep">
                          {p.number}
                        </span>
                        <span className="font-medium group-hover:translate-x-0.5 transition-transform">
                          {p.title}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>
                
                <div className="p-5 rounded-2xl border border-warm-border bg-warm-soft/20 text-center space-y-2">
                  <p className="text-xs text-charcoal-medium">
                    Do you have suggestions or feedback?
                  </p>
                  <button
                    onClick={() => navigateTo("#contact")}
                    className="text-xs font-semibold text-charcoal-deep underline hover:text-charcoal-light transition-all cursor-pointer"
                  >
                    Contact Hemapriya
                  </button>
                </div>
              </aside>

              {/* Main Reading Flow */}
              <div className="lg:col-span-8 space-y-12">
                
                {/* TL;DR Highlight Card */}
                <section className="p-6 sm:p-8 rounded-2xl border-2 border-charcoal-deep bg-warm-cream shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📌</span>
                    <h2 className="font-display text-lg font-extrabold text-charcoal-deep uppercase tracking-wide">
                      TL;DR
                    </h2>
                  </div>
                  <p className="font-display text-base sm:text-lg font-bold text-charcoal-deep leading-relaxed">
                    {PHILOSOPHY.tldr.heading}
                  </p>
                  <p className="text-sm text-charcoal-medium leading-relaxed font-sans">
                    {PHILOSOPHY.tldr.content}
                  </p>
                </section>

                {/* Mobile Table of Contents */}
                <section className="block lg:hidden p-5 rounded-2xl border border-warm-border bg-warm-cream space-y-3">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-light border-b border-warm-border pb-1.5">
                    Jump to Principle
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PHILOSOPHY.principles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          const el = document.getElementById(p.id);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                        className="text-left flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-xs text-charcoal-medium hover:bg-warm-soft cursor-pointer"
                      >
                        <span className="font-mono text-[10px] text-charcoal-light">{p.number}</span>
                        <span className="font-medium line-clamp-1">{p.title}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* The 10 Principles */}
                <div className="space-y-12">
                  {PHILOSOPHY.principles.map((p) => (
                    <article
                      key={p.id}
                      id={p.id}
                      className="scroll-mt-24 p-6 sm:p-10 rounded-2xl border border-warm-border bg-warm-cream shadow-sm hover:border-charcoal-deep/20 hover:shadow-md transition-all duration-300 space-y-6"
                    >
                      {/* Principle Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-warm-soft border border-warm-border text-charcoal-deep">
                              {getPhilosophyIcon(p.iconName, "w-5 h-5")}
                            </div>
                            <span className="text-xs font-mono tracking-widest text-charcoal-light uppercase">
                              Principle {p.number}
                            </span>
                          </div>
                          <h3 className="font-display text-xl sm:text-2xl font-extrabold text-charcoal-deep tracking-tight pt-1">
                            {p.title}
                          </h3>
                        </div>
                        <span className="text-4xl sm:text-5xl font-display font-black text-charcoal-light/10 select-none">
                          {p.number}
                        </span>
                      </div>

                      {/* Subtitle/Key Sentence */}
                      {p.subtitle && (
                        <p className="font-display font-semibold text-charcoal-deep text-sm sm:text-base border-l-2 border-charcoal-deep/30 pl-3">
                          {p.subtitle}
                        </p>
                      )}

                      {/* Paragraphs */}
                      <div className="space-y-4 text-sm text-charcoal-medium font-sans leading-relaxed">
                        {p.paragraphs.map((para, idx) => (
                          <p key={idx}>{para}</p>
                        ))}
                      </div>

                      {/* Quote block if exists */}
                      {p.quote && (
                        <div className="p-4 sm:p-5 rounded-r-xl border-l-4 border-charcoal-deep bg-warm-soft/40 italic text-charcoal-deep text-sm font-sans leading-relaxed">
                          "{p.quote}"
                        </div>
                      )}

                      {/* Additional Paragraphs (for Keep Improving section) */}
                      {"additionalParagraphs" in p && p.additionalParagraphs && (
                        <div className="space-y-4 text-sm text-charcoal-medium font-sans leading-relaxed pt-2">
                          {(p.additionalParagraphs as string[]).map((para, idx) => (
                            <p key={idx}>{para}</p>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>

                {/* Back to Directory Callout */}
                <div className="pt-6 text-center border-t border-warm-border/60">
                  <p className="text-xs text-charcoal-light font-mono uppercase tracking-wider mb-4">
                    Thank you for reading the manifesto
                  </p>
                  <button
                    onClick={() => navigateTo("#opportunities")}
                    className="px-6 py-3 rounded-xl bg-charcoal-deep text-warm-cream text-sm font-semibold hover:bg-opacity-90 transition-all duration-200 inline-flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    Go to Opportunity Directory
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* VIEW: ABOUT */}
        {route.view === "about" && (() => {
          const getCategoryId = (title: string) => {
            return title.replace(/[^\w\s-]/g, "").trim().toLowerCase().replace(/\s+/g, "-");
          };

          const getAboutSectionIcon = (iconName: string, className = "w-4 h-4") => {
            switch (iconName) {
              case "Heart": return <Heart className={className} />;
              case "History": return <History className={className} />;
              case "Globe": return <Globe className={className} />;
              case "Users": return <Users className={className} />;
              case "PenTool": return <PenTool className={className} />;
              case "Compass": return <Compass className={className} />;
              case "Gift": return <Gift className={className} />;
              default: return <Sparkles className={className} />;
            }
          };

          return (
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300">
              {/* Header section */}
              <div className="space-y-4 text-center max-w-3xl mx-auto">
                <span className="text-xs font-mono uppercase tracking-widest text-charcoal-light bg-warm-soft px-3 py-1.5 rounded-full border border-warm-border inline-block">
                  The Story Behind the Radar
                </span>
                <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-charcoal-deep">
                  About Dev Opportunity Radar
                </h1>
                <p className="text-sm text-charcoal-medium leading-relaxed">
                  How a single weekly share grew into a community project to help developers find hidden pathways to growth.
                </p>
              </div>

              {/* TL;DR Highlight Card */}
              <div className="max-w-4xl mx-auto">
                <section className="p-6 sm:p-8 rounded-2xl border border-warm-border bg-warm-soft/25 text-charcoal-deep space-y-5 relative overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-warm-border/60 pb-2">
                    <span className="text-xl">📌</span>
                    <h2 className="font-display text-sm uppercase tracking-wider font-extrabold text-charcoal-medium">
                      {ABOUT_CONTENT.tldr.heading}
                    </h2>
                  </div>
                  <div className="text-sm text-charcoal-medium leading-relaxed font-sans space-y-4">
                    {ABOUT_CONTENT.tldr.paragraphs.map((para, idx) => (
                      <p key={idx}>{renderFormattedText(para)}</p>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-warm-border/40">
                    <div className="p-4 sm:p-5 rounded-xl border-l-4 border-charcoal-deep bg-warm-cream text-sm italic font-sans text-charcoal-deep leading-relaxed">
                      <strong>Mission:</strong> <em>{ABOUT_CONTENT.tldr.mission}</em>
                    </div>
                  </div>
                </section>
              </div>

              {/* Main Content Layout with Sticky Sidebar */}
              <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start max-w-6xl mx-auto">
                {/* Left side: Sticky Sidebar Table of Contents */}
                <aside className="hidden lg:block lg:col-span-4 sticky top-28 self-start space-y-6">
                  <div className="p-6 rounded-2xl border border-warm-border bg-warm-cream shadow-sm space-y-4">
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-light border-b border-warm-border pb-2">
                      Table of Contents
                    </h3>
                    <nav className="space-y-2" aria-label="About Page Navigation">
                      {ABOUT_CONTENT.sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => {
                            const el = document.getElementById(getCategoryId(section.title));
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                          }}
                          className="w-full text-left flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-charcoal-medium hover:bg-warm-soft hover:text-charcoal-deep transition-all duration-200 group cursor-pointer"
                        >
                          <span className="text-charcoal-light/80 group-hover:scale-110 transition-transform">
                            {getAboutSectionIcon(section.iconName, "w-4 h-4")}
                          </span>
                          <span className="font-medium group-hover:translate-x-0.5 transition-transform">
                            {section.title}
                          </span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="p-5 rounded-2xl border border-warm-border bg-warm-soft/20 text-center space-y-2">
                    <p className="text-xs text-charcoal-medium">
                      Want to see the active listings?
                    </p>
                    <button
                      onClick={() => navigateTo("#opportunities")}
                      className="text-xs font-semibold text-charcoal-deep underline hover:text-charcoal-light transition-all cursor-pointer"
                    >
                      Browse Opportunity Directory
                    </button>
                  </div>
                </aside>

                {/* Right side: Sections Flow */}
                <div className="lg:col-span-8 w-full space-y-12">
                  {/* Mobile Categories Jump List */}
                  <section className="block lg:hidden p-5 rounded-2xl border border-warm-border bg-warm-cream space-y-3">
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-light border-b border-warm-border pb-1.5">
                      Jump to Section
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ABOUT_CONTENT.sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => {
                            const el = document.getElementById(getCategoryId(section.title));
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                          }}
                          className="text-left flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-xs text-charcoal-medium hover:bg-warm-soft cursor-pointer"
                        >
                          <span className="text-charcoal-light">{getAboutSectionIcon(section.iconName, "w-3.5 h-3.5")}</span>
                          <span className="font-medium line-clamp-1">{section.title}</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Render each section */}
                  {ABOUT_CONTENT.sections.map((section) => (
                    <article
                      key={section.id}
                      id={getCategoryId(section.title)}
                      className="scroll-mt-24 space-y-5 border-b border-warm-border/45 pb-10 last:border-0 last:pb-0"
                    >
                      {/* Section Header */}
                      <div className="flex items-center gap-3 border-b border-warm-border pb-3">
                        <div className="p-2 rounded-lg bg-warm-soft border border-warm-border text-charcoal-deep">
                          {getAboutSectionIcon(section.iconName, "w-5 h-5")}
                        </div>
                        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-charcoal-deep">
                          {section.title}
                        </h2>
                      </div>

                      {/* Paragraphs Before */}
                      <div className="space-y-4 text-sm sm:text-base text-charcoal-medium font-sans leading-relaxed">
                        {section.paragraphsBefore.map((para, idx) => (
                          <p key={idx}>{renderFormattedText(para)}</p>
                        ))}
                      </div>

                      {/* Custom Quote (Welcome Page Goals etc.) */}
                      {section.quote && (
                        <div className="p-4 sm:p-5 rounded-r-xl border-l-4 border-charcoal-deep bg-warm-soft/40 italic text-charcoal-deep text-sm font-sans leading-relaxed my-4">
                          "{section.quote}"
                        </div>
                      )}

                      {/* List Items if any */}
                      {section.listItems && (
                        <ul className="space-y-3 pl-1 my-4" role="list">
                          {section.listItems.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-charcoal-medium">
                              <span className="p-1 rounded-full bg-warm-soft text-charcoal-deep shrink-0 mt-0.5">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                              <span>{renderFormattedText(item)}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Paragraphs After */}
                      {section.paragraphsAfter && (
                        <div className="space-y-4 text-sm sm:text-base text-charcoal-medium font-sans leading-relaxed pt-2">
                          {section.paragraphsAfter.map((para, idx) => (
                            <p key={idx}>{renderFormattedText(para)}</p>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}

                  {/* Concluding Back-to-Directory Action callout */}
                  <div className="pt-6 text-center border-t border-warm-border/60">
                    <p className="text-xs text-charcoal-light font-mono uppercase tracking-wider mb-4">
                      Thank you for reading our story
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <button
                        onClick={() => navigateTo("#opportunities")}
                        className="px-6 py-3 rounded-xl bg-charcoal-deep text-warm-cream text-sm font-semibold hover:bg-opacity-90 transition-all duration-200 inline-flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        Go to Opportunity Directory
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigateTo("#contact")}
                        className="px-6 py-3 rounded-xl border border-warm-border bg-warm-cream text-charcoal-deep text-sm font-semibold hover:bg-warm-soft transition-all duration-200 inline-flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        Contact Hemapriya
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* VIEW: FAQ */}
        {route.view === "faq" && (() => {
          // Helper for category ID
          const getCategoryId = (cat: string) => {
            return cat.replace(/[^\w\s-]/g, "").trim().toLowerCase().replace(/\s+/g, "-");
          };

          // Helper for category icon
          const getFAQCategoryIcon = (categoryName: string, className = "w-4 h-4") => {
            if (categoryName.includes("Started")) return <Sprout className={className} />;
            if (categoryName.includes("Opportunities")) return <Search className={className} />;
            if (categoryName.includes("Community") && !categoryName.includes("Welcoming")) return <Users className={className} />;
            if (categoryName.includes("Project")) return <HelpCircle className={className} />;
            if (categoryName.includes("Ahead")) return <Rocket className={className} />;
            if (categoryName.includes("Welcoming")) return <Smile className={className} />;
            return <HelpCircle className={className} />;
          };

          // Group FAQS
          const groupedFaqs = FAQS.reduce<Record<string, typeof FAQS>>((acc, faq) => {
            if (!acc[faq.category]) {
              acc[faq.category] = [];
            }
            acc[faq.category].push(faq);
            return acc;
          }, {});

          // Filter FAQS for search
          const activeSearch = faqSearch.trim().toLowerCase();
          const filteredFaqs = activeSearch
            ? FAQS.filter(
                (faq) =>
                  faq.question.toLowerCase().includes(activeSearch) ||
                  faq.answer.toLowerCase().includes(activeSearch)
              )
            : [];

          const toggleFaq = (question: string) => {
            setExpandedFaqs((prev) => ({
              ...prev,
              [question]: !prev[question],
            }));
          };

          return (
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300">
              {/* Header section */}
              <div className="space-y-4 text-center max-w-3xl mx-auto">
                <span className="text-xs font-mono uppercase tracking-widest text-charcoal-light bg-warm-soft px-3 py-1.5 rounded-full border border-warm-border inline-block">
                  Answers to Common Queries
                </span>
                <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-charcoal-deep">
                  Frequently Asked Questions
                </h1>
                <p className="text-sm text-charcoal-medium leading-relaxed">
                  Everything you might want to know about how the radar works, our curation criteria, and how to get involved.
                </p>
              </div>

              {/* TL;DR Highlight Card */}
              <div className="max-w-4xl mx-auto">
                <section className="p-6 sm:p-8 rounded-2xl border border-warm-border bg-warm-soft/25 text-charcoal-deep space-y-4 relative overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-warm-border/60 pb-2">
                    <span className="text-xl">📌</span>
                    <h2 className="font-display text-sm uppercase tracking-wider font-extrabold text-charcoal-medium">
                      {FAQ_TLDR.heading}
                    </h2>
                  </div>
                  <div className="text-sm text-charcoal-medium leading-relaxed font-sans italic space-y-3">
                    {FAQ_TLDR.content.split("\n\n").map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </section>
              </div>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto relative">
                <label htmlFor="faq-search-input" className="sr-only">Search FAQ</label>
                <div className="relative">
                  <input
                    id="faq-faq-search-input"
                    type="text"
                    placeholder="Search questions or keywords..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 rounded-xl border border-warm-border bg-warm-cream focus:outline-none focus:ring-2 focus:ring-charcoal-deep/15 focus:border-charcoal-deep text-sm transition-all"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                  {faqSearch && (
                    <button
                      onClick={() => setFaqSearch("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-charcoal-deep text-xs font-mono font-medium focus:outline-none cursor-pointer"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start max-w-6xl mx-auto">
                {/* Left side: Sticky Navigation Menu (only visible when not searching) */}
                {!faqSearch.trim() ? (
                  <aside className="hidden lg:block lg:col-span-4 sticky top-28 self-start space-y-6">
                    <div className="p-6 rounded-2xl border border-warm-border bg-warm-cream shadow-sm space-y-4">
                      <h3 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-light border-b border-warm-border pb-2">
                        Table of Contents
                      </h3>
                      <nav className="space-y-2" aria-label="FAQ Categories Navigation">
                        {Object.keys(groupedFaqs).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              const el = document.getElementById(getCategoryId(cat));
                              if (el) {
                                el.scrollIntoView({ behavior: "smooth", block: "start" });
                              }
                            }}
                            className="w-full text-left flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-charcoal-medium hover:bg-warm-soft hover:text-charcoal-deep transition-all duration-200 group cursor-pointer"
                          >
                            <span className="text-charcoal-light/80 group-hover:scale-110 transition-transform">
                              {getFAQCategoryIcon(cat, "w-4 h-4")}
                            </span>
                            <span className="font-medium group-hover:translate-x-0.5 transition-transform line-clamp-1">
                              {cat}
                            </span>
                          </button>
                        ))}
                      </nav>
                    </div>

                    <div className="p-5 rounded-2xl border border-warm-border bg-warm-soft/20 text-center space-y-2">
                      <p className="text-xs text-charcoal-medium">
                        Still have any questions left?
                      </p>
                      <button
                        onClick={() => navigateTo("#contact")}
                        className="text-xs font-semibold text-charcoal-deep underline hover:text-charcoal-light transition-all cursor-pointer"
                      >
                        Contact Curator
                      </button>
                    </div>
                  </aside>
                ) : null}

                {/* Right side: Questions Flow */}
                <div className={`${faqSearch.trim() ? "lg:col-span-12 max-w-4xl mx-auto" : "lg:col-span-8"} w-full space-y-12`}>
                  {faqSearch.trim() ? (
                    // Search Results View
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-warm-border pb-4">
                        <h2 className="font-display text-lg font-bold text-charcoal-deep">
                          Search Results ({filteredFaqs.length})
                        </h2>
                        <button
                          onClick={() => setFaqSearch("")}
                          className="text-xs font-mono font-semibold text-charcoal-medium hover:text-charcoal-deep transition-colors cursor-pointer"
                        >
                          Show All Categories
                        </button>
                      </div>

                      {filteredFaqs.length === 0 ? (
                        <div className="text-center py-12 px-4 border border-dashed border-warm-border rounded-xl">
                          <HelpCircle className="w-8 h-8 text-charcoal-light mx-auto mb-2" />
                          <p className="text-sm text-charcoal-medium font-semibold">No questions matched your search.</p>
                          <p className="text-xs text-charcoal-light mt-1">Try using other keywords, or view all categories.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredFaqs.map((faq) => {
                            return (
                              <div
                                key={faq.question}
                                className="border border-warm-border rounded-xl bg-warm-cream overflow-hidden shadow-sm"
                              >
                                <div className="w-full text-left p-5 flex items-center justify-between gap-4 font-display font-bold text-sm sm:text-base text-charcoal-deep border-b border-warm-border/50 bg-warm-soft/10">
                                  <span>{faq.question}</span>
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-light bg-warm-soft px-2 py-0.5 rounded border border-warm-border">
                                    {faq.category}
                                  </span>
                                </div>
                                <div className="p-5 sm:p-6 bg-warm-cream text-xs sm:text-sm text-charcoal-medium font-sans leading-relaxed space-y-3">
                                  {faq.answer.split("\n\n").map((para, idx) => (
                                    <p key={idx}>{para}</p>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Grouped Categories View
                    <div className="space-y-12">
                      {/* Mobile Categories Jump List */}
                      <section className="block lg:hidden p-5 rounded-2xl border border-warm-border bg-warm-cream space-y-3">
                        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-charcoal-light border-b border-warm-border pb-1.5">
                          Jump to Section
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.keys(groupedFaqs).map((cat) => (
                            <button
                              key={cat}
                              onClick={() => {
                                const el = document.getElementById(getCategoryId(cat));
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                                }
                              }}
                              className="text-left flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-xs text-charcoal-medium hover:bg-warm-soft cursor-pointer"
                            >
                              <span className="text-charcoal-light">{getFAQCategoryIcon(cat, "w-3.5 h-3.5")}</span>
                              <span className="font-medium line-clamp-1">{cat}</span>
                            </button>
                          ))}
                        </div>
                      </section>

                      {/* Render each category group */}
                      {Object.entries(groupedFaqs).map(([category, items]) => (
                        <section
                          key={category}
                          id={getCategoryId(category)}
                          className="scroll-mt-24 space-y-5"
                        >
                          {/* Category Header */}
                          <div className="flex items-center gap-3 border-b border-warm-border pb-3">
                            <div className="p-2 rounded-lg bg-warm-soft border border-warm-border text-charcoal-deep">
                              {getFAQCategoryIcon(category, "w-5 h-5")}
                            </div>
                            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-charcoal-deep">
                              {category}
                            </h2>
                          </div>

                          {/* Accordion List */}
                          <div className="space-y-3">
                            {items.map((faq) => {
                              const isExpanded = !!expandedFaqs[faq.question];
                              return (
                                <div
                                  key={faq.question}
                                  className="border border-warm-border rounded-xl bg-warm-cream overflow-hidden hover:border-charcoal-deep/25 hover:shadow-sm transition-all duration-200"
                                >
                                  <button
                                    onClick={() => toggleFaq(faq.question)}
                                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-display font-bold text-sm sm:text-base text-charcoal-deep hover:bg-warm-soft/20 focus:outline-none transition-colors cursor-pointer"
                                  >
                                    <span>{faq.question}</span>
                                    <span
                                      className={`p-1 rounded-full bg-warm-soft shrink-0 transition-all duration-300 ${
                                        isExpanded
                                          ? "rotate-180 bg-charcoal-deep text-warm-cream"
                                          : "text-charcoal-medium"
                                      }`}
                                    >
                                      <ChevronDown className="w-4 h-4" />
                                    </span>
                                  </button>

                                  <div
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                      isExpanded
                                        ? "max-h-[800px] border-t border-warm-border/50 opacity-100"
                                        : "max-h-0 opacity-0"
                                    }`}
                                  >
                                    <div className="p-5 sm:p-6 bg-warm-cream text-xs sm:text-sm text-charcoal-medium font-sans leading-relaxed space-y-3">
                                      {faq.answer.split("\n\n").map((para, idx) => (
                                        <p key={idx}>{para}</p>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      ))}
                    </div>
                  )}

                  {/* Closing Section */}
                  <div className="pt-8 border-t border-warm-border/60">
                    <section className="p-6 sm:p-8 rounded-2xl border border-charcoal-deep/20 bg-warm-cream shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-warm-border/60 pb-3">
                        <span className="text-lg">💙</span>
                        <h2 className="font-display text-lg font-bold text-charcoal-deep">
                          {FAQ_CLOSING.title}
                        </h2>
                      </div>
                      <div className="text-sm text-charcoal-medium leading-relaxed font-sans space-y-4">
                        {FAQ_CLOSING.content.split("\n\n").map((para, idx) => {
                          if (para.includes("**If you take away one thing")) {
                            return (
                              <p key={idx} className="font-bold text-charcoal-deep border-l-2 border-charcoal-deep/30 pl-3 italic">
                                If you take away one thing from this website, I hope it's this: opportunities are meant to be shared.
                              </p>
                            );
                          }
                          return <p key={idx}>{para}</p>;
                        })}
                      </div>
                    </section>
                  </div>

                  {/* Still have questions footer callout */}
                  <div className="p-6 rounded-2xl border border-warm-border bg-warm-soft/40 text-center space-y-2 max-w-xl mx-auto mt-6">
                    <h3 className="font-display font-semibold text-charcoal-deep">Have another question?</h3>
                    <p className="text-xs text-charcoal-medium">
                      Please get in touch directly. I'd love to chat and clarify anything.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => navigateTo("#contact")}
                        className="px-4 py-2 rounded-lg bg-charcoal-deep text-warm-cream text-xs font-semibold hover:bg-opacity-90 transition-all cursor-pointer"
                      >
                        Contact Curator
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* VIEW: CREATOR CONSOLE */}
        {route.view === "creator-console" && (
          !isAdminAuthorized ? (
            <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8 animate-in fade-in duration-300">
              <div className="rounded-2xl border border-warm-border bg-warm-cream p-8 shadow-sm space-y-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <Lock className="h-6 w-6" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold text-charcoal-deep">Restricted Curation Space</h2>
                  <p className="text-xs sm:text-sm text-charcoal-medium leading-relaxed">
                    <strong>Double-Factor Verification Active:</strong> To prevent unauthorized modifications, please enter your secure curator passcode and registered curator email.
                  </p>
                </div>

                 <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    
                    const trimmedPin = enteredPin.trim();
                    const trimmedEmail = enteredEmail.trim().toLowerCase();

                    try {
                      const response = await fetch("/api/verify-admin", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          pin: trimmedPin,
                          email: trimmedEmail,
                        }),
                      });

                      const data = await response.json();

                      if (response.ok && data.success) {
                        setIsAdminAuthorized(true);
                        try {
                          sessionStorage.setItem("dor_admin_authorized", "true");
                        } catch (err) {}
                        showToast("Authentication successful! Welcome back, Curator.", "success");
                        setEnteredPin("");
                        setEnteredEmail("");
                        setPinError("");
                      } else {
                        setPinError(data.error || "Incorrect passcode or unregistered email address. Access denied.");
                        showToast("Invalid credentials. Curation space locked.", "warning");
                      }
                    } catch (err) {
                      setPinError("Server verification failed. Please try again later.");
                      showToast("Unable to connect to security server.", "warning");
                    }
                  }}
                  className="space-y-4 text-left"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal-deep">Secure Curator PIN</label>
                    <input
                      type="password"
                      maxLength={10}
                      value={enteredPin}
                      onChange={(e) => {
                        setEnteredPin(e.target.value);
                        if (pinError) setPinError("");
                      }}
                      placeholder="Enter secure passcode"
                      className="w-full text-center tracking-widest font-mono font-bold text-lg px-4 py-2.5 rounded-xl border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal-deep">Registered Curation Email</label>
                    <input
                      type="email"
                      value={enteredEmail}
                      onChange={(e) => {
                        setEnteredEmail(e.target.value);
                        if (pinError) setPinError("");
                      }}
                      placeholder="e.g. curator@domain.com"
                      className="w-full text-sm font-sans px-4 py-2.5 rounded-xl border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                      required
                    />
                  </div>

                  {pinError && (
                    <p className="text-xs text-red-600 mt-2 font-medium flex items-center justify-center gap-1 bg-red-50 p-2 rounded border border-red-100 leading-tight">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{pinError}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-charcoal-deep text-warm-cream font-semibold rounded-xl hover:bg-opacity-95 transition-all text-xs"
                  >
                    Verify Double Credentials
                  </button>
                </form>


              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300">
              {/* Header section */}
              <div className="space-y-4 text-center max-w-3xl mx-auto">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 inline-block">
                  ⚡ Interactive Admin Panel
                </span>
                <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-charcoal-deep">
                  Curator's Control Console
                </h1>
                <p className="text-sm text-charcoal-medium leading-relaxed max-w-lg mx-auto">
                  No manual code editing required. Dynamically update active weekly editions, edit deadlines or links, or release new opportunities with instant site-wide synchronisation.
                </p>
                <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsAdminAuthorized(false);
                      try {
                        sessionStorage.removeItem("dor_admin_authorized");
                      } catch (err) {}
                      navigateTo("#");
                      showToast("Curation session securely closed.", "info");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-200 rounded-lg bg-amber-50/50 hover:bg-amber-50 text-xs font-semibold text-amber-800 hover:text-amber-900 transition-all shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Lock Console & Sign Out
                  </button>

                  <button
                    onClick={() => {
                      setIsSafeguardActive(!isSafeguardActive);
                      showToast(
                        !isSafeguardActive
                          ? "Curation Safeguard enabled. Double-safety verification required for database writes."
                          : "Curation Safeguard disabled. Changes will commit immediately.",
                        !isSafeguardActive ? "success" : "warning"
                      );
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all shadow-xs ${
                      isSafeguardActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        : "border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Safeguard: {isSafeguardActive ? "ON (Double Safety)" : "OFF (Danger Mode)"}
                  </button>
                </div>
              </div>

            {/* Tab Switched Navigation */}
            <div className="flex border-b border-warm-border max-w-lg mx-auto justify-center gap-1 sm:gap-2">
              <button
                onClick={() => setConsoleTab("dashboard")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
                  consoleTab === "dashboard"
                    ? "border-charcoal-deep text-charcoal-deep font-semibold"
                    : "border-transparent text-charcoal-light hover:text-charcoal-deep"
                }`}
              >
                Dashboard & Settings
              </button>
              <button
                onClick={() => setConsoleTab("opportunities")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
                  consoleTab === "opportunities"
                    ? "border-charcoal-deep text-charcoal-deep font-semibold"
                    : "border-transparent text-charcoal-light hover:text-charcoal-deep"
                }`}
              >
                Manage Opportunities ({opportunities.length})
              </button>
              <button
                onClick={() => setConsoleTab("editions")}
                className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
                  consoleTab === "editions"
                    ? "border-charcoal-deep text-charcoal-deep font-semibold"
                    : "border-transparent text-charcoal-light hover:text-charcoal-deep"
                }`}
              >
                Weekly Editions ({editions.length})
              </button>
            </div>

            {/* TAB CONTENT: DASHBOARD */}
            {consoleTab === "dashboard" && (
              <div className="space-y-8">
                {/* Bento Grid Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stats 1 */}
                  <div className="p-6 rounded-2xl border border-warm-border bg-warm-cream flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase text-charcoal-light font-bold">Directories</span>
                        <Briefcase className="w-5 h-5 text-charcoal-medium" />
                      </div>
                      <p className="text-3xl font-display font-bold text-charcoal-deep mt-4">{opportunities.length}</p>
                      <h3 className="text-sm font-sans font-medium text-charcoal-medium mt-1">Total Opportunities Shared</h3>
                    </div>
                    <div className="pt-6">
                      <button
                        onClick={() => {
                          resetOppForm();
                          setConsoleTab("opportunities");
                        }}
                        className="w-full py-2 bg-charcoal-deep text-warm-cream text-xs font-semibold rounded-lg hover:bg-opacity-95 transition-all"
                      >
                        + Create New Opportunity
                      </button>
                    </div>
                  </div>

                  {/* Stats 2 */}
                  <div className="p-6 rounded-2xl border border-warm-border bg-warm-cream flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase text-charcoal-light font-bold">Newsletters</span>
                        <BookOpenCheck className="w-5 h-5 text-charcoal-medium" />
                      </div>
                      <p className="text-3xl font-display font-bold text-charcoal-deep mt-4">{editions.length}</p>
                      <h3 className="text-sm font-sans font-medium text-charcoal-medium mt-1">Published Weekly Editions</h3>
                    </div>
                    <div className="pt-6">
                      <button
                        onClick={() => {
                          resetEdForm();
                          setConsoleTab("editions");
                        }}
                        className="w-full py-2 bg-charcoal-deep text-warm-cream text-xs font-semibold rounded-lg hover:bg-opacity-95 transition-all"
                      >
                        + Create New Edition
                      </button>
                    </div>
                  </div>

                  {/* Stats 3 - Dangerous Settings */}
                  <div className="p-6 rounded-2xl border border-red-200 bg-red-50/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase text-red-800 font-bold">Recovery</span>
                        <RefreshCw className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="text-3xl font-display font-bold text-charcoal-deep mt-4">Reset</p>
                      <h3 className="text-sm font-sans font-medium text-charcoal-medium mt-1">Revert custom data to fallback data</h3>
                    </div>
                    <div className="pt-6">
                      <button
                        onClick={() => {
                          const resetAction = () => {
                            localStorage.removeItem("dor_opportunities");
                            localStorage.removeItem("dor_editions");
                            setOpportunities(STATIC_OPPORTUNITIES);
                            setEditions(STATIC_EDITIONS);
                            showToast("All data successfully restored to factory defaults!", "success");
                          };

                          handleRequestAction(
                            "reset",
                            null,
                            "You are about to discard all custom-curated Opportunities and Editions, restoring the original default datasets. This action is irreversible.",
                            resetAction
                          );
                        }}
                        className="w-full py-2 border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-50 text-xs font-semibold rounded-lg transition-all"
                      >
                        Reset Workspace to Defaults
                      </button>
                    </div>
                  </div>
                </div>

                {/* Workflow Guidance Banner */}
                <div className="p-6 rounded-2xl border border-warm-border bg-warm-soft/30 space-y-3">
                  <h3 className="font-display font-bold text-charcoal-deep flex items-center gap-1.5 text-base">
                    💡 How can I update editions and opportunities?
                  </h3>
                  <div className="text-xs sm:text-sm text-charcoal-medium leading-relaxed space-y-2">
                    <p>
                      <strong>1. Auto-Binding:</strong> When you change any field below, your modifications are saved locally in real-time. The main landing page, weekly editions dropdowns, individual detail cards, and categories directories map over your state changes instantly.
                    </p>
                    <p>
                      <strong>2. Deadline statuses:</strong> For closed programs (such as <em>Claude Corps</em>), you can set their status to <strong>Open</strong> or <strong>Closed</strong>, or specify a custom calendar string (e.g. <code>July 17, 2026</code>) directly. If an opportunity status includes "closed", the site will auto-apply the eye-catching crimson warning badge beautifully.
                    </p>
                    <p>
                      <strong>3. Testing previews:</strong> Feel free to customize text, deadlines, or add placeholders. You can return to original values anytime using the <strong>Reset Workspace to Defaults</strong> button.
                    </p>
                  </div>
                </div>

                {/* CURATE PLATFORM STATISTICS CARD */}
                <div className="p-6 rounded-2xl border border-warm-border bg-warm-cream space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-warm-border/60 pb-3">
                    <div>
                      <h3 className="font-display font-bold text-lg text-charcoal-deep flex items-center gap-1.5">
                        <Sliders className="w-5 h-5 text-charcoal-medium" />
                        Curate Platform Statistics
                      </h3>
                      <p className="text-xs text-charcoal-light font-sans mt-0.5">
                        Manage the dynamic counter statistics displayed in the main page row.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-charcoal-deep block">Editions Published</label>
                      <input
                        type="number"
                        value={stats.editionsCount}
                        onChange={(e) => setStats((prev: any) => ({ ...prev, editionsCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none font-mono text-sm"
                        min="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-charcoal-deep block">Opportunities Shared</label>
                      <input
                        type="number"
                        value={stats.opportunitiesCount}
                        onChange={(e) => setStats((prev: any) => ({ ...prev, opportunitiesCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none font-mono text-sm"
                        min="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-charcoal-deep block">Community Finds</label>
                      <input
                        type="number"
                        value={stats.communityFindsCount}
                        onChange={(e) => setStats((prev: any) => ({ ...prev, communityFindsCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none font-mono text-sm"
                        min="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-charcoal-deep block">Contributors Credited</label>
                      <input
                        type="number"
                        value={stats.contributorsCount}
                        onChange={(e) => setStats((prev: any) => ({ ...prev, contributorsCount: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none font-mono text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-warm-border/50 flex justify-end">
                    <button
                      onClick={() => {
                        const directSaveStats = () => {
                          executeSafeAction("save-stats", stats);
                        };

                        handleRequestAction(
                          "save-stats",
                          stats,
                          "You are about to save changes to the homepage platform statistics counters.",
                          directSaveStats
                        );
                      }}
                      className="px-4 py-2 bg-charcoal-deep text-warm-cream text-xs font-semibold rounded-lg hover:bg-opacity-95 active:scale-[0.98] transition-all flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-deep"
                    >
                      Save Statistics
                    </button>
                  </div>
                </div>

                {/* Quick Directory list with edit links */}
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-lg text-charcoal-deep">Quick-Edit Directories</h3>
                  <div className="rounded-xl border border-warm-border bg-warm-cream divide-y divide-warm-border overflow-hidden">
                    <div className="p-4 bg-warm-soft/40 flex items-center justify-between text-xs font-mono text-charcoal-light font-bold">
                      <span>Opportunity name & Organization</span>
                      <span>Action</span>
                    </div>
                    {opportunities.slice(0, 8).map((opp) => (
                      <div key={opp.id} className="p-4 flex items-center justify-between gap-4 hover:bg-warm-soft/20 transition-all">
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-charcoal-deep">{opp.title}</p>
                          <p className="text-xs text-charcoal-light">{opp.organization} • <span className="font-mono text-[10px]">{opp.category}</span></p>
                        </div>
                        <button
                          onClick={() => startEditOpp(opp)}
                          className="px-3 py-1 rounded border border-warm-border text-xs text-charcoal-medium hover:text-charcoal-deep hover:bg-warm-soft transition-all"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    ))}
                    {opportunities.length > 8 && (
                      <div className="p-3 text-center bg-warm-soft/20">
                        <button
                          onClick={() => setConsoleTab("opportunities")}
                          className="text-xs font-semibold text-charcoal-deep hover:underline"
                        >
                          View & Edit remaining {opportunities.length - 8} opportunities →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: OPPORTUNITIES MANAGER */}
            {consoleTab === "opportunities" && (
              <div className="space-y-10">
                {/* Form Section */}
                <div className="rounded-2xl border border-warm-border bg-warm-cream p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-warm-border pb-4">
                    <h2 className="font-display text-xl font-bold text-charcoal-deep">
                      {editingOpp ? `Editing Opportunity: "${editingOpp.title}"` : "Add New Opportunity"}
                    </h2>
                    {editingOpp && (
                      <button
                        onClick={resetOppForm}
                        className="px-3 py-1 rounded border border-warm-border text-xs text-charcoal-medium hover:bg-warm-soft transition-all"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!oppTitle || !oppOrg || !oppDesc || !oppWhyFeatured || !oppDeadline) {
                        showToast("Please fill in all mandatory fields.", "warning");
                        return;
                      }

                      const tagsArray = oppTags
                        ? oppTags.split(",").map((t) => t.trim()).filter(Boolean)
                        : [];

                      const updatedOpp: Opportunity = {
                        id: editingOpp ? editingOpp.id : `opp-${Date.now()}`,
                        title: oppTitle,
                        organization: oppOrg,
                        category: oppCategoryField,
                        description: oppDesc,
                        whyFeatured: oppWhyFeatured,
                        deadline: oppDeadline,
                        status: oppStatus || undefined,
                        officialWebsite: oppLink || "#",
                        editionSectionLink: oppSectionLink || undefined,
                        tags: tagsArray.length > 0 ? tagsArray : ["Opportunity"],
                        whoItsFor: oppWhoItsFor || undefined,
                        sharedBy: oppSharedBy || undefined,
                        featuredInEdition: oppFeaturedInEd ? Number(oppFeaturedInEd) : undefined,
                        relatedIds: editingOpp ? editingOpp.relatedIds : [],
                        dateAdded: editingOpp ? editingOpp.dateAdded : new Date().toISOString().split("T")[0]
                      };

                      const directAction = () => {
                        executeSafeAction("save-opp", {
                          updatedOpp,
                          editingOppId: editingOpp ? editingOpp.id : null,
                          oppTitle
                        });
                      };

                      handleRequestAction(
                        "save-opp",
                        {
                          updatedOpp,
                          editingOppId: editingOpp ? editingOpp.id : null,
                          oppTitle
                        },
                        editingOpp 
                          ? `You are about to save changes to the Opportunity "${oppTitle}". This will immediately update the live database directory.`
                          : `You are about to publish a new Opportunity "${oppTitle}" to the live database directory.`,
                        directAction
                      );
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm"
                  >
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-charcoal-deep">Opportunity Title *</label>
                      <input
                        type="text"
                        value={oppTitle}
                        onChange={(e) => setOppTitle(e.target.value)}
                        placeholder="e.g. Claude Corps Developer Grant"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                        required
                      />
                    </div>

                    {/* Organization */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-charcoal-deep">Host Organization *</label>
                      <input
                        type="text"
                        value={oppOrg}
                        onChange={(e) => setOppOrg(e.target.value)}
                        placeholder="e.g. Anthropic"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-charcoal-deep">Category Directory *</label>
                      <select
                        value={oppCategoryField}
                        onChange={(e) => setOppCategoryField(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status badge */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-charcoal-deep">Program Status Badge *</label>
                      <select
                        value={oppStatus}
                        onChange={(e) => setOppStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                      >
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                        <option value="Rolling">Rolling</option>
                        <option value="Ongoing">Ongoing</option>
                      </select>
                    </div>

                    {/* Deadline */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-charcoal-deep">Application Deadline *</label>
                      <input
                        type="text"
                        value={oppDeadline}
                        onChange={(e) => setOppDeadline(e.target.value)}
                        placeholder="e.g. July 17, 2026 or Rolling"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                        required
                      />
                    </div>

                    {/* Shared By credit */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-charcoal-deep">Community Credit (Shared By)</label>
                      <input
                        type="text"
                        value={oppSharedBy}
                        onChange={(e) => setOppSharedBy(e.target.value)}
                        placeholder="e.g. @username (Optional)"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                      />
                    </div>

                    {/* External apply url */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-charcoal-deep">External Application URL</label>
                      <input
                        type="text"
                        value={oppLink}
                        onChange={(e) => setOppLink(e.target.value)}
                        placeholder="e.g. https://apply.anthropic.com"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                      />
                    </div>

                    {/* Newsletter publication link */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-charcoal-deep">Dev.to Publication Section Link</label>
                      <input
                        type="text"
                        value={oppSectionLink}
                        onChange={(e) => setOppSectionLink(e.target.value)}
                        placeholder="e.g. https://dev.to/hemapriya_kanagala/...#claude-corps"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                      />
                    </div>

                    {/* Tag list */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="font-semibold text-charcoal-deep">Tags (Comma-separated list)</label>
                      <input
                        type="text"
                        value={oppTags}
                        onChange={(e) => setOppTags(e.target.value)}
                        placeholder="e.g. AI, Open Source, Grants, Developer Support"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                      />
                    </div>

                    {/* Who it's for */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="font-semibold text-charcoal-deep">Who is this for?</label>
                      <input
                        type="text"
                        value={oppWhoItsFor}
                        onChange={(e) => setOppWhoItsFor(e.target.value)}
                        placeholder="e.g. Individual developers or small teams shipping open source AI models"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="font-semibold text-charcoal-deep">Program Description *</label>
                      <textarea
                        rows={3}
                        value={oppDesc}
                        onChange={(e) => setOppDesc(e.target.value)}
                        placeholder="Enter clean details about the benefits, scope, funding, and goals..."
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                        required
                      />
                    </div>

                    {/* Curation insight / why featured */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="font-semibold text-charcoal-deep">Curation Insight / Why Featured *</label>
                      <input
                        type="text"
                        value={oppWhyFeatured}
                        onChange={(e) => setOppWhyFeatured(e.target.value)}
                        placeholder="e.g. Provides amazing financial backing without taking equity, keeping builders sovereign."
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                        required
                      />
                    </div>

                    {/* Featured in edition */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-charcoal-deep">Featured in Weekly Edition #</label>
                      <input
                        type="number"
                        value={oppFeaturedInEd}
                        onChange={(e) => setOppFeaturedInEd(e.target.value ? Number(e.target.value) : "")}
                        placeholder="e.g. 1"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                      />
                    </div>

                    {/* Form submissions action */}
                    <div className="md:col-span-2 pt-4 flex gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-charcoal-deep text-warm-cream text-xs font-semibold hover:bg-opacity-95 transition-all"
                      >
                        {editingOpp ? "💾 Save Opportunity Changes" : "✨ Publish Opportunity"}
                      </button>
                      <button
                        type="button"
                        onClick={resetOppForm}
                        className="px-4 py-2.5 rounded-lg border border-warm-border text-xs text-charcoal-medium hover:bg-warm-soft transition-all"
                      >
                        Clear Form
                      </button>
                    </div>
                  </form>
                </div>

                {/* Directory Table Grid for all opportunities */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="font-display font-bold text-lg text-charcoal-deep">Full Opportunities Database</h3>
                  </div>

                  <div className="rounded-xl border border-warm-border bg-warm-cream overflow-hidden">
                    <div className="grid grid-cols-1 divide-y divide-warm-border">
                      {opportunities.map((opp) => (
                        <div key={opp.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-warm-soft/20 transition-all">
                          <div className="space-y-1.5 max-w-xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-mono text-charcoal-light uppercase tracking-wider">{opp.organization}</span>
                              <span className="text-[10px] font-mono text-charcoal-light uppercase px-1.5 py-0.5 rounded bg-warm-soft border border-warm-border">{opp.category}</span>
                              {opp.status && (
                                <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                                  opp.status.toLowerCase().includes("closed")
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}>
                                  {opp.status}
                                </span>
                              )}
                            </div>
                            <h4 className="font-display font-semibold text-charcoal-deep text-base">{opp.title}</h4>
                            <p className="text-xs text-charcoal-medium line-clamp-2">{opp.description}</p>
                            <p className="text-[10px] font-mono text-charcoal-light">Deadline: <span className="font-bold text-charcoal-medium">{opp.deadline}</span></p>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => startEditOpp(opp)}
                              className="px-3 py-1.5 rounded border border-warm-border text-xs text-charcoal-medium hover:text-charcoal-deep hover:bg-warm-soft transition-all flex items-center gap-1"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => {
                                const deleteAction = () => {
                                  executeSafeAction("delete-opp", { oppId: opp.id, oppTitle: opp.title });
                                };

                                handleRequestAction(
                                  "delete-opp",
                                  { oppId: opp.id, oppTitle: opp.title },
                                  `You are about to permanently delete the Opportunity "${opp.title}". This action is irreversible.`,
                                  deleteAction
                                );
                              }}
                              className="px-3 py-1.5 rounded border border-red-200 text-xs text-red-600 hover:bg-red-50 transition-all flex items-center gap-1"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EDITIONS ARCHIVE MANAGER */}
            {consoleTab === "editions" && (
              <div className="space-y-10">
                {/* Form to edit or add Edition */}
                <div className="rounded-2xl border border-warm-border bg-warm-cream p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-warm-border pb-4">
                    <h2 className="font-display text-xl font-bold text-charcoal-deep">
                      {editingEd ? `Editing Weekly Edition #${editingEd.number}` : "Add New Weekly Edition"}
                    </h2>
                    {editingEd && (
                      <button
                        onClick={resetEdForm}
                        className="px-3 py-1 rounded border border-warm-border text-xs text-charcoal-medium hover:bg-warm-soft transition-all"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!edNumber || !edDate || !edClosing) {
                        showToast("Please fill in all mandatory fields.", "warning");
                        return;
                      }

                      const highlightsArray = edHighlights
                        ? edHighlights.split("\n").map((h) => h.trim()).filter(Boolean)
                        : [];

                      const updatedEd: Edition = {
                        number: Number(edNumber),
                        publishedDate: edDate,
                        introduction: edIntroduction || undefined,
                        highlights: highlightsArray.length > 0 ? highlightsArray : ["New curated resources available"],
                        closing: edClosing,
                        devToLink: edDevToLink || undefined,
                        opportunityIds: editingEd ? editingEd.opportunityIds : []
                      };

                      const directAction = () => {
                        executeSafeAction("save-ed", {
                          updatedEd,
                          editingEdNumber: editingEd ? editingEd.number : null,
                          edNumber
                        });
                      };

                      handleRequestAction(
                        "save-ed",
                        {
                          updatedEd,
                          editingEdNumber: editingEd ? editingEd.number : null,
                          edNumber
                        },
                        editingEd
                          ? `You are about to save changes to Edition #${edNumber}. This will immediately update the live database newsletter records.`
                          : `You are about to publish a brand-new weekly newsletter Edition #${edNumber} to the live database archive.`,
                        directAction
                      );
                    }}
                    className="grid grid-cols-1 gap-5 text-sm"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Number */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-charcoal-deep">Edition Number *</label>
                        <input
                          type="number"
                          value={edNumber}
                          onChange={(e) => setEdNumber(e.target.value ? Number(e.target.value) : "")}
                          placeholder="e.g. 4"
                          className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                          required
                          disabled={!!editingEd}
                        />
                      </div>

                      {/* Date */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-charcoal-deep">Publication Date *</label>
                        <input
                          type="text"
                          value={edDate}
                          onChange={(e) => setEdDate(e.target.value)}
                          placeholder="e.g. July 17, 2026"
                          className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* devto Link */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-charcoal-deep">Dev.to Publication URL Link</label>
                      <input
                        type="text"
                        value={edDevToLink}
                        onChange={(e) => setEdDevToLink(e.target.value)}
                        placeholder="e.g. https://dev.to/hemapriya_kanagala/dev-opportunity-radar-edition-4"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                      />
                    </div>

                    {/* Introduction */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-charcoal-deep">Edition Introduction</label>
                      <textarea
                        rows={2}
                        value={edIntroduction}
                        onChange={(e) => setEdIntroduction(e.target.value)}
                        placeholder="Welcome words or overview theme..."
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                      />
                    </div>

                    {/* Highlights (One per line) */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-charcoal-deep">Highlights (One line per highlight point)</label>
                      <textarea
                        rows={3}
                        value={edHighlights}
                        onChange={(e) => setEdHighlights(e.target.value)}
                        placeholder="e.g. Added major developer grants by Anthropic&#10;Shared new research fellowships&#10;Added regional startup incubators"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                      />
                    </div>

                    {/* Closing sign-off quotes */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-charcoal-deep">Closing Reflection / Quote *</label>
                      <input
                        type="text"
                        value={edClosing}
                        onChange={(e) => setEdClosing(e.target.value)}
                        placeholder="e.g. If you take away one thing, remember that opportunities are meant to be shared!"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-cream focus:border-charcoal-deep focus:outline-none"
                        required
                      />
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-charcoal-deep text-warm-cream text-xs font-semibold hover:bg-opacity-95 transition-all"
                      >
                        {editingEd ? "💾 Save Edition Changes" : "✨ Publish Newsletter Edition"}
                      </button>
                      <button
                        type="button"
                        onClick={resetEdForm}
                        className="px-4 py-2.5 rounded-lg border border-warm-border text-xs text-charcoal-medium hover:bg-warm-soft transition-all"
                      >
                        Clear Form
                      </button>
                    </div>
                  </form>
                </div>

                {/* Editions list */}
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-lg text-charcoal-deep">Published Editions</h3>
                  <div className="rounded-xl border border-warm-border bg-warm-cream overflow-hidden">
                    <div className="grid grid-cols-1 divide-y divide-warm-border">
                      {editions.map((ed) => (
                        <div key={ed.number} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-warm-soft/20 transition-all">
                          <div className="space-y-1">
                            <h4 className="font-display font-semibold text-charcoal-deep text-base">Edition #{ed.number}</h4>
                            <p className="text-xs text-charcoal-light">{ed.publishedDate}</p>
                            <p className="text-xs text-charcoal-medium italic">"{ed.closing}"</p>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => startEditEd(ed)}
                              className="px-3 py-1.5 rounded border border-warm-border text-xs text-charcoal-medium hover:text-charcoal-deep hover:bg-warm-soft transition-all"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => {
                                const deleteAction = () => {
                                  executeSafeAction("delete-ed", { edNumber: ed.number });
                                };

                                handleRequestAction(
                                  "delete-ed",
                                  { edNumber: ed.number },
                                  `You are about to permanently delete Edition #${ed.number} from the archive index.`,
                                  deleteAction
                                );
                              }}
                              className="px-3 py-1.5 rounded border border-red-200 text-xs text-red-600 hover:bg-red-50 transition-all"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          )
        )}

        {/* VIEW: CONTACT */}
        {route.view === "contact" && (
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300">
            {/* Header section */}
            <div className="space-y-4 text-center max-w-3xl mx-auto">
              <span className="text-xs font-mono uppercase tracking-widest text-charcoal-light bg-warm-soft px-3 py-1.5 rounded-full border border-warm-border inline-block">
                Get in Touch
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-charcoal-deep">
                Get in Touch
              </h1>
              <p className="text-sm text-charcoal-medium leading-relaxed max-w-lg mx-auto">
                Discover the best ways to reach me, ask questions, suggest opportunities, or share your developer journey.
              </p>
            </div>

            {/* TL;DR Highlight Card */}
            <section className="p-6 sm:p-8 rounded-2xl border border-warm-border bg-warm-soft/25 text-charcoal-deep space-y-4 relative overflow-hidden">
              <div className="flex items-center gap-2 border-b border-warm-border/60 pb-2">
                <span className="text-xl">📬</span>
                <h2 className="font-display text-sm uppercase tracking-wider font-extrabold text-charcoal-medium">
                  {CONTACT_CONTENT.tldr.heading}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {CONTACT_CONTENT.tldr.items.map((item, idx) => {
                  const isDev = item.icon.includes("DEV");
                  const isLinkedIn = item.icon.includes("LinkedIn");
                  const isEmail = item.icon.includes("Email");
                  
                  let iconBg = "";
                  let iconElement = null;
                  let cardHref = "";
                  
                  if (isDev) {
                    iconBg = "bg-charcoal-deep text-warm-cream border-charcoal-deep shadow-xs";
                    iconElement = <MessageSquare className="w-4 h-4" />;
                    cardHref = "https://dev.to/hemapriya_kanagala";
                  } else if (isLinkedIn) {
                    iconBg = "bg-sky-100 text-sky-800 border-sky-200 shadow-xs";
                    iconElement = <Linkedin className="w-4 h-4" />;
                    cardHref = "https://www.linkedin.com/in/hemapriya-kanagala/";
                  } else if (isEmail) {
                    iconBg = "bg-amber-100 text-amber-800 border-amber-200 shadow-xs";
                    iconElement = <Mail className="w-4 h-4" />;
                    cardHref = "mailto:hemapriyakanagala@gmail.com";
                  }

                  return (
                    <div 
                      key={idx} 
                      className="group p-5 rounded-2xl border border-warm-border bg-warm-cream flex flex-col justify-between gap-4 shadow-xs hover:border-charcoal-deep/30 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative"
                      onClick={() => {
                        window.open(cardHref, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center justify-center p-2 rounded-xl border ${iconBg}`}>
                            {iconElement}
                          </span>
                          <span className="text-[10px] font-mono text-charcoal-light uppercase tracking-wider flex items-center gap-1 group-hover:text-charcoal-deep transition-colors">
                            {isDev ? "DEV.to" : isLinkedIn ? "LinkedIn" : "Email"}
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="font-display font-bold text-sm text-charcoal-deep">
                            {isDev ? "DEV Community" : isLinkedIn ? "LinkedIn Network" : "Direct Email"}
                          </h3>
                          <p className="text-xs text-charcoal-medium font-sans leading-relaxed">
                            {renderFormattedText(item.text)}
                          </p>
                        </div>
                      </div>

                      {isEmail && (
                        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText("hemapriyakanagala@gmail.com");
                              showToast("Email address copied to clipboard!", "success");
                            }}
                            className="w-full py-1.5 px-3 rounded-lg border border-warm-border bg-warm-soft/40 hover:bg-warm-soft hover:border-charcoal-deep/30 text-[11px] font-mono font-medium text-charcoal-medium hover:text-charcoal-deep transition-all duration-200 flex items-center justify-center gap-1.5"
                          >
                            <span>📋</span> Copy Email
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Story & Guidelines Content */}
            <div className="space-y-6 text-sm sm:text-base text-charcoal-medium font-sans leading-relaxed max-w-3xl mx-auto">
              <p className="text-base sm:text-lg font-medium text-charcoal-deep">
                {renderFormattedText(CONTACT_CONTENT.paragraphs[0])}
              </p>
              <p>
                {renderFormattedText(CONTACT_CONTENT.paragraphs[1])}
              </p>
              <p>
                {renderFormattedText(CONTACT_CONTENT.paragraphs[2])}
              </p>
              <p>
                {renderFormattedText(CONTACT_CONTENT.paragraphs[3])}
              </p>
              <p>
                {renderFormattedText(CONTACT_CONTENT.paragraphs[4])}
              </p>

              {/* Request Guidelines Box */}
              <div className="p-6 sm:p-8 rounded-2xl border border-warm-border bg-warm-soft/20 space-y-5 my-8">
                <div className="flex items-center gap-2 border-b border-warm-border/60 pb-2">
                  <span className="text-lg">💡</span>
                  <h3 className="font-display font-bold text-sm uppercase tracking-wider text-charcoal-deep">
                    {CONTACT_CONTENT.paragraphs[5]}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dos */}
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs font-mono uppercase tracking-wider">
                      <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="w-3 h-3" />
                      </span>
                      Yes, Please
                    </div>
                    <p className="text-xs sm:text-sm text-charcoal-medium leading-relaxed">
                      {renderFormattedText(CONTACT_CONTENT.paragraphs[6])}
                    </p>
                  </div>

                  {/* Don'ts */}
                  <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/20 space-y-2">
                    <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs font-mono uppercase tracking-wider">
                      <span className="p-0.5 rounded-full bg-rose-100 text-rose-700">
                        <X className="w-3 h-3" />
                      </span>
                      No, Thank you
                    </div>
                    <p className="text-xs sm:text-sm text-charcoal-medium leading-relaxed">
                      {renderFormattedText(CONTACT_CONTENT.paragraphs[7])}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm font-medium text-charcoal-deep italic border-l-2 border-charcoal-light/30 pl-3 pt-2">
                {renderFormattedText(CONTACT_CONTENT.paragraphs[8])}
              </p>
            </div>
          </div>
        )}

        {/* VIEW: UNIVERSAL SEARCH */}
        {route.view === "search" && (
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2 border-b border-warm-border pb-6">
              <h1 className="font-display text-3xl font-bold tracking-tight">Universal Search</h1>
              <p className="text-sm text-charcoal-medium">
                Query across all opportunities, weekly newsletter editions, and community discoveries.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-charcoal-light" />
              <input
                type="text"
                placeholder="Type keyword, organization, edition, or category name..."
                value={universalSearchQuery}
                onChange={(e) => setUniversalSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-warm-border bg-warm-cream text-base focus:outline-none focus:border-charcoal-deep shadow-sm"
                aria-label="Universal search field"
                autoFocus
              />
              {universalSearchQuery && (
                <button
                  onClick={() => setUniversalSearchQuery("")}
                  className="absolute right-4 top-3.5 text-charcoal-light hover:text-charcoal-deep"
                  aria-label="Clear universal search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Results output */}
            {!universalSearchQuery.trim() ? (
              <div className="text-center py-12 space-y-3">
                <Compass className="w-10 h-10 text-charcoal-light mx-auto" />
                <p className="text-sm text-charcoal-medium">Please enter a search query above to browse the database.</p>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  <button onClick={() => setUniversalSearchQuery("Grant")} className="text-xs bg-warm-soft px-3 py-1 rounded border border-warm-border text-charcoal-medium hover:text-charcoal-deep">"Grant"</button>
                  <button onClick={() => setUniversalSearchQuery("AWS")} className="text-xs bg-warm-soft px-3 py-1 rounded border border-warm-border text-charcoal-medium hover:text-charcoal-deep">"AWS"</button>
                  <button onClick={() => setUniversalSearchQuery("Community")} className="text-xs bg-warm-soft px-3 py-1 rounded border border-warm-border text-charcoal-medium hover:text-charcoal-deep">"Community"</button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Opportunities results */}
                <div className="space-y-4">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-charcoal-light font-semibold border-b border-warm-border pb-1">
                    Matched Opportunities ({universalSearchResults.opportunities.length})
                  </h2>

                  {universalSearchResults.opportunities.length === 0 ? (
                    <p className="text-xs text-charcoal-light italic font-sans">No matching opportunities found.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {universalSearchResults.opportunities.map((opp) => (
                        <button
                          key={opp.id}
                          onClick={() => navigateTo(`#opportunity/${opp.id}`)}
                          className="text-left p-4 rounded-xl border border-warm-border bg-warm-cream hover:border-charcoal-deep/20 transition-all flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-charcoal-deep"
                        >
                          <div>
                            <span className="text-[10px] font-mono text-charcoal-light uppercase">{opp.category}</span>
                            <h3 className="font-semibold text-sm text-charcoal-deep mt-0.5 line-clamp-1">{opp.title}</h3>
                            <p className="text-xs text-charcoal-medium line-clamp-2 mt-1">{opp.description}</p>
                          </div>
                          <span className="text-xs font-semibold text-charcoal-deep flex items-center gap-0.5 mt-3">
                            View resource
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Editions results */}
                <div className="space-y-4">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-charcoal-light font-semibold border-b border-warm-border pb-1">
                    Matched Weekly Editions ({universalSearchResults.editions.length})
                  </h2>

                  {universalSearchResults.editions.length === 0 ? (
                    <p className="text-xs text-charcoal-light italic font-sans">No matching newsletter editions found.</p>
                  ) : (
                    <div className="space-y-2">
                      {universalSearchResults.editions.map((ed) => (
                        <div
                          key={ed.number}
                          className="p-4 rounded-xl border border-warm-border bg-warm-cream flex items-center justify-between gap-4"
                        >
                          <div>
                            <h3 className="font-semibold text-sm text-charcoal-deep">Edition #{ed.number}</h3>
                            <p className="text-xs text-charcoal-light">{ed.publishedDate} — Highlights: {ed.highlights.join(", ")}</p>
                          </div>
                          <button
                            onClick={() => {
                              setExpandedEditions((prev) => ({
                                ...prev,
                                [ed.number]: true,
                              }));
                              navigateTo("#editions");
                              setTimeout(() => {
                                const el = document.getElementById(`edition-${ed.number}`);
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                                }
                              }, 100);
                            }}
                            className="px-3 py-1 rounded border border-charcoal-deep text-[11px] font-semibold text-charcoal-deep hover:bg-charcoal-deep hover:text-warm-cream transition-all"
                          >
                            View in Archives
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Finds results */}
                <div className="space-y-4">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-charcoal-light font-semibold border-b border-warm-border pb-1">
                    Matched Community Discoveries ({universalSearchResults.finds.length})
                  </h2>

                  {universalSearchResults.finds.length === 0 ? (
                    <p className="text-xs text-charcoal-light italic font-sans">No matching community discoveries found.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {universalSearchResults.finds.map((cf) => (
                        <div
                          key={cf.id}
                          className="p-4 rounded-xl border border-warm-border bg-warm-cream flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[9px] font-mono text-charcoal-light uppercase">{cf.type} — Shared by {cf.sharedBy}</span>
                            <h3 className="font-semibold text-sm text-charcoal-deep mt-0.5">{cf.title}</h3>
                            {cf.description && <p className="text-xs text-charcoal-medium mt-1 line-clamp-2">{cf.description}</p>}
                          </div>
                          {cf.link && (
                            <a
                              href={cf.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-charcoal-deep hover:underline inline-flex items-center gap-0.5 mt-3 self-start"
                            >
                              Open Site
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: ACCESSIBILITY STATEMENT */}
        {route.view === "accessibility" && (
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 border-b border-warm-border pb-6">
              <span className="text-xs font-mono uppercase text-charcoal-light">Universal Usability</span>
              <h1 className="font-display text-3xl font-bold tracking-tight">Accessibility Statement</h1>
              <p className="text-sm text-charcoal-medium">
                Commitment to WCAG AA compliance, full keyboard utility, and readability standard policies.
              </p>
            </div>

            <div className="space-y-4 text-sm text-charcoal-medium font-sans leading-relaxed">
              <p>
                I believe that digital resources should be accessible to everyone, regardless of physical or cognitive ability. This website has been built from the ground up with the target of complying with the Web Content Accessibility Guidelines (WCAG 2.1) Level AA standard.
              </p>

              <h2 className="font-display font-semibold text-lg text-charcoal-deep pt-2">Implemented Features:</h2>
              <ul className="list-disc pl-5 space-y-2" role="list">
                <li>
                  <strong>Full Keyboard Navigation:</strong> All links, buttons, form inputs, and custom dropdowns are fully navigable using the Tab key, with clear visible focus rings.
                </li>
                <li>
                  <strong>High Contrast:</strong> Colors are based on a high-contrast warm cream canvas (#faf9f6) and deep charcoal grey text (#1c1b18) to ensure high readability with zero eye fatigue.
                </li>
                <li>
                  <strong>Light &amp; Dark Themes:</strong> A theme switcher in the navigation bar toggles between the warm light canvas and a warm dark one, both meeting WCAG AA contrast. The site follows your device's appearance setting until you choose otherwise, and remembers your choice.
                </li>
                <li>
                  <strong>Semantic Markup:</strong> Clear heading levels (H1, H2, H3), lists, main land-marker regions, and button elements allow screen readers to parse structures naturally.
                </li>
                <li>
                  <strong>Form Labeling:</strong> Every text input and drop-down contains a corresponding programmatic &lt;label&gt; element, eliminating confusion.
                </li>
                <li>
                  <strong>Skip to Content:</strong> A skip navigation link is present at the very top of the page for keyboard users to bypass headers quickly.
                </li>
              </ul>

              <h2 className="font-display font-semibold text-lg text-charcoal-deep pt-2">Continuous Feedback:</h2>
              <p>
                Accessibility is an ongoing journey of care. If you encounter any bugs, have difficulty navigating with assistive technologies, or have recommendations to improve my styling contrast, please contact me immediately via our <button onClick={() => navigateTo("#contact")} className="font-semibold underline text-charcoal-deep">Contact page</button>. I value your input.
              </p>
            </div>
          </div>
        )}

        {/* VIEW: PRIVACY POLICY */}
        {route.view === "privacy" && (
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 border-b border-warm-border pb-6">
              <span className="text-xs font-mono uppercase text-charcoal-light">Zero Tracking Guarantee</span>
              <h1 className="font-display text-3xl font-bold tracking-tight">Privacy Policy</h1>
              <p className="text-sm text-charcoal-medium">
                Honest and transparent respect for your attention, telemetry, and personal web storage.
              </p>
            </div>

            <div className="space-y-4 text-sm text-charcoal-medium font-sans leading-relaxed">
              <p>
                This privacy policy is simple and direct: <strong>I do not track you.</strong>
              </p>
              <p>
                I believe developer portals should respect your privacy completely, without tracking scripts, annoying marketing banners, or corporate telemetry scrapers.
              </p>

              <h2 className="font-display font-semibold text-lg text-charcoal-deep pt-2">Core Commitments:</h2>
              <ul className="list-disc pl-5 space-y-2" role="list">
                <li>
                  <strong>No Tracking or Marketing Cookies:</strong> The application code itself does not create, store, or transmit any tracking cookies, pixel beacons, web bugs, or analytics hooks (such as Google Analytics or Facebook Pixel). We do not collect behavioral data.
                </li>
                <li>
                  <strong>Note on Essential Technical Cookies:</strong> Because this application is deployed on cloud hosting infrastructure (such as Google Cloud Run, proxy layers, or delivery networks), the hosting providers may automatically issue standard, temporary technical cookies. These are strictly required for load balancing, DDoS protection, security headers, and reliable server response delivery. They are non-tracking, do not contain personal identifiers, and are outside of our application code's operation.
                </li>
                <li>
                  <strong>No Data Sale:</strong> I do not sell, rent, trade, or distribute your email addresses, submission names, or stories to any marketing agencies or third-party systems.
                </li>
                <li>
                  <strong>Local Storage Only:</strong> Your bookmarked list, theme preference, and draft form submissions are kept entirely on your own local device using standard browser cache (`localStorage`). This data never leaves your device unless you actively submit a form.
                </li>
                <li>
                  <strong>Humble Contact Delivery:</strong> Form submissions and email details are exclusively used to read, reply, and help you with your direct queries.
                </li>
              </ul>

              <p className="pt-4 text-xs font-mono text-charcoal-light">
                Policy active since May 29, 2026. If you have questions about deployment security, please contact me directly.
              </p>
            </div>
          </div>
        )}

        {/* VIEW: 404 / NOT FOUND */}
        {![
          "home", "start-here", "opportunities", "opportunity", "categories", "category", "deadlines",
          "community-finds", "reader-updates", "editions", "edition", "about", "philosophy", "faq", "contact",
          "search", "accessibility", "privacy"
        ].includes(route.view) && (
          <div className="mx-auto max-w-md px-4 py-20 text-center space-y-6 animate-in fade-in duration-300">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-warm-soft border border-warm-border text-charcoal-medium">
              <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <h1 className="font-display text-2xl font-bold">This page seems to have wandered off.</h1>
            <p className="text-sm text-charcoal-medium leading-relaxed max-w-sm mx-auto">
              Let's help you find something else instead. You can always start over on the home page or browse active categories.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigateTo("#")}
                className="px-5 py-2.5 rounded-lg bg-charcoal-deep text-warm-cream text-xs font-medium"
              >
                Return Home
              </button>
              <button
                onClick={() => navigateTo("#opportunities")}
                className="px-5 py-2.5 rounded-lg border border-warm-border bg-warm-cream text-xs font-medium text-charcoal-medium"
              >
                Browse Directory
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer component */}
      <Footer onNavigate={navigateTo} isAdminAuthorized={isAdminAuthorized} />

      {/* DOUBLE SAFETY CURATION CONFIRMATION MODAL */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-deep/80 backdrop-blur-xs animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-warm-border bg-warm-cream p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700 border border-red-200">
                <Shield className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-bold text-charcoal-deep">Curation Safeguard Lock</h3>
                <p className="text-xs text-charcoal-medium leading-relaxed">
                  {confirmAction.message}
                </p>
              </div>
            </div>

            <div className="bg-warm-soft/40 p-3 rounded-lg border border-warm-border/60 text-xs text-charcoal-medium space-y-1">
              <p className="font-semibold text-charcoal-deep">🔒 Safe Curation Protocol Active</p>
              <p>To prevent accidental live modifications, please confirm your action by typing the keyword below.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (safetyInput.trim().toUpperCase() === "COMMIT") {
                  executeSafeAction(confirmAction.type, confirmAction.payload);
                  setConfirmAction(null);
                  setSafetyInput("");
                } else {
                  setSafetyError("Passkey word must match 'COMMIT' exactly.");
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-charcoal-deep block">
                  Type <span className="font-mono font-extrabold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">COMMIT</span> to execute:
                </label>
                <input
                  type="text"
                  value={safetyInput}
                  onChange={(e) => {
                    setSafetyInput(e.target.value);
                    if (safetyError) setSafetyError("");
                  }}
                  placeholder="Type COMMIT here"
                  className="w-full text-center font-mono font-bold tracking-widest px-4 py-2.5 rounded-xl border border-warm-border bg-warm-cream focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  autoFocus
                  required
                />
                {safetyError && (
                  <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{safetyError}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmAction(null);
                    setSafetyInput("");
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-warm-border text-xs font-semibold text-charcoal-medium hover:bg-warm-soft transition-all"
                >
                  Cancel & Abort
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-danger-solid text-white text-xs font-semibold hover:bg-danger-solid-hover transition-all shadow-xs animate-pulse"
                >
                  Execute Live Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
