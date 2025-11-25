export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  gpa?: string;
  cgpa?: string;
  coursework?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  technologies: string;
  link: string;
  date: string;
  description: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certificates: Certificate[];
  awards: Award[];
  skills: string[];
}

export enum TemplateType {
  MODERN = 'MODERN',
  CLASSIC = 'CLASSIC',
  MINIMAL = 'MINIMAL',
  TECH = 'TECH'
}

export interface KeywordAnalysis {
  score: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface ResumeImprovement {
  id: string;
  section: string;
  itemId?: string;
  field: string;
  issue: string;
  suggestion: string;
}

export interface ReviewResult {
  score: number;
  summary: string;
  improvements: ResumeImprovement[];
}

// Auth and Project Types
export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface ResumeProject {
  id: string;
  userId: string;
  title: string;
  lastModified: number; // Timestamp
  data: ResumeData;
  template: TemplateType;
}