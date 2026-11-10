export type Language = 'en' | 'ar';

export type TemplateId =
  | 'modern-navy'
  | 'executive-slate'
  | 'minimal-ats'
  | 'tech-innovator'
  | 'creative-emerald'
  | 'compact-elegance';

export interface PersonalDetails {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  avatarUrl?: string;
  photoPath?: string;
  includePhoto?: boolean;
  photoPosition?: 'left' | 'right' | 'top' | 'sidebar';
}

export interface Summary {
  content: string;
  highlights?: string[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  bulletPoints: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  gpa?: string;
  description?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'tools' | 'other';
  level: number; // 1 to 5
}

export interface LanguageSkill {
  id: string;
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic';
}

export interface ProjectItem {
  id: string;
  title: string;
  role?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  technologies: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface ResumeData {
  id: string;
  userId?: string;
  title: string;
  language: Language;
  templateId: TemplateId;
  primaryColor: string;
  fontFamily: 'default' | 'cairo' | 'jakarta' | 'plex' | 'inter';
  personalDetails: PersonalDetails;
  summary: Summary;
  experiences: ExperienceItem[];
  educations: EducationItem[];
  skills: SkillItem[];
  languages: LanguageSkill[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  references: ReferenceItem[];
  customSections?: {
    id: string;
    title: string;
    items: { id: string; title: string; subtitle?: string; date?: string; description?: string }[];
  }[];
  sectionOrder: string[];
  atsScore?: number;
  atsAnalysis?: ATSAnalysisResult;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  includePhoto?: boolean;
  sourceFilePath?: string;
  originalFileName?: string;
  sourceFileType?: string;
}

export interface ATSAnalysisResult {
  score: number;
  breakdown: {
    completeness: number;
    readability: number;
    impact: number;
    formatting: number;
  };
  summary: string;
  missingKeywords: string[];
  formattingWarnings: string[];
  actionableSuggestions: string[];
}

export interface CoverLetterData {
  id: string;
  userId?: string;
  resumeId?: string;
  title: string;
  applicantName: string;
  recipientName: string;
  companyName: string;
  jobTitle: string;
  language: Language;
  tone: string;
  greeting: string;
  openingParagraph: string;
  bodyParagraphs: string[];
  closingParagraph: string;
  signOff: string;
  fullLetter: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  preferredLanguage: Language;
  createdAt?: string;
}
