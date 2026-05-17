import { Job } from "@/types/job";

export const mockJobs: Job[] = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "Spotify",
    logo: "",
    location: "Remote",
    salary: "140000-180000",
    remote: true,
    stack: ["React", "TypeScript", "Node.js", "GraphQL"],
    description: "Join our team to build amazing user experiences for millions of users worldwide. You'll work on our web platform, collaborating with designers and backend engineers.",
    posted: "2 days ago",
    matchScore: 92,
    matchReasons: [
      "Your React + TypeScript stack matches perfectly",
      "Remote-friendly position",
      "Salary matches your preferences"
    ],
    experienceLevel: "senior",
    jobType: "full-time",
    benefits: ["Health insurance", "401k matching", "Stock options", "Remote work stipend"],
    companyDescription: "Spotify is the world's most popular audio streaming subscription service, with over 500 million users. We're on a mission to unlock the potential of human creativity by giving creators the tools they need to succeed.",
    companySize: "5,000+"
  },
  {
    id: 2,
    title: "Full-Stack Engineer",
    company: "Vercel",
    logo: "",
    location: "San Francisco, CA",
    salary: "130000-160000",
    remote: true,
    stack: ["Next.js", "React", "Go", "PostgreSQL"],
    description: "Help build the future of web development. You'll work on our deployment platform, API services, and developer tools.",
    posted: "1 day ago",
    matchScore: 88,
    matchReasons: [
      "Your Next.js experience aligns with their stack",
      "Full-stack role matches your skills"
    ],
    experienceLevel: "mid",
    jobType: "full-time",
    benefits: ["Health insurance", "Equity", "Flexible hours", "Learning budget"],
    companyDescription: "Vercel is the platform for frontend developers, providing the speed and reliability needed to build world-class applications. Creators of Next.js.",
    companySize: "1,000+"
  },
  {
    id: 3,
    title: "Backend Developer - Go",
    company: "Stripe",
    logo: "",
    location: "New York, NY",
    salary: "150000-200000",
    remote: false,
    stack: ["Go", "Python", "AWS", "gRPC"],
    description: "Build the infrastructure that powers global payments. Work on high-performance systems processing billions of transactions.",
    posted: "3 days ago",
    matchScore: 75,
    matchReasons: [
      "Strong backend role with growth potential",
      "Competitive salary range"
    ],
    experienceLevel: "mid",
    jobType: "full-time",
    benefits: ["Health insurance", "401k", "Stock options", "Commuter benefits"],
    companyDescription: "Stripe builds economic infrastructure for the internet, enabling businesses of all sizes to accept payments and manage their businesses online.",
    companySize: "8,000+"
  },
  {
    id: 4,
    title: "Frontend Engineer",
    company: "Figma",
    logo: "",
    location: "Remote",
    salary: "120000-150000",
    remote: true,
    stack: ["React", "TypeScript", "WebGL", "Canvas"],
    description: "Work on the design tool used by millions of designers. Build collaborative features and optimize performance.",
    posted: "5 hours ago",
    matchScore: 81,
    matchReasons: [
      "Your React + TypeScript skills are a perfect match",
      "Remote position available"
    ],
    experienceLevel: "mid",
    jobType: "full-time",
    benefits: ["Health insurance", "Equity", "Home office stipend"],
    companyDescription: "Figma is a collaborative interface design tool that's taken the design world by storm. Used by millions of designers and developers worldwide.",
    companySize: "1,500+"
  },
  {
    id: 5,
    title: "Staff Engineer - Platform",
    company: "Netflix",
    logo: "",
    location: "Los Angeles, CA",
    salary: "180000-250000",
    remote: true,
    stack: ["Java", "Spring Boot", "Kubernetes", "Microservices"],
    description: "Lead technical initiatives for our streaming platform infrastructure. Design and implement systems serving 200M+ subscribers.",
    posted: "1 week ago",
    matchScore: 65,
    matchReasons: [
      "High-impact role with leadership opportunities",
      "Top-tier compensation"
    ],
    experienceLevel: "principal",
    jobType: "full-time",
    benefits: ["Health insurance", "Unlimited PTO", "Stock options", "Wellness stipend"],
    companyDescription: "Netflix is the world's leading streaming entertainment service with over 230 million paid memberships globally.",
    companySize: "13,000+"
  },
  {
    id: 6,
    title: "DevOps Engineer",
    company: "GitLab",
    logo: "",
    location: "Remote",
    salary: "110000-140000",
    remote: true,
    stack: ["Kubernetes", "Terraform", "AWS", "Docker"],
    description: "Help build and maintain our cloud-native infrastructure. Work on CI/CD pipelines and developer tooling.",
    posted: "4 days ago",
    matchScore: 72,
    matchReasons: [
      "Fully remote position",
      "Strong DevOps role"
    ],
    experienceLevel: "mid",
    jobType: "full-time",
    benefits: ["Health insurance", "401k", "Remote work budget", "Conference attendance"],
    companyDescription: "GitLab is a complete DevOps platform that enables professionals to perform all tasks from planning to monitoring in a single application.",
    companySize: "2,000+"
  },
  {
    id: 7,
    title: "Mobile Developer - React Native",
    company: "Discord",
    logo: "",
    location: "San Francisco, CA",
    salary: "130000-170000",
    remote: true,
    stack: ["React Native", "TypeScript", "Redux", "iOS"],
    description: "Build the mobile app used by millions of gamers. Implement real-time features and optimize app performance.",
    posted: "2 days ago",
    matchScore: 85,
    matchReasons: [
      "Your React Native + TypeScript stack is a great match",
      "Remote-friendly with great culture"
    ],
    experienceLevel: "mid",
    jobType: "full-time",
    benefits: ["Health insurance", "401k", "Gaming perks", "Free Nitro"],
    companyDescription: "Discord is the easiest way to communicate over voice, video, and text with friends, communities, and game developers. Over 150 million active users.",
    companySize: "1,200+"
  },
  {
    id: 8,
    title: "Data Engineer",
    company: "Airbnb",
    logo: "",
    location: "Remote",
    salary: "140000-180000",
    remote: true,
    stack: ["Python", "Spark", "Airflow", "BigQuery"],
    description: "Build data pipelines powering business decisions. Work with petabytes of data to drive insights for millions of bookings.",
    posted: "6 days ago",
    matchScore: 78,
    matchReasons: [
      "Python-based data engineering role",
      "Fully remote position"
    ],
    experienceLevel: "senior",
    jobType: "full-time",
    benefits: ["Health insurance", "Travel credits", "Equity", "Learning budget"],
    companyDescription: "Airbnb is a community-driven hospitality company that connects travelers with unique accommodations and experiences around the world. Over 7 million listings worldwide.",
    companySize: "6,000+"
  }
];