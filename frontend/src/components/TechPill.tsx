"use client";

import { motion } from "framer-motion";

export type TechCategory = "frontend" | "backend" | "database" | "devops" | "other";

interface TechPillProps {
  tech: string;
  category?: TechCategory;
}

// Category color mapping
const categoryColors: Record<TechCategory, { bg: string; border: string; text: string }> = {
  frontend: {
    bg: "rgba(139, 92, 246, 0.15)",
    border: "rgba(139, 92, 246, 0.3)",
    text: "#8B5CF6",
  },
  backend: {
    bg: "rgba(59, 130, 246, 0.15)",
    border: "rgba(59, 130, 246, 0.3)",
    text: "#3B82F6",
  },
  database: {
    bg: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.3)",
    text: "#10B981",
  },
  devops: {
    bg: "rgba(245, 158, 11, 0.15)",
    border: "rgba(245, 158, 11, 0.3)",
    text: "#F59E0B",
  },
  other: {
    bg: "rgba(161, 161, 170, 0.15)",
    border: "rgba(161, 161, 170, 0.3)",
    text: "#A1A1AA",
  },
};

// Auto-detect category based on tech stack keyword
const detectCategory = (tech: string): TechCategory => {
  const lowerTech = tech.toLowerCase();

  // Frontend
  const frontendKeywords = [
    "react", "vue", "angular", "svelte", "next", "nuxt", "gatsby",
    "javascript", "typescript", "html", "css", "sass", "tailwind",
    " redux", "zustand", "recoil", "mobx", "astro", "ember",
  ];
  if (frontendKeywords.some((keyword) => lowerTech.includes(keyword))) {
    return "frontend";
  }

  // Backend
  const backendKeywords = [
    "node", "python", "java", "ruby", "go", "rust", "c#", "php",
    "express", "fastapi", "django", "rails", "spring", ".net",
    "graphql", "rest", "api", "server",
  ];
  if (backendKeywords.some((keyword) => lowerTech.includes(keyword))) {
    return "backend";
  }

  // Database
  const databaseKeywords = [
    "sql", "mysql", "postgresql", "postgres", "mongodb", "redis",
    "dynamodb", "prisma", "supabase", "firebase", "oracle", "sqlite",
  ];
  if (databaseKeywords.some((keyword) => lowerTech.includes(keyword))) {
    return "database";
  }

  // DevOps
  const devopsKeywords = [
    "docker", "kubernetes", "k8s", "aws", "azure", "gcp", "terraform",
    "ansible", "jenkins", "github", "gitlab", "ci/cd", "devops", "linux",
  ];
  if (devopsKeywords.some((keyword) => lowerTech.includes(keyword))) {
    return "devops";
  }

  return "other";
};

export function TechPill({ tech, category }: TechPillProps) {
  const detectedCategory = category || detectCategory(tech);
  const colors = categoryColors[detectedCategory];

  return (
    <motion.span
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.15 }}
    >
      {tech}
    </motion.span>
  );
}

export default TechPill;