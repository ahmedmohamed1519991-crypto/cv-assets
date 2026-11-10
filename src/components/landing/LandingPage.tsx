import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Download,
  Languages as LangIcon,
  FileText,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Layers,
  Lock,
} from 'lucide-react';
import { Language } from '../../types/resume';
import { getTranslation } from '../../utils/i18n';
import { sampleEnglishResume, sampleArabicResume } from '../../data/sampleData';
import { ResumeTemplateRenderer } from '../templates/ResumeTemplateRenderer';

interface LandingPageProps {
  onGetStarted: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  language,
  onToggleLanguage,
}) => {
  const t = getTranslation(language);
  const isRtl = language === 'ar';
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [previewTab, setPreviewTab] = useState<'en' | 'ar'>('en');

  const faqs = [
    {
      q: isRtl
        ? 'هل يدعم المحرر اللغة العربية بشكل كامل مع الاتجاه من اليمين لليسار (RTL)؟'
        : 'Does CV Maker AI fully support Arabic with right-to-left (RTL) layouts?',
      a: isRtl
        ? 'نعم، تم بناء النظام من الأساس ليدعم اللغة العربية باتجاه RTL أصيل وخطوط عربية احترافية مثل Cairo و IBM Plex Sans Arabic، مع ترتيب التواريخ والأيقونات بدقة.'
        : 'Yes, CV Maker AI is built from the ground up with native RTL support, Arabic typography (Cairo, IBM Plex Sans Arabic), and automatic text realignment.',
    },
    {
      q: isRtl
        ? 'كيف يعمل فاحص التوافق مع أنظمة التوظيف (ATS)؟'
        : 'How does the ATS keyword analyzer work?',
      a: isRtl
        ? 'يقوم النموذج بمطابقة هيكل سيرتك الذاتية ومحتواها مع معايير خوارزميات الفرز الآلي الأكثر شيوعاً، ويقارنها بالوصف الوظيفي المقترح لتحديد المهارات والكلمات المفتاحية الناقصة دون أي وعود وهمية.'
        : 'Our engine parses your resume content against industry standard ATS algorithms, identifying missing technical terms, keyword densities, and formatting red flags.',
    },
    {
      q: isRtl
        ? 'هل يمكنني تنزيل السيرة الذاتية بصيغة PDF دون تسجيل حساب؟'
        : 'Can I download my resume as a PDF without creating an account?',
      a: isRtl
        ? 'نعم بكل تأكيد! يمكنك إنشاء وتعديل وتحميل السيرة الذاتية مجاناً في وضع الزائر السريع، مع إمكانية إنشاء حساب لاحقاً لمزامنة بياناتك عبر أجهزتك.'
        : 'Absolutely. You can craft, preview, and download your high-resolution A4 PDF immediately in Guest Mode without entering a credit card or signing up.',
    },
    {
      q: isRtl
        ? 'ما هي النماذج والقوالب المتاحة في التطبيق؟'
        : 'What resume templates are included?',
      a: isRtl
        ? 'يحتوي التطبيق على 6 نماذج متباينة تماماً (الكحلي الحديث، التنفيذي الرمادي، المبسط القياسي، المبتكر التقني، الزمردي الإبداعي، والموجز الأنيق) تلائم مختلف التخصصات.'
        : 'We offer 6 distinct ATS-friendly templates including Modern Navy, Executive Slate, Minimal ATS, Tech Innovator, Creative Emerald, and Compact Elegance.',
    },
  ];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-white text-slate-900">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-slate-100 bg-linear-to-b from-slate-50/80 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Copy & CTAs (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-start">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.hero.badge}</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                {t.hero.title}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {t.hero.subtitle}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2"
                >
                  <span>{t.hero.ctaPrimary}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={onGetStarted}
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-2xs transition"
                >
                  {t.hero.ctaSecondary}
                </button>
              </div>

              {/* Trust statement */}
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t.hero.noAccountNeeded}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Preview Demo Card (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-bold text-slate-600 ms-1">
                      {isRtl ? 'معاينة حية فورية' : 'Live Interactive Engine'}
                    </span>
                  </div>

                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('en')}
                      className={`px-2 py-0.5 rounded font-bold transition ${
                        previewTab === 'en' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-600'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('ar')}
                      className={`px-2 py-0.5 rounded font-bold transition ${
                        previewTab === 'ar' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-600'
                      }`}
                    >
                      العربية
                    </button>
                  </div>
                </div>

                {/* Scaled Preview Frame */}
                <div className="h-[430px] overflow-hidden rounded-xl border border-slate-100 bg-slate-50 flex justify-center items-start pt-2">
                  <ResumeTemplateRenderer
                    data={previewTab === 'en' ? sampleEnglishResume : sampleArabicResume}
                    scale={0.46}
                  />
                </div>

                {/* Overlay Floating Badge */}
                <div className="absolute bottom-6 end-6 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl shadow-lg border border-slate-700/50 flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">95% ATS Compatibility</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Features Grid */}
      <section className="py-20 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isRtl ? 'أدوات ذكية متكاملة لبناء مستندات مهنية رائدة' : 'Everything You Need for Career Breakthroughs'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {isRtl
                ? 'صُممت منصتنا لتجمع بين خوارزميات الذكاء الاصطناعي الأكثر تطوراً والدقة الطباعية لضمان اجتياز فلاتر التوظيف العالمية.'
                : 'Engineered with deep recruiting standards to deliver executive resumes that capture attention and pass applicant filters.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-start">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <LangIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isRtl ? 'دعم ثنائي كامل للغتين (Arabic & English)' : 'True Bilingual Engine (RTL & LTR)'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isRtl
                  ? 'تبديل فوري بين العربية والإنجليزية مع ضبط كامل للمحاذاة، والاتجاه، ونوعية الخطوط العربية الأصيلة.'
                  : 'Seamlessly generate and toggle between English and Arabic. Enjoy genuine RTL typography tailored to Gulf and global markets.'}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isRtl ? 'محلل التوافق مع أنظمة ATS' : 'ATS Auditor & Keyword Gap Matcher'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isRtl
                  ? 'فحص شامل للهيكل والمصطلحات المفقودة مقارنة بالوصف الوظيفي لضمان أعلى درجات القبول الفني.'
                  : 'Compare your resume against any target job description to discover missing high-value keywords and fix layout parse errors.'}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isRtl ? 'صياغة الإنجازات بمعادلة XYZ' : 'Google XYZ Action Formula'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isRtl
                  ? 'تحويل المهام الروتينية إلى إنجازات ملموسة مدعومة بأفعال قوية وأرقام محددة تعكس قيمتك الحقيقية.'
                  : 'Elevate generic bullet points into high-impact accomplishments: "Accomplished [X] measured by [Y] by doing [Z]".'}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isRtl ? '6 نماذج وقوالب احترافية معتمدة' : '6 Visually Distinct ATS Templates'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isRtl
                  ? 'خيارات متعددة تناسب القياديين، والمطورين، والمصممين، والحديثي التخرج مع توافق تام للأبعاد.'
                  : 'From Modern Navy to Minimal ATS and Tech Innovator, pick the aesthetic that suits your seniority and target industry.'}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isRtl ? 'مساعد خطابات التقديم المخصصة' : 'Tailored Cover Letter Generator'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isRtl
                  ? 'صياغة خطاب تقديم وظيفي متناسق مع نقاط سيرتك الذاتية وموجه خصيصاً للشركة والوظيفة المستهدفة.'
                  : 'Generate persuasive cover letters matching your resume background and customized to the company culture and job title.'}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isRtl ? 'تصدير PDF عالي الدقة بحجم A4' : 'Crisp A4 PDF & Print Export'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isRtl
                  ? 'تصدير فوري بدقة طباعية عالية تضمن عدم تشوه الخطوط أو تداخل الجداول عند فتح الملف على أي جهاز.'
                  : 'Pixel-perfect PDF compilation engineered to exact A4 standards with embedded fonts and razor-sharp resolution.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works (3 Steps) */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-12">
            {isRtl ? 'كيف تصنع سيرتك الذاتية في 3 خطوات بسيطة؟' : 'Three Simple Steps to Your Next Career Move'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {isRtl ? 'أدخل بياناتك أو ابدأ بنموذج جاهز' : 'Enter Details or Load Sample'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isRtl
                  ? 'أدخل بياناتك المهنية والتعليمية، أو انقر على "تحميل بيانات تجريبية" لتعديل نموذج متكامل فوراً.'
                  : 'Fill in your experience and education, or click "Load Sample Data" to start with a realistic, high-impact base.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {isRtl ? 'التحسين الذكي وفحص ATS' : 'Polish with AI & Run ATS Audit'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isRtl
                  ? 'استخدم الذكاء الاصطناعي لصياغة النبذة التنفيذية وإعادة كتابة الإنجازات وفحص الكلمات المفتاحية الناقصة.'
                  : 'Utilize Gemini AI to rephrase bullets with strong action verbs, generate executive summaries, and check ATS keyword density.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {isRtl ? 'اختر القالب وحمّل ملف PDF' : 'Choose Template & Download PDF'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isRtl
                  ? 'اختر من بين 6 قوالب طباعية، خصص الألوان والخطوط، وحمّل ملف PDF جاهز للتقديم الفوري.'
                  : 'Select your preferred visual template, adjust color palettes and typography, and export clean A4 PDFs.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing / Access Plan Placeholder */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              {isRtl ? 'خطط مرنة تناسب كل مرحلة في مسيرتك' : 'Transparent, Accessible Pricing'}
            </h2>
            <p className="text-sm text-slate-600">
              {isRtl
                ? 'ابدأ مجاناً تماماً واستمتع بكافة ميزات التصميم والتحميل المباشر.'
                : 'Start completely free with full access to editor and PDF export.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                  {isRtl ? 'الوصول المباشر (مجاناً)' : 'Guest & Essential Free'}
                </div>
                <div className="text-3xl font-black text-slate-900 mb-4">
                  $0 <span className="text-xs font-normal text-slate-500">/ forever</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'إنشاء سير ذاتية بالعربية والإنجليزية' : 'Full English & Arabic bilingual support'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'تحميل ملفات PDF غير محدودة بحجم A4' : 'Unlimited high-res A4 PDF downloads'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'الوصول لكافة القوالب الـ 6 المعتمدة' : 'Access to all 6 ATS-optimized templates'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'توليد النبذة بالذكاء الاصطناعي (Gemini)' : 'Gemini AI Summary & Polish assistant'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'حفظ تلقائي محلي بدون حاجة لبطاقة دفع' : 'Local browser auto-save without signup'}</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
              >
                {isRtl ? 'ابدأ الآن مجاناً' : 'Get Started Free'}
              </button>
            </div>

            {/* Cloud Sync Pro Plan */}
            <div className="p-8 rounded-2xl bg-white border-2 border-blue-600 shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 end-4 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                {isRtl ? 'المزامنة السحابية' : 'Cloud Sync Pro'}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                  {isRtl ? 'حساب المزامنة السحابية' : 'Supabase Cloud Sync'}
                </div>
                <div className="text-3xl font-black text-slate-900 mb-4">
                  Free Beta <span className="text-xs font-normal text-slate-500">/ cloud auth</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'كافة ميزات الخطة المجانية' : 'All Guest Mode features included'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'مزامنة مشفرة سحابياً عبر PostgreSQL' : 'Encrypted PostgreSQL cloud database sync'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'الوصول لسيرك الذاتية من أي جهاز وهاتف' : 'Multi-device access from phone or desktop'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isRtl ? 'حفظ غير محدود لخطابات التقديم' : 'Unlimited cloud cover letters'}</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
              >
                {isRtl ? 'إنشاء حساب ومزامنة' : 'Sign Up & Sync Online'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              {isRtl ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-sm text-slate-600">
              {isRtl ? 'إجابات واضحة ومباشرة حول كيفية عمل النظام.' : 'Clear answers to help you make the most of CV Maker AI.'}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-start flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-100/60 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. High-Impact CTA Banner */}
      <section className="py-16 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            {isRtl ? 'جاهز لإطلاق الخطوة التالية في مسيرتك المهنية؟' : 'Ready to Elevate Your Professional Career?'}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            {isRtl
              ? 'انضم للآلاف الذين بنوا سيرهم الذاتية بالعربية والإنجليزية بدقة الذكاء الاصطناعي مجاناً.'
              : 'Join thousands of professionals crafting executive bilingual resumes with Google Gemini precision today.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onGetStarted}
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-xl hover:shadow-2xl transition inline-flex items-center gap-2"
            >
              <span>{t.hero.ctaPrimary}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
