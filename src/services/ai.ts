import { ATSAnalysisResult, CoverLetterData, Language } from '../types/resume';

export interface GenerateSummaryParams {
  professionalTitle: string;
  yearsOfExperience: string;
  keySkills: string[];
  language: Language;
  industry?: string;
  existingDraft?: string;
}

export interface ImproveExperienceParams {
  roleTitle: string;
  company: string;
  bulletPoints: string[];
  language: Language;
  actionVerbFocus?: string;
}

export interface TranslateParams {
  text: string;
  targetLanguage: Language;
  context?: string;
}

export interface AnalyzeATSParams {
  resumeData: any;
  targetJobDescription?: string;
  language: Language;
}

export interface JobMatchParams {
  resumeData: any;
  targetJobDescription: string;
  language: Language;
}

export interface JobMatchResult {
  matchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  recommendations: string[];
  summary: string;
}

export interface CoverLetterParams {
  applicantName: string;
  roleTitle: string;
  companyName: string;
  keySkills: string[];
  resumeSummary?: string;
  jobDescription?: string;
  language: Language;
  tone?: string;
}

export interface SuggestSkillsParams {
  roleTitle: string;
  industry?: string;
  existingSkills?: string[];
  language: Language;
}

export const AIService = {
  async generateSummary(params: GenerateSummaryParams): Promise<{ summary: string; keyHighlights: string[] }> {
    const res = await fetch('/api/ai/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to generate summary' }));
      throw new Error(err.error || 'Server error generating summary');
    }

    return await res.json();
  },

  async improveExperience(params: ImproveExperienceParams): Promise<{ improvedBullets: string[]; explanation: string }> {
    const res = await fetch('/api/ai/improve-experience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to improve experience' }));
      throw new Error(err.error || 'Server error improving experience');
    }

    return await res.json();
  },

  async translate(params: TranslateParams): Promise<{ translatedText: string; notes?: string }> {
    const res = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to translate' }));
      throw new Error(err.error || 'Server error translating text');
    }

    return await res.json();
  },

  async analyzeATS(params: AnalyzeATSParams): Promise<ATSAnalysisResult> {
    const res = await fetch('/api/ai/analyze-ats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to analyze ATS' }));
      throw new Error(err.error || 'Server error analyzing ATS');
    }

    return await res.json();
  },

  async jobMatch(params: JobMatchParams): Promise<JobMatchResult> {
    const res = await fetch('/api/ai/job-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to run job matching' }));
      throw new Error(err.error || 'Server error running job match');
    }

    return await res.json();
  },

  async generateCoverLetter(params: CoverLetterParams): Promise<{
    greeting: string;
    openingParagraph: string;
    bodyParagraphs: string[];
    closingParagraph: string;
    signOff: string;
    fullLetter: string;
  }> {
    const res = await fetch('/api/ai/cover-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to generate cover letter' }));
      throw new Error(err.error || 'Server error generating cover letter');
    }

    return await res.json();
  },

  async suggestSkills(params: SuggestSkillsParams): Promise<{
    technicalSkills: string[];
    softSkills: string[];
    toolsAndTech: string[];
  }> {
    const res = await fetch('/api/ai/suggest-skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to suggest skills' }));
      throw new Error(err.error || 'Server error suggesting skills');
    }

    return await res.json();
  },
};
