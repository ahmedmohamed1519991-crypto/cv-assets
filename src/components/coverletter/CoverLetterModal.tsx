import React, { useState } from 'react';
import { X, Sparkles, Copy, Download, Printer, Check, RefreshCw, FileText } from 'lucide-react';
import { AIService } from '../../services/ai';
import { StorageService } from '../../services/storage';
import { ResumeData, CoverLetterData, Language } from '../../types/resume';
import { getTranslation } from '../../utils/i18n';

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  language: Language;
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  language,
}) => {
  const t = getTranslation(language);
  const isRtl = language === 'ar';

  const [applicantName, setApplicantName] = useState(resumeData.personalDetails.fullName || '');
  const [roleTitle, setRoleTitle] = useState(resumeData.personalDetails.professionalTitle || '');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Confident & High-Impact');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [generatedLetter, setGeneratedLetter] = useState<CoverLetterData | null>(null);
  const [editableLetter, setEditableLetter] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const skills = resumeData.skills.map((s) => s.name);
      const res = await AIService.generateCoverLetter({
        applicantName,
        roleTitle,
        companyName,
        keySkills: skills,
        resumeSummary: resumeData.summary.content,
        jobDescription,
        language,
        tone,
      });

      const fullText = res.fullLetter || `${res.greeting}\n\n${res.openingParagraph}\n\n${res.bodyParagraphs.join('\n\n')}\n\n${res.closingParagraph}\n\n${res.signOff}\n${applicantName}`;

      const newCoverLetter: CoverLetterData = {
        id: 'cl_' + Math.random().toString(36).substring(2, 9),
        resumeId: resumeData.id,
        title: `${roleTitle || 'Role'} at ${companyName || 'Company'}`,
        applicantName,
        recipientName: 'Hiring Team',
        companyName,
        jobTitle: roleTitle,
        language,
        tone,
        greeting: res.greeting,
        openingParagraph: res.openingParagraph,
        bodyParagraphs: res.bodyParagraphs,
        closingParagraph: res.closingParagraph,
        signOff: res.signOff,
        fullLetter: fullText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setGeneratedLetter(newCoverLetter);
      setEditableLetter(fullText);
      StorageService.saveCoverLetter(newCoverLetter);
    } catch (err: any) {
      setError(err.message || 'Failed to generate cover letter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([editableLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cover_Letter_${companyName || 'Application'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <html dir="${isRtl ? 'rtl' : 'ltr'}">
        <head>
          <title>Cover Letter - ${applicantName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; line-height: 1.6; color: #1e293b; max-width: 800px; margin: auto; }
            p { margin-bottom: 1.2em; white-space: pre-line; }
          </style>
        </head>
        <body>
          <h2>${applicantName}</h2>
          <hr style="margin-bottom: 24px; border: 0; border-top: 1px solid #cbd5e1;" />
          <p>${editableLetter.replace(/\n/g, '<br />')}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.coverLetter.title}</h3>
              <p className="text-xs text-blue-200">{t.coverLetter.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Form: Inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.coverLetter.applicantName}
              </label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.coverLetter.targetRole}
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Lead Engineer"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.coverLetter.targetCompany}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, Aramco"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.coverLetter.tone}
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
              >
                <option value="Confident & High-Impact">{t.coverLetter.tones.confident}</option>
                <option value="Executive & Strategic">{t.coverLetter.tones.executive}</option>
                <option value="Creative & Engaging">{t.coverLetter.tones.creative}</option>
                <option value="Traditional & Formal">{t.coverLetter.tones.formal}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.coverLetter.jobDescription}
              </label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key responsibilities or job posting to tailor paragraphs..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-blue-600"
              />
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleGenerate}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.coverLetter.generating}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.coverLetter.generateBtn}</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                {error}
              </div>
            )}
          </div>

          {/* Right Preview & Editor (7 cols) */}
          <div className="lg:col-span-7 flex flex-col border border-slate-200 rounded-xl bg-slate-50 p-4">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">
                {isRtl ? 'المعاينة والتحرير:' : 'Cover Letter Preview (Editable):'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={!editableLetter}
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-xs rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1 disabled:opacity-40"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t.coverLetter.copied : t.coverLetter.copyBtn}</span>
                </button>
                <button
                  type="button"
                  disabled={!editableLetter}
                  onClick={handleDownloadTxt}
                  className="px-2.5 py-1 text-xs rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1 disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>TXT</span>
                </button>
                <button
                  type="button"
                  disabled={!editableLetter}
                  onClick={handlePrint}
                  className="px-2.5 py-1 text-xs rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1 disabled:opacity-40"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PDF / Print</span>
                </button>
              </div>
            </div>

            <textarea
              rows={14}
              value={editableLetter}
              onChange={(e) => setEditableLetter(e.target.value)}
              placeholder={
                isRtl
                  ? 'انقر على "إنشاء الخطاب بالذكاء الاصطناعي" لتوليد خطاب متناسق مع سيرتك الذاتية...'
                  : 'Click "Generate Cover Letter with AI" to generate a tailored letter based on your resume...'
              }
              className="w-full flex-1 text-xs p-3.5 rounded-lg border border-slate-200 bg-white text-slate-800 leading-relaxed focus:outline-blue-600 font-sans"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
