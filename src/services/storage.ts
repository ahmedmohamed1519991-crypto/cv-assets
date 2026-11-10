import { ResumeData, CoverLetterData, UserProfile } from '../types/resume';
import { sampleEnglishResume, sampleArabicResume, createBlankResume } from '../data/sampleData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  RESUMES: 'cvmaker_resumes_v1',
  ACTIVE_RESUME_ID: 'cvmaker_active_id_v1',
  COVER_LETTERS: 'cvmaker_cover_letters_v1',
  RESUME_VERSIONS: 'cvmaker_resume_versions_v1',
  USER_SESSION: 'cvmaker_local_user_v1',
  APP_LANG: 'cvmaker_ui_language_v1',
};

export interface ResumeVersion {
  id: string;
  resumeId: string;
  versionName: string;
  data: ResumeData;
  createdAt: string;
}

// Initial state with sample data
function getInitialResumes(): ResumeData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESUMES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load local resumes, using defaults:', e);
  }
  // Default to sample resumes so new users have immediate rich preview
  const defaults = [sampleEnglishResume, sampleArabicResume];
  localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(defaults));
  return defaults;
}

export const StorageService = {
  // Resumes
  getAllResumes(): ResumeData[] {
    return getInitialResumes();
  },

  getResumeById(id: string): ResumeData | null {
    const all = this.getAllResumes();
    return all.find((r) => r.id === id) || null;
  },

  saveResume(resume: ResumeData, userId?: string): { success: boolean; isOnlineSynced: boolean } {
    try {
      const all = this.getAllResumes();
      const updatedResume = {
        ...resume,
        updatedAt: new Date().toISOString(),
      };

      const index = all.findIndex((r) => r.id === resume.id);
      let next: ResumeData[];
      if (index >= 0) {
        next = [...all];
        next[index] = updatedResume;
      } else {
        next = [updatedResume, ...all];
      }

      localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(next));

      // Attempt online sync if user is signed in to Supabase
      let isOnlineSynced = false;
      if (isSupabaseConfigured && supabase && userId) {
        supabase
          .from('resumes')
          .upsert({
            id: updatedResume.id,
            user_id: userId,
            title: updatedResume.title,
            language: updatedResume.language,
            template_id: updatedResume.templateId,
            data: updatedResume,
            ats_score: updatedResume.atsScore || 0,
            updated_at: updatedResume.updatedAt,
          })
          .then(({ error }) => {
            if (error) console.error('Supabase sync error:', error);
          });
        isOnlineSynced = true;
      }

      return { success: true, isOnlineSynced };
    } catch (e) {
      console.error('Failed to save resume locally:', e);
      return { success: false, isOnlineSynced: false };
    }
  },

  deleteResume(id: string, userId?: string): boolean {
    try {
      const all = this.getAllResumes().filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(all));

      if (isSupabaseConfigured && supabase && userId) {
        supabase.from('resumes').delete().eq('id', id).eq('user_id', userId).then();
      }
      return true;
    } catch (e) {
      console.error('Failed to delete resume:', e);
      return false;
    }
  },

  duplicateResume(id: string): ResumeData | null {
    const source = this.getResumeById(id);
    if (!source) return null;

    const copy: ResumeData = {
      ...JSON.parse(JSON.stringify(source)),
      id: 'resume_' + Math.random().toString(36).substring(2, 9),
      title: `${source.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveResume(copy);
    return copy;
  },

  createNewResume(language: 'en' | 'ar' = 'en'): ResumeData {
    const blank = createBlankResume(language);
    this.saveResume(blank);
    this.setActiveResumeId(blank.id);
    return blank;
  },

  getActiveResumeId(): string {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_RESUME_ID);
    if (stored && this.getResumeById(stored)) {
      return stored;
    }
    const all = this.getAllResumes();
    const id = all[0]?.id || sampleEnglishResume.id;
    this.setActiveResumeId(id);
    return id;
  },

  setActiveResumeId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_RESUME_ID, id);
  },

  // Cover Letters
  getAllCoverLetters(): CoverLetterData[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.COVER_LETTERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveCoverLetter(letter: CoverLetterData, userId?: string) {
    const all = this.getAllCoverLetters();
    const idx = all.findIndex((l) => l.id === letter.id);
    let next: CoverLetterData[];
    if (idx >= 0) {
      next = [...all];
      next[idx] = letter;
    } else {
      next = [letter, ...all];
    }
    localStorage.setItem(STORAGE_KEYS.COVER_LETTERS, JSON.stringify(next));

    if (isSupabaseConfigured && supabase && userId) {
      supabase
        .from('cover_letters')
        .upsert({
          id: letter.id,
          user_id: userId,
          title: letter.title,
          language: letter.language,
          company_name: letter.companyName,
          job_title: letter.jobTitle,
          content: letter.fullLetter,
          updated_at: letter.updatedAt,
        })
        .then();
    }
  },

  deleteCoverLetter(id: string, userId?: string) {
    const all = this.getAllCoverLetters().filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.COVER_LETTERS, JSON.stringify(all));

    if (isSupabaseConfigured && supabase && userId) {
      supabase.from('cover_letters').delete().eq('id', id).eq('user_id', userId).then();
    }
  },

  // Bidirectional Supabase Sync (strictly scoped to userId)
  async syncFromSupabase(userId: string): Promise<{ resumesCount: number; coverLettersCount: number }> {
    if (!isSupabaseConfigured || !supabase || !userId) {
      return { resumesCount: 0, coverLettersCount: 0 };
    }

    let resumesCount = 0;
    let coverLettersCount = 0;

    try {
      const { data: remoteResumes, error: resErr } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (!resErr && Array.isArray(remoteResumes)) {
        const local = this.getAllResumes();
        const mergedMap = new Map<string, ResumeData>();
        for (const r of local) mergedMap.set(r.id, r);
        for (const row of remoteResumes) {
          if (row.data) {
            mergedMap.set(row.id, row.data as ResumeData);
            resumesCount++;
          }
        }
        localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(Array.from(mergedMap.values())));
      }

      const { data: remoteLetters, error: clErr } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (!clErr && Array.isArray(remoteLetters)) {
        const localCl = this.getAllCoverLetters();
        const clMap = new Map<string, CoverLetterData>();
        for (const c of localCl) clMap.set(c.id, c);
        for (const row of remoteLetters) {
          clMap.set(row.id, {
            id: row.id,
            resumeId: row.resume_id || '',
            title: row.title,
            applicantName: '',
            recipientName: row.recipient_name || 'Hiring Team',
            companyName: row.company_name || '',
            jobTitle: row.job_title || '',
            language: row.language || 'en',
            tone: 'Confident & High-Impact',
            greeting: '',
            openingParagraph: '',
            bodyParagraphs: [],
            closingParagraph: '',
            signOff: '',
            fullLetter: row.content || '',
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          });
          coverLettersCount++;
        }
        localStorage.setItem(STORAGE_KEYS.COVER_LETTERS, JSON.stringify(Array.from(clMap.values())));
      }
    } catch (e) {
      console.error('Supabase syncFromSupabase error:', e);
    }

    return { resumesCount, coverLettersCount };
  },

  // Profile Management
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !supabase || !userId) return this.getLocalUser();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error || !data) return this.getLocalUser();
      const profile: UserProfile = {
        id: data.id,
        email: data.email,
        fullName: data.full_name || data.email.split('@')[0],
        avatarUrl: data.avatar_url || undefined,
        preferredLanguage: data.preferred_language === 'ar' ? 'ar' : 'en',
      };
      this.setLocalUser(profile);
      return profile;
    } catch {
      return this.getLocalUser();
    }
  },

  async updateProfile(
    userId: string,
    updates: { fullName?: string; preferredLanguage?: 'en' | 'ar'; avatarUrl?: string }
  ): Promise<{ success: boolean; error?: string }> {
    const current = this.getLocalUser();
    if (current) {
      this.setLocalUser({
        ...current,
        ...(updates.fullName !== undefined ? { fullName: updates.fullName } : {}),
        ...(updates.preferredLanguage !== undefined ? { preferredLanguage: updates.preferredLanguage } : {}),
        ...(updates.avatarUrl !== undefined ? { avatarUrl: updates.avatarUrl } : {}),
      });
    }

    if (isSupabaseConfigured && supabase && userId) {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...(updates.fullName !== undefined ? { full_name: updates.fullName } : {}),
          ...(updates.preferredLanguage !== undefined ? { preferred_language: updates.preferredLanguage } : {}),
          ...(updates.avatarUrl !== undefined ? { avatar_url: updates.avatarUrl } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      if (error) return { success: false, error: error.message };
    }

    return { success: true };
  },

  // Resume Version History (Snapshots)
  async getResumeVersions(resumeId: string, userId?: string): Promise<ResumeVersion[]> {
    let localVersions: ResumeVersion[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RESUME_VERSIONS);
      const all: ResumeVersion[] = raw ? JSON.parse(raw) : [];
      localVersions = all.filter((v) => v.resumeId === resumeId);
    } catch {
      localVersions = [];
    }

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('resume_versions')
          .select('*')
          .eq('resume_id', resumeId)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map((row) => ({
            id: row.id,
            resumeId: row.resume_id,
            versionName: row.version_name || 'Snapshot',
            data: row.data as ResumeData,
            createdAt: row.created_at,
          }));
        }
      } catch (e) {
        console.warn('Failed to fetch remote resume versions:', e);
      }
    }

    return localVersions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async saveResumeVersion(
    resumeId: string,
    versionName: string,
    data: ResumeData,
    userId?: string
  ): Promise<ResumeVersion> {
    const newVersion: ResumeVersion = {
      id: 'ver_' + Math.random().toString(36).substring(2, 10),
      resumeId,
      versionName: versionName.trim() || `Snapshot ${new Date().toLocaleTimeString()}`,
      data: JSON.parse(JSON.stringify(data)),
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RESUME_VERSIONS);
      const all: ResumeVersion[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(STORAGE_KEYS.RESUME_VERSIONS, JSON.stringify([newVersion, ...all].slice(0, 50)));
    } catch (e) {
      console.warn('Failed to save local version:', e);
    }

    if (isSupabaseConfigured && supabase && userId) {
      await supabase.from('resume_versions').insert({
        id: newVersion.id,
        resume_id: resumeId,
        user_id: userId,
        version_name: newVersion.versionName,
        data: newVersion.data,
        created_at: newVersion.createdAt,
      });
    }

    return newVersion;
  },

  async deleteResumeVersion(versionId: string, userId?: string): Promise<boolean> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RESUME_VERSIONS);
      const all: ResumeVersion[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(
        STORAGE_KEYS.RESUME_VERSIONS,
        JSON.stringify(all.filter((v) => v.id !== versionId))
      );

      if (isSupabaseConfigured && supabase && userId) {
        await supabase.from('resume_versions').delete().eq('id', versionId).eq('user_id', userId);
      }
      return true;
    } catch {
      return false;
    }
  },

  // UI Language Preference
  getUILanguage(): 'en' | 'ar' {
    const val = localStorage.getItem(STORAGE_KEYS.APP_LANG);
    return val === 'ar' ? 'ar' : 'en';
  },

  setUILanguage(lang: 'en' | 'ar') {
    localStorage.setItem(STORAGE_KEYS.APP_LANG, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  },

  // Local user profile for anonymous mode
  getLocalUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setLocalUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    }
  },

  // JSON Export / Import
  exportDataJSON(): string {
    const payload = {
      resumes: this.getAllResumes(),
      coverLetters: this.getAllCoverLetters(),
      exportedAt: new Date().toISOString(),
      app: 'CV Maker AI',
    };
    return JSON.stringify(payload, null, 2);
  },

  importDataJSON(jsonStr: string): { success: boolean; count: number; error?: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.resumes || !Array.isArray(data.resumes)) {
        return { success: false, count: 0, error: 'Invalid file format: missing resumes' };
      }
      const existing = this.getAllResumes();
      const existingIds = new Set(existing.map((r) => r.id));
      const merged = [...existing];
      let count = 0;

      for (const r of data.resumes) {
        if (!existingIds.has(r.id)) {
          merged.push(r);
          count++;
        }
      }

      localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(merged));
      return { success: true, count };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message };
    }
  },
};
