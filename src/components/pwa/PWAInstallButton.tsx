import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { Language } from '../../types/resume';

interface PWAInstallButtonProps {
  language: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isRtl = language === 'ar';

  // If running as standalone installed app, hide prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
        title="Install app to your home screen or desktop"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isRtl ? 'تثبيت التطبيق (PWA)' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isRtl ? 'تثبيت على آيفون' : 'Install on iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-slate-900 border border-slate-200"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {isRtl ? 'تثبيت التطبيق على iPhone / iPad' : 'Install on iPhone / iPad'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>
                    {isRtl
                      ? 'اضغط على زر المشاركة (Share) في شريط متصفح Safari بالأسفل.'
                      : 'Tap the Share icon in the Safari toolbar at the bottom.'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>
                    {isRtl
                      ? 'مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
                      : 'Scroll down and select "Add to Home Screen".'}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>
                    {isRtl
                      ? 'اضغط على "إضافة" للاستمتاع بتجربة تطبيق كاملة دون الحاجة لمتجر التطبيقات.'
                      : 'Tap "Add" in the top-right corner to launch directly from your home screen.'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                {isRtl ? 'فهمت ذلك' : 'Got It'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
