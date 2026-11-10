import React, { useState } from 'react';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Languages as LangIcon,
  Layers,
  Award,
  Users,
  Palette,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { ResumeData, Language, TemplateId } from '../../types/resume';
import { getTranslation } from '../../utils/i18n';
import { AIAssistantModal, AIAssistantMode } from './AIAssistantModal';
import { ProfilePhotoUploader } from './ProfilePhotoUploader';
import { sampleEnglishResume, sampleArabicResume } from '../../data/sampleData';

interface CVEditorProps {
  resumeData: ResumeData;
  onChange: (updated: ResumeData) => void;
  saveStatus: 'saving' | 'saved' | 'idle';
  isCloudSynced: boolean;
}

type TabKey =
  | 'personal'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'certifications'
  | 'references'
  | 'styling';

const TEMPLATES_LIST: { id: TemplateId; nameKey: string; previewBg: string }[] = [
  { id: 'modern-navy', nameKey: 'modernNavy', previewBg: 'from-blue-900 to-slate-900' },
  { id: 'executive-slate', nameKey: 'executiveSlate', previewBg: 'from-slate-700 to-slate-900' },
  { id: 'minimal-ats', nameKey: 'minimalAts', previewBg: 'from-neutral-200 to-neutral-400' },
  { id: 'tech-innovator', nameKey: 'techInnovator', previewBg: 'from-cyan-600 to-blue-800' },
  { id: 'creative-emerald', nameKey: 'creativeEmerald', previewBg: 'from-emerald-700 to-teal-900' },
  { id: 'compact-elegance', nameKey: 'compactElegance', previewBg: 'from-slate-800 to-indigo-950' },
];

const COLOR_PALETTES = [
  { name: 'Classic Navy', hex: '#1e3a8a' },
  { name: 'Royal Slate', hex: '#334155' },
  { name: 'Deep Emerald', hex: '#0f766e' },
  { name: 'Executive Indigo', hex: '#4338ca' },
  { name: 'Bold Burgundy', hex: '#881337' },
  { name: 'Modern Charcoal', hex: '#18181b' },
];

export const CVEditor: React.FC<CVEditorProps> = ({
  resumeData,
  onChange,
  saveStatus,
  isCloudSynced,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [aiModalState, setAiModalState] = useState<{
    isOpen: boolean;
    mode: AIAssistantMode;
    initialData?: any;
    targetContext?: string;
  }>({
    isOpen: false,
    mode: 'summary',
  });

  const isRtl = resumeData.language === 'ar';
  const t = getTranslation(resumeData.language);

  // Tab definitions
  const tabs = [
    { key: 'personal' as TabKey, label: t.editor.tabs.personal, icon: User },
    { key: 'summary' as TabKey, label: t.editor.tabs.summary, icon: FileText },
    { key: 'experience' as TabKey, label: t.editor.tabs.experience, icon: Briefcase },
    { key: 'education' as TabKey, label: t.editor.tabs.education, icon: GraduationCap },
    { key: 'skills' as TabKey, label: t.editor.tabs.skills, icon: CheckCircle2 },
    { key: 'languages' as TabKey, label: t.editor.tabs.languages, icon: LangIcon },
    { key: 'projects' as TabKey, label: t.editor.tabs.projects, icon: Layers },
    { key: 'certifications' as TabKey, label: t.editor.tabs.certifications, icon: Award },
    { key: 'references' as TabKey, label: t.editor.tabs.references, icon: Users },
    { key: 'styling' as TabKey, label: t.editor.tabs.styling, icon: Palette },
  ];

  // Helper updates
  const updatePersonalDetails = (field: string, value: string) => {
    onChange({
      ...resumeData,
      personalDetails: {
        ...resumeData.personalDetails,
        [field]: value,
      },
    });
  };

  const updateSummary = (content: string, highlights?: string[]) => {
    onChange({
      ...resumeData,
      summary: {
        ...resumeData.summary,
        content,
        highlights: highlights || resumeData.summary.highlights,
      },
    });
  };

  // Experience helpers
  const addExperience = () => {
    const newItem = {
      id: 'exp_' + Math.random().toString(36).substring(2, 7),
      role: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: true,
      description: '',
      bulletPoints: [''],
    };
    onChange({
      ...resumeData,
      experiences: [newItem, ...resumeData.experiences],
    });
  };

  const updateExperience = (id: string, updates: Partial<typeof resumeData.experiences[0]>) => {
    const updated = resumeData.experiences.map((exp) =>
      exp.id === id ? { ...exp, ...updates } : exp
    );
    onChange({ ...resumeData, experiences: updated });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...resumeData,
      experiences: resumeData.experiences.filter((exp) => exp.id !== id),
    });
  };

  const moveExperience = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= resumeData.experiences.length) return;
    const items = [...resumeData.experiences];
    const temp = items[index];
    items[index] = items[target];
    items[target] = temp;
    onChange({ ...resumeData, experiences: items });
  };

  // Education helpers
  const addEducation = () => {
    const newItem = {
      id: 'edu_' + Math.random().toString(36).substring(2, 7),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      gpa: '',
      description: '',
    };
    onChange({
      ...resumeData,
      educations: [newItem, ...resumeData.educations],
    });
  };

  const updateEducation = (id: string, updates: Partial<typeof resumeData.educations[0]>) => {
    const updated = resumeData.educations.map((edu) =>
      edu.id === id ? { ...edu, ...updates } : edu
    );
    onChange({ ...resumeData, educations: updated });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...resumeData,
      educations: resumeData.educations.filter((edu) => edu.id !== id),
    });
  };

  const moveEducation = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= resumeData.educations.length) return;
    const items = [...resumeData.educations];
    const temp = items[index];
    items[index] = items[target];
    items[target] = temp;
    onChange({ ...resumeData, educations: items });
  };

  // Skills helpers
  const addSkill = (name = '', category: 'technical' | 'soft' | 'tools' | 'other' = 'technical') => {
    const newItem = {
      id: 'sk_' + Math.random().toString(36).substring(2, 7),
      name,
      category,
      level: 4,
    };
    onChange({ ...resumeData, skills: [...resumeData.skills, newItem] });
  };

  const removeSkill = (id: string) => {
    onChange({ ...resumeData, skills: resumeData.skills.filter((s) => s.id !== id) });
  };

  // Language skills
  const addLanguageSkill = () => {
    const newItem = {
      id: 'lang_' + Math.random().toString(36).substring(2, 7),
      name: '',
      proficiency: 'Professional' as const,
    };
    onChange({ ...resumeData, languages: [...resumeData.languages, newItem] });
  };

  const removeLanguageSkill = (id: string) => {
    onChange({ ...resumeData, languages: resumeData.languages.filter((l) => l.id !== id) });
  };

  // Load sample data helper
  const handleLoadSample = () => {
    const sample = resumeData.language === 'ar' ? sampleArabicResume : sampleEnglishResume;
    onChange({
      ...sample,
      id: resumeData.id, // keep current resume id
      title: `${resumeData.title} (Pre-filled with Sample Data)`,
    });
  };

  // Validation helpers
  const isEmailValid =
    !resumeData.personalDetails.email ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resumeData.personalDetails.email);

  // Profile completeness percentage
  const calculateCompleteness = () => {
    let score = 0;
    const p = resumeData.personalDetails;
    if (p.fullName.trim()) score += 15;
    if (p.professionalTitle.trim()) score += 10;
    if (p.email.trim() && isEmailValid) score += 10;
    if (p.phone.trim()) score += 5;
    if (p.location.trim()) score += 5;
    if (resumeData.summary.content.trim().length > 25) score += 15;
    if (resumeData.experiences.length > 0) score += 20;
    if (resumeData.educations.length > 0) score += 10;
    if (resumeData.skills.length >= 3) score += 10;
    return Math.min(100, score);
  };

  const completenessScore = calculateCompleteness();

  const currentTabIndex = tabs.findIndex((tab) => tab.key === activeTab);
  const prevTab = currentTabIndex > 0 ? tabs[currentTabIndex - 1] : null;
  const nextTab = currentTabIndex < tabs.length - 1 ? tabs[currentTabIndex + 1] : null;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Editor Bar: Title, Save Status, Sample Pre-fill */}
      <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={resumeData.title}
            onChange={(e) => onChange({ ...resumeData, title: e.target.value })}
            className="text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-hidden px-1 py-0.5"
          />
          {/* Save status badge */}
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <span
              className={`w-2 h-2 rounded-full ${
                saveStatus === 'saving'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-emerald-500'
              }`}
            />
            {saveStatus === 'saving'
              ? t.editor.autosaveSaving
              : isCloudSynced
              ? t.editor.cloudSynced
              : t.editor.autosaveSaved}
          </span>
        </div>

        {/* Right tools: Load sample data & language toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition"
            title="Pre-fills this resume with comprehensive demo data"
          >
            {isRtl ? 'تحميل بيانات تجريبية (عينة)' : 'Load Sample Data'}
          </button>

          <button
            type="button"
            onClick={() => {
              const nextLang: Language = resumeData.language === 'en' ? 'ar' : 'en';
              onChange({
                ...resumeData,
                language: nextLang,
                fontFamily: nextLang === 'ar' ? 'cairo' : 'default',
              });
            }}
            className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1 transition"
          >
            <LangIcon className="w-3.5 h-3.5" />
            <span>{resumeData.language === 'en' ? 'Switch to العربية' : 'Switch to English'}</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center overflow-x-auto no-scrollbar border-b border-slate-200 px-4 bg-white text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/20'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Progress & Completeness Bar */}
      <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">
            {isRtl ? 'اكتمال السيرة الذاتية:' : 'CV Completeness:'}
          </span>
          <span className="font-extrabold text-blue-600">{completenessScore}%</span>
        </div>
        <div className="w-36 sm:w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              completenessScore >= 80
                ? 'bg-emerald-500'
                : completenessScore >= 50
                ? 'bg-blue-600'
                : 'bg-amber-500'
            }`}
            style={{ width: `${completenessScore}%` }}
          />
        </div>
      </div>

      {/* Tab Content Panel */}
      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        {/* Tab 1: Personal Info */}
        {activeTab === 'personal' && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-slate-900">{t.editor.personal.title}</h3>
            <ProfilePhotoUploader
              personalDetails={resumeData.personalDetails}
              userId={resumeData.userId}
              language={resumeData.language}
              onChange={(updated) =>
                onChange({
                  ...resumeData,
                  personalDetails: { ...resumeData.personalDetails, ...updated },
                  ...(updated.includePhoto !== undefined ? { includePhoto: updated.includePhoto } : {}),
                })
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.editor.personal.fullName}
                </label>
                <input
                  type="text"
                  value={resumeData.personalDetails.fullName}
                  onChange={(e) => updatePersonalDetails('fullName', e.target.value)}
                  placeholder="e.g. Johnathan Doe"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.editor.personal.professionalTitle}
                </label>
                <input
                  type="text"
                  value={resumeData.personalDetails.professionalTitle}
                  onChange={(e) => updatePersonalDetails('professionalTitle', e.target.value)}
                  placeholder="e.g. Senior Software Architect"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {t.editor.personal.email}
                  </label>
                  {!isEmailValid && (
                    <span className="text-[10px] text-red-500 font-semibold">
                      {isRtl ? 'صيغة بريد غير صالحة' : 'Invalid email format'}
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  value={resumeData.personalDetails.email}
                  onChange={(e) => updatePersonalDetails('email', e.target.value)}
                  placeholder="john.doe@example.com"
                  className={`w-full text-xs px-3 py-2 rounded-lg border transition ${
                    !isEmailValid
                      ? 'border-red-400 focus:outline-red-600 bg-red-50/20'
                      : 'border-slate-300 focus:outline-blue-600'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.editor.personal.phone}
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={resumeData.personalDetails.phone}
                  onChange={(e) => updatePersonalDetails('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.editor.personal.location}
                </label>
                <input
                  type="text"
                  value={resumeData.personalDetails.location}
                  onChange={(e) => updatePersonalDetails('location', e.target.value)}
                  placeholder="City, Country"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.editor.personal.website}
                </label>
                <input
                  type="url"
                  value={resumeData.personalDetails.website || ''}
                  onChange={(e) => updatePersonalDetails('website', e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.editor.personal.linkedin}
                </label>
                <input
                  type="text"
                  value={resumeData.personalDetails.linkedin || ''}
                  onChange={(e) => updatePersonalDetails('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.editor.personal.github}
                </label>
                <input
                  type="text"
                  value={resumeData.personalDetails.github || ''}
                  onChange={(e) => updatePersonalDetails('github', e.target.value)}
                  placeholder="github.com/username"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{t.editor.summary.title}</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setAiModalState({
                      isOpen: true,
                      mode: 'summary',
                      initialData: {
                        professionalTitle: resumeData.personalDetails.professionalTitle,
                        keySkills: resumeData.skills.map((s) => s.name),
                        existingDraft: resumeData.summary.content,
                      },
                    })
                  }
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.editor.summary.aiGenerateBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAiModalState({
                      isOpen: true,
                      mode: 'translate',
                      initialData: {
                        text: resumeData.summary.content,
                      },
                    })
                  }
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition"
                >
                  <LangIcon className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'ترجمة للإنجليزية' : 'Translate to Arabic'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={5}
              value={resumeData.summary.content}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder={t.editor.summary.placeholder}
              className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:outline-blue-600 leading-relaxed"
            />

            {/* Key highlights list */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">
                  {t.editor.summary.highlightsTitle}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updateSummary(resumeData.summary.content, [
                      ...(resumeData.summary.highlights || []),
                      '',
                    ])
                  }
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.editor.summary.addHighlight}</span>
                </button>
              </div>
              <div className="space-y-2">
                {(resumeData.summary.highlights || []).map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => {
                        const next = [...(resumeData.summary.highlights || [])];
                        next[index] = e.target.value;
                        updateSummary(resumeData.summary.content, next);
                      }}
                      placeholder="e.g. Scaled database throughput by 45%"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = (resumeData.summary.highlights || []).filter(
                          (_, i) => i !== index
                        );
                        updateSummary(resumeData.summary.content, next);
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Work Experience */}
        {activeTab === 'experience' && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{t.editor.experience.title}</h3>
              <button
                type="button"
                onClick={addExperience}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.editor.experience.addBtn}</span>
              </button>
            </div>

            <div className="space-y-6">
              {resumeData.experiences.map((exp, index) => (
                <div
                  key={exp.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 relative"
                >
                  <div className="absolute top-4 end-4 flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveExperience(index, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                      title={isRtl ? 'تحريك للأعلى' : 'Move up'}
                    >
                      <ChevronDown className="w-4 h-4 rotate-180" />
                    </button>
                    <button
                      type="button"
                      disabled={index === resumeData.experiences.length - 1}
                      onClick={() => moveExperience(index, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                      title={isRtl ? 'تحريك للأسفل' : 'Move down'}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition"
                      title="Remove Experience"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pe-24">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.editor.experience.role}
                      </label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
                        placeholder="e.g. Lead Software Engineer"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.editor.experience.company}
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                        placeholder="e.g. CloudTech Solutions"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.editor.experience.startDate}
                      </label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                        placeholder="2021-03"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.editor.experience.endDate}
                      </label>
                      <input
                        type="text"
                        disabled={exp.isCurrent}
                        value={exp.endDate || ''}
                        onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                        placeholder="2023-11"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600 disabled:bg-slate-100"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.isCurrent}
                          onChange={(e) => updateExperience(exp.id, { isCurrent: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{t.editor.experience.isCurrent}</span>
                      </label>
                    </div>
                  </div>

                  {/* Bullet points & AI enhance */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800">
                        {t.editor.experience.bulletsTitle}
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          updateExperience(exp.id, {
                            bulletPoints: [...exp.bulletPoints, ''],
                          })
                        }
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.editor.experience.addBullet}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {exp.bulletPoints.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => {
                              const next = [...exp.bulletPoints];
                              next[bIdx] = e.target.value;
                              updateExperience(exp.id, { bulletPoints: next });
                            }}
                            placeholder="Accomplished [X] as measured by [Y], by doing [Z]..."
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAiModalState({
                                isOpen: true,
                                mode: 'improve-bullet',
                                initialData: {
                                  bullet,
                                  roleTitle: exp.role,
                                  company: exp.company,
                                },
                                targetContext: `${exp.id}:${bIdx}`,
                              })
                            }
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="Enhance with AI"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = exp.bulletPoints.filter((_, i) => i !== bIdx);
                              updateExperience(exp.id, { bulletPoints: next });
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Education */}
        {activeTab === 'education' && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{t.editor.education.title}</h3>
              <button
                type="button"
                onClick={addEducation}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.editor.education.addBtn}</span>
              </button>
            </div>

            <div className="space-y-4">
              {resumeData.educations.map((edu, index) => (
                <div
                  key={edu.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative"
                >
                  <div className="absolute top-4 end-4 flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveEducation(index, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                      title={isRtl ? 'تحريك للأعلى' : 'Move up'}
                    >
                      <ChevronDown className="w-4 h-4 rotate-180" />
                    </button>
                    <button
                      type="button"
                      disabled={index === resumeData.educations.length - 1}
                      onClick={() => moveEducation(index, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition"
                      title={isRtl ? 'تحريك للأسفل' : 'Move down'}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition"
                      title="Remove Education"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pe-24">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.editor.education.institution}
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                        placeholder="e.g. Stanford University"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.editor.education.degree}
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                        placeholder="e.g. Bachelor of Science (B.S.)"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.editor.education.fieldOfStudy}
                      </label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })}
                        placeholder="Computer Science"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.editor.education.startDate} – {t.editor.education.endDate}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                          placeholder="2016"
                          className="w-1/2 text-xs px-2 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                        />
                        <input
                          type="text"
                          value={edu.endDate || ''}
                          onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                          placeholder="2020"
                          className="w-1/2 text-xs px-2 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.editor.education.gpa}
                      </label>
                      <input
                        type="text"
                        value={edu.gpa || ''}
                        onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                        placeholder="3.8 / 4.0"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Skills */}
        {activeTab === 'skills' && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t.editor.skills.title}</h3>
                <p className="text-xs text-slate-500">
                  {isRtl ? 'أضف المهارات الفنية والشخصية لرفع مطابقة أنظمة ATS' : 'Add skills to optimize keyword density for ATS systems.'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setAiModalState({
                      isOpen: true,
                      mode: 'suggest-skills',
                      initialData: {
                        professionalTitle: resumeData.personalDetails.professionalTitle,
                        existingSkills: resumeData.skills.map((s) => s.name),
                      },
                    })
                  }
                  className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.editor.skills.aiSuggestBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => addSkill()}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.editor.skills.addBtn}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resumeData.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                >
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => {
                      const updated = resumeData.skills.map((s) =>
                        s.id === skill.id ? { ...s, name: e.target.value } : s
                      );
                      onChange({ ...resumeData, skills: updated });
                    }}
                    placeholder="Skill name (e.g. React.js)"
                    className="flex-1 text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-blue-600 font-medium"
                  />
                  <select
                    value={skill.level}
                    onChange={(e) => {
                      const updated = resumeData.skills.map((s) =>
                        s.id === skill.id ? { ...s, level: parseInt(e.target.value, 10) } : s
                      );
                      onChange({ ...resumeData, skills: updated });
                    }}
                    className="text-xs px-2 py-1.5 rounded border border-slate-300 bg-white text-slate-700"
                  >
                    <option value={5}>5/5 (Master)</option>
                    <option value={4}>4/5 (Advanced)</option>
                    <option value={3}>3/5 (Intermediate)</option>
                    <option value={2}>2/5 (Basic)</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Languages */}
        {activeTab === 'languages' && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{t.editor.languages.title}</h3>
              <button
                type="button"
                onClick={addLanguageSkill}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.editor.languages.addBtn}</span>
              </button>
            </div>

            <div className="space-y-2">
              {resumeData.languages.map((l) => (
                <div
                  key={l.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                >
                  <input
                    type="text"
                    value={l.name}
                    onChange={(e) => {
                      const updated = resumeData.languages.map((item) =>
                        item.id === l.id ? { ...item, name: e.target.value } : item
                      );
                      onChange({ ...resumeData, languages: updated });
                    }}
                    placeholder="Language (e.g. Arabic, English)"
                    className="flex-1 text-xs px-3 py-1.5 rounded border border-slate-300 bg-white focus:outline-blue-600"
                  />
                  <select
                    value={l.proficiency}
                    onChange={(e) => {
                      const updated = resumeData.languages.map((item) =>
                        item.id === l.id ? { ...item, proficiency: e.target.value as any } : item
                      );
                      onChange({ ...resumeData, languages: updated });
                    }}
                    className="text-xs px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700"
                  >
                    <option value="Native">{t.editor.languages.levels.Native}</option>
                    <option value="Fluent">{t.editor.languages.levels.Fluent}</option>
                    <option value="Professional">{t.editor.languages.levels.Professional}</option>
                    <option value="Intermediate">{t.editor.languages.levels.Intermediate}</option>
                    <option value="Basic">{t.editor.languages.levels.Basic}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeLanguageSkill(l.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{t.editor.projects.title}</h3>
              <button
                type="button"
                onClick={() => {
                  const newItem = {
                    id: 'proj_' + Math.random().toString(36).substring(2, 7),
                    title: '',
                    role: '',
                    link: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                    technologies: [],
                  };
                  onChange({ ...resumeData, projects: [newItem, ...resumeData.projects] });
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.editor.projects.addBtn}</span>
              </button>
            </div>

            <div className="space-y-4">
              {resumeData.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative"
                >
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...resumeData,
                        projects: resumeData.projects.filter((p) => p.id !== proj.id),
                      })
                    }
                    className="absolute top-4 end-4 text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pe-8">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.editor.projects.name}
                      </label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = resumeData.projects.map((p) =>
                            p.id === proj.id ? { ...p, title: e.target.value } : p
                          );
                          onChange({ ...resumeData, projects: updated });
                        }}
                        placeholder="e.g. Distributed Event Bus"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {t.editor.projects.link}
                      </label>
                      <input
                        type="url"
                        value={proj.link || ''}
                        onChange={(e) => {
                          const updated = resumeData.projects.map((p) =>
                            p.id === proj.id ? { ...p, link: e.target.value } : p
                          );
                          onChange({ ...resumeData, projects: updated });
                        }}
                        placeholder="https://github.com/..."
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {t.editor.projects.description}
                    </label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const updated = resumeData.projects.map((p) =>
                          p.id === proj.id ? { ...p, description: e.target.value } : p
                        );
                        onChange({ ...resumeData, projects: updated });
                      }}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {t.editor.projects.technologies}
                    </label>
                    <input
                      type="text"
                      value={proj.technologies.join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                        const updated = resumeData.projects.map((p) =>
                          p.id === proj.id ? { ...p, technologies: tags } : p
                        );
                        onChange({ ...resumeData, projects: updated });
                      }}
                      placeholder="React, TypeScript, Go, Docker"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: Certifications */}
        {activeTab === 'certifications' && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{t.editor.certifications.title}</h3>
              <button
                type="button"
                onClick={() => {
                  const newItem = {
                    id: 'cert_' + Math.random().toString(36).substring(2, 7),
                    name: '',
                    issuer: '',
                    issueDate: '',
                  };
                  onChange({ ...resumeData, certifications: [...resumeData.certifications, newItem] });
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.editor.certifications.addBtn}</span>
              </button>
            </div>

            <div className="space-y-3">
              {resumeData.certifications.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => {
                        const updated = resumeData.certifications.map((item) =>
                          item.id === c.id ? { ...item, name: e.target.value } : item
                        );
                        onChange({ ...resumeData, certifications: updated });
                      }}
                      placeholder="Certificate Name"
                      className="text-xs px-3 py-1.5 rounded border border-slate-300 bg-white focus:outline-blue-600 font-semibold"
                    />
                    <input
                      type="text"
                      value={c.issuer}
                      onChange={(e) => {
                        const updated = resumeData.certifications.map((item) =>
                          item.id === c.id ? { ...item, issuer: e.target.value } : item
                        );
                        onChange({ ...resumeData, certifications: updated });
                      }}
                      placeholder="Issuer (e.g. AWS)"
                      className="text-xs px-3 py-1.5 rounded border border-slate-300 bg-white focus:outline-blue-600"
                    />
                    <input
                      type="text"
                      value={c.issueDate}
                      onChange={(e) => {
                        const updated = resumeData.certifications.map((item) =>
                          item.id === c.id ? { ...item, issueDate: e.target.value } : item
                        );
                        onChange({ ...resumeData, certifications: updated });
                      }}
                      placeholder="Date (e.g. 2023-05)"
                      className="text-xs px-3 py-1.5 rounded border border-slate-300 bg-white focus:outline-blue-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...resumeData,
                        certifications: resumeData.certifications.filter((item) => item.id !== c.id),
                      })
                    }
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 9: References */}
        {activeTab === 'references' && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{t.editor.references.title}</h3>
              <button
                type="button"
                onClick={() => {
                  const newItem = {
                    id: 'ref_' + Math.random().toString(36).substring(2, 7),
                    name: '',
                    company: '',
                    role: '',
                    email: '',
                    phone: '',
                    relationship: '',
                  };
                  onChange({ ...resumeData, references: [...resumeData.references, newItem] });
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.editor.references.addBtn}</span>
              </button>
            </div>

            <div className="space-y-3">
              {resumeData.references.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 relative"
                >
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...resumeData,
                        references: resumeData.references.filter((item) => item.id !== r.id),
                      })
                    }
                    className="absolute top-3 end-3 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-2 pe-6">
                    <input
                      type="text"
                      value={r.name}
                      onChange={(e) => {
                        const updated = resumeData.references.map((item) =>
                          item.id === r.id ? { ...item, name: e.target.value } : item
                        );
                        onChange({ ...resumeData, references: updated });
                      }}
                      placeholder="Reference Name"
                      className="text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-blue-600 font-bold"
                    />
                    <input
                      type="text"
                      value={r.company}
                      onChange={(e) => {
                        const updated = resumeData.references.map((item) =>
                          item.id === r.id ? { ...item, company: e.target.value } : item
                        );
                        onChange({ ...resumeData, references: updated });
                      }}
                      placeholder="Company"
                      className="text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      value={r.email}
                      onChange={(e) => {
                        const updated = resumeData.references.map((item) =>
                          item.id === r.id ? { ...item, email: e.target.value } : item
                        );
                        onChange({ ...resumeData, references: updated });
                      }}
                      placeholder="Email Address"
                      className="text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-blue-600"
                    />
                    <input
                      type="text"
                      value={r.relationship}
                      onChange={(e) => {
                        const updated = resumeData.references.map((item) =>
                          item.id === r.id ? { ...item, relationship: e.target.value } : item
                        );
                        onChange({ ...resumeData, references: updated });
                      }}
                      placeholder="Relationship (e.g. Manager)"
                      className="text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-blue-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 10: Styling & Templates */}
        {activeTab === 'styling' && (
          <div className="space-y-6 max-w-3xl">
            {/* Template Selection */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">{t.editor.styling.chooseTemplate}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TEMPLATES_LIST.map((tpl) => {
                  const isSelected = resumeData.templateId === tpl.id;
                  const tplMeta = (t.templates as any)[tpl.nameKey];
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => onChange({ ...resumeData, templateId: tpl.id })}
                      className={`p-3 rounded-xl border text-start flex flex-col justify-between transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className={`h-16 w-full rounded-lg bg-gradient-to-br ${tpl.previewBg} mb-2 shadow-xs`} />
                      <div>
                        <div className="text-xs font-bold text-slate-900 mb-0.5">{tplMeta?.name || tpl.id}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-2">{tplMeta?.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Color Palette */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{t.editor.styling.colorPalette}</h3>
              <div className="flex flex-wrap gap-2.5">
                {COLOR_PALETTES.map((palette) => {
                  const isSelected = resumeData.primaryColor === palette.hex;
                  return (
                    <button
                      key={palette.hex}
                      type="button"
                      onClick={() => onChange({ ...resumeData, primaryColor: palette.hex })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: palette.hex }} />
                      <span>{palette.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography selection */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{t.editor.styling.fontStyle}</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'default', label: isRtl ? 'افتراضي (Plex Arabic)' : 'Inter Clean' },
                  { id: 'cairo', label: 'Cairo (Modern Arabic/Latin)' },
                  { id: 'jakarta', label: 'Plus Jakarta Sans (Executive)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onChange({ ...resumeData, fontFamily: f.id as any })}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                      resumeData.fontFamily === f.id
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Step Guided Navigation Footer */}
      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between text-xs font-bold">
        {prevTab ? (
          <button
            type="button"
            onClick={() => setActiveTab(prevTab.key)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            <span>{isRtl ? `السابق: ${prevTab.label}` : `Back: ${prevTab.label}`}</span>
          </button>
        ) : (
          <div />
        )}

        {nextTab ? (
          <button
            type="button"
            onClick={() => setActiveTab(nextTab.key)}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-2xs transition"
          >
            <span>{isRtl ? `التالي: ${nextTab.label}` : `Next: ${nextTab.label}`}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isRtl ? 'اكتملت كافة الأقسام — يمكنك التصدير الآن' : 'All Sections Configured'}</span>
          </div>
        )}
      </div>
      {/* AI Assistant Modal Integration */}
      <AIAssistantModal
        isOpen={aiModalState.isOpen}
        onClose={() => setAiModalState({ ...aiModalState, isOpen: false })}
        mode={aiModalState.mode}
        language={resumeData.language}
        initialData={aiModalState.initialData}
        onApply={(result) => {
          if (aiModalState.mode === 'summary') {
            updateSummary(result.content, result.highlights);
          } else if (aiModalState.mode === 'improve-bullet') {
            if (aiModalState.targetContext) {
              const [expId, bIdxStr] = aiModalState.targetContext.split(':');
              const bIdx = parseInt(bIdxStr, 10);
              const exp = resumeData.experiences.find((e) => e.id === expId);
              if (exp) {
                const updatedBullets = [...exp.bulletPoints];
                updatedBullets[bIdx] = result;
                updateExperience(expId, { bulletPoints: updatedBullets });
              }
            }
          } else if (aiModalState.mode === 'suggest-skills') {
            const newSkills = (result as string[]).map((name) => ({
              id: 'sk_' + Math.random().toString(36).substring(2, 7),
              name,
              category: 'technical' as const,
              level: 4,
            }));
            onChange({
              ...resumeData,
              skills: [...resumeData.skills, ...newSkills],
            });
          } else if (aiModalState.mode === 'translate') {
            updateSummary(result);
          }
        }}
      />
    </div>
  );
};
