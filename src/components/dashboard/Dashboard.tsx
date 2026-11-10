import React, { useState } from 'react';
import {
  Plus,
  FileText,
  Copy,
  Trash2,
  Edit,
  Download,
  ShieldCheck,
  Calendar,
  Languages as LangIcon,
  Star,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Eye,
  FileUp,
} from 'lucide-react';
import { ResumeData, Language, CoverLetterData } from '../../types/resume';
import { getTranslation } from '../../utils/i18n';
import { StorageService } from '../../services/storage';
import { exportResumeToPDF } from '../../services/pdfExport';
import { ImportCVModal } from './ImportCVModal';

interface DashboardProps {
  resumes: ResumeData[];
  onSelectResume: (id: string) => void;
  onCreateNew: (lang: Language) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenCoverLetter: () => void;
  language: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({
  resumes,
  onSelectResume,
  onCreateNew,
  onDuplicate,
  onDelete,
  onOpenCoverLetter,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLang, setFilterLang] = useState<'all' | 'en' | 'ar'>('all');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const t = getTranslation(language);
  const isRtl = language === 'ar';

  const coverLetters = StorageService.getAllCoverLetters();

  // Filter resumes
  const filteredResumes = resumes.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.personalDetails.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.personalDetails.professionalTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = filterLang === 'all' || r.language === filterLang;
    return matchesSearch && matchesLang;
  });

  // Calculate stats
  const totalResumes = resumes.length;
  const avgAtsScore = totalResumes
    ? Math.round(resumes.reduce((acc, r) => acc + (r.atsScore || 85), 0) / totalResumes)
    : 0;

  const handleQuickDownload = async (resume: ResumeData, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(resume.id);
    try {
      // Temporarily select to ensure printable DOM node exists or open editor
      onSelectResume(resume.id);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.dashboard.title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t.dashboard.subtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onCreateNew('en')}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.dashboard.createEnglish}</span>
          </button>

          <button
            type="button"
            onClick={() => onCreateNew('ar')}
            className="px-4 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-2xs flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>{t.dashboard.createArabic}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl shadow-2xs flex items-center gap-2 transition"
          >
            <FileUp className="w-4 h-4 text-indigo-600" />
            <span>{isRtl ? 'استيراد سيرة حالية' : 'Import Existing Resume'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCoverLetter}
            className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{t.nav.coverLetter}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {isRtl ? 'إجمالي السير الذاتية' : 'Total Resumes'}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalResumes}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">
            {isRtl ? 'محفوظة محلياً & جاهزة للتصدير' : 'Saved locally & export-ready'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {isRtl ? 'متوسط توافق ATS' : 'Avg. ATS Compatibility'}
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{avgAtsScore}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {isRtl ? 'متطابق مع معايير الفرز' : 'Industry benchmark aligned'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {isRtl ? 'خطابات التقديم' : 'Cover Letters'}
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{coverLetters.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {isRtl ? 'مصممة بواسطة الذكاء الاصطناعي' : 'Tailored with Gemini AI'}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {isRtl ? 'صيغة التصدير' : 'Export Standard'}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">A4</div>
          <div className="text-[10px] text-blue-600 mt-0.5 font-medium">
            {isRtl ? '210 × 297 مم دقة طباعية' : '210 × 297 mm High-Res PDF'}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'بحث في السير الذاتية والمسميات...' : 'Search resumes by title or role...'}
            className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-blue-600 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline me-1">
            {isRtl ? 'اللغة:' : 'Language:'}
          </span>
          <button
            type="button"
            onClick={() => setFilterLang('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterLang === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isRtl ? 'الكل' : 'All'}
          </button>
          <button
            type="button"
            onClick={() => setFilterLang('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterLang === 'en'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setFilterLang('ar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterLang === 'ar'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            العربية
          </button>
        </div>
      </div>

      {/* Resumes Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            {t.dashboard.recentResumes} ({filteredResumes.length})
          </h2>
        </div>

        {filteredResumes.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">{t.dashboard.emptyTitle}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              {t.dashboard.emptySubtitle}
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => onCreateNew('en')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                {t.dashboard.createNew}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map((resume) => {
              const resumeLang = resume.language;
              const isResumeAr = resumeLang === 'ar';
              const formattedDate = new Date(resume.updatedAt).toLocaleDateString(
                language === 'ar' ? 'ar-SA' : 'en-US',
                { month: 'short', day: 'numeric', year: 'numeric' }
              );

              return (
                <div
                  key={resume.id}
                  onClick={() => onSelectResume(resume.id)}
                  className="rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group cursor-pointer"
                >
                  {/* Card Header & Preview Accent */}
                  <div>
                    <div
                      className="h-24 w-full relative p-4 flex justify-between items-start"
                      style={{
                        backgroundColor: resume.primaryColor || '#1e3a8a',
                      }}
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/20 text-white backdrop-blur-xs uppercase">
                          {resume.templateId.replace('-', ' ')}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-black/25 text-white">
                          {isResumeAr ? 'عربي (RTL)' : 'English'}
                        </span>
                      </div>

                      {resume.atsScore ? (
                        <div className="px-2.5 py-0.5 rounded-full bg-white text-slate-900 text-[10px] font-black flex items-center gap-1 shadow-xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{resume.atsScore}% ATS</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition mb-1 line-clamp-1">
                        {resume.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-1 mb-3">
                        {resume.personalDetails.fullName || (isRtl ? 'بدون اسم' : 'Unnamed candidate')} —{' '}
                        {resume.personalDetails.professionalTitle || (isRtl ? 'المسمى المهني' : 'Professional')}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{t.dashboard.lastModified}: {formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectResume(resume.id);
                      }}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs flex items-center gap-1.5 transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>{t.dashboard.actions.edit}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(resume.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
                        title={t.dashboard.actions.duplicate}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(resume.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title={t.dashboard.actions.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cover Letters Section */}
      {coverLetters.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>{t.dashboard.coverLetters} ({coverLetters.length})</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenCoverLetter}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              + {isRtl ? 'إنشاء خطاب جديد' : 'New Cover Letter'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coverLetters.map((cl) => (
              <div
                key={cl.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xs font-bold text-slate-900">{cl.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                      {cl.language === 'ar' ? 'عربي' : 'English'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {cl.companyName || 'Company'} — {cl.jobTitle || 'Role'}
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                    {cl.fullLetter}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400">
                    {new Date(cl.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenCoverLetter()}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <span>{isRtl ? 'عرض وتحرير' : 'View & Edit'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Gallery Showcase */}
      <div className="pt-6 border-t border-slate-200">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">
            {language === 'ar' ? 'نماذج السير الذاتية المعتمدة (6 قوالب احترافية)' : 'ATS-Optimized Template Gallery (6 Distinct Designs)'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'ar'
              ? 'مصممة للفرز الآلي بدقة، مع دعم كامل للغتين العربية والإنجليزية وتصدير طباعي A4.'
              : 'Designed to pass corporate ATS filters with high readability, full bilingual support, and precision A4 print styling.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'modern-navy', name: 'Modern Navy', role: 'Corporate & Engineering', bg: 'bg-blue-900' },
            { id: 'executive-slate', name: 'Executive Slate', role: 'Leadership & Strategy', bg: 'bg-slate-800' },
            { id: 'minimal-ats', name: 'Minimal ATS', role: 'Pure ATS Compliant', bg: 'bg-neutral-800' },
            { id: 'tech-innovator', name: 'Tech Innovator', role: 'Software & DevOps', bg: 'bg-cyan-800' },
            { id: 'creative-emerald', name: 'Creative Emerald', role: 'Product & Design', bg: 'bg-emerald-800' },
            { id: 'compact-elegance', name: 'Compact Elegance', role: 'Experienced Leads', bg: 'bg-indigo-950' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => {
                const blank = StorageService.createNewResume(language);
                blank.templateId = item.id as any;
                StorageService.saveResume(blank);
                onSelectResume(blank.id);
              }}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
            >
              <div className={`h-12 w-full rounded-lg ${item.bg} mb-2 shadow-2xs`} />
              <div>
                <div className="text-xs font-bold text-slate-900">{item.name}</div>
                <div className="text-[10px] text-slate-500">{item.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ImportCVModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        language={language}
        userId={StorageService.getLocalUser()?.id}
        onConfirmImport={(newResume) => {
          StorageService.saveResume(newResume, StorageService.getLocalUser()?.id);
          onSelectResume(newResume.id);
        }}
      />
    </div>
  );
};
