import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { StorageService } from '../../services/storage';
import { Language, UserProfile } from '../../types/resume';
import { getTranslation } from '../../utils/i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile) => void;
  onSignOut: () => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onSignOut,
  language,
}) => {
  const t = getTranslation(language);
  const isRtl = language === 'ar';

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSupabaseConfigured && supabase) {
        if (mode === 'signin') {
          const { data, error: authErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (authErr) throw authErr;
          if (data.user) {
            await StorageService.syncFromSupabase(data.user.id);
            const profile: UserProfile = {
              id: data.user.id,
              email: data.user.email || email,
              fullName: data.user.user_metadata?.full_name || email.split('@')[0],
              preferredLanguage: language,
            };
            StorageService.setLocalUser(profile);
            onAuthSuccess(profile);
            onClose();
          }
        } else if (mode === 'signup') {
          const { data, error: authErr } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                full_name: fullName,
                preferred_language: language,
              },
            },
          });
          if (authErr) throw authErr;
          if (data.user && !data.session) {
            // Email confirmation required
            setMessage(
              isRtl
                ? 'تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.'
                : 'Account created! Please check your email inbox to verify your account.'
            );
          } else if (data.user) {
            const profile: UserProfile = {
              id: data.user.id,
              email: data.user.email || email,
              fullName: fullName || email.split('@')[0],
              preferredLanguage: language,
            };
            StorageService.setLocalUser(profile);
            onAuthSuccess(profile);
            setMessage(
              isRtl
                ? 'تم إنشاء الحساب بنجاح وتم تسجيل الدخول!'
                : 'Account created successfully and signed in!'
            );
            setTimeout(() => onClose(), 1200);
          }
        } else if (mode === 'forgot') {
          const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
          });
          if (resetErr) throw resetErr;
          setMessage(
            isRtl
              ? 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.'
              : 'Password reset link sent to your email.'
          );
        }
      } else {
        // Fallback simulated local user session when Supabase env vars aren't provided yet
        const mockProfile: UserProfile = {
          id: 'local_usr_' + Math.random().toString(36).substring(2, 9),
          email: email || 'user@example.com',
          fullName: fullName || (email ? email.split('@')[0] : 'Guest User'),
          preferredLanguage: language,
        };
        StorageService.setLocalUser(mockProfile);
        onAuthSuccess(mockProfile);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{t.auth.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Supabase status pill */}
        <div className="px-6 pt-4 pb-1">
          {isSupabaseConfigured ? (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.auth.supabaseNotice}</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{t.auth.localModeNotice}</span>
            </div>
          )}
        </div>

        {currentUser ? (
          /* Profile & Sign Out View */
          <div className="p-6 space-y-4">
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold mx-auto mb-2">
                {(currentUser.fullName || currentUser.email)[0].toUpperCase()}
              </div>
              <h4 className="text-base font-bold text-slate-900">{currentUser.fullName || 'Signed In'}</h4>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div><strong>{isRtl ? 'حالة السحابة:' : 'Cloud Status:'}</strong> {isSupabaseConfigured ? 'Connected to Supabase' : 'Offline / Local Guest Cache'}</div>
              <div><strong>{isRtl ? 'اللغة الافتراضية:' : 'Language:'}</strong> {currentUser.preferredLanguage === 'ar' ? 'العربية' : 'English'}</div>
            </div>

            <button
              type="button"
              onClick={() => {
                StorageService.setLocalUser(null);
                if (isSupabaseConfigured && supabase) {
                  supabase.auth.signOut().then();
                }
                onSignOut();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition"
            >
              {t.nav.signOut}
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="p-6 space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-2 text-center border-b-2 transition ${
                  mode === 'signin'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.auth.signInTab}
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-center border-b-2 transition ${
                  mode === 'signup'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.auth.signUpTab}
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.auth.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.auth.email}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      {t.auth.password}
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-blue-600 hover:underline"
                      >
                        {t.auth.forgotPassword}
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isRtl ? 'جاري التحقق...' : 'Processing...'}</span>
                  </>
                ) : (
                  <span>
                    {mode === 'signin' && t.auth.signInBtn}
                    {mode === 'signup' && t.auth.signUpBtn}
                    {mode === 'forgot' && (isRtl ? 'إرسال الرابط' : 'Send Reset Link')}
                  </span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
