export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  whyFeatured: string; // "Why it was featured"
  deadline: string; // ISO date format "YYYY-MM-DD" or "Ongoing" / "Rolling"
  category: string; // e.g. "Funding", "Hackathons", "Learning", "AI"
  tags: string[];
  featuredInEdition: number; // Edition #
  officialWebsite: string;
  relatedIds: string[]; // List of related opportunity IDs
  dateAdded: string; // ISO date when added
  whoItsFor?: string;
  quickFacts?: string;
  status?: "Open" | "Closed" | string;
  editionSectionLink?: string;
  sharedBy?: string;
}

export interface Edition {
  number: number;
  publishedDate: string; // ISO format
  highlights: string[];
  opportunityIds: string[]; // List of opportunity IDs featured in this edition
  introduction?: string;
  closing?: string;
  devToLink?: string;
}

export interface CommunityFind {
  id: string;
  title: string;
  type: string;
  sharedBy: string;
  featuredInEdition: number;
  description?: string;
  link?: string;
  approved: boolean; // For newly submitted ones
}

export interface ReaderUpdate {
  id: string;
  readerName: string;
  opportunityName: string;
  story: string;
  date: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}
