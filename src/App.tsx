import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StorageService } from './services/storage';
import { ResumeData, Language, UserProfile, TemplateId } from './types/resume';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { CVEditor } from './components/editor/CVEditor';
import { LiveResumePreview } from './components/preview/LiveResumePreview';
import { ATSAnalyzerModal } from './components/ats/ATSAnalyzerModal';
import { CoverLetterModal } from './components/coverletter/CoverLetterModal';
import { AuthModal } from './components/auth/AuthModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { isSupabaseConfigured, supabase } from './services/supabase';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'editor'>('dashboard');
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string>('');
  const [language, setLanguage] = useState<Language>('en');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Modals state
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Mobile layout switch: 'editor' vs 'preview'
  const [mobileSplitView, setMobileSplitView] = useState<'editor' | 'preview'>('editor');

  const saveTimerRef = useRef<any>(null);

  // 1. Initial Load
  useEffect(() => {
    // UI Language
    const initialLang = StorageService.getUILanguage();
    setLanguage(initialLang);
    document.documentElement.lang = initialLang;
    document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';

    // Resumes
    const all = StorageService.getAllResumes();
    setResumes(all);
    const activeId = StorageService.getActiveResumeId();
    setActiveResumeId(activeId);

    // User session
    const localUser = StorageService.getLocalUser();
    setCurrentUser(localUser);

    // If Supabase configured, check active session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            preferredLanguage: initialLang,
          };
          setCurrentUser(profile);
          setIsCloudSynced(true);
        }
      });
    }
  }, []);

  // 2. Active Resume Finder
  const activeResume: ResumeData =
    resumes.find((r) => r.id === activeResumeId) || resumes[0];

  // 3. Debounced Auto-save
  const handleUpdateResume = useCallback(
    (updated: ResumeData) => {
      setSaveStatus('saving');

      // Update in memory immediately for instantaneous live preview
      setResumes((prev) => {
        const idx = prev.findIndex((r) => r.id === updated.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [updated, ...prev];
      });

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        const { isOnlineSynced } = StorageService.saveResume(updated, currentUser?.id);
        setIsCloudSynced(isOnlineSynced);
        setSaveStatus('saved');
      }, 500);
    },
    [currentUser]
  );

  // 4. Language Toggle
  const handleToggleLanguage = () => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    setLanguage(nextLang);
    StorageService.setUILanguage(nextLang);
  };

  // 5. Create Resume
  const handleCreateNew = (lang: Language) => {
    const blank = StorageService.createNewResume(lang);
    setResumes(StorageService.getAllResumes());
    setActiveResumeId(blank.id);
    setCurrentView('editor');
  };

  // 6. Duplicate Resume
  const handleDuplicate = (id: string) => {
    const copy = StorageService.duplicateResume(id);
    if (copy) {
      setResumes(StorageService.getAllResumes());
      setActiveResumeId(copy.id);
    }
  };

  // 7. Delete Resume
  const handleDelete = (id: string) => {
    if (resumes.length <= 1) {
      alert(language === 'ar' ? 'يجب الاحتفاظ بسيرة ذاتية واحدة على الأقل' : 'You must keep at least one resume.');
      return;
    }
    const confirmed = window.confirm(
      language === 'ar' ? 'هل أنت متأكد من حذف هذه السيرة الذاتية؟' : 'Are you sure you want to delete this resume?'
    );
    if (!confirmed) return;

    StorageService.deleteResume(id, currentUser?.id);
    const remaining = StorageService.getAllResumes();
    setResumes(remaining);
    setActiveResumeId(remaining[0]?.id || '');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Primary Header */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAts={() => setIsAtsModalOpen(true)}
        onOpenCoverLetter={() => setIsCoverLetterModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1 flex flex-col">
        {/* Landing View */}
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => setCurrentView('editor')}
            language={language}
            onToggleLanguage={handleToggleLanguage}
          />
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <Dashboard
            resumes={resumes}
            onSelectResume={(id) => {
              setActiveResumeId(id);
              StorageService.setActiveResumeId(id);
              setCurrentView('editor');
            }}
            onCreateNew={handleCreateNew}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onOpenCoverLetter={() => setIsCoverLetterModalOpen(true)}
            language={language}
          />
        )}

        {/* Editor & Live Preview View */}
        {currentView === 'editor' && activeResume && (
          <div className="flex-1 flex flex-col p-3 sm:p-5 max-w-[1720px] mx-auto w-full gap-4">
            {/* Mobile View Switcher (Visible on small screens) */}
            <div className="lg:hidden flex items-center justify-center p-1 bg-white rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMobileSplitView('editor')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  mobileSplitView === 'editor'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ar' ? 'المحرر والبيانات' : 'Resume Editor'}
              </button>
              <button
                type="button"
                onClick={() => setMobileSplitView('preview')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  mobileSplitView === 'preview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ar' ? 'المعاينة الحية A4' : 'Live Preview (A4)'}
              </button>
            </div>

            {/* Split Screen Grid (6 cols Editor, 6 cols Preview on desktop) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[750px]">
              {/* Left Column: Editor (hidden on mobile if preview tab active) */}
              <div
                className={`lg:col-span-6 xl:col-span-5 h-[84vh] ${
                  mobileSplitView === 'preview' ? 'hidden lg:block' : 'block'
                }`}
              >
                <CVEditor
                  resumeData={activeResume}
                  onChange={handleUpdateResume}
                  saveStatus={saveStatus}
                  isCloudSynced={isCloudSynced}
                />
              </div>

              {/* Right Column: Live A4 Preview (hidden on mobile if editor tab active) */}
              <div
                className={`lg:col-span-6 xl:col-span-7 h-[84vh] ${
                  mobileSplitView === 'editor' ? 'hidden lg:block' : 'block'
                }`}
              >
                <LiveResumePreview
                  resumeData={activeResume}
                  language={language}
                  onOpenAtsModal={() => setIsAtsModalOpen(true)}
                  onChangeTemplate={(tplId) =>
                    handleUpdateResume({ ...activeResume, templateId: tplId })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Modals */}
      {activeResume && (
        <>
          <ATSAnalyzerModal
            isOpen={isAtsModalOpen}
            onClose={() => setIsAtsModalOpen(false)}
            resumeData={activeResume}
            language={activeResume.language}
            onUpdateResume={handleUpdateResume}
          />

          <CoverLetterModal
            isOpen={isCoverLetterModalOpen}
            onClose={() => setIsCoverLetterModalOpen(false)}
            resumeData={activeResume}
            language={activeResume.language}
          />
        </>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(u) => {
          setCurrentUser(u);
          setIsCloudSynced(isSupabaseConfigured);
        }}
        onSignOut={() => {
          setCurrentUser(null);
          setIsCloudSynced(false);
        }}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        language={language}
        onLanguageChange={(newLang) => {
          setLanguage(newLang);
          StorageService.setUILanguage(newLang);
        }}
        currentUser={currentUser}
        onOpenAuth={() => {
          setIsSettingsModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onDataImported={() => {
          setResumes(StorageService.getAllResumes());
        }}
      />

      {/* Offline Connectivity Notification */}
      <OfflineIndicator language={language} />
    </div>
  );
}
