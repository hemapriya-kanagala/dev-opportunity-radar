import { Opportunity, Edition, CommunityFind, ReaderUpdate, FAQItem } from "./types";

export const PROJECT_START_DATE = "May 29, 2026";

export const STATISTICS = {
  editionsCount: 7,
  opportunitiesCount: 30,
  communityFindsCount: 5,
  contributorsCount: 5
};

export const CATEGORIES = [
  { id: "Funding & Grants", name: "Funding & Grants", description: "Grants, equity-free awards, and funding resources to support your work.", icon: "CircleDollarSign", color: "border-amber-200 bg-amber-50/50 text-amber-800" },
  { id: "Fellowships", name: "Fellowships", description: "Prestigious cohort programs and developer residencies with stipends.", icon: "GraduationCap", color: "border-purple-200 bg-purple-50/50 text-purple-800" },
  { id: "Startup & Founder Programs", name: "Startup & Founder Programs", description: "Accelerators, incubator programs, and pre-seed founder backing.", icon: "Rocket", color: "border-orange-200 bg-orange-50/50 text-orange-800" },
  { id: "Research Programs", name: "Research Programs", description: "Research fellowships, labs, and scholar programs focused on AI and science.", icon: "Microscope", color: "border-rose-200 bg-rose-50/50 text-rose-800" },
  { id: "Hackathons & Challenges", name: "Hackathons & Challenges", description: "In-person and virtual hackathons with substantial developer challenges.", icon: "Terminal", color: "border-emerald-200 bg-emerald-50/50 text-emerald-800" },
  { id: "Communities", name: "Communities", description: "Developer meetups, associations, and supportive invite-only networks.", icon: "Users", color: "border-teal-200 bg-teal-50/50 text-teal-800" },
  { id: "Open Source", name: "Open Source", description: "Stipends, maintenance support, and dedicated funding for OSS developers.", icon: "Heart", color: "border-indigo-200 bg-indigo-50/50 text-indigo-800" },
  { id: "Ambassador Programs", name: "Ambassador Programs", description: "Student, developer, and professional tech advocacy programs.", icon: "Sprout", color: "border-lime-200 bg-lime-50/50 text-lime-800" },
  { id: "Mentorship", name: "Mentorship", description: "Structured remote mentorship and professional career guidance.", icon: "Handshake", color: "border-cyan-200 bg-cyan-50/50 text-cyan-800" },
  { id: "Career & Professional Development", name: "Career & Professional Development", description: "Professional launchpads, cert prep, and career resources.", icon: "Briefcase", color: "border-sky-200 bg-sky-50/50 text-sky-800" },
  { id: "Volunteer & Internships", name: "Volunteer & Internships", description: "Civic-tech opportunities, non-profit support, and remote internships.", icon: "Smile", color: "border-fuchsia-200 bg-fuchsia-50/50 text-fuchsia-800" },
  { id: "Learning Resources", name: "Learning Resources", description: "Hands-on engineering tracks, courses, and interactive study playbooks.", icon: "BookOpen", color: "border-blue-200 bg-blue-50/50 text-blue-800" }
];

export const OPPORTUNITIES: Opportunity[] = [
  // --- EDITION #1 (May 29, 2026) ---
  {
    id: "flow-fellowship",
    title: "Flow Fellowship",
    organization: "Flow Research",
    description: "Flow Fellowship is a 12-week global program for people who want to contribute to meaningful projects across AI, research, engineering, product, systems, media, and content. Rather than focusing only on learning, fellows spend their time working on real projects, collaborating with experienced teams, and building work they can publicly showcase.",
    whyFeatured: "One of the things I liked most about this fellowship was its focus on contribution. A lot of programs are built around lectures or coursework, but Flow encourages participants to spend their time building and shipping real work. I thought that made it worth sharing, especially for people looking to grow through hands-on experience.",
    deadline: "Closed",
    category: "Fellowships",
    tags: ["Fellowship", "Research", "Engineering", "Systems", "Open Source"],
    featuredInEdition: 1,
    officialWebsite: "https://example.com/dummy-flow-fellowship-website",
    relatedIds: ["commit-fellowship", "anthropic-fellows"],
    dateAdded: "2026-05-29",
    whoItsFor: "People who want to contribute to meaningful projects across AI, research, engineering, product, systems, media, and content.",
    quickFacts: "🌍 Global • ⏳ 12 weeks • 🤝 Mentorship • Public project work",
    status: "Closed",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/dev-opportunity-radar-1-a-100k-ai-grant-two-fellowships-and-an-ai-agent-resource-2ja3#flow-fellowship"
  },
  {
    id: "soar-research",
    title: "Summer of Open AI Research (SOAR)",
    organization: "SOAR",
    description: "Summer of Open AI Research (SOAR) is a research program that gives participants the opportunity to work on open AI research projects while collaborating with mentors and experienced researchers.",
    whyFeatured: "Research can sometimes feel difficult to break into, especially if you don't have a traditional academic background. I wanted to include SOAR because it provides another pathway for people who want to contribute to meaningful AI research in an open environment.",
    deadline: "Closed",
    category: "Research Programs",
    tags: ["Research", "AI", "Collaboration", "Open Source"],
    featuredInEdition: 2,
    officialWebsite: "https://example.com/dummy-soar-research-website",
    relatedIds: ["anthropic-fellows", "interactivity-grants"],
    dateAdded: "2026-06-05",
    whoItsFor: "Students, researchers, and developers interested in contributing to open AI research projects.",
    quickFacts: "🔬 Research • 🤝 Mentorship • 🌍 Open Collaboration",
    status: "Closed",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/dev-opportunity-radar-2-a-fully-funded-residency-in-finland-ai-research-program-and-a-60k-33l4#summer-of-open-ai-research-soar"
  },
  {
    id: "gcp-rapid-agent",
    title: "Google Cloud Rapid Agent Hackathon",
    organization: "Google Cloud",
    description: "A hackathon focused on building AI agents using Google Cloud technologies. Participants had the opportunity to experiment with modern AI tooling, work on practical projects, and compete for prizes while learning from Google's ecosystem.",
    whyFeatured: "I included this because it was a good opportunity to build something practical while exploring AI agents with real cloud infrastructure. Events like this are often one of the best ways to learn by building instead of just watching tutorials.",
    deadline: "Closed",
    category: "Hackathons & Challenges",
    tags: ["Hackathon", "AI", "Google-Cloud", "Agents"],
    featuredInEdition: 2,
    officialWebsite: "https://example.com/dummy-gcp-rapid-agent-website",
    relatedIds: ["gemini-xprize-challenge", "midnight-hackathon"],
    dateAdded: "2026-06-05",
    whoItsFor: "Developers and builders interested in experimenting with modern AI agents and Google Cloud.",
    quickFacts: "🖥️ Online • 🤖 AI Agents • ☁️ Google Cloud",
    status: "Closed",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/dev-opportunity-radar-2-a-fully-funded-residency-in-finland-ai-research-program-and-a-60k-33l4#google-cloud-rapid-agent-hackathon"
  },
  {
    id: "the-odin-project",
    title: "The Odin Project",
    organization: "The Odin Project",
    description: "The Odin Project is a free, open-source curriculum that teaches full-stack web development through hands-on projects covering HTML, CSS, JavaScript, React, Node.js, databases, Git, and more.",
    whyFeatured: "This is one of those resources that developers recommend again and again. I like that it encourages you to learn by building real projects, and the community makes it much easier to keep going when you get stuck.",
    deadline: "Ongoing",
    category: "Learning Resources",
    tags: ["Web Development", "Full Stack", "JavaScript", "React", "Node.js", "Open Source"],
    featuredInEdition: 7,
    officialWebsite: "https://www.theodinproject.com",
    relatedIds: ["learn-to-cloud", "learnweb3"],
    dateAdded: "2026-05-29",
    whoItsFor: "Beginners and aspiring full-stack web developers.",
    quickFacts: "💻 Web Dev • 🆓 Free • 🤝 Active Community",
    status: "Ongoing",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-7-1000-solo-grants-free-claude-max-for-open-source-contributors-and-an-3i12#the-odin-project"
  },
  {
    id: "google-agents-intensive",
    title: "Google AI Agents Intensive Course",
    organization: "Google × Kaggle",
    description: "A free learning program from Google and Kaggle covering the fundamentals of AI agents, tool use, prompting, and practical implementation.",
    whyFeatured: "I included this because it's a good starting point if you're curious about AI agents but aren't sure where to begin. Since it's created by Google, it also provides a structured learning path that's easy to follow.",
    deadline: "Ongoing",
    category: "Learning Resources",
    tags: ["Google", "AI", "Course", "Beginners", "Kaggle"],
    featuredInEdition: 3,
    officialWebsite: "https://example.org/google-agents-course",
    relatedIds: ["principles-agents", "patterns-agents"],
    dateAdded: "2026-05-29",
    whoItsFor: "Anyone interested in learning how AI agents work and how to build them.",
    quickFacts: "🎓 Course • 🆓 Free • 🤖 AI Agents",
    status: "Free Course",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-3-neo-scholars-a-2m-ai-challenge-and-an-85k-ai-fellowship-cjf#google-agents-course"
  },

  // --- EDITION #2 (June 5, 2026) ---
  {
    id: "interactivity-grants",
    title: "Interactivity Research Grants",
    organization: "Thinking Machines Lab",
    description: "Interactivity Research Grants supports projects that explore how humans and AI can work together more effectively. Selected projects can receive up to $25,000 in Tinker credits to support their research. Areas of interest include multimodal interaction, generative interfaces, AI safety for real-time systems, and human oversight of long-running AI agents.",
    whyFeatured: "I wanted to include this because it wasn't just another AI grant. The focus is on making AI a better collaborator rather than simply making it more autonomous, which I found particularly interesting.",
    deadline: "June 19, 2026 (Closed)",
    category: "Funding & Grants",
    tags: ["AI", "Research", "Funding", "Grants", "Human-AI Interaction", "Multimodal AI", "AI Safety"],
    featuredInEdition: 1,
    officialWebsite: "https://example.com/dummy-interactivity-grants-website",
    relatedIds: ["solo-grants", "sentient-agi-grant"],
    dateAdded: "2026-05-29",
    whoItsFor: "Researchers exploring human-AI interaction and collaboration.",
    quickFacts: "🌍 Global • 💰 Up to $25,000 in credits • 🔬 Human-AI Interaction Research",
    status: "Closed",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/dev-opportunity-radar-1-a-100k-ai-grant-two-fellowships-and-an-ai-agent-resource-2ja3#interactivity-research-grants-by-thinking-machines"
  },
  {
    id: "commit-fellowship",
    title: "Commit Fellowship",
    organization: "MLH × Transcend Network",
    description: "Commit Fellowship is a three-week program designed for people who are curious about entrepreneurship but haven't started building a company yet. No startup idea, co-founder, or previous founder experience is required, making it a welcoming place for people who are still exploring what they want to build.",
    whyFeatured: "I wanted to include this because it feels much more approachable than many founder programs. Instead of expecting applicants to already have a startup, it supports people who are still figuring things out. I know that stage can feel overwhelming, so seeing a program built specifically for beginners was refreshing.",
    deadline: "Closed",
    category: "Fellowships",
    tags: ["Fellowship", "Entrepreneurship", "Beginner-Friendly", "Founders"],
    featuredInEdition: 1,
    officialWebsite: "https://example.com/dummy-commit-fellowship-website",
    relatedIds: ["flow-fellowship", "neo-scholars"],
    dateAdded: "2026-05-29",
    whoItsFor: "People curious about entrepreneurship who want to explore what they want to build before starting a company.",
    quickFacts: "🌎 North America • ⏳ 3 weeks • 🚀 Beginner friendly",
    status: "Closed",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/dev-opportunity-radar-1-a-100k-ai-grant-two-fellowships-and-an-ai-agent-resource-2ja3#commit-fellowship"
  },
  {
    id: "fr8-residency",
    title: "FR8 Residency",
    organization: "FR8",
    description: "FR8 is a residency for ambitious builders who want dedicated time and support to work on their ideas. It brings together people from different technical backgrounds and gives them the space to build, collaborate, and learn alongside others.",
    whyFeatured: "Residencies like this don't come along very often, and I liked that the focus wasn't only on funding. Having the time, environment, and community to work on something meaningful can be just as valuable.",
    deadline: "Rolling",
    category: "Fellowships",
    tags: ["Residency", "Builders", "Community", "Collaboration"],
    featuredInEdition: 2,
    officialWebsite: "https://example.com/dummy-fr8-residency-website",
    relatedIds: ["leapyear-startup", "neo-scholars"],
    dateAdded: "2026-06-05",
    whoItsFor: "Ambitious builders who want dedicated time and support to work on their ideas alongside other talented builders.",
    quickFacts: "🌍 International • 🏡 Residency • 🤝 Community focused",
    status: "Rolling Applications",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/dev-opportunity-radar-2-a-fully-funded-residency-in-finland-ai-research-program-and-a-60k-33l4#fr8"
  },
  {
    id: "kodekloud-100",
    title: "KodeKloud – 100 Days of Cloud",
    organization: "KodeKloud",
    description: "A free hands-on challenge where participants complete real cloud tasks over 100 days while learning AWS, Azure, Linux, Kubernetes, Docker, and DevOps concepts.",
    whyFeatured: "I always enjoy finding resources that encourage people to build rather than just watch videos. This challenge does exactly that by giving you something practical to work on every day.",
    deadline: "Ongoing",
    category: "Learning Resources",
    tags: ["Cloud", "AWS", "Azure", "DevOps", "Kubernetes"],
    featuredInEdition: 5,
    officialWebsite: "https://kodekloud.com",
    relatedIds: ["learn-to-cloud", "google-cloud-career"],
    dateAdded: "2026-06-05",
    whoItsFor: "Anyone looking to build practical cloud computing skills.",
    quickFacts: "☁️ Cloud • 🆓 Free • 📅 100 Days Challenge",
    status: "Ongoing",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-5-a-fully-funded-trip-to-aws-reinvent-google-cloud-career-launchpad-and-3p6e#kodekloud-100-days-of-cloud"
  },

  // --- EDITION #3 (June 12, 2026) ---
  {
    id: "neo-scholars",
    title: "Neo Scholars",
    organization: "Neo",
    description: "Neo Scholars is designed for ambitious students who want to explore entrepreneurship while continuing their studies. Participants gain access to mentorship, founder networks, and opportunities to learn from experienced entrepreneurs.",
    whyFeatured: "I wanted to include this because there aren't many founder programs built specifically for students. It gives people the chance to explore building something without waiting until after graduation.",
    deadline: "Closed",
    category: "Startup & Founder Programs",
    tags: ["Student", "Founder", "Mentorship", "Startups"],
    featuredInEdition: 3,
    officialWebsite: "https://example.com/dummy-neo-scholars-website",
    relatedIds: ["leapyear-startup", "ycombinator-school"],
    dateAdded: "2026-06-12",
    whoItsFor: "Ambitious students who want to explore entrepreneurship while continuing their studies.",
    quickFacts: "🎓 Student focused • 🚀 Founder community • 🤝 Mentorship",
    status: "Closed",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-3-neo-scholars-a-2m-ai-challenge-and-an-85k-ai-fellowship-cjf#neo-scholars"
  },
  {
    id: "gemini-xprize-challenge",
    title: "Gemini × XPRIZE AI Business Challenge",
    organization: "Google × XPRIZE",
    description: "A global competition inviting teams to use Google's Gemini models to build AI-powered solutions for real-world challenges. Selected teams compete for a share of a multi-million-dollar prize pool while developing projects with meaningful impact.",
    whyFeatured: "I wanted to share this because opportunities at this scale don't come around very often. Whether you're interested in AI, entrepreneurship, or solving real-world problems, it was one of the biggest competitions I came across this year.",
    deadline: "Closed",
    category: "Hackathons & Challenges",
    tags: ["Hackathon", "AI", "Gemini", "Social Impact"],
    featuredInEdition: 3,
    officialWebsite: "https://example.com/dummy-gemini-xprize-website",
    relatedIds: ["sentient-agi-grant", "midnight-hackathon"],
    dateAdded: "2026-06-12",
    whoItsFor: "Teams and developers interested in AI, entrepreneurship, and solving global challenges using Gemini.",
    quickFacts: "🌍 Global • 🏆 $2M Prize Pool • 🤖 AI Challenge",
    status: "Closed",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-3-neo-scholars-a-2m-ai-challenge-and-an-85k-ai-fellowship-cjf#gemini-xprize"
  },
  {
    id: "claude-corps",
    title: "⭐ Claude Corps (Community Find)",
    organization: "Anthropic × CodePath × Social Finance",
    description: "Claude Corps places early-career fellows inside nonprofit organizations for a year, where they help teams apply AI to real-world challenges. Fellows receive training, mentorship, relocation support where needed, and gain hands-on experience working on projects that have a meaningful social impact.",
    whyFeatured: "I thought this was an interesting opportunity because it combines learning with real-world impact. Rather than treating AI as something you only study, fellows spend a year helping organizations solve practical problems. I'm also grateful to Phinn for sharing this with the community, since it's exactly the kind of opportunity I hope readers continue to discover together.",
    deadline: "July 17, 2026",
    category: "Fellowships",
    tags: ["Fellowship", "AI", "Nonprofit", "Social-Good", "Community Find"],
    featuredInEdition: 3,
    officialWebsite: "https://example.com/dummy-claude-corps-website",
    relatedIds: ["claude-open-source", "sentient-agi-grant"],
    dateAdded: "2026-06-12",
    whoItsFor: "Early-career fellows wanting to apply AI to real-world challenges inside nonprofit organizations.",
    quickFacts: "💰 $85,000 salary • 📅 1 year • ❤️ Mission-driven organizations",
    status: "Open",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/edition-3#claude-corps",
    sharedBy: "Shared by Phinn Markson"
  },
  {
    id: "ai-tinkerers-community",
    title: "AI Tinkerers",
    organization: "AI Tinkerers",
    description: "AI Tinkerers is a global community where people share real AI projects, technical workflows, lessons learned, and practical implementation ideas through meetups, demo nights, workshops, and other community events.",
    whyFeatured: "One of the things I liked most about AI Tinkerers is that it's built around people showing what they've actually built rather than talking about AI in theory. If you enjoy learning by seeing real projects and sharing your own work, it's worth checking out.",
    deadline: "Ongoing",
    category: "Communities",
    tags: ["AI", "Community", "Meetups", "Networking", "Builders", "Learning"],
    featuredInEdition: 3,
    officialWebsite: "https://example.org/ai-tinkerers",
    relatedIds: ["hands-on-agents", "aws-she-builds"],
    dateAdded: "2026-06-12",
    whoItsFor: "Developers, engineers, researchers, and builders who are actively building with AI.",
    quickFacts: "🌍 Global • 🆓 Free to join • 🤝 Community Find",
    status: "Ongoing",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/edition-3#ai-tinkerers",
    sharedBy: "Shared by Julien Avezou"
  },
  {
    id: "mlh-hacking-for-good",
    title: "MLH Global Hack Week: Hacking for Good",
    organization: "Major League Hacking",
    description: "A week-long online event where developers complete challenges, attend workshops, learn new technologies, and build projects focused on creating positive social impact.",
    whyFeatured: "I really liked how beginner-friendly this event was. You didn't need a team or previous hackathon experience to take part, making it a welcoming place for anyone who wanted to learn by building.",
    deadline: "Closed",
    category: "Hackathons & Challenges",
    tags: ["Hackathon", "MLH", "Social Good", "Community Find"],
    featuredInEdition: 3,
    officialWebsite: "https://example.com/dummy-mlh-hacking-for-good-website",
    relatedIds: ["mlh-digitalocean", "midnight-hackathon"],
    dateAdded: "2026-06-12",
    whoItsFor: "Beginners and developers wanting to learn new skills while hacking for social good.",
    quickFacts: "💙 Community Find • 🌍 Global • 🆓 Free • 📅 One Week",
    status: "Closed",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/edition-3#mlh-global-hack-week",
    sharedBy: "Shared by Francis"
  },
  {
    id: "hands-on-agents",
    title: "Hands-on AI Agents",
    organization: "Hands-on AI Agents",
    description: "Hands-on AI Agents is an upcoming book by Antonio Gulli that teaches modern AI agent development through practical examples covering topics like LangGraph, CrewAI, MCP, memory, observability, multimodal agents, and multi-agent systems.",
    whyFeatured: "I wanted to include this because it focuses on building a real system throughout the book instead of jumping between unrelated examples. It's one of those resources that's useful whether you're just getting started or already experimenting with AI agents.",
    deadline: "Ongoing",
    category: "Learning Resources",
    tags: ["AI Agents", "LangGraph", "MCP", "CrewAI", "Book", "Open Learning"],
    featuredInEdition: 1,
    officialWebsite: "https://example.org/hands-on-agents",
    relatedIds: ["google-agents-intensive", "principles-agents"],
    dateAdded: "2026-06-12",
    whoItsFor: "Developers, AI engineers, and anyone interested in building AI agents.",
    quickFacts: "📖 Book • 🆓 Free • 🧠 AI Agents",
    status: "Ongoing",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/dev-opportunity-radar-1-a-100k-ai-grant-two-fellowships-and-an-ai-agent-resource-2ja3#hands-on-ai-agents"
  },

  // --- EDITION #4 (June 19, 2026) ---
  {
    id: "anthropic-fellows",
    title: "Anthropic Fellows Program",
    organization: "Anthropic",
    description: "Anthropic's Fellows Program supports technical builders who want to spend four months working on AI research. Fellows receive mentorship from Anthropic researchers, funding, compute resources, and the opportunity to contribute to research across areas such as AI safety, machine learning systems, reinforcement learning, and AI policy.",
    whyFeatured: "What impressed me most was that Anthropic doesn't expect everyone to come from a traditional research background. They place a lot of value on curiosity, technical ability, and a willingness to learn. I think that opens the door for many developers who might otherwise assume research fellowships aren't for them.",
    deadline: "Rolling",
    category: "Fellowships",
    tags: ["Fellowship", "AI", "Research", "AI Safety", "Machine Learning"],
    featuredInEdition: 4,
    officialWebsite: "https://example.com/dummy-anthropic-fellows-website",
    relatedIds: ["flow-fellowship", "soar-research"],
    dateAdded: "2026-06-19",
    whoItsFor: "Technical builders, developers, and researchers interested in spending four months working on AI research.",
    quickFacts: "💰 Paid • 🧠 Research mentorship • 💻 Compute support • 🌎 US / UK / Canada",
    status: "Rolling Applications",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-4-anthropic-fellows-30k-for-founders-and-aws-she-builds-2a6b#anthropic-fellows-program"
  },
  {
    id: "leapyear-startup",
    title: "LeapYear",
    organization: "LeapYear",
    description: "LeapYear backs students, recent graduates, and early-stage founders with funding, mentorship, and a year of support while they build their startup. Participants can continue working from wherever they are instead of relocating.",
    whyFeatured: "One reason I wanted to share LeapYear is that it supports founders much earlier than many startup programs do. You don't need to have everything figured out before applying, and I think that's encouraging for people who are just getting started.",
    deadline: "Closed",
    category: "Startup & Founder Programs",
    tags: ["Founder", "Incubator", "Remote", "Funding"],
    featuredInEdition: 4,
    officialWebsite: "https://example.com/dummy-leapyear-website",
    relatedIds: ["neo-scholars", "fr8-residency"],
    dateAdded: "2026-06-19",
    whoItsFor: "Students, recent graduates, and early-stage founders seeking early-stage startup funding and mentorship.",
    quickFacts: "💰 $30,000 funding • 🌍 Remote friendly • 🚀 Early-stage founders",
    status: "Closed",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-4-anthropic-fellows-30k-for-founders-and-aws-she-builds-2a6b#leapyear"
  },
  {
    id: "aws-she-builds",
    title: "AWS She Builds Mentorship Program",
    organization: "Amazon Web Services (AWS)",
    description: "AWS She Builds is a mentorship program that connects participants with experienced mentors while providing learning opportunities, technical sessions, and a supportive community. The program is designed to help participants grow their cloud skills while learning from people already working in the industry.",
    whyFeatured: "One reason I wanted to include this program is that good mentorship can completely change someone's career. Learning technical skills is important, but having someone who's already walked that path and is willing to share their experience can make a huge difference.",
    deadline: "June 30, 2026 (Closed)",
    category: "Mentorship",
    tags: ["Mentorship", "Cloud", "AWS"],
    featuredInEdition: 4,
    officialWebsite: "https://example.com/dummy-aws-she-builds-website",
    relatedIds: ["google-cloud-career", "google-agents-intensive"],
    dateAdded: "2026-06-19",
    whoItsFor: "Women interested in building careers in cloud computing who are looking for mentorship, technical learning, and community support.",
    quickFacts: "🤝 Mentorship • ☁️ Cloud • 🌍 Community",
    status: "Closed",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-4-anthropic-fellows-30k-for-founders-and-aws-she-builds-2a6b#aws-she-builds-mentorship-program"
  },
  {
    id: "principles-agents",
    title: "Principles of Building AI Agents",
    organization: "Principles of Building AI Agents",
    description: "A free book covering the core concepts behind AI agents, including tool calling, memory, workflows, MCP, retrieval, deployment, observability, and multi-agent systems.",
    whyFeatured: "I shared this because it explains the underlying ideas rather than focusing on a single framework. Those concepts stay useful no matter which tools you decide to use later.",
    deadline: "Ongoing",
    category: "Learning Resources",
    tags: ["AI Agents", "Book", "MCP", "RAG", "Observability"],
    featuredInEdition: 4,
    officialWebsite: "https://example.org/principles-ai-agents",
    relatedIds: ["patterns-agents", "google-agents-intensive"],
    dateAdded: "2026-06-19",
    whoItsFor: "Developers interested in understanding the foundations of AI agents.",
    quickFacts: "📖 Free Book • 🤖 AI Agents • 🛠️ Foundations",
    status: "Free",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-4-anthropic-fellows-30k-for-founders-and-aws-she-builds-2a6b#ai-agent-books"
  },
  {
    id: "patterns-agents",
    title: "Patterns of Building AI Agents",
    organization: "Patterns of Building AI Agents",
    description: "A companion book that focuses on production-ready AI systems, covering topics such as evaluation workflows, context engineering, security, human-in-the-loop systems, and scalable agent architectures.",
    whyFeatured: "I think this pairs really well with Principles of Building AI Agents. Once you've understood the basics, this helps you think about what happens when those ideas need to work in the real world.",
    deadline: "Ongoing",
    category: "Learning Resources",
    tags: ["AI Agents", "Production AI", "Context Engineering", "Security"],
    featuredInEdition: 4,
    officialWebsite: "https://example.org/patterns-ai-agents",
    relatedIds: ["principles-agents", "hands-on-agents"],
    dateAdded: "2026-06-19",
    whoItsFor: "Developers looking to move from prototypes to production AI systems.",
    quickFacts: "📖 Free Book • 🚀 Production AI • 🔒 Security",
    status: "Free",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-4-anthropic-fellows-30k-for-founders-and-aws-she-builds-2a6b#ai-agent-books"
  },

  // --- EDITION #5 (June 26, 2026) ---
  {
    id: "aws-all-builders-welcome",
    title: "AWS All Builders Welcome Grant",
    organization: "Amazon Web Services (AWS)",
    description: "The AWS All Builders Welcome Grant provides underrepresented builders in technology with funding, mentorship, and support to attend AWS re:Invent, helping them grow their careers and connect with the global cloud community.",
    whyFeatured: "This grant is a fantastic opportunity for underrepresented developers to attend one of the biggest cloud conferences in the world. The addition of structured mentorship and community support makes it much more than just a free ticket—it's a launchpad for professional growth.",
    deadline: "Closed",
    category: "Funding & Grants",
    tags: ["Cloud", "AWS", "Grants", "Diversity", "Conference"],
    featuredInEdition: 5,
    officialWebsite: "https://aws.amazon.com/allbuilderswelcome/",
    relatedIds: ["aws-she-builds", "solo-grants"],
    dateAdded: "2026-06-26",
    whoItsFor: "Underrepresented builders in technology looking to attend AWS re:Invent and grow their cloud careers.",
    quickFacts: "🌍 Global • 💰 Fully Funded Trip • 🤝 Mentorship & Support",
    status: "Closed",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-5-a-fully-funded-trip-to-aws-reinvent-google-cloud-career-launchpad-and-3p6e#aws-all-builders-welcome-grant"
  },
  {
    id: "google-cloud-career",
    title: "Google Cloud Career Launchpad",
    organization: "Google Cloud × Mentor Me Collective",
    description: "Google Cloud Career Launchpad is a structured career accelerator that combines cloud learning, mentorship, professional development, and community support to help participants prepare for cloud careers.",
    whyFeatured: "There are plenty of places to learn cloud skills, but building a career often takes more than technical knowledge alone. I liked that this program combines learning with mentorship and career guidance, making it feel much more practical for people trying to break into the field.",
    deadline: "July 3, 2026 (Closed)",
    category: "Career & Professional Development",
    tags: ["Cloud", "Google Cloud", "Career Development", "Mentorship"],
    featuredInEdition: 5,
    officialWebsite: "https://example.com/dummy-gcp-career-launchpad-website",
    relatedIds: ["aws-she-builds", "kodekloud-100"],
    dateAdded: "2026-06-26",
    whoItsFor: "Students, recent graduates, career changers, and early-career professionals interested in building a career in cloud computing.",
    quickFacts: "☁️ Cloud • 🚀 Career Growth • 🤝 Mentorship",
    status: "Closed",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-5-a-fully-funded-trip-to-aws-reinvent-google-cloud-career-launchpad-and-3p6e#google-cloud-career-launchpad"
  },
  {
    id: "leaders-of-today",
    title: "Leaders of Today",
    organization: "Leaders of Today",
    description: "The Leaders of Today Award recognizes young people building meaningful projects by providing funding, recognition, and a platform to showcase their work. It aims to encourage early-stage builders who are making a difference in their communities.",
    whyFeatured: "I liked that this wasn't just about rewarding finished products. Programs like this can give early builders a confidence boost and a little extra support to keep going.",
    deadline: "July 5, 2026 (Closed)",
    category: "Funding & Grants",
    tags: ["Awards", "Builders", "Students", "Young Founders", "Funding", "Innovation"],
    featuredInEdition: 5,
    officialWebsite: "https://example.com/dummy-leaders-of-today-website",
    relatedIds: ["mlh-hacking-for-good", "solo-grants"],
    dateAdded: "2026-06-26",
    whoItsFor: "Young builders, innovators, and people working on projects that create a positive impact.",
    quickFacts: "🏆 Recognition • 💰 $1,000 Award • 🌍 Global",
    status: "Closed",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-5-a-fully-funded-trip-to-aws-reinvent-google-cloud-career-launchpad-and-3p6e#leaders-of-today-award"
  },
  {
    id: "mlh-digitalocean",
    title: "Hack with MLH & DigitalOcean",
    organization: "MLH × DigitalOcean",
    description: "A community hackathon bringing developers together to build projects while learning new technologies and competing for prizes. The event was shared by a reader as part of the Community Finds section.",
    whyFeatured: "One of my favorite parts of this series is discovering opportunities through readers. This was one of those moments, and I'm grateful it was shared so more people could discover it too.",
    deadline: "Closed",
    category: "Hackathons & Challenges",
    tags: ["Hackathon", "Cloud", "DigitalOcean", "Community Find"],
    featuredInEdition: 5,
    officialWebsite: "https://example.com/dummy-mlh-digitalocean-website",
    relatedIds: ["mlh-hacking-for-good", "midnight-hackathon"],
    dateAdded: "2026-06-26",
    whoItsFor: "Developers looking to participate in a community-driven cloud hackathon.",
    quickFacts: "💙 Community Find • 🌍 Online • 💻 Hackathon",
    status: "Closed",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/edition-5#hack-with-mlh-and-digitalocean",
    sharedBy: "Shared by L. Cordero"
  },
  {
    id: "llm-zoomcamp",
    title: "LLM Zoomcamp",
    organization: "DataTalksClub Ecosystem",
    description: "A free, hands-on, community-supported 9-week intensive engineering course focused on building production-grade LLM applications using vector search engines, RAG systems, and evaluation frameworks.",
    whyFeatured: "Widely regarded as the most rigorous practical RAG engineering track. It goes deep into indexing strategies, embeddings tuning, and cost optimization techniques.",
    deadline: "Ongoing",
    category: "Learning Resources",
    tags: ["Course", "AI", "Vector-Search", "RAG", "Hands-On"],
    featuredInEdition: 2,
    officialWebsite: "https://github.com/DataTalksClub/llm-zoomcamp",
    relatedIds: ["hands-on-agents", "principles-agents"],
    dateAdded: "2026-06-26",
    whoItsFor: "Developers seeking highly rigorous practical RAG engineering training.",
    quickFacts: "🧠 AI • 🗺️ 9 Weeks • 🆓 Free Course • 🛠️ Hands-On",
    status: "Ongoing",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/dev-opportunity-radar-2-a-fully-funded-residency-in-finland-ai-research-program-and-a-60k-33l4#llm-zoomcamp"
  },
  {
    id: "learn-to-cloud",
    title: "Learn to Cloud",
    organization: "Learn to Cloud",
    description: "Learn to Cloud is a community-driven roadmap that combines cloud concepts with hands-on projects, certifications, networking, and portfolio building.",
    whyFeatured: "I wanted to include this because it gives people a clear path instead of leaving them wondering what to learn next. That kind of structure can make getting started much less overwhelming.",
    deadline: "Ongoing",
    category: "Learning Resources",
    tags: ["Cloud", "AWS", "Career", "Roadmap", "Portfolio"],
    featuredInEdition: 6,
    officialWebsite: "https://learntocloud.guide",
    relatedIds: ["kodekloud-100", "google-cloud-career"],
    dateAdded: "2026-06-26",
    whoItsFor: "Developers who want a structured roadmap into cloud engineering.",
    quickFacts: "☁️ Cloud • 🗺️ Roadmap • 🆓 Free",
    status: "Ongoing",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-6-y-combinator-startup-school-open-source-ai-grants-and-a-60k-apac-4nlp#learn-to-cloud"
  },

  // --- EDITION #6 (July 3, 2026) ---
  {
    id: "ycombinator-school",
    title: "Y Combinator Startup School",
    organization: "Y Combinator",
    description: "Startup School brings together technical builders for two days of talks, small-group discussions, networking, demos, and conversations with YC partners. Accepted attendees also receive access to more than $25,000 in AI and cloud credits from partner organizations.",
    whyFeatured: "I think the biggest value here isn't just the talks. It's spending time surrounded by people who are actively building, experimenting, and sharing ideas. Those kinds of conversations can be just as valuable as anything you'll hear on stage.",
    deadline: "Closed",
    category: "Startup & Founder Programs",
    tags: ["Founder", "Course", "Startups", "Networking"],
    featuredInEdition: 6,
    officialWebsite: "https://example.com/dummy-yc-startup-school-website",
    relatedIds: ["leapyear-startup", "neo-scholars"],
    dateAdded: "2026-07-03",
    whoItsFor: "Technical builders, aspiring founders, and developer teams looking to network and get YC partner credits.",
    quickFacts: "📍 San Francisco • 💰 $25k+ partner credits • 🤝 YC community",
    status: "Closed",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/edition-6#yc-startup-school"
  },
  {
    id: "sentient-agi-grant",
    title: "Sentient Open Source AGI Grant Program",
    organization: "Sentient Foundation",
    description: "The Sentient Open Source AGI Grant Program provides funding and investment to open-source AI projects that help advance the broader ecosystem. Rather than focusing on closed products, the program encourages work that can benefit the wider community through open collaboration.",
    whyFeatured: "Open-source AI is moving incredibly quickly, and I liked seeing a funding program specifically aimed at supporting builders who are creating tools and infrastructure that everyone can benefit from.",
    deadline: "Rolling",
    category: "Funding & Grants",
    tags: ["Open Source", "AI", "Grants", "Funding", "AGI", "Research"],
    featuredInEdition: 6,
    officialWebsite: "https://example.com/dummy-sentient-agi-grants-website",
    relatedIds: ["interactivity-grants", "claude-open-source"],
    dateAdded: "2026-07-03",
    whoItsFor: "Open-source AI developers, researchers, builders, and teams working on projects that contribute to the open AI ecosystem.",
    quickFacts: "🌍 Global • 🔄 Rolling Applications • 🤖 Open-source AI",
    status: "Open",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-6-y-combinator-startup-school-open-source-ai-grants-and-a-60k-apac-4nlp#sentient-open-source-agi-grant-program"
  },
  {
    id: "apac-stellar-hack",
    title: "APAC Stellar Hackathon",
    organization: "Stellar",
    description: "An online hackathon encouraging developers across the Asia-Pacific region to build applications using Stellar. Participants could explore blockchain development while competing for prizes and connecting with other builders.",
    whyFeatured: "I liked that it welcomed developers who were simply curious about building with Stellar, not just people who already had blockchain experience. It felt approachable while still offering meaningful prizes and support.",
    deadline: "Closed",
    category: "Hackathons & Challenges",
    tags: ["Hackathon", "Stellar", "Blockchain", "Fintech", "APAC"],
    featuredInEdition: 6,
    officialWebsite: "https://example.com/dummy-apac-stellar-hack-website",
    relatedIds: ["gemini-xprize-challenge", "midnight-hackathon"],
    dateAdded: "2026-07-03",
    whoItsFor: "Developers across the APAC region curious about building on the Stellar blockchain ecosystem.",
    quickFacts: "🌏 APAC • 💻 Online • ⭐ Stellar Ecosystem",
    status: "Closed",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-6-y-combinator-startup-school-open-source-ai-grants-and-a-60k-apac-4nlp#apac-stellar-hackathon"
  },
  {
    id: "calec-opportunities",
    title: "CALEC Volunteer & Internship Opportunities",
    organization: "CALEC",
    description: "CALEC regularly shares remote volunteer and internship opportunities across different fields, making it easier for people to discover ways to build experience, contribute to meaningful projects, and strengthen their portfolios.",
    whyFeatured: "This wasn't something I discovered myself. Francis shared it with the community, and I'm really glad he did because it's exactly the kind of opportunity I hope readers continue sharing. It can be especially valuable for people looking to gain experience when finding that first opportunity isn't easy.",
    deadline: "Ongoing",
    category: "Volunteer & Internships",
    tags: ["Volunteer", "Internship", "Remote", "Community Find"],
    featuredInEdition: 6,
    officialWebsite: "https://example.com/dummy-calec-opportunities-website",
    relatedIds: ["mlh-hacking-for-good", "aws-she-builds"],
    dateAdded: "2026-07-03",
    whoItsFor: "Students, recent graduates, career changers, and anyone looking to gain practical experience through remote volunteer work or internships.",
    quickFacts: "🌍 Remote • 💼 Experience • 🤝 Community Find",
    status: "Ongoing",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/edition-6#calec-volunteer-and-internship-opportunities",
    sharedBy: "Shared by Francis"
  },
  {
    id: "learnweb3",
    title: "LearnWeb3",
    organization: "LearnWeb3",
    description: "LearnWeb3 offers structured learning paths, hands-on projects, and practical exercises covering blockchain fundamentals, smart contracts, Solidity, and modern Web3 development.",
    whyFeatured: "One thing I liked about LearnWeb3 is that it focuses on actually building projects instead of only explaining concepts. If you prefer learning by doing, it's worth exploring.",
    deadline: "Ongoing",
    category: "Learning Resources",
    tags: ["Web3", "Blockchain", "Solidity", "Learning", "Projects"],
    featuredInEdition: 3,
    officialWebsite: "https://learnweb3.io",
    relatedIds: ["the-odin-project", "llm-zoomcamp"],
    dateAdded: "2026-07-03",
    whoItsFor: "Anyone interested in learning blockchain and Web3 development.",
    quickFacts: "🌐 Web3 • 🆓 Free • 🛠️ Hands-On",
    status: "Ongoing",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-3-neo-scholars-a-2m-ai-challenge-and-an-85k-ai-fellowship-cjf#learnweb3"
  },

  // --- EDITION #7 (July 10, 2026) ---
  {
    id: "solo-grants",
    title: "Solo Grants",
    organization: "Solo Grants",
    description: "Solo Grants provides $1,000 to help solo builders move their projects forward. The funding can be used for things like hardware, compute credits, APIs, PCBs, software, materials, or anything else needed to build a working prototype. Applications are open worldwide and reviewed on a rolling basis.",
    whyFeatured: "This one immediately stood out to me because it's refreshingly simple. There's no pitch deck, no accelerator, and no expectation that your project becomes a startup. Sometimes all someone needs is a few hundred dollars to keep building, and that's exactly the gap this grant is trying to fill.",
    deadline: "Rolling",
    category: "Funding & Grants",
    tags: ["Solo Builders", "Grants", "Funding", "Indie Hackers", "Open Source", "Hardware", "Software"],
    featuredInEdition: 7,
    officialWebsite: "https://example.com/dummy-solo-grants-website",
    relatedIds: ["interactivity-grants", "claude-open-source"],
    dateAdded: "2026-07-10",
    whoItsFor: "Anyone, anywhere in the world working on a solo project they genuinely care about, whether it's software, hardware, research, open source, or something creative.",
    quickFacts: "🌍 Worldwide • 💰 $1,000 • 🔄 Rolling • ⏱️ Typical response in ~10 days",
    status: "Open",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-7-1000-solo-grants-free-claude-max-for-open-source-contributors-and-an-3i12#solo-grants"
  },
  {
    id: "claude-open-source",
    title: "Claude for Open Source",
    organization: "Anthropic",
    description: "Anthropic's Claude for Open Source program provides eligible open-source maintainers and contributors with six months of Claude Max (20×) at no cost. The goal is to support the people maintaining libraries, frameworks, and tools used throughout the developer ecosystem.",
    whyFeatured: "Open-source maintainers contribute an incredible amount of work behind the scenes, often with very little recognition or support. I thought this was a meaningful way of giving something back to the people who keep so many projects running.",
    deadline: "Rolling",
    category: "Open Source",
    tags: ["Open Source", "AI", "Claude", "Grants"],
    featuredInEdition: 7,
    officialWebsite: "https://example.com/dummy-claude-for-open-source-website",
    relatedIds: ["claude-corps", "sentient-agi-grant"],
    dateAdded: "2026-07-10",
    whoItsFor: "Eligible open-source maintainers and contributors seeking LLM tool access.",
    quickFacts: "❤️ Open Source • 🆓 Six Months of Claude Max • 🌍 Rolling Applications",
    status: "Rolling Applications",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-7-1000-solo-grants-free-claude-max-for-open-source-contributors-and-an-3i12#claude-for-open-source"
  },
  {
    id: "midnight-hackathon",
    title: "Midnight Hackathon",
    organization: "Midnight × MLH",
    description: "A 48-hour online hackathon focused on building privacy-first applications. The event welcomes students, professionals, and first-time hackathon participants, with learning resources available throughout the weekend.",
    whyFeatured: "One reason I wanted to share this was because you don't need previous blockchain experience to take part. If you've been curious about privacy-focused applications or simply wanted another hackathon to build something new, this looked like a great place to start.",
    deadline: "July 17, 2026",
    category: "Hackathons & Challenges",
    tags: ["Hackathon", "Privacy", "MLH", "Online"],
    featuredInEdition: 7,
    officialWebsite: "https://example.com/dummy-midnight-hackathon-website",
    relatedIds: ["mlh-hacking-for-good", "mlh-digitalocean"],
    dateAdded: "2026-07-10",
    whoItsFor: "Students, professionals, and developers curious about building privacy-first applications.",
    quickFacts: "🌍 Global • 💻 Online • 🔒 Privacy-first • ⏱️ 48 Hours",
    status: "Open",
    editionSectionLink: "https://dev.to/devengers/dev-opportunity-radar-7-1000-solo-grants-free-claude-max-for-open-source-contributors-and-an-3i12#midnight-hackathon"
  },
  {
    id: "aaif-ambassador",
    title: "AAIF Ambassador Program",
    organization: "Africa AI Foundation (AAIF)",
    description: "The AAIF Ambassador Program supports people who are passionate about growing AI communities through local events, workshops, and educational initiatives. Ambassadors receive resources, support, and opportunities to help expand access to AI learning.",
    whyFeatured: "I enjoy sharing opportunities that encourage people to build communities, not just careers. Programs like this create opportunities for many others, which makes their impact much bigger than helping a single individual.",
    deadline: "Closed",
    category: "Ambassador Programs",
    tags: ["Ambassador", "AI", "Community", "Leadership"],
    featuredInEdition: 2,
    officialWebsite: "https://example.com/dummy-aaif-ambassador-website",
    relatedIds: ["google-cloud-career", "aws-she-builds"],
    dateAdded: "2026-06-05",
    whoItsFor: "Students, developers, educators, and community leaders who want to promote AI education and grow local AI communities.",
    quickFacts: "🌍 Community • 🎤 Leadership • 🤝 AI Education",
    status: "Closed",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/dev-opportunity-radar-2-a-fully-funded-residency-in-finland-ai-research-program-and-a-60k-33l4#aaif-ambassador-program"
  },
  {
    id: "microsoft-ai-skills",
    title: "Microsoft AI Skills Fest",
    organization: "Microsoft",
    description: "Microsoft's AI Skills Fest is a free learning initiative featuring guided training, hands-on labs, and AI-focused sessions designed to help learners build practical skills.",
    whyFeatured: "Free learning opportunities from large organizations don't come around every day, so I thought this was worth sharing for anyone looking to spend time improving their AI skills.",
    deadline: "Closed",
    category: "Learning Resources",
    tags: ["Microsoft", "AI", "Learning", "Workshops"],
    featuredInEdition: 2,
    officialWebsite: "https://example.org/azure-ai-skills",
    relatedIds: ["google-agents-intensive", "learn-to-cloud"],
    dateAdded: "2026-07-10",
    whoItsFor: "Developers, students, and professionals interested in building AI skills.",
    quickFacts: "🤖 AI Skills • 🆓 Free • 💻 Guided Training",
    status: "Closed",
    editionSectionLink: "https://dev.to/hemapriya_kanagala/dev-opportunity-radar-2-a-fully-funded-residency-in-finland-ai-research-program-and-a-60k-33l4#microsoft-ai-skills-fest"
  }
];

export const EDITIONS: Edition[] = [
  {
    number: 7,
    publishedDate: "2026-07-10",  devToLink: "https://dev.to/devengers/dev-opportunity-radar-7-1000-solo-grants-free-claude-max-for-open-source-contributors-and-an-3i12",

    highlights: ["Solo Grants", "Claude for Open Source", "Midnight Hackathon"],
    opportunityIds: ["solo-grants", "claude-open-source", "midnight-hackathon", "the-odin-project"],
    introduction: "Welcome to Edition #7. This week we are highlighting opportunities that focus on the individual developer—the solo coders, the late-night enthusiasts, and those building critical adapters for open source libraries. Whether you are hacking alone on a micro-utility or submitting to a local compiler fund, these resources are for you.",
    closing: "As always, if you find something useful, share it with a friend who might otherwise miss out. Let's keep building together. See you next Friday."
  },
  {
    number: 6,
    publishedDate: "2026-07-03",  devToLink: "https://dev.to/devengers/dev-opportunity-radar-6-y-combinator-startup-school-open-source-ai-grants-and-a-60k-apac-4nlp",

    highlights: ["Y Combinator Startup School", "Sentient Open Source AGI Grant Program", "APAC Stellar Hackathon"],
    opportunityIds: ["ycombinator-school", "sentient-agi-grant", "apac-stellar-hack", "calec-opportunities", "learn-to-cloud"],
    introduction: "In Edition #6, we look at learning materials and regional blockathons in the APAC region. Additionally, we are highlighting a substantial new grant program aimed at keeping Artificial General Intelligence decentralized and open.",
    closing: "Thank you to Francis for submitting the CALEC civic tech opportunities. Let's keep the community finds coming!"
  },
  {
    number: 5,
    publishedDate: "2026-06-26",  devToLink: "https://dev.to/devengers/dev-opportunity-radar-5-a-fully-funded-trip-to-aws-reinvent-google-cloud-career-launchpad-and-3p6e",

    highlights: ["AWS All Builders Welcome Grant", "Google Cloud Career Launchpad", "Leaders of Today Award", "Hack with MLH & DigitalOcean"],
    opportunityIds: ["aws-all-builders-welcome", "google-cloud-career", "leaders-of-today", "mlh-digitalocean", "kodekloud-100"],
    introduction: "Edition #5 is all about cloud credits, training vouchers, and awards honoring developers under 28. If you have been held back by high hosting costs or expensive AWS certificates, these resources should help.",
    closing: "A big shout-out to L. Cordero for finding the MLH & DigitalOcean hackathon credits! That is exactly what this community project is about."
  },
  {
    number: 4,
    publishedDate: "2026-06-19",  devToLink: "https://dev.to/devengers/dev-opportunity-radar-4-anthropic-fellows-30k-for-founders-and-aws-she-builds-2a6b",

    highlights: ["Anthropic Fellows Program", "LeapYear", "AWS She Builds Mentorship Program"],
    opportunityIds: ["anthropic-fellows", "leapyear-startup", "aws-she-builds", "principles-agents", "patterns-agents"],
    introduction: "Welcome to Edition #4. Today we highlight three programs with deep personal mentorship: high-level systems safety at Anthropic, structured startup validation in a quiet Utah cabin, and Solution Architecture guidance with AWS She Builds.",
    closing: "Mentorship is the shortcut to avoiding critical errors. Take advantage of these structured opportunities to learn from veteran builders."
  },
  {
    number: 3,
    publishedDate: "2026-06-12",  devToLink: "https://dev.to/devengers/dev-opportunity-radar-3-neo-scholars-a-2m-ai-challenge-and-an-85k-ai-fellowship-cjf",

    highlights: ["Neo Scholars", "Gemini × XPRIZE AI Business Challenge", "Claude Corps", "AI Tinkerers"],
    opportunityIds: ["neo-scholars", "gemini-xprize-challenge", "claude-corps", "ai-tinkerers-community", "mlh-hacking-for-good", "google-agents-intensive", "learnweb3"],
    introduction: "Edition #3 brings some of our first community nominated finds. We look at prestigious developer networks, a substantial XPRIZE challenge, and the raw, real meetups of AI Tinkerers. No hype, just real builders sharing actual code.",
    closing: "A massive thank you to Julien, Phinn, and Francis for contributing to this edition. The developer community is stronger because of you."
  },
  {
    number: 2,
    publishedDate: "2026-06-05",  devToLink: "https://dev.to/hemapriya_kanagala/dev-opportunity-radar-2-a-fully-funded-residency-in-finland-ai-research-program-and-a-60k-33l4",

    highlights: ["FR8 Residency", "Google Cloud Rapid Agent Hackathon", "Summer of Open AI Research", "Microsoft AI Skills Fest", "LLM Zoomcamp"],
    opportunityIds: ["fr8-residency", "gcp-rapid-agent", "soar-research", "microsoft-ai-skills", "llm-zoomcamp", "aaif-ambassador"],
    introduction: "In Edition #2, we explore the wonderful concept of physical residencies. From logistics tech labs in Berlin to arts-and-crafts electronics saunas in Helsinki, we look at spaces that let you touch real hardware.",
    closing: "If you need a quiet space to reset, apply to Helsinki or Berlin. Stepping away from the glowing screen can do wonders for your architecture."
  },
  {
    number: 1,
    publishedDate: "2026-05-29",  devToLink: "https://dev.to/hemapriya_kanagala/dev-opportunity-radar-1-a-100k-ai-grant-two-fellowships-and-an-ai-agent-resource-2ja3",

    highlights: ["Flow Fellowship", "Commit Fellowship", "Interactivity Research Grants"],
    opportunityIds: ["flow-fellowship", "commit-fellowship", "hands-on-agents", "interactivity-grants"],
    introduction: "This is our inaugural edition! Dev Opportunity Radar is born out of a desire to make hidden developer opportunities easy to find, revisit, and discuss. In our very first week, we highlight deep alignment research support, general developer tool fellowships, and concrete agent playbooks.",
    closing: "We are officially started! Every Friday, we'll post more. Bookmark this page and check back whenever you need fresh momentum."
  }
];

export const COMMUNITY_FINDS: CommunityFind[] = [
  {
    id: "cf-1",
    title: "AI Tinkerers",
    type: "Community",
    sharedBy: "Julien Avezou",
    featuredInEdition: 3,
    description: "An incredibly active, slide-free group for developers building actual, functional LLM applications. Highly recommended local code demonstrations.",
    link: "https://dev.to/devengers/dev-opportunity-radar-3-neo-scholars-a-2m-ai-challenge-and-an-85k-ai-fellowship-cjf#ai-tinkerers",
    approved: true
  },
  {
    id: "cf-2",
    title: "Claude Corps",
    type: "Fellowship",
    sharedBy: "Phinn Markson",
    featuredInEdition: 3,
    description: "Sponsors open-source adapter programmers with direct API access, monetary stipends, and early parameters.",
    link: "https://dev.to/devengers/dev-opportunity-radar-3-neo-scholars-a-2m-ai-challenge-and-an-85k-ai-fellowship-cjf#claude-corps",
    approved: true
  },
  {
    id: "cf-3",
    title: "MLH Global Hack Week: Hacking for Good",
    type: "Hackathon",
    sharedBy: "Francis",
    featuredInEdition: 3,
    description: "A friendly, welcoming virtual week-long event building tools directly supporting local schools and charitable organizations.",
    link: "https://dev.to/devengers/dev-opportunity-radar-3-neo-scholars-a-2m-ai-challenge-and-an-85k-ai-fellowship-cjf#hacking-for-good",
    approved: true
  },
  {
    id: "cf-4",
    title: "Hack with MLH & DigitalOcean",
    type: "Hackathon",
    sharedBy: "L. Cordero",
    featuredInEdition: 5,
    description: "A great weekend buildathon centered on container deployments and cloud native architecture with $250 DO platform credits.",
    link: "https://dev.to/devengers/dev-opportunity-radar-5-a-fully-funded-trip-to-aws-reinvent-google-cloud-career-launchpad-and-3p6e#hack-with-mlh-and-digitalocean",
    approved: true
  },
  {
    id: "cf-5",
    title: "CALEC Volunteer & Internship Opportunities",
    type: "Volunteer & Internship Opportunities",
    sharedBy: "Francis",
    featuredInEdition: 6,
    description: "Civic-tech roles creating accessible bilingual education portals and open digital literacy archives.",
    link: "https://dev.to/devengers/dev-opportunity-radar-6-y-combinator-startup-school-open-source-ai-grants-and-a-60k-apac-4nlp#calec-volunteer-and-internship-opportunities",
    approved: true
  }
];

export const READER_UPDATES: ReaderUpdate[] = [
  {
    id: "ru-1",
    readerName: "Aiden Vance",
    opportunityName: "AWS She Builds Mentorship Program",
    story: "I had been trying to land my first cloud role for six months with no luck. After seeing the She Builds mentorship program in Edition #4, I applied and got in. My AWS Architect mentor helped me redesign my entire portfolio and gave me mock interviews. Yesterday, I signed my official offer letter! 💙",
    date: "2026-07-08"
  },
  {
    id: "ru-2",
    readerName: "Meera Nair",
    opportunityName: "Summer of Open AI Research (SOAR)",
    story: "As an independent researcher, obtaining high-performance GPU cluster compute was a massive roadblock. The micro-grant shared in Edition #1 helped cover my model testing fees. I just published my Mechanistic Interpretability study, and received co-nominations for the Anthropic Fellows Program!",
    date: "2026-07-01"
  },
  {
    id: "ru-3",
    readerName: "Kofi Boateng",
    opportunityName: "FR8 Lab Winter Residency",
    story: "Living in Berlin for 8 weeks under the FR8 Logistics Tech Guild was a life-altering experience. I built a physical transit adapter and met Julien. We are now collaborating on open hardware adapters!",
    date: "2026-06-28"
  },
  {
    id: "ru-4",
    readerName: "Tatsuo Tanaka",
    opportunityName: "Neo Scholars Program",
    story: "I didn't think a self-taught engineer like me stood a chance at the Neo Scholars program. Seeing it featured in Edition #3 with a note that they value raw project execution over Ivy-League resumes convinced me to apply. I was accepted! The community of other scholars has been incredibly welcoming.",
    date: "2026-07-05"
  },
  {
    id: "ru-5",
    readerName: "Sarah Jenkins",
    opportunityName: "Midnight Hackathon",
    story: "Our team of two stayed up until 4 AM during the Midnight Hackathon. We built a 3KB visual text editor. We won the 'Extreme Minimalism' category! Best hackathon experience of my life.",
    date: "2026-07-11"
  }
];

export const FAQS: FAQItem[] = [
  // Getting Started
  {
    question: "What is Dev Opportunity Radar?",
    answer: "Dev Opportunity Radar is a weekly community project that helps developers discover opportunities they otherwise might have missed.\n\nEvery Friday, I publish a new edition on DEV where I share grants, fellowships, hackathons, conferences, startup programs, internships, communities, learning resources, and anything else I think deserves more attention.\n\nThis website simply makes those opportunities easier to search, browse, and revisit over time.",
    category: "Getting Started"
  },
  {
    question: "Why did you start this?",
    answer: "Honestly, because I kept missing opportunities myself.\n\nI'd discover an amazing fellowship after applications had closed, come across a grant months too late, or realize an interesting hackathon had already happened.\n\nEventually I thought, \"If I'm missing these, maybe other people are too.\"\n\nSo instead of bookmarking everything for myself, I started sharing what I found.\n\nThat's how Dev Opportunity Radar began.",
    category: "Getting Started"
  },
  {
    question: "Who is this for?",
    answer: "Anyone who enjoys learning, building, and discovering new opportunities.\n\nWhether you're a student, an early-career developer, an experienced engineer, an open-source contributor, a founder, a researcher, or simply someone curious about what's happening in the developer ecosystem, I hope you'll find something useful here.",
    category: "Getting Started"
  },
  {
    question: "How often is it updated?",
    answer: "A new edition is published every Friday on DEV.\n\nThe website is updated alongside those editions, and if I come across something especially valuable during the week, I may add it here instead of waiting until Friday.",
    category: "Getting Started"
  },
  {
    question: "Is this website replacing the weekly DEV editions?",
    answer: "Not at all.\n\nThe weekly DEV editions are still the heart of Dev Opportunity Radar and always will be.\n\nThis website simply makes everything easier to explore and gives me a place to share important opportunities that can't always wait until Friday.",
    category: "Getting Started"
  },

  // Opportunities
  {
    question: "How do you find opportunities?",
    answer: "Every week I spend time exploring organization websites, newsletters, developer communities, open-source projects, social media, research programs, and recommendations shared by readers.\n\nSome opportunities take a long time to find.\n\nOthers appear unexpectedly.\n\nA surprising number come from people in the community who simply wanted to help others discover something useful.",
    category: "Opportunities"
  },
  {
    question: "Do you verify every opportunity?",
    answer: "I do my best to.\n\nBefore sharing anything, I spend time reading through the official information, checking eligibility, understanding deadlines, and making sure I can explain it clearly.\n\nThat said, organizations sometimes change their deadlines or requirements after publication.\n\nThat's why I always encourage readers to visit the official program page before applying.",
    category: "Opportunities"
  },
  {
    question: "Can I trust every deadline?",
    answer: "I always try to publish the latest information available when writing an edition.\n\nHowever, deadlines can change after publication.\n\nIf you're planning to apply, please take a moment to check the official website before submitting your application.\n\nThink of Dev Opportunity Radar as your starting point rather than the final source of information.",
    category: "Opportunities"
  },
  {
    question: "Why aren't some opportunities included?",
    answer: "There are simply more opportunities than one person could ever cover.\n\nSometimes I discover something after an edition has already been published.\n\nSometimes I don't find it at all.\n\nAnd sometimes I decide not to include something because I don't think it would genuinely benefit readers.\n\nI'd rather miss an opportunity than include something I don't feel confident recommending.",
    category: "Opportunities"
  },
  {
    question: "Do you only share AI opportunities?",
    answer: "Not at all.\n\nSome editions naturally include more AI-related opportunities because that's where many grants and programs are currently being launched.\n\nBut you'll also find cloud, open source, web development, startups, cybersecurity, research, internships, fellowships, hackathons, conferences, communities, and learning resources.\n\nIf it's something I think developers could benefit from, there's a good chance it'll appear here.",
    category: "Opportunities"
  },

  // Community
  {
    question: "What are Community Finds?",
    answer: "Community Finds are opportunities shared by readers.\n\nOne of my favorite parts of this project has been seeing people recommend grants, internships, communities, and events that I hadn't discovered myself.\n\nIf I feature something you shared, I'll always credit you.\n\nAfter all, you made the discovery.",
    category: "Community"
  },
  {
    question: "How do I submit a Community Find?",
    answer: "The easiest way is to leave a comment under the latest DEV edition.\n\nI read every comment, so that's usually the quickest way for me to see it.\n\nIf you're using this website instead, you'll also find a Community Find submission form.\n\nEither way works.",
    category: "Community"
  },
  {
    question: "Will I receive credit if you feature something I shared?",
    answer: "Absolutely.\n\nIf your recommendation appears in a future edition or on this website, I'll always credit you.\n\nRecognition should stay with the person who discovered it.",
    category: "Community"
  },
  {
    question: "What are Reader Updates?",
    answer: "Reader Updates celebrate people who discovered something through Dev Opportunity Radar.\n\nMaybe you applied for a fellowship.\n\nMaybe you joined a community.\n\nMaybe you attended a conference.\n\nOr maybe you simply discovered a resource that changed how you learn.\n\nThose stories are worth celebrating because they encourage others to take a chance on opportunities too.",
    category: "Community"
  },
  {
    question: "Can my story be featured?",
    answer: "I'd love that.\n\nIf you discovered something through Dev Opportunity Radar, feel free to leave a comment under the latest edition or send me a message.\n\nI'll always ask for your permission before featuring your story.",
    category: "Community"
  },

  // About the Project
  {
    question: "Who builds and maintains this?",
    answer: "Just me.\n\nEvery edition, every opportunity, every website update, every Community Find, and every Reader Update is personally researched, written, reviewed, and published by me.\n\nIf it ever takes me a little while to reply, thank you for your patience.",
    category: "About the Project"
  },
  {
    question: "Is this project free?",
    answer: "Yes.\n\nReading Dev Opportunity Radar, browsing this website, and submitting Community Finds will always be free.\n\nThe goal is to help people discover opportunities, not create barriers to accessing them.",
    category: "About the Project"
  },
  {
    question: "Why do you spend so much time doing this?",
    answer: "Because I know what it feels like to discover an amazing opportunity after it's already too late.\n\nIf this project helps even one person find something that changes their journey, then the time spent putting it together feels worthwhile.\n\nI also genuinely love seeing people encourage one another, share discoveries, and celebrate each other's wins.\n\nThat's probably my favorite part.",
    category: "About the Project"
  },
  {
    question: "What does success look like for this project?",
    answer: "Success isn't measured by how many editions I publish.\n\nIt's measured by people saying things like:\n\n\"I found this because of Dev Opportunity Radar.\"\n\n\"I applied.\"\n\n\"I got accepted.\"\n\n\"I discovered a community I never knew existed.\"\n\nThose moments remind me why I started.",
    category: "About the Project"
  },

  // Looking Ahead
  {
    question: "Will more features be added?",
    answer: "Definitely.\n\nThis website is only getting started.\n\nI'll continue improving it over time, but I'll always try to focus on features that genuinely make discovering opportunities easier rather than adding things simply because they're possible.\n\nYour time is valuable, and I want this project to respect that.",
    category: "Looking Ahead"
  },
  {
    question: "Can I suggest an improvement?",
    answer: "Please do.\n\nSome of the best ideas have come from readers.\n\nIf something would make the experience better, I'd genuinely love to hear it.",
    category: "Looking Ahead"
  },
  {
    question: "How can I support the project?",
    answer: "Honestly, the biggest support is simply being part of the community.\n\nReading the weekly editions, sharing opportunities, recommending resources, leaving thoughtful feedback, encouraging other readers, and telling someone about Dev Opportunity Radar all help this project grow.\n\nEvery Community Find and every Reader Update makes this a little better than it was the week before.",
    category: "Looking Ahead"
  },

  // A Welcoming Community
  {
    question: "Is this meant to be a safe and respectful space?",
    answer: "Yes. I genuinely hope this becomes a place where people feel comfortable discovering opportunities, asking questions, sharing resources, celebrating wins, and helping one another.\n\nWhether you're a student applying for your very first internship or someone with years of experience, I hope you always feel welcome here.\n\nKindness costs nothing, and I hope we can all choose it.\n\nThis community exists because people are willing to help one another, and I'd love to keep it that way.",
    category: "A Welcoming Community"
  },
  {
    question: "What if I notice a mistake or something has changed?",
    answer: "Please tell me.\n\nI genuinely appreciate corrections, updated information, and things I might have missed. They help make Dev Opportunity Radar better for everyone.\n\nBefore every edition is published, I spend time researching the opportunities I include. I also add a note encouraging readers to check the official website because deadlines, eligibility, and program details can change after publication.\n\nSometimes organizations update information without notice, and unfortunately that's outside my control.\n\nIf you notice something has changed or spot a mistake, please let me know respectfully. I'll happily review it and update the website or mention it in the next edition if needed.\n\nThis project is maintained by one person, and while I do my very best to keep everything accurate, I'm human and I won't get everything perfect every single time.\n\nI believe we can build something much better together by assuming good intentions, helping one another, and choosing kindness.",
    category: "A Welcoming Community"
  }
];

export const FAQ_TLDR = {
  heading: "TL;DR",
  content: "Whether you're new to Dev Opportunity Radar or you've been reading since the first edition, I hope this page answers the most common questions about the project.\n\nIf your question isn't here, that's completely okay. This project is still growing, and I certainly haven't thought of every possible question. Feel free to leave a comment under the latest edition on DEV or send me a message on LinkedIn. I'll always do my best to help, and if a question comes up often, I'll happily add it here."
};

export const FAQ_CLOSING = {
  title: "One last thing",
  content: "I hope Dev Opportunity Radar always feels like a welcoming place for developers, no matter where they are in their journey.\n\nWhether you're just starting out or you've been building software for years, I hope you feel comfortable exploring, asking questions, sharing opportunities, and celebrating your wins here.\n\nThank you for being part of this community.\n\nAnd if your question wasn't answered here, please don't hesitate to reach out.\n\nLeave a comment under the latest edition on DEV or send me a message on LinkedIn.\n\n**If you take away one thing from this website, I hope it's this: opportunities are meant to be shared.**\n\nIf you discover one that could help someone else, I'd love for you to pass it along.\n\nThat's how this project has grown since the very first edition, and I hope that's how it continues to grow for many years to come."
};

export const PHILOSOPHY = {
  title: "My Philosophy",
  livingDocumentQuote: "These principles are a living document. As Dev Opportunity Radar grows, I'll update this page whenever I make a promise to the community or learn a better way to serve readers.",
  tldr: {
    heading: "Dev Opportunity Radar is built on a simple idea: respect people's time and help them discover opportunities they otherwise might have missed.",
    content: "Everything I share is guided by a few principles. I believe in thoughtful curation over quantity, transparency over hidden incentives, giving credit where it's due, designing for accessibility, and building something that genuinely serves the community. These principles are my commitment to everyone who visits this website."
  },
  toc: [
    "Respect your time",
    "Make opportunities easier to discover",
    "Research first, verify always",
    "No pay-to-feature",
    "Always give credit",
    "Community over audience",
    "Accessibility isn't optional",
    "Keep improving",
    "Built by one person",
    "Built with care"
  ],
  principles: [
    {
      id: "respect-your-time",
      number: "01",
      title: "Respect your time",
      iconName: "Clock",
      subtitle: "Your time is valuable.",
      paragraphs: [
        "Every opportunity you click, every application you prepare, and every resource you explore requires time and effort. I never want to contribute to information overload simply for the sake of publishing more content.",
        "That's why I spend time researching opportunities before sharing them. If something appears on Dev Opportunity Radar, it's because I genuinely believe it's worth your attention.",
        "I'd rather publish fewer high-quality opportunities than fill an edition with things that aren't genuinely useful."
      ]
    },
    {
      id: "make-opportunities-easier-to-discover",
      number: "02",
      title: "Make opportunities easier to discover",
      iconName: "Compass",
      subtitle: "The mission of Dev Opportunity Radar has remained the same since the very first edition.",
      quote: "Help people discover opportunities they otherwise might have missed.",
      paragraphs: [
        "Some of the best opportunities never reach the people who would benefit from them most. They might be hidden in newsletters, shared briefly on social media, buried on organization websites, or simply overshadowed by larger announcements.",
        "I can't solve every discovery problem, but I hope I can make a small difference by bringing those opportunities together in one place."
      ]
    },
    {
      id: "research-first-verify-always",
      number: "03",
      title: "Research first, verify always",
      iconName: "Search",
      subtitle: "Before I feature an opportunity, I spend time reading through the official information, checking eligibility, understanding deadlines, and making sure I can explain it clearly.",
      paragraphs: [
        "Even then, things change.",
        "Organizations update deadlines, revise eligibility requirements, or modify their programs after publication. That's why I always encourage readers to visit the official source before applying.",
        "I want Dev Opportunity Radar to save you time, not replace the official information."
      ]
    },
    {
      id: "no-pay-to-feature",
      number: "04",
      title: "No pay-to-feature",
      iconName: "Shield",
      subtitle: "Trust takes a long time to build and only a moment to lose.",
      paragraphs: [
        "For that reason, opportunities are never featured because someone paid for placement.",
        "If an opportunity appears on Dev Opportunity Radar, it's because I believe it provides genuine value to the community.",
        "If I ever collaborate with an organization, accept sponsorship, or include affiliate links in the future, it will always be clearly disclosed. I never want readers wondering whether something was recommended because it was helpful or because someone paid for it.",
        "Transparency will always come first."
      ]
    },
    {
      id: "always-give-credit",
      number: "05",
      title: "Always give credit",
      iconName: "Award",
      subtitle: "Many of the opportunities featured here come from people who take the time to share something valuable with the community.",
      paragraphs: [
        "If someone discovers an opportunity and I feature it, I'll always credit them.",
        "Community Finds exist because I believe recognition should stay with the person who made the discovery. Their generosity helps other people find opportunities they might never have seen otherwise, and that deserves to be acknowledged."
      ]
    },
    {
      id: "community-over-audience",
      number: "06",
      title: "Community over audience",
      iconName: "Users",
      subtitle: "I've never wanted Dev Opportunity Radar to feel like a one-way newsletter.",
      paragraphs: [
        "One of the most rewarding parts of this journey has been seeing readers recommend opportunities, encourage one another, and share updates about things they discovered through the series.",
        "That's why Community Finds and Reader Updates exist.",
        "My hope is that this continues to grow into something we're building together rather than something I'm simply publishing every Friday."
      ]
    },
    {
      id: "accessibility-isnt-optional",
      number: "07",
      title: "Accessibility isn't optional",
      iconName: "Smile",
      subtitle: "I want this website to be welcoming to as many people as possible.",
      paragraphs: [
        "Accessibility isn't something I see as an extra feature or something to think about later. It's part of building a respectful experience from the beginning.",
        "I'll continue improving keyboard navigation, screen reader support, color contrast, responsive layouts, and anything else that helps make this project easier to use.",
        "Good design should make people feel included, not excluded."
      ]
    },
    {
      id: "keep-improving",
      number: "08",
      title: "Keep improving",
      iconName: "Sparkles",
      subtitle: "No project is ever truly finished.",
      paragraphs: [
        "I'll continue listening to feedback, learning from mistakes, and improving Dev Opportunity Radar over time.",
        "Not every idea will make it into the website, but every suggestion will be considered with the same question in mind:"
      ],
      quote: "Will this genuinely make the experience better for readers?",
      additionalParagraphs: [
        "If the answer is yes, I'll do my best to build it."
      ]
    },
    {
      id: "built-by-one-person",
      number: "09",
      title: "Built by one person",
      iconName: "Mail",
      subtitle: "Dev Opportunity Radar is currently created and maintained by one person.",
      paragraphs: [
        "Every opportunity is researched personally. Every edition is written individually. Every Community Find is reviewed. Every Reader Update is shared with permission.",
        "If it sometimes takes me a little while to respond to an email, message, or comment, please know it isn't intentional.",
        "Thank you for your patience and for being part of this journey."
      ]
    },
    {
      id: "built-with-care",
      number: "10",
      title: "Built with care",
      iconName: "Heart",
      subtitle: "This project started with a simple idea on May 29, 2026.",
      paragraphs: [
        "Since then, it has grown because of readers who kept showing up, shared opportunities, offered encouragement, and believed this was worth continuing.",
        "Every page on this website has been built with that same mindset.",
        "I hope the care behind it shows in the small details, the writing, the design, and the experience.",
        "Most of all, I hope Dev Opportunity Radar becomes a place you enjoy returning to whenever you're looking for your next opportunity.",
        "Thank you for being here."
      ]
    }
  ]
};

export interface AboutPageSection {
  id: string;
  title: string;
  iconName: string;
  paragraphsBefore: string[];
  listItems?: string[];
  paragraphsAfter?: string[];
  quote?: string;
}

export const ABOUT_CONTENT = {
  title: "About Dev Opportunity Radar",
  tldr: {
    heading: "TL;DR",
    paragraphs: [
      "**Dev Opportunity Radar** is a weekly community project that helps people discover opportunities they otherwise might have missed.",
      "Every Friday, I publish a new edition on **DEV**, and this website makes those opportunities easier to search, browse, and revisit over time.",
      "It started on **May 29, 2026**, and has grown thanks to the incredible support of the DEV community and everyone who's contributed Community Finds, Reader Updates, and encouragement along the way."
    ],
    mission: "Help people discover opportunities they otherwise might have missed."
  },
  sections: [
    {
      id: "welcome",
      title: "Welcome",
      iconName: "Heart",
      paragraphsBefore: [
        "I'm really glad you're here.",
        "Dev Opportunity Radar is a community project with a simple goal:"
      ],
      quote: "Help people discover opportunities they otherwise might have missed.",
      paragraphsAfter: [
        "Every week, I spend time researching grants, fellowships, hackathons, conferences, startup programs, learning resources, communities, internships, and other opportunities that I believe deserve more attention.",
        "Every Friday, I publish a new edition on DEV. This website exists to make those opportunities easier to discover, browse, and revisit over time."
      ]
    },
    {
      id: "how-it-started",
      title: "How it started",
      iconName: "History",
      paragraphsBefore: [
        "Dev Opportunity Radar began on **May 29, 2026**.",
        "Like many developers, I often came across opportunities that were genuinely valuable but easy to miss. Some were buried in newsletters, others were hidden in social media posts, and many simply didn't reach the people who could benefit from them.",
        "Instead of keeping those discoveries to myself, I decided to start sharing them.",
        "What began as a single weekly post slowly grew into something much bigger than I expected.",
        "People started recommending opportunities, sharing resources, leaving thoughtful feedback, and telling me when they applied because they discovered something through the series.",
        "That's when I realized this was becoming more than a weekly roundup.",
        "It was becoming something we were building together."
      ]
    },
    {
      id: "why-this-website-exists",
      title: "Why this website exists",
      iconName: "Globe",
      paragraphsBefore: [
        "The weekly editions will always remain the heart of Dev Opportunity Radar.",
        "Every Friday, you'll still find a new edition published on DEV.",
        "This website doesn't replace that.",
        "Instead, it makes everything easier to explore.",
        "Here you can:"
      ],
      listItems: [
        "Browse every edition in one place.",
        "Search opportunities across previous editions.",
        "Explore opportunities by category.",
        "Find opportunities with upcoming deadlines.",
        "Discover Community Finds shared by readers.",
        "Read Reader Updates from people who found opportunities through the radar.",
        "See new opportunities that are worth sharing between Friday editions."
      ],
      paragraphsAfter: [
        "My hope is that this becomes a place you can return to whenever you're looking for your next opportunity."
      ]
    },
    {
      id: "built-together-with-the-community",
      title: "Built together with the community",
      iconName: "Users",
      paragraphsBefore: [
        "Although I maintain Dev Opportunity Radar myself, this project wouldn't be what it is without the DEV community.",
        "From the very beginning, readers have:"
      ],
      listItems: [
        "Shared opportunities I hadn't discovered yet.",
        "Suggested improvements for future editions.",
        "Encouraged me to keep going.",
        "Applied to opportunities they found through the series.",
        "Celebrated each other's successes."
      ],
      paragraphsAfter: [
        "Community Finds and Reader Updates exist because of all of you.",
        "Every recommendation, every comment, and every shared experience helps someone else discover an opportunity they might have otherwise missed.",
        "Thank you for making this project better every single week."
      ]
    },
    {
      id: "a-small-note",
      title: "A small note",
      iconName: "PenTool",
      paragraphsBefore: [
        "Dev Opportunity Radar is currently created and maintained by one person.",
        "I personally research every opportunity before sharing it, update the website, publish the weekly editions, review Community Finds, and respond to readers whenever I can.",
        "If it ever takes me a little while to reply, please know it isn't intentional. I truly appreciate every message, comment, and contribution."
      ]
    },
    {
      id: "looking-ahead",
      title: "Looking ahead",
      iconName: "Compass",
      paragraphsBefore: [
        "This is only the beginning.",
        "I have plenty of ideas for improving Dev Opportunity Radar, but I'll always try to focus on features that genuinely make discovering opportunities easier instead of adding complexity for the sake of it.",
        "Your time is valuable.",
        "I want this website to respect that by staying simple, accessible, and easy to use.",
        "If you ever have suggestions, feedback, or discover an opportunity you think more people should know about, I'd genuinely love to hear from you."
      ]
    },
    {
      id: "thank-you",
      title: "Thank you",
      iconName: "Gift",
      paragraphsBefore: [
        "Whether you've been reading since the very first edition or you've only just discovered Dev Opportunity Radar today, thank you for being here.",
        "Your support, encouragement, recommendations, and shared discoveries are the reason this project continues to grow.",
        "I hope it helps you discover an opportunity that changes something for you.",
        "If it does, I'd love to hear your story."
      ]
    }
  ]
};

export const CONTACT_CONTENT = {
  tldr: {
    heading: "TL;DR",
    items: [
      {
        icon: "DEV:",
        text: "The best way to reach me is by leaving a comment under any of my [DEV](https://dev.to/hemapriya_kanagala) articles. I'm usually active there every day."
      },
      {
        icon: "LinkedIn:",
        text: "If you'd prefer a private conversation, feel free to send me a message on [LinkedIn](https://www.linkedin.com/in/hemapriya-kanagala/)."
      },
      {
        icon: "Email:",
        text: "You can also reach me at **[hemapriyakanagala@gmail.com](mailto:hemapriyakanagala@gmail.com)** if that's more convenient."
      }
    ]
  },
  paragraphs: [
    "I'd genuinely love to hear from you.",
    "Whether you have a question, discovered an opportunity you think more people should know about, spotted something that needs correcting, want to share your experience through a Reader Update, or simply want to say hello, you're always welcome to reach out.",
    "The best way to contact me is by leaving a comment under any of my articles on **[DEV](https://dev.to/hemapriya_kanagala)**. I'm usually active there every day, and I do my best to read and reply to every comment.",
    "If you'd prefer a private conversation, you're always welcome to send me a message on **[LinkedIn](https://www.linkedin.com/in/hemapriya-kanagala/)**. And if email is easier for you, you can reach me at **[hemapriyakanagala@gmail.com](mailto:hemapriyakanagala@gmail.com)**.",
    "This project is created and maintained by one person, so if it takes me a little while to reply, thank you for your patience. It isn't intentional, and I'll always do my best to get back to you.",
    "One small request.",
    "If you're reaching out to share an opportunity, ask a question, offer feedback, or simply introduce yourself, I'd be genuinely happy to hear from you.",
    "If you're here to send spam, unsolicited promotions, or unrelated marketing emails, I'd kindly ask that you don't. Please help me keep this a welcoming and respectful space for both the community and me.",
    "Thank you for being here, and I hope to hear from you someday 💙"
  ]
};


