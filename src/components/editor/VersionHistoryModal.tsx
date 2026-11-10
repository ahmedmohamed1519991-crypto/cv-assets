import React, { useState, useEffect } from 'react';
import { X, History, Plus, RotateCcw, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { ResumeData, Language } from '../../types/resume';
import { StorageService, ResumeVersion } from '../../services/storage';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  userId?: string;
  language: Language;
  onRestoreVersion: (restoredData: ResumeData) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  userId,
  language,
  onRestoreVersion,
}) => {
  const isRtl = language === 'ar';
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [versionName, setVersionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const loadVersions = async () => {
    setIsLoading(true);
    const list = await StorageService.getResumeVersions(resumeData.id, userId);
    setVersions(list);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, resumeData.id, userId]);

  if (!isOpen) return null;

  const handleSaveSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = versionName.trim() || (isRtl ? `نسخة ${versions.length + 1}` : `Snapshot v${versions.length + 1}`);
    const created = await StorageService.saveResumeVersion(resumeData.id, label, resumeData, userId);
    setVersions((prev) => [created, ...prev]);
    setVersionName('');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleDelete = async (versionId: string) => {
    await StorageService.deleteResumeVersion(versionId, userId);
    setVersions((prev) => prev.filter((v) => v.id !== versionId));
  };

  const handleRestore = (version: ResumeVersion) => {
    onRestoreVersion({
      ...version.data,
      id: resumeData.id,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isRtl ? 'سجل الإصدارات والنسخ الاحتياطية' : 'Resume Version History'}
              </h3>
              <p className="text-xs text-slate-300">
                {isRtl ? 'احفظ نقاط استعادة قبل تعديل سيرتك الذاتية' : 'Save and restore snapshots of your resume'}
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

        {/* Create Snapshot Form */}
        <form onSubmit={handleSaveSnapshot} className="p-4 bg-slate-50 border-b border-slate-200 flex gap-2">
          <input
            type="text"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            placeholder={isRtl ? 'اسم النسخة (مثال: قبل التقديم لشركة X)' : 'Snapshot name (e.g., Before ATS Tailoring)'}
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shrink-0"
          >
            {savedNotice ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{savedNotice ? (isRtl ? 'تم الحفظ' : 'Saved') : (isRtl ? 'حفظ نسخة' : 'Save Snapshot')}</span>
          </button>
        </form>

        {/* Version List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {isLoading ? (
            <div className="py-10 text-center text-xs text-slate-500">
              {isRtl ? 'جاري تحميل الإصدارات...' : 'Loading version history...'}
            </div>
          ) : versions.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">
                {isRtl
                  ? 'لا توجد نسخ محفوظة بعد. أنشئ أول نقطة استعادة أعلاه.'
                  : 'No snapshots saved yet. Create your first restore point above.'}
              </p>
            </div>
          ) : (
            versions.map((ver) => (
              <div
                key={ver.id}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{ver.versionName}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ver.createdAt).toLocaleString(isRtl ? 'ar-EG' : 'en-US')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRestore(ver)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'استعادة' : 'Restore'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ver.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title={isRtl ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
