import React, { useState } from 'react';
import { Sparkles, Check, X, Edit3, ArrowRight, RefreshCw, AlertCircle, Languages as LangIcon } from 'lucide-react';
import { AIService } from '../../services/ai';
import { Language } from '../../types/resume';
import { getTranslation } from '../../utils/i18n';

export type AIAssistantMode = 'summary' | 'improve-bullet' | 'suggest-skills' | 'translate';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AIAssistantMode;
  language: Language;
  initialData?: any;
  onApply: (data: any) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  mode,
  language,
  initialData,
  onApply,
}) => {
  const t = getTranslation(language);
  const isRtl = language === 'ar';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Summary generation state
  const [profTitle, setProfTitle] = useState(initialData?.professionalTitle || '');
  const [yearsExp, setYearsExp] = useState(initialData?.yearsOfExperience || '5+ years');
  const [industry, setIndustry] = useState(initialData?.industry || 'Technology');
  const [keySkillsInput, setKeySkillsInput] = useState(
    Array.isArray(initialData?.keySkills) ? initialData.keySkills.join(', ') : ''
  );
  const [existingDraft, setExistingDraft] = useState(initialData?.existingDraft || '');
  const [generatedSummary, setGeneratedSummary] = useState<{ summary: string; keyHighlights: string[] } | null>(null);

  // Bullet improve state
  const [bulletInput, setBulletInput] = useState(initialData?.bullet || '');
  const [roleTitleInput, setRoleTitleInput] = useState(initialData?.roleTitle || '');
  const [companyInput, setCompanyInput] = useState(initialData?.company || '');
  const [improvedBullets, setImprovedBullets] = useState<string[]>([]);
  const [explanation, setExplanation] = useState<string>('');

  // Skills suggest state
  const [suggestedSkills, setSuggestedSkills] = useState<{
    technicalSkills: string[];
    softSkills: string[];
    toolsAndTech: string[];
  } | null>(null);
  const [selectedSkillsToAdd, setSelectedSkillsToAdd] = useState<string[]>([]);

  // Translation state
  const [textToTranslate, setTextToTranslate] = useState(initialData?.text || '');
  const [targetLang, setTargetLang] = useState<Language>(language === 'en' ? 'ar' : 'en');
  const [translatedResult, setTranslatedResult] = useState<string>('');

  // Editable draft for user before applying
  const [editableResult, setEditableResult] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  // Handlers
  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const skillsArray = keySkillsInput.split(',').map((s: string) => s.trim()).filter(Boolean);
      const res = await AIService.generateSummary({
        professionalTitle: profTitle,
        yearsOfExperience: yearsExp,
        keySkills: skillsArray,
        language,
        industry,
        existingDraft,
      });
      setGeneratedSummary(res);
      setEditableResult(res.summary);
    } catch (err: any) {
      setError(err.message || 'Error communicating with AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImproveBullet = async () => {
    if (!bulletInput.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await AIService.improveExperience({
        roleTitle: roleTitleInput,
        company: companyInput,
        bulletPoints: [bulletInput],
        language,
        actionVerbFocus: 'High-Impact Measurable',
      });
      setImprovedBullets(res.improvedBullets);
      setExplanation(res.explanation);
      if (res.improvedBullets.length > 0) {
        setEditableResult(res.improvedBullets[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to improve bullet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestSkills = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AIService.suggestSkills({
        roleTitle: profTitle || initialData?.professionalTitle || 'Software Engineer',
        industry,
        existingSkills: initialData?.existingSkills || [],
        language,
      });
      setSuggestedSkills(res);
      const all = [...res.technicalSkills, ...res.toolsAndTech, ...res.softSkills];
      setSelectedSkillsToAdd(all);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch skill suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!textToTranslate.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await AIService.translate({
        text: textToTranslate,
        targetLanguage: targetLang,
        context: 'Curriculum Vitae',
      });
      setTranslatedResult(res.translatedText);
      setEditableResult(res.translatedText);
    } catch (err: any) {
      setError(err.message || 'Failed to translate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (mode === 'summary') {
      onApply({
        content: editableResult || generatedSummary?.summary,
        highlights: generatedSummary?.keyHighlights || [],
      });
    } else if (mode === 'improve-bullet') {
      onApply(editableResult || improvedBullets[0]);
    } else if (mode === 'suggest-skills') {
      onApply(selectedSkillsToAdd);
    } else if (mode === 'translate') {
      onApply(editableResult || translatedResult);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'summary' && (isRtl ? 'صانع النبذة المهنية الذكي' : 'AI Executive Summary Generator')}
                {mode === 'improve-bullet' && (isRtl ? 'تحسين صياغة الإنجازات (معادلة XYZ)' : 'AI Bullet Point Polish (XYZ Formula)')}
                {mode === 'suggest-skills' && (isRtl ? 'اقتراح مهارات مطلوبة في السوق' : 'AI In-Demand Skills Suggester')}
                {mode === 'translate' && (isRtl ? 'المترجم المهني الفوري' : 'AI Professional CV Translator')}
              </h3>
              <p className="text-xs text-blue-200">
                {isRtl ? 'مدعوم بنموذج Google Gemini 3.8 Flash' : 'Powered by Google Gemini 3.8 Flash'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Mode 1: Summary Generator */}
          {mode === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'المسمى المهني' : 'Professional Title'}
                  </label>
                  <input
                    type="text"
                    value={profTitle}
                    onChange={(e) => setProfTitle(e.target.value)}
                    placeholder="e.g. Senior Software Architect"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'سنوات الخبرة' : 'Experience Level'}
                  </label>
                  <input
                    type="text"
                    value={yearsExp}
                    onChange={(e) => setYearsExp(e.target.value)}
                    placeholder="e.g. 7+ years"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'أبرز المهارات والتخصصات' : 'Key Skills & Specializations (comma separated)'}
                </label>
                <input
                  type="text"
                  value={keySkillsInput}
                  onChange={(e) => setKeySkillsInput(e.target.value)}
                  placeholder="e.g. React, TypeScript, Cloud Architecture, Team Leadership"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'مسودة أولية لتطويرها (اختياري)' : 'Existing Draft or Notes to Refine (optional)'}
                </label>
                <textarea
                  rows={2}
                  value={existingDraft}
                  onChange={(e) => setExistingDraft(e.target.value)}
                  placeholder="Paste rough notes or existing summary..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleGenerateSummary}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isRtl ? 'جاري الصياغة الذكية...' : 'Crafting Executive Summary...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isRtl ? 'توليد النبذة بالذكاء الاصطناعي' : 'Generate Executive Summary'}</span>
                  </>
                )}
              </button>

              {/* Result Preview & Edit */}
              {generatedSummary && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">
                      {isRtl ? 'النتيجة المقترحة (يمكنك التعديل عليها):' : 'AI Recommendation (Editable):'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditing ? (isRtl ? 'معاينة' : 'Done Editing') : (isRtl ? 'تعديل النص' : 'Edit Text')}</span>
                    </button>
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={editableResult}
                      onChange={(e) => setEditableResult(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-blue-400 bg-blue-50/20 focus:outline-blue-600"
                    />
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
                      {editableResult}
                    </div>
                  )}

                  {generatedSummary.keyHighlights && generatedSummary.keyHighlights.length > 0 && (
                    <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                      <div className="text-[11px] font-bold text-emerald-900 mb-1">
                        {isRtl ? 'نقاط تميز مقترحة:' : 'Suggested Key Highlights:'}
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-xs text-emerald-800">
                        {generatedSummary.keyHighlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Bullet Point Polish */}
          {mode === 'improve-bullet' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'الإنجاز أو النقطة الحالية' : 'Original Responsibility / Bullet Point'}
                </label>
                <textarea
                  rows={2}
                  value={bulletInput}
                  onChange={(e) => setBulletInput(e.target.value)}
                  placeholder="e.g. Worked on the website and helped speed up pages."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'المسمى الوظيفي' : 'Role'}
                  </label>
                  <input
                    type="text"
                    value={roleTitleInput}
                    onChange={(e) => setRoleTitleInput(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'الشركة' : 'Company'}
                  </label>
                  <input
                    type="text"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={isLoading || !bulletInput.trim()}
                onClick={handleImproveBullet}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isRtl ? 'جاري تحسين الصياغة المهنية...' : 'Transforming with XYZ Formula...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isRtl ? 'إعادة صياغة النقطة باحترافية' : 'Polish with High-Impact Verbs'}</span>
                  </>
                )}
              </button>

              {improvedBullets.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-900">
                    {isRtl ? 'الصياغة المحسنة:' : 'Enhanced High-Impact Bullet:'}
                  </div>
                  <textarea
                    rows={3}
                    value={editableResult}
                    onChange={(e) => setEditableResult(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-blue-400 bg-blue-50/20 focus:outline-blue-600"
                  />
                  {explanation && (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                      <strong>{isRtl ? 'ملاحظة التحسين:' : 'Why this works:'}</strong> {explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Suggest Skills */}
          {mode === 'suggest-skills' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'المسمى المستهدف' : 'Target Role'}
                  </label>
                  <input
                    type="text"
                    value={profTitle}
                    onChange={(e) => setProfTitle(e.target.value)}
                    placeholder="e.g. DevOps Engineer / Cloud Specialist"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? 'المجال' : 'Industry'}
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Fintech, SaaS, Healthcare"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleSuggestSkills}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isRtl ? 'جاري تحليل متطلبات السوق...' : 'Analyzing Market Demands...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isRtl ? 'اقتراح مهارات حديثة' : 'Suggest Top Industry Skills'}</span>
                  </>
                )}
              </button>

              {suggestedSkills && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1.5">
                      {isRtl ? 'مهارات تقنية (Technical Skills):' : 'Technical Skills:'}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedSkills.technicalSkills.map((sk) => {
                        const isSelected = selectedSkillsToAdd.includes(sk);
                        return (
                          <button
                            type="button"
                            key={sk}
                            onClick={() => {
                              setSelectedSkillsToAdd(
                                isSelected
                                  ? selectedSkillsToAdd.filter((s) => s !== sk)
                                  : [...selectedSkillsToAdd, sk]
                              );
                            }}
                            className={`px-2 py-1 text-xs rounded-lg border transition ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 font-medium'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {sk}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1.5">
                      {isRtl ? 'برامج وأدوات (Tools & Tech):' : 'Tools & Frameworks:'}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedSkills.toolsAndTech.map((sk) => {
                        const isSelected = selectedSkillsToAdd.includes(sk);
                        return (
                          <button
                            type="button"
                            key={sk}
                            onClick={() => {
                              setSelectedSkillsToAdd(
                                isSelected
                                  ? selectedSkillsToAdd.filter((s) => s !== sk)
                                  : [...selectedSkillsToAdd, sk]
                              );
                            }}
                            className={`px-2 py-1 text-xs rounded-lg border transition ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {sk}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1.5">
                      {isRtl ? 'مهارات شخصية وقيادية (Soft Skills):' : 'Leadership & Soft Skills:'}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedSkills.softSkills.map((sk) => {
                        const isSelected = selectedSkillsToAdd.includes(sk);
                        return (
                          <button
                            type="button"
                            key={sk}
                            onClick={() => {
                              setSelectedSkillsToAdd(
                                isSelected
                                  ? selectedSkillsToAdd.filter((s) => s !== sk)
                                  : [...selectedSkillsToAdd, sk]
                              );
                            }}
                            className={`px-2 py-1 text-xs rounded-lg border transition ${
                              isSelected
                                ? 'bg-teal-600 text-white border-teal-600 font-medium'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {sk}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 4: Translator */}
          {mode === 'translate' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {isRtl ? 'اللغة المستهدفة:' : 'Target Language:'}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetLang('ar')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold ${
                      targetLang === 'ar' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    العربية (Arabic)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetLang('en')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold ${
                      targetLang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isRtl ? 'النص المراد ترجمته بدقة مهنية' : 'Content to Translate'}
                </label>
                <textarea
                  rows={4}
                  value={textToTranslate}
                  onChange={(e) => setTextToTranslate(e.target.value)}
                  placeholder="Paste section or text here..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-blue-600"
                />
              </div>

              <button
                type="button"
                disabled={isLoading || !textToTranslate.trim()}
                onClick={handleTranslate}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isRtl ? 'جاري الترجمة المهنية...' : 'Translating Professionally...'}</span>
                  </>
                ) : (
                  <>
                    <LangIcon className="w-4 h-4" />
                    <span>{isRtl ? 'ترجمة النص' : 'Translate Content'}</span>
                  </>
                )}
              </button>

              {translatedResult && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-900">
                    {isRtl ? 'الترجمة الاحترافية المعتمدة:' : 'Professional Translation:'}
                  </div>
                  <textarea
                    rows={4}
                    dir={targetLang === 'ar' ? 'rtl' : 'ltr'}
                    value={editableResult}
                    onChange={(e) => setEditableResult(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-blue-400 bg-blue-50/20 focus:outline-blue-600"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            {t.aiAssistant.reject}
          </button>

          {(generatedSummary || improvedBullets.length > 0 || (suggestedSkills && selectedSkillsToAdd.length > 0) || translatedResult) && (
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2 transition"
            >
              <Check className="w-4 h-4" />
              <span>{t.aiAssistant.accept}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
