import React, { useState } from 'react';
import {
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCode,
  ShieldCheck,
  Check,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { ResumeData, Language, TemplateId } from '../../types/resume';
import { getTranslation } from '../../utils/i18n';
import { ResumeTemplateRenderer } from '../templates/ResumeTemplateRenderer';
import { exportResumeToPDF, printResumeNative } from '../../services/pdfExport';

interface LiveResumePreviewProps {
  resumeData: ResumeData;
  language: Language;
  onOpenAtsModal: () => void;
  onChangeTemplate: (tplId: TemplateId) => void;
}

export const LiveResumePreview: React.FC<LiveResumePreviewProps> = ({
  resumeData,
  language,
  onOpenAtsModal,
  onChangeTemplate,
}) => {
  const [zoom, setZoom] = useState<number>(0.85);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const t = getTranslation(language);
  const isRtl = language === 'ar';

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const sanitizedName = (resumeData.personalDetails.fullName || 'Resume')
        .replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
      await exportResumeToPDF('resume-printable-node', `${sanitizedName}_CV.pdf`);
    } catch (e) {
      console.error('PDF error:', e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.45));
  const handleResetZoom = () => setZoom(0.85);

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Top Toolbar: Action Buttons & Zoom Controls */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Export & ATS triggers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
            title="Download high-resolution A4 PDF"
          >
            {isExportingPdf ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t.preview.generatingPdf}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{t.preview.downloadPdf}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={printResumeNative}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
            title="Native print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.preview.print}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAtsModal}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1.5"
            title="Audit against ATS algorithms"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">{t.preview.atsCheck}</span>
            {resumeData.atsScore ? (
              <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1 rounded">
                {resumeData.atsScore}%
              </span>
            ) : null}
          </button>
        </div>

        {/* Right: Template quick-switcher & Zoom controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              {isRtl ? 'القالب:' : 'Template:'}
            </span>
            <select
              value={resumeData.templateId}
              onChange={(e) => onChangeTemplate(e.target.value as TemplateId)}
              className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-blue-600"
            >
              <option value="modern-navy">Modern Navy</option>
              <option value="executive-slate">Executive Slate</option>
              <option value="minimal-ats">Minimal ATS</option>
              <option value="tech-innovator">Tech Innovator</option>
              <option value="creative-emerald">Creative Emerald</option>
              <option value="compact-elegance">Compact Elegance</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white transition"
              title={t.preview.zoomOut}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-700 min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white transition"
              title={t.preview.zoomIn}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white transition ms-0.5"
              title={t.preview.resetZoom}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Container with realistic paper shadow & centered viewport */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start bg-slate-200/70">
        <div className="transition-transform duration-150 ease-out origin-top flex justify-center">
          <ResumeTemplateRenderer data={resumeData} scale={zoom} />
        </div>
      </div>

      {/* Floating Download PDF Action Button */}
      <button
        type="button"
        disabled={isExportingPdf}
        onClick={handleDownloadPdf}
        className={`no-print absolute bottom-5 ${isRtl ? 'left-5' : 'right-5'} z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl transition-all active:scale-95 disabled:opacity-60`}
        title={t.preview.downloadPdf}
      >
        {isExportingPdf ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t.preview.generatingPdf}</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>{t.preview.downloadPdf}</span>
          </>
        )}
      </button>
    </div>
  );
};
