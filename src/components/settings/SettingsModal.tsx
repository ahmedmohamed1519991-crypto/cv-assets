import React, { useRef, useState } from 'react';
import { X, Globe, Download, Upload, Trash2, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language, UserProfile } from '../../types/resume';
import { getTranslation } from '../../utils/i18n';
import { isSupabaseConfigured } from '../../services/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onDataImported: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  currentUser,
  onOpenAuth,
  onDataImported,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const t = getTranslation(language);
  const isRtl = language === 'ar';

  if (!isOpen) return null;

  const handleExportJson = () => {
    const jsonStr = StorageService.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CV_Maker_AI_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = StorageService.importDataJSON(content);
      if (result.success) {
        setImportStatus(
          isRtl
            ? `تم استيراد ${result.count} سيرة ذاتية بنجاح!`
            : `Successfully imported ${result.count} resumes!`
        );
        onDataImported();
      } else {
        setImportStatus(result.error || 'Failed to import JSON data');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
          <h3 className="text-base font-bold text-white">{t.nav.settings}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>{isRtl ? 'لغة الواجهة والتطبيق' : 'Application Language'}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                  language === 'en'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                English (LTR)
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('ar')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                  language === 'ar'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                العربية (RTL)
              </button>
            </div>
          </div>

          {/* Account Status */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                {isRtl ? 'حساب المستخدم والمزامنة' : 'Account & Sync Status'}
              </span>
              <button
                type="button"
                onClick={onOpenAuth}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                {currentUser ? (isRtl ? 'إدارة الحساب' : 'Manage Account') : (isRtl ? 'تسجيل الدخول' : 'Sign In')}
              </button>
            </div>
            <p className="text-xs text-slate-600">
              {currentUser
                ? `${isRtl ? 'مسجل الدخول كـ' : 'Signed in as'}: ${currentUser.email}`
                : isRtl
                ? 'تعمل حالياً في وضع الزائر السريع — يتم حفظ التعديلات محلياً وتستطيع تصدير PDF فوراً.'
                : 'Working in Guest Mode — Resumes are saved locally in your browser.'}
            </p>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>{isRtl ? 'النسخ الاحتياطي والاستيراد (JSON)' : 'Data Backup & Migration'}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportJson}
                className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تصدير نسخة JSON' : 'Export JSON'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isRtl ? 'استيراد نسخة JSON' : 'Import JSON'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
            {importStatus && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
          >
            {isRtl ? 'تم' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
