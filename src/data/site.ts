export const SITE = {
  name: "Jahnvi Verma",
  handle: "JV",
  email: "vermajaanvi64@gmail.com",
  github: "https://github.com/verma-jaanvi",
  githubLabel: "github.com/verma-jaanvi",
  linkedin: "https://www.linkedin.com/in/jahnvi-verma-7b09612b0/",
  linkedinLabel: "linkedin.com/in/jahnvi-verma",
};

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/sketches", label: "Sketches" },
  { to: "/writings", label: "Writing" },
  { to: "/contact", label: "Contact" },
] as const;

export const CATEGORIES = [
  "All",
  "AI / NLP",
  "Android dev",
  "Desktop App",
  "Web dev",
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Project {
  code: string;
  title: string;
  cat: Exclude<Category, "All">;
  year: string;
  tag: string;
  desc: string;
  featured?: boolean;
  featuredOrder?: number;
}

export const projects: Project[] = [
  {
    code: "01",
    title: "EMPOWER MSME",
    cat: "Web dev",
    year: "working...",
    tag: "MSME Networking Platform",
    desc: "A LinkedIn-inspired platform connecting MSMEs with investors, mentors, and growth opportunities.",
  },
  {
    code: "02",
    title: "VERSION CONTROL",
    cat: "Web dev",
    year: "2026",
    tag: "Version Control System",
    desc: "A web-based version control system that allows developers to manage code changes, collaborate on projects, and track revisions efficiently.",
    featured: true,
    featuredOrder: 2,
  },
  {
    code: "03",
    title: "CLIENTOS",
    cat: "Web dev",
    year: "2026",
    tag: "Client Management System",
    desc: "A comprehensive web application for managing client relationships, tracking interactions, and streamlining business operations.",
    featured: true,
    featuredOrder: 2,
  },
  {
    code: "04",
    title: "CIRCUIT VISION",
    cat: "Desktop App",
    year: "2026",
    tag: "Alternative KiCad Frontend",
    desc: "A modern desktop environment for designing, simulating, and visualizing electronic circuits with an intuitive workflow.",
    featured: true,
    featuredOrder: 1,
  },
  {
    code: "05",
    title: "APPOINT IT",
    cat: "Android dev",
    year: "2025",
    tag: "Doctor Appointment App",
    desc: "Android app that helps users discover nearby doctors and schedule appointments seamlessly.",
    featured: true,
    featuredOrder: 4,
  },
  {
    code: "06",
    title: "WEATHER MOOD",
    cat: "Web dev",
    year: "2024",
    tag: "Weather-Based Playlist Generator",
    desc: "Blends real-time weather data with Spotify listening habits to curate mood-perfect playlists.",
    featured: true,
    featuredOrder: 3,
  },
  {
    code: "07",
    title: "TEXT GUARDIAN",
    cat: "AI / NLP",
    year: "2024",
    tag: "Plagiarism Checker",
    desc: "Intelligent text comparison engine leveraging TF-IDF and similarity scoring with a web scraping API.",
    featured: true,
    featuredOrder: 2,
  },
];

export const isInProgress = (p: Project) => /working/i.test(p.year);
export const yearLabel = (p: Project) =>
  isInProgress(p) ? "In progress" : p.year;

export const skills = [
  {
    k: "AI / Machine Learning",
    v: [
      "Large Language Models (LLMs)",
      "Prompt Engineering",
      "RAG Pipelines",
      "Vector Databases",
      "Embeddings",
      "AI Agent Workflows",
      "Claude code",
    ],
  },
  {
    k: "Frontend",
    v: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript (ES6+)",
      "Tailwind CSS",
      "HTML5 & CSS3",
    ],
  },
  {
    k: "Backend",
    v: [
      "Node.js",
      "Express.js",
      "Python",
      "Django",
      "FastAPI",
      "REST APIs",
      "Authentication",
    ],
  },
  {
    k: "Mobile & Desktop",
    v: ["Android Development", "Tauri(Rust)", "Java", "PyQt5"],
  },
  {
    k: "Databases",
    v: ["PostgreSQL", "SQLite", "MongoDB", "Firebase"],
  },
  {
    k: "DevOps & Cloud",
    v: ["Docker", "Git & GitHub", "CI/CD", "Vercel", "AWS (Learning)"],
  },
  {
    k: "Programming",
    v: [
      "C++",
      "Python",
      "Java",
      "TypeScript",
      "JavaScript",
      "SQL",
      "Rust (Learning)",
    ],
  },
  {
    k: "Graphics & Creative",
    v: ["Three.js", "WebGL", "GLSL", "Canvas API", "GSAP", "Anime.js"],
  },
];

export const timeline = [
  {
    year: "2024",
    title: "First commit",
    body: "Discovered the strange poetry of typing words that summon things.",
    duration: 12,
  },
  {
    year: "2025",
    title: "Dove deep into open source",
    body: "Started contributing to open-source projects, collaborated with developers worldwide, and strengthened my real-world development skills.",
    duration: 8,
  },
  {
    year: "2025",
    title: "Won my first hackathon",
    body: "Participated in and won my first hackathon, showcasing my skills in rapid prototyping and collaborative development.",
    duration: 3,
  },
  {
    year: "2026",
    title: "Started freelancing",
    body: "Began working as a freelance developer, building modern web applications and AI-powered solutions for clients while expanding my professional portfolio.",
    duration: 6,
  },
  {
    year: "2026",
    title: "Software development internship",
    body: "Joined my first software development internship, gaining industry experience by working on production-ready applications and collaborative engineering workflows.",
    duration: 3,
  },
  {
    year: "Present",
    title: "Building the future",
    body: "Continuing to create impactful software, contribute to open source, explore AI, and grow as a full-stack developer.",
    duration: 12,
  },
];

export const LEETCODE = {
  username: "verma-jaanvi",
  profile: "https://leetcode.com/u/verma-jaanvi/",
  label: "leetcode.com/u/verma-jaanvi",
};

/**
 * Resume variants shown in the nav dropdown.
 * For now every option opens the same PDF — when you have role-specific versions,
 * drop them into public/resume/ and change the `file` path of the matching entry.
 */
export const RESUMES = [
  {
    id: "software",
    label: "Software Engineer",
    short: "SWE",
    file: "/resume/resume_swe.pdf",
  },
  {
    id: "frontend",
    label: "Frontend Developer",
    short: "FE",
    file: "/resume/resume_frontend.pdf",
  },
  {
    id: "backend",
    label: "Backend Developer",
    short: "BE",
    file: "/resume/resume_backend.pdf",
  },
  {
    id: "ai",
    label: "AI Engineer",
    short: "AI",
    file: "/resume/resume_ai.pdf",
  },
  // {
  //   id: "app",
  //   label: "App Developer",
  //   short: "APP",
  //   file: "/resume/resume_swe.pdf",
  // },
] as const;
export type Resume = (typeof RESUMES)[number];
