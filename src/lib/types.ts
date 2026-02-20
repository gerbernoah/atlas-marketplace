export interface Idea {
  id: string;
  title: string;
  description: string;
  category: Category;
  founder: Founder;
  lookingFor: string[];
  createdAt: string;
  likes: number;
}

export interface Founder {
  name: string;
  avatar: string;
  tagline: string;
  email: string;
}

export type Category =
  | "SaaS"
  | "Fintech"
  | "Health"
  | "AI / ML"
  | "Education"
  | "E-Commerce"
  | "Social"
  | "Developer Tools"
  | "Sustainability"
  | "Other";

export const CATEGORIES: Category[] = [
  "SaaS",
  "Fintech",
  "Health",
  "AI / ML",
  "Education",
  "E-Commerce",
  "Social",
  "Developer Tools",
  "Sustainability",
  "Other",
];

export const LOOKING_FOR_OPTIONS = [
  "Co-Founder",
  "Frontend Developer",
  "Backend Developer",
  "Designer",
  "Marketing",
  "Sales",
  "Investor",
  "Advisor",
  "Other",
];
