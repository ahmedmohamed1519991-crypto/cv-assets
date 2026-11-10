import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  FileUp,
} from 'lucide-react';
import { Language, ResumeData } from '../../types/resume';
import { createBlankResume } from '../../data/sampleData';
import { SupabaseStorageService } from '../../services/supabaseStorage';

interface ImportCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  userId?: string;
  onConfirmImport: (newResume: ResumeData) => void;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ImportCVModal: React.FC<ImportCVModalProps> = ({
  isOpen,
  onClose,
  language,
  userId,
  onConfirmImport,
}) => {
  const isRtl = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review state
  const [extracted, setExtracted] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();
    const validExt = lower.endsWith('.pdf') || lower.endsWith('.docx');
    const validMime =
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === '';

    if (!validExt || !validMime) {
      setError(
        isRtl
          ? 'صيغة الملف غير مدعومة. يرجى رفع ملف PDF أو DOCX فقط.'
          : 'Unsupported file format. Please upload a PDF or DOCX file.'
      );
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setError(
        isRtl
          ? 'حجم الملف يتجاوز الحد الأقصى المسموح به (10 ميجابايت).'
          : 'File size exceeds the 10 MB maximum limit.'
      );
      return;
    }

    setSelectedFile(file);
    setExtracted(null);
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    setUploadProgress(25);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('language', language);

      setUploadProgress(55);
      const res = await fetch('/api/ai/import-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract resume information.');
      }

      setUploadProgress(100);
      setExtracted(data);
    } catch (err: any) {
      setError(err.message || 'Error processing resume file.');
      setUploadProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!extracted) return;
    const detectedLang: Language = extracted.detectedLanguage === 'ar' ? 'ar' : language;
    const base = createBlankResume(detectedLang);

    // Upload original file to private Supabase Storage if authenticated
    let sourceFilePath: string | undefined;
    if (selectedFile && userId) {
      const uploaded = await SupabaseStorageService.uploadOriginalResumeFile(
        selectedFile,
        base.id,
        userId
      );
      sourceFilePath = uploaded.sourceFilePath;
    }

    const mappedExperiences = Array.isArray(extracted.experiences)
      ? extracted.experiences.map((exp: any, i: number) => ({
          id: `exp_${Date.now()}_${i}`,
          role: exp.role || '',
          company: exp.company || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          isCurrent: Boolean(exp.isCurrent),
          description: exp.description || '',
          highlights: exp.description
            ? String(exp.description)
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        }))
      : [];

    const mappedEducations = Array.isArray(extracted.educations)
      ? extracted.educations.map((edu: any, i: number) => ({
          id: `edu_${Date.now()}_${i}`,
          degree: edu.degree || '',
          institution: edu.institution || '',
          location: edu.location || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa || '',
        }))
      : [];

    const mappedSkills = Array.isArray(extracted.skills)
      ? extracted.skills.map((s: string, i: number) => ({
          id: `skill_${Date.now()}_${i}`,
          name: String(s),
          category: 'technical' as const,
          level: 4,
        }))
      : [];

    const newResume: ResumeData = {
      ...base,
      userId,
      title: extracted.fullName
        ? `${extracted.fullName} — ${isRtl ? 'مستوردة' : 'Imported'}`
        : selectedFile?.name || base.title,
      personalDetails: {
        ...base.personalDetails,
        fullName: extracted.fullName || '',
        professionalTitle: extracted.professionalTitle || '',
        email: extracted.email || '',
        phone: extracted.phone || '',
        location: extracted.location || '',
        linkedin: extracted.linkedin || '',
        website: extracted.website || '',
      },
      summary: {
        content: extracted.summary || '',
      },
      experiences: mappedExperiences,
      educations: mappedEducations,
      skills: mappedSkills,
      sourceFilePath,
      originalFileName: extracted.originalFileName || selectedFile?.name,
      sourceFileType: extracted.sourceFileType,
      updatedAt: new Date().toISOString(),
    };

    onConfirmImport(newResume);
    setSelectedFile(null);
    setExtracted(null);
    onClose();
  };

  const missingWarnings: string[] = [];
  if (extracted) {
    if (!extracted.fullName) missingWarnings.push(isRtl ? 'الاسم الكامل غير مكتمل' : 'Full Name not detected');
    if (!extracted.email) missingWarnings.push(isRtl ? 'البريد الإلكتروني غير موجود' : 'Email address not detected');
    if (!extracted.experiences || extracted.experiences.length === 0)
      missingWarnings.push(isRtl ? 'لم يتم استخراج خبرات عملية' : 'No work experience entries detected');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isRtl ? 'استيراد سيرة ذاتية حالية (PDF / DOCX)' : 'Import Existing Resume (PDF / DOCX)'}
              </h3>
              <p className="text-xs text-slate-300">
                {isRtl
                  ? 'استخراج ذكي للبيانات وتحويلها إلى قالب احترافي قابل للتعديل'
                  : 'Extract structured details into an editable, ATS-friendly template'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {!extracted ? (
            <>
              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {isRtl ? 'انقر لاختيار ملف PDF أو DOCX' : 'Click to select a PDF or DOCX resume'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {isRtl ? 'الحد الأقصى لحجم الملف: 10 ميجابايت' : 'Maximum file size: 10 MB'}
                  </p>
                </div>
              </div>

              {/* Selected File Preview */}
              {selectedFile && (
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-6 h-6 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{selectedFile.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleStartImport}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{isRtl ? 'جاري الاستخراج...' : 'Extracting...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'بدء الاستخراج الذكي' : 'Extract & Review'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    {isRtl ? 'جاري قراءة الملف وتحليل البيانات...' : 'Parsing document and structuring resume data...'}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Review Screen */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isRtl
                    ? 'تم استخراج البيانات بنجاح! راجع الحقول وعدّلها قبل الحفظ.'
                    : 'Resume extracted! Review and edit the fields below before importing.'}
                </span>
              </div>

              {missingWarnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{isRtl ? 'تنبيهات حقول مفقودة:' : 'Missing Information Warnings:'}</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px]">
                    {missingWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isRtl ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={extracted.fullName || ''}
                    onChange={(e) => setExtracted({ ...extracted, fullName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isRtl ? 'المسمى الوظيفي' : 'Professional Title'}
                  </label>
                  <input
                    type="text"
                    value={extracted.professionalTitle || ''}
                    onChange={(e) => setExtracted({ ...extracted, professionalTitle: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isRtl ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={extracted.email || ''}
                    onChange={(e) => setExtracted({ ...extracted, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isRtl ? 'رقم الهاتف' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={extracted.phone || ''}
                    onChange={(e) => setExtracted({ ...extracted, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isRtl ? 'الملخص المهني' : 'Professional Summary'}
                </label>
                <textarea
                  rows={3}
                  value={extracted.summary || ''}
                  onChange={(e) => setExtracted({ ...extracted, summary: e.target.value })}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">{extracted.experiences?.length || 0}</div>
                  <div className="text-[11px] text-slate-500">{isRtl ? 'خبرات عملية' : 'Experiences'}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">{extracted.educations?.length || 0}</div>
                  <div className="text-[11px] text-slate-500">{isRtl ? 'شهادات علمية' : 'Education'}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">{extracted.skills?.length || 0}</div>
                  <div className="text-[11px] text-slate-500">{isRtl ? 'مهارات' : 'Skills'}</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
          {extracted && (
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              {isRtl ? 'تأكيد واستيراد السيرة' : 'Confirm and Import'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
