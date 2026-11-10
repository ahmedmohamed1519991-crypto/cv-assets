import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Globe,
  Settings,
  User as UserIcon,
  Download,
  Menu,
  X,
} from 'lucide-react';
import { Language, UserProfile } from '../../types/resume';
import { getTranslation } from '../../utils/i18n';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface HeaderProps {
  currentView: 'landing' | 'dashboard' | 'editor';
  onNavigate: (view: 'landing' | 'dashboard' | 'editor') => void;
  language: Language;
  onToggleLanguage: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onOpenAts: () => void;
  onOpenCoverLetter: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  language,
  onToggleLanguage,
  currentUser,
  onOpenAuth,
  onOpenSettings,
  onOpenAts,
  onOpenCoverLetter,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = getTranslation(language);
  const isRtl = language === 'ar';

  const handleNav = (view: 'landing' | 'dashboard' | 'editor') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleNav('landing')}
              className="flex items-center gap-2.5 text-start group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-600 transition">
                <FileText className="w-5 h-5 text-blue-400 group-hover:text-white transition" />
              </div>
              <div>
                <span className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1">
                  <span>CV Maker</span>
                  <span className="text-blue-600">AI</span>
                </span>
                <span className="block text-[9.5px] font-semibold text-slate-400 -mt-1 tracking-wider uppercase">
                  {language === 'ar' ? 'سير ذاتية ثنائية اللغة' : 'Bilingual Resume Engine'}
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleNav('landing')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentView === 'landing'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {t.nav.landing}
              </button>
              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentView === 'dashboard'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {t.nav.dashboard}
              </button>
              <button
                type="button"
                onClick={() => handleNav('editor')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  currentView === 'editor'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {t.nav.editor}
              </button>
              <button
                type="button"
                onClick={onOpenAts}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.nav.ats}</span>
              </button>
              <button
                type="button"
                onClick={onOpenCoverLetter}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.nav.coverLetter}</span>
              </button>
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PWA Install Button */}
            <PWAInstallButton language={language} />

            {/* Language Switcher */}
            <button
              type="button"
              onClick={onToggleLanguage}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 transition"
              title="Toggle English / Arabic"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition hidden sm:inline-flex"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Account / Profile */}
            <button
              type="button"
              onClick={onOpenAuth}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                currentUser
                  ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>
                {currentUser ? currentUser.fullName || currentUser.email.split('@')[0] : t.nav.signIn}
              </span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:hidden transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-fadeIn"
        >
          <div className="flex flex-col space-y-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleNav('landing')}
              className={`p-2.5 rounded-lg text-start transition ${
                currentView === 'landing' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.nav.landing}
            </button>
            <button
              type="button"
              onClick={() => handleNav('dashboard')}
              className={`p-2.5 rounded-lg text-start transition ${
                currentView === 'dashboard' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.nav.dashboard}
            </button>
            <button
              type="button"
              onClick={() => handleNav('editor')}
              className={`p-2.5 rounded-lg text-start transition ${
                currentView === 'editor' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.nav.editor}
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenAts();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg text-start text-emerald-800 hover:bg-emerald-50 transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.nav.ats}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenCoverLetter();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg text-start text-indigo-800 hover:bg-indigo-50 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{t.nav.coverLetter}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg text-start text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>{t.nav.settings}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg text-start text-slate-900 bg-slate-100 hover:bg-slate-200 font-bold transition flex items-center gap-2 mt-2"
            >
              <UserIcon className="w-4 h-4" />
              <span>{currentUser ? currentUser.fullName || currentUser.email : t.nav.signIn}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

