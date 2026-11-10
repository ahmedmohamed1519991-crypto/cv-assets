import React, { useState } from 'react';
import {
  X,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Target,
  Briefcase,
  ThumbsUp,
  Lightbulb,
} from 'lucide-react';
import { AIService, JobMatchResult } from '../../services/ai';
import { ResumeData, ATSAnalysisResult, Language } from '../../types/resume';
import { getTranslation } from '../../utils/i18n';

interface ATSAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
  language: Language;
  onUpdateResume?: (updated: ResumeData) => void;
}

export const ATSAnalyzerModal: React.FC<ATSAnalyzerModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  language,
  onUpdateResume,
}) => {
  const t = getTranslation(language);
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState<'audit' | 'jobMatch'>('audit');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(
    resumeData.atsAnalysis || null
  );
  const [jobMatchResult, setJobMatchResult] = useState<JobMatchResult | null>(null);

  if (!isOpen) return null;

  const handleRunAudit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await AIService.analyzeATS({
        resumeData,
        targetJobDescription: jobDescription,
        language,
      });
      setAnalysisResult(result);
      if (onUpdateResume) {
        onUpdateResume({
          ...resumeData,
          atsScore: result.score,
          atsAnalysis: result,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete ATS audit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunJobMatch = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 15) {
      setError(t.ats.jobMatchRequiredWarning || 'Please enter a job description with at least 15 characters.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await AIService.jobMatch({
        resumeData,
        targetJobDescription: jobDescription,
        language,
      });
      setJobMatchResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to complete job matching analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeywordToSkills = (keyword: string) => {
    if (!onUpdateResume) return;
    const exists = resumeData.skills.some((s) => s.name.toLowerCase() === keyword.toLowerCase());
    if (exists) return;

    const newSkill = {
      id: 'skill_' + Math.random().toString(36).substring(2, 7),
      name: keyword,
      category: 'technical' as const,
      level: 4,
    };

    onUpdateResume({
      ...resumeData,
      skills: [...resumeData.skills, newSkill],
    });
  };

  const scoreColor =
    (analysisResult?.score || 0) >= 85
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : (analysisResult?.score || 0) >= 65
      ? 'text-blue-600 bg-blue-50 border-blue-200'
      : 'text-amber-600 bg-amber-50 border-amber-200';

  const matchColor =
    (jobMatchResult?.matchPercentage || 0) >= 80
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : (jobMatchResult?.matchPercentage || 0) >= 65
      ? 'text-blue-600 bg-blue-50 border-blue-200'
      : 'text-amber-600 bg-amber-50 border-amber-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t.ats.title}
              </h3>
              <p className="text-xs text-blue-200">{t.ats.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('audit');
              setError(null);
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-t-2 ${
              activeTab === 'audit'
                ? 'bg-white text-blue-600 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.ats.tabAudit || 'ATS Audit & Health'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('jobMatch');
              setError(null);
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 border-t-2 ${
              activeTab === 'jobMatch'
                ? 'bg-white text-blue-600 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>{t.ats.tabMatch || 'Job Match & Alignment'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Target Job Description Input */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.ats.jobDescLabel}</span>
              </label>
              {activeTab === 'jobMatch' && (
                <span className="text-[11px] text-blue-600 font-medium">
                  {isRtl ? '* مطلوب لتحليل المطابقة' : '* Required for job matching'}
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={t.ats.jobDescPlaceholder}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
            />

            <div className="pt-1">
              {activeTab === 'audit' ? (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleRunAudit}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t.ats.auditing}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t.ats.runAuditBtn}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleRunJobMatch}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t.ats.matching || 'Analyzing Match with Gemini...'}</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      <span>{t.ats.runJobMatchBtn || 'Match Resume with Job Description'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              {error}
            </div>
          )}

          {/* Tab 1: ATS Audit Results */}
          {activeTab === 'audit' && analysisResult && (
            <div className="space-y-6">
              {/* Score Gauge Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                {/* Overall Score */}
                <div className={`col-span-2 p-5 rounded-xl border text-center ${scoreColor}`}>
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-1">
                    {t.ats.overallScore}
                  </div>
                  <div className="text-4xl font-black mb-1">
                    {analysisResult.score}<span className="text-xl font-normal">/100</span>
                  </div>
                  <div className="text-xs font-medium">
                    {analysisResult.score >= 85
                      ? (isRtl ? 'توافق ممتاز مع أنظمة الفرز' : 'Excellent ATS Compatibility')
                      : analysisResult.score >= 70
                      ? (isRtl ? 'توافق جيد — يحتاج تحسينات بسيطة' : 'Good Fit — Minor tweaks recommended')
                      : (isRtl ? 'يحتاج إضافة مهارات وأرقام' : 'Needs Optimization')}
                  </div>
                </div>

                {/* Sub-metrics breakdown */}
                <div className="col-span-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500">{t.ats.breakdown.completeness}</div>
                    <div className="font-bold text-slate-800 text-sm">{analysisResult.breakdown.completeness}%</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${analysisResult.breakdown.completeness}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500">{t.ats.breakdown.readability}</div>
                    <div className="font-bold text-slate-800 text-sm">{analysisResult.breakdown.readability}%</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-indigo-600 h-full" style={{ width: `${analysisResult.breakdown.readability}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500">{t.ats.breakdown.impact}</div>
                    <div className="font-bold text-slate-800 text-sm">{analysisResult.breakdown.impact}%</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-emerald-600 h-full" style={{ width: `${analysisResult.breakdown.impact}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500">{t.ats.breakdown.formatting}</div>
                    <div className="font-bold text-slate-800 text-sm">{analysisResult.breakdown.formatting}%</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-teal-600 h-full" style={{ width: `${analysisResult.breakdown.formatting}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary feedback */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">{isRtl ? 'ملخص التقرير:' : 'Executive Assessment:'} </span>
                {analysisResult.summary}
              </div>

              {/* Missing Keywords */}
              {analysisResult.missingKeywords.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-amber-500" />
                    <span>{t.ats.missingKeywords}</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.missingKeywords.map((kw, i) => {
                      const alreadyInSkills = resumeData.skills.some(
                        (s) => s.name.toLowerCase() === kw.toLowerCase()
                      );
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddKeywordToSkills(kw)}
                          className={`px-2.5 py-1 text-xs rounded-lg border flex items-center gap-1 transition ${
                            alreadyInSkills
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 cursor-default'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          {alreadyInSkills ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <span>+</span>}
                          <span>{kw}</span>
                          {!alreadyInSkills && <span className="text-[10px] text-slate-400">({isRtl ? 'إضافة للمهارات' : 'Add'})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actionable Suggestions */}
              {analysisResult.actionableSuggestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{t.ats.actionableChecklist}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {analysisResult.actionableSuggestions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-bold text-blue-600 shrink-0">{idx + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Formatting warnings */}
              {analysisResult.formattingWarnings.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>{t.ats.formattingWarnings}</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-amber-900">
                    {analysisResult.formattingWarnings.map((w, idx) => (
                      <li key={idx} className="p-2 rounded-lg bg-amber-50/70 border border-amber-200">
                        • {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="text-[10.5px] text-slate-400 italic">
                {t.ats.disclaimer}
              </div>
            </div>
          )}

          {/* Tab 2: Job Match Results */}
          {activeTab === 'jobMatch' && jobMatchResult && (
            <div className="space-y-6">
              {/* Match Percentage Banner */}
              <div className={`p-5 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${matchColor}`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/80 shadow-xs border border-current">
                    <Target className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider">
                      {t.ats.matchScore || 'Job Match Score'}
                    </div>
                    <div className="text-3xl font-black">
                      {jobMatchResult.matchPercentage}%
                    </div>
                    <p className="text-xs font-medium mt-0.5">
                      {jobMatchResult.matchPercentage >= 80
                        ? (isRtl ? 'تطابق ممتاز مع شروط الوظيفة' : 'High alignment with role requirements')
                        : jobMatchResult.matchPercentage >= 65
                        ? (isRtl ? 'تطابق جيد مع فرص للتحسين' : 'Good fit with opportunities to optimize')
                        : (isRtl ? 'يحتاج إلى تخصيص أكبر لسيرتك الذاتية' : 'Significant gaps in key requirements')}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-right max-w-xs">
                  <span className="font-bold">{isRtl ? 'الملخص:' : 'Evaluation:'} </span>
                  {jobMatchResult.summary}
                </div>
              </div>

              {/* Matched Keywords */}
              {jobMatchResult.matchedKeywords.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <h4 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{t.ats.matchedKeywords || 'Matched Keywords (Found in CV)'}</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {jobMatchResult.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white text-emerald-800 border border-emerald-300 font-medium flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>{kw}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Keywords with 1-Click Add */}
              {jobMatchResult.missingKeywords.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Search className="w-4 h-4 text-amber-600" />
                      <span>{t.ats.missingKeywords || 'Missing Keywords from Job Description'}</span>
                    </h4>
                    <span className="text-[10px] text-amber-700">
                      {isRtl ? 'انقر على أي مهارة لإضافتها مباشرة لسيرتك' : 'Click any skill to add directly to your CV'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {jobMatchResult.missingKeywords.map((kw, i) => {
                      const alreadyInSkills = resumeData.skills.some(
                        (s) => s.name.toLowerCase() === kw.toLowerCase()
                      );
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddKeywordToSkills(kw)}
                          className={`px-2.5 py-1.5 text-xs rounded-lg border font-medium flex items-center gap-1.5 transition ${
                            alreadyInSkills
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 cursor-default'
                              : 'bg-white text-slate-800 border-amber-300 hover:border-amber-500 hover:bg-amber-100/50 shadow-2xs'
                          }`}
                        >
                          {alreadyInSkills ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{kw}</span>
                              <span className="text-[10px] text-emerald-700 font-bold">({t.ats.addedKeyword || 'Added!'})</span>
                            </>
                          ) : (
                            <>
                              <span className="text-blue-600 font-bold">+</span>
                              <span>{kw}</span>
                              <span className="text-[10px] text-slate-500 font-normal">({t.ats.addKeywordBtn || 'Add'})</span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Strengths & Recommendations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                {jobMatchResult.strengths.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4 text-blue-600" />
                      <span>{t.ats.strengthsTitle || 'Candidate Strengths for this Role'}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {jobMatchResult.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {jobMatchResult.recommendations.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>{t.ats.recommendationsTitle || 'Tailoring Action Plan'}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {jobMatchResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-bold text-indigo-600 shrink-0">{idx + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
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
