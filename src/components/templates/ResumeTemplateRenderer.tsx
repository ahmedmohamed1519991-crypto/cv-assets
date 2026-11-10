import React from 'react';
import { ResumeData } from '../../types/resume';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  Languages as LangIcon,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
  scale?: number;
}

export const ResumeTemplateRenderer: React.FC<TemplateProps> = ({ data, scale = 1 }) => {
  const isRtl = data.language === 'ar';
  const primaryColor = data.primaryColor || '#1e3a8a';

  // Apply font family based on language & selection
  const fontClass = isRtl
    ? data.fontFamily === 'cairo'
      ? 'font-["Cairo"]'
      : 'font-["IBM_Plex_Sans_Arabic"]'
    : data.fontFamily === 'jakarta'
    ? 'font-["Plus_Jakarta_Sans"]'
    : 'font-["Inter"]';

  const containerStyle: React.CSSProperties = {
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top center',
  };

  switch (data.templateId) {
    case 'executive-slate':
      return <ExecutiveSlateTemplate data={data} isRtl={isRtl} primaryColor={primaryColor} fontClass={fontClass} containerStyle={containerStyle} />;
    case 'minimal-ats':
      return <MinimalAtsTemplate data={data} isRtl={isRtl} primaryColor={primaryColor} fontClass={fontClass} containerStyle={containerStyle} />;
    case 'tech-innovator':
      return <TechInnovatorTemplate data={data} isRtl={isRtl} primaryColor={primaryColor} fontClass={fontClass} containerStyle={containerStyle} />;
    case 'creative-emerald':
      return <CreativeEmeraldTemplate data={data} isRtl={isRtl} primaryColor={primaryColor} fontClass={fontClass} containerStyle={containerStyle} />;
    case 'compact-elegance':
      return <CompactEleganceTemplate data={data} isRtl={isRtl} primaryColor={primaryColor} fontClass={fontClass} containerStyle={containerStyle} />;
    case 'modern-navy':
    default:
      return <ModernNavyTemplate data={data} isRtl={isRtl} primaryColor={primaryColor} fontClass={fontClass} containerStyle={containerStyle} />;
  }
};

/* =========================================================
   1. Modern Navy Template (2-Column with Top Header Banner)
   ========================================================= */
const ModernNavyTemplate: React.FC<{
  data: ResumeData;
  isRtl: boolean;
  primaryColor: string;
  fontClass: string;
  containerStyle: React.CSSProperties;
}> = ({ data, isRtl, primaryColor, fontClass, containerStyle }) => {
  const { personalDetails: p, summary: s } = data;

  return (
    <div
      id="resume-printable-node"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={containerStyle}
      className={`a4-page relative overflow-hidden bg-white text-slate-800 ${fontClass} p-8 flex flex-col justify-between`}
    >
      <div>
        {/* Top Header Card */}
        <div
          className="rounded-xl p-6 text-white mb-6 shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <div
            className={`flex ${
              p.photoPosition === 'top'
                ? 'flex-col items-center text-center'
                : p.photoPosition === 'right'
                ? 'flex-row-reverse justify-between items-center'
                : 'flex-col md:flex-row justify-between items-start md:items-center'
            } gap-4`}
          >
            <div className={`flex items-center gap-4 ${p.photoPosition === 'top' ? 'flex-col' : ''}`}>
              {p.avatarUrl && p.includePhoto !== false && (
                <img
                  src={p.avatarUrl}
                  alt={p.fullName || 'Profile'}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/80 shadow-md shrink-0 bg-white"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                  {p.fullName || (isRtl ? 'الاسم الكامل' : 'Your Full Name')}
                </h1>
                <p className="text-sm font-medium text-blue-100 opacity-95">
                  {p.professionalTitle || (isRtl ? 'المسمى المهني' : 'Professional Title')}
                </p>
              </div>
            </div>
            {/* Contact Badges */}
            <div className="flex flex-wrap gap-y-1.5 gap-x-3 text-xs text-blue-50 opacity-90 max-w-sm">
              {p.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>{p.email}</span>
                </div>
              )}
              {p.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span dir="ltr">{p.phone}</span>
                </div>
              )}
              {p.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{p.location}</span>
                </div>
              )}
              {p.linkedin && (
                <div className="flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 shrink-0" />
                  <span>{p.linkedin}</span>
                </div>
              )}
              {p.github && (
                <div className="flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 shrink-0" />
                  <span>{p.github}</span>
                </div>
              )}
              {p.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span>{p.website}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Body Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Main Column (8 cols): Summary, Experience, Education, Projects */}
          <div className="col-span-8 space-y-5">
            {/* Executive Summary */}
            {s.content && (
              <section>
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-200">
                  <Briefcase className="w-4 h-4" style={{ color: primaryColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {isRtl ? 'النبذة المهنية' : 'Professional Summary'}
                  </h2>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 mb-2">
                  {s.content}
                </p>
                {s.highlights && s.highlights.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-[10.5px] text-slate-600">
                    {s.highlights.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* Experience */}
            {data.experiences.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200">
                  <Briefcase className="w-4 h-4" style={{ color: primaryColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {isRtl ? 'الخبرات العملية' : 'Work Experience'}
                  </h2>
                </div>
                <div className="space-y-4">
                  {data.experiences.map((exp) => (
                    <div key={exp.id} className="relative">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="text-xs font-bold text-slate-900">{exp.role}</h3>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {exp.startDate} – {exp.isCurrent ? (isRtl ? 'حتى الآن' : 'Present') : exp.endDate}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-slate-600 font-medium mb-1.5 flex items-center justify-between">
                        <span style={{ color: primaryColor }}>{exp.company}</span>
                        {exp.location && <span className="text-slate-400">{exp.location}</span>}
                      </div>
                      {exp.description && (
                        <p className="text-[10.5px] text-slate-600 mb-1 leading-snug">{exp.description}</p>
                      )}
                      {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                        <ul className="space-y-1 text-[10.5px] text-slate-600 list-disc list-outside ms-3.5">
                          {exp.bulletPoints.map((b, i) => (
                            <li key={i} className="leading-relaxed">{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200">
                  <Layers className="w-4 h-4" style={{ color: primaryColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {isRtl ? 'المشاريع والأعمال' : 'Key Projects'}
                  </h2>
                </div>
                <div className="space-y-3">
                  {data.projects.map((proj) => (
                    <div key={proj.id}>
                      <div className="flex justify-between items-baseline mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-slate-900">{proj.title}</h3>
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noreferrer" className="text-blue-600">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {proj.startDate && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ''}
                          </span>
                        )}
                      </div>
                      {proj.role && <div className="text-[10px] text-slate-500 mb-1">{proj.role}</div>}
                      <p className="text-[10.5px] text-slate-600 leading-snug mb-1.5">{proj.description}</p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {proj.technologies.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Column (4 cols): Education, Skills, Certs, Languages */}
          <div className="col-span-4 space-y-5 border-s border-slate-100 ps-4">
            {/* Education */}
            {data.educations.length > 0 && (
              <section>
                <div className="flex items-center gap-1.5 mb-2.5 pb-1 border-b border-slate-200">
                  <BookOpen className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {isRtl ? 'التعليم والمؤهلات' : 'Education'}
                  </h2>
                </div>
                <div className="space-y-3">
                  {data.educations.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="text-xs font-bold text-slate-900 leading-snug">{edu.degree}</h3>
                      <div className="text-[10.5px] text-slate-600 font-medium">{edu.fieldOfStudy}</div>
                      <div className="text-[10px] text-slate-500">{edu.institution}</div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">
                        {edu.startDate} – {edu.isCurrent ? (isRtl ? 'الآن' : 'Present') : edu.endDate}
                        {edu.gpa && ` • ${edu.gpa}`}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {data.skills.length > 0 && (
              <section>
                <div className="flex items-center gap-1.5 mb-2.5 pb-1 border-b border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {isRtl ? 'المهارات والتقنيات' : 'Core Skills'}
                  </h2>
                </div>
                <div className="space-y-2">
                  {data.skills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between items-center text-[10.5px] mb-0.5">
                        <span className="font-medium text-slate-700">{skill.name}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(skill.level / 5) * 100}%`,
                            backgroundColor: primaryColor,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {data.certifications.length > 0 && (
              <section>
                <div className="flex items-center gap-1.5 mb-2.5 pb-1 border-b border-slate-200">
                  <Award className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {isRtl ? 'الشهادات المعتمدة' : 'Certifications'}
                  </h2>
                </div>
                <div className="space-y-2">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="text-[10px]">
                      <div className="font-bold text-slate-800 leading-snug">{cert.name}</div>
                      <div className="text-slate-500">{cert.issuer} ({cert.issueDate})</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <section>
                <div className="flex items-center gap-1.5 mb-2.5 pb-1 border-b border-slate-200">
                  <LangIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {isRtl ? 'اللغات' : 'Languages'}
                  </h2>
                </div>
                <div className="space-y-1.5">
                  {data.languages.map((l) => (
                    <div key={l.id} className="flex justify-between items-center text-[10.5px]">
                      <span className="font-medium text-slate-800">{l.name}</span>
                      <span className="text-[9.5px] text-slate-500">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* References */}
            {data.references.length > 0 && (
              <section>
                <div className="flex items-center gap-1.5 mb-2.5 pb-1 border-b border-slate-200">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {isRtl ? 'المعرفون' : 'References'}
                  </h2>
                </div>
                <div className="space-y-2">
                  {data.references.map((r) => (
                    <div key={r.id} className="text-[10px]">
                      <div className="font-bold text-slate-800">{r.name}</div>
                      <div className="text-slate-500">{r.role} • {r.company}</div>
                      <div className="text-slate-400 text-[9px]">{r.email}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Footer subtle brand indicator */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400">
        <span>{p.fullName} — {p.professionalTitle}</span>
        <span>A4 Format • ATS Verified</span>
      </div>
    </div>
  );
};

/* =========================================================
   2. Executive Slate Template (Classic Top-Tier Management)
   ========================================================= */
const ExecutiveSlateTemplate: React.FC<{
  data: ResumeData;
  isRtl: boolean;
  primaryColor: string;
  fontClass: string;
  containerStyle: React.CSSProperties;
}> = ({ data, isRtl, primaryColor, fontClass, containerStyle }) => {
  const { personalDetails: p, summary: s } = data;

  return (
    <div
      id="resume-printable-node"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={containerStyle}
      className={`a4-page bg-white text-slate-900 ${fontClass} p-10 flex flex-col justify-between`}
    >
      <div>
        {/* Centered Executive Header */}
        <div className="text-center pb-4 mb-6 border-b-2" style={{ borderColor: primaryColor }}>
          <h1 className="text-2xl font-bold tracking-wide uppercase text-slate-900 mb-1">
            {p.fullName || 'Candidate Name'}
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3" style={{ color: primaryColor }}>
            {p.professionalTitle || 'Executive Professional'}
          </p>
          {/* Centered inline contact info */}
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[10.5px] text-slate-600">
            {p.location && <span>{p.location}</span>}
            {p.phone && <span>• <span dir="ltr">{p.phone}</span></span>}
            {p.email && <span>• {p.email}</span>}
            {p.linkedin && <span>• {p.linkedin}</span>}
            {p.website && <span>• {p.website}</span>}
          </div>
        </div>

        {/* Executive Summary */}
        {s.content && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b border-slate-300" style={{ color: primaryColor }}>
              {isRtl ? 'الملخص التنفيذي' : 'Executive Profile'}
            </h2>
            <p className="text-[11px] leading-relaxed text-slate-700">{s.content}</p>
          </section>
        )}

        {/* Experience Section */}
        {data.experiences.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-0.5 border-b border-slate-300" style={{ color: primaryColor }}>
              {isRtl ? 'المسيرة المهنية والإنجازات' : 'Professional Experience'}
            </h2>
            <div className="space-y-4">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="text-xs font-bold text-slate-900">{exp.role}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">
                      {exp.startDate} – {exp.isCurrent ? (isRtl ? 'حتى الآن' : 'Present') : exp.endDate}
                    </div>
                  </div>
                  <div className="text-[10.5px] font-semibold text-slate-700 mb-1 flex justify-between">
                    <span>{exp.company}</span>
                    {exp.location && <span className="text-slate-400 font-normal">{exp.location}</span>}
                  </div>
                  {exp.description && <p className="text-[10.5px] text-slate-600 mb-1">{exp.description}</p>}
                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul className="list-disc list-outside ms-4 space-y-1 text-[10.5px] text-slate-700">
                      {exp.bulletPoints.map((b, i) => (
                        <li key={i} className="leading-snug">{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.educations.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-0.5 border-b border-slate-300" style={{ color: primaryColor }}>
              {isRtl ? 'المؤهلات العلمية' : 'Education & Credentials'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {data.educations.map((edu) => (
                <div key={edu.id} className="text-[10.5px]">
                  <div className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</div>
                  <div className="text-slate-600">{edu.institution} {edu.location ? `• ${edu.location}` : ''}</div>
                  <div className="text-slate-400 text-[10px]">{edu.startDate} – {edu.endDate} {edu.gpa ? `(${edu.gpa})` : ''}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills & Certifications Grid */}
        <div className="grid grid-cols-2 gap-6">
          {data.skills.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b border-slate-300" style={{ color: primaryColor }}>
                {isRtl ? 'الكفاءات الأساسية' : 'Core Competencies'}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((s) => (
                  <span key={s.id} className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium">
                    {s.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {data.certifications.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b border-slate-300" style={{ color: primaryColor }}>
                {isRtl ? 'الشهادات المهنية' : 'Certifications'}
              </h2>
              <div className="space-y-1 text-[10px] text-slate-700">
                {data.certifications.map((c) => (
                  <div key={c.id}>
                    <span className="font-bold">{c.name}</span> — {c.issuer} ({c.issueDate})
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 text-center text-[9px] text-slate-400">
        Confidential Executive Resume
      </div>
    </div>
  );
};

/* =========================================================
   3. Minimal ATS Template (100% Parser Compliant, Clean Text)
   ========================================================= */
const MinimalAtsTemplate: React.FC<{
  data: ResumeData;
  isRtl: boolean;
  primaryColor: string;
  fontClass: string;
  containerStyle: React.CSSProperties;
}> = ({ data, isRtl, fontClass, containerStyle }) => {
  const { personalDetails: p, summary: s } = data;

  return (
    <div
      id="resume-printable-node"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={containerStyle}
      className={`a4-page bg-white text-black ${fontClass} p-8 flex flex-col justify-between`}
    >
      <div>
        {/* Clean ATS Header */}
        <div className="text-center pb-2 mb-4 border-b border-black">
          <h1 className="text-xl font-bold tracking-tight uppercase text-black mb-1">
            {p.fullName || 'Candidate Name'}
          </h1>
          <div className="text-xs font-medium text-black mb-2">
            {p.professionalTitle}
          </div>
          <div className="text-[10px] text-black space-x-2">
            <span>{p.location}</span>
            <span>|</span>
            <span dir="ltr">{p.phone}</span>
            <span>|</span>
            <span>{p.email}</span>
            {p.linkedin && (
              <>
                <span>|</span>
                <span>{p.linkedin}</span>
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        {s.content && (
          <section className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5">
              {isRtl ? 'الملخص المهني' : 'Professional Summary'}
            </h2>
            <p className="text-[10.5px] leading-relaxed text-black">{s.content}</p>
          </section>
        )}

        {/* Experience */}
        {data.experiences.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2">
              {isRtl ? 'الخبرات الوظيفية' : 'Work Experience'}
            </h2>
            <div className="space-y-3">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between text-xs font-bold">
                    <span>{exp.role} — {exp.company}</span>
                    <span className="font-normal text-[10px]">
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.location && <div className="text-[10px] italic">{exp.location}</div>}
                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul className="list-disc list-outside ms-4 space-y-1 text-[10px] text-black mt-1">
                      {exp.bulletPoints.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.educations.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2">
              {isRtl ? 'التعليم' : 'Education'}
            </h2>
            <div className="space-y-2">
              {data.educations.map((edu) => (
                <div key={edu.id} className="flex justify-between text-[10.5px]">
                  <div>
                    <span className="font-bold">{edu.degree} in {edu.fieldOfStudy}</span>, {edu.institution}
                  </div>
                  <span className="text-[10px]">{edu.startDate} – {edu.endDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5">
              {isRtl ? 'المهارات التقنية والشخصية' : 'Skills & Competencies'}
            </h2>
            <p className="text-[10px] leading-relaxed">
              {data.skills.map((sk) => sk.name).join(' • ')}
            </p>
          </section>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5">
              {isRtl ? 'الشهادات' : 'Certifications'}
            </h2>
            <div className="text-[10px] space-y-1">
              {data.certifications.map((c) => (
                <div key={c.id}>
                  {c.name} — {c.issuer} ({c.issueDate})
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="text-center text-[9px] text-neutral-400">
        Page 1 of 1 • ATS Compliant Plaintext Structure
      </div>
    </div>
  );
};

/* =========================================================
   4. Tech Innovator Template (Modern Badges, Tech Stack)
   ========================================================= */
const TechInnovatorTemplate: React.FC<{
  data: ResumeData;
  isRtl: boolean;
  primaryColor: string;
  fontClass: string;
  containerStyle: React.CSSProperties;
}> = ({ data, isRtl, primaryColor, fontClass, containerStyle }) => {
  const { personalDetails: p, summary: s } = data;

  return (
    <div
      id="resume-printable-node"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={containerStyle}
      className={`a4-page bg-white text-slate-800 ${fontClass} p-8 flex flex-col justify-between`}
    >
      <div>
        {/* Header with terminal/code aesthetic accent */}
        <div className="border-s-4 ps-4 pb-1 mb-5" style={{ borderColor: primaryColor }}>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{p.fullName}</h1>
          <p className="text-sm font-semibold text-slate-600 mb-2">{p.professionalTitle}</p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span dir="ltr">{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.github && <span className="font-mono text-slate-700">{p.github}</span>}
          </div>
        </div>

        {/* Summary */}
        {s.content && (
          <section className="mb-5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>
              {isRtl ? '// نبذة عامة' : '// Summary'}
            </div>
            <p className="text-[11px] leading-relaxed text-slate-700">{s.content}</p>
          </section>
        )}

        {/* Experience */}
        {data.experiences.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: primaryColor }}>
              <span>{isRtl ? 'الخبرة العملية البرمجية' : 'Engineering Experience'}</span>
              <div className="h-px bg-slate-200 flex-1" />
            </h2>
            <div className="space-y-4">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="border-s-2 border-slate-200 ps-3">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-xs font-bold text-slate-900">{exp.role}</h3>
                    <span className="text-[10px] font-mono text-slate-500">
                      {exp.startDate} ~ {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[10.5px] font-semibold text-slate-600 mb-1">{exp.company}</div>
                  {exp.bulletPoints && (
                    <ul className="list-disc list-outside ms-3.5 space-y-1 text-[10.5px] text-slate-700">
                      {exp.bulletPoints.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tech Stack Badges */}
        {data.skills.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: primaryColor }}>
              <span>{isRtl ? 'المكدس البرمجي والأدوات' : 'Tech Stack & Skills'}</span>
              <div className="h-px bg-slate-200 flex-1" />
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s) => (
                <span
                  key={s.id}
                  className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: primaryColor }}>
              <span>{isRtl ? 'المشاريع والمصادر المفتوحة' : 'Open Source & Projects'}</span>
              <div className="h-px bg-slate-200 flex-1" />
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {data.projects.map((proj) => (
                <div key={proj.id} className="p-2.5 rounded border border-slate-200 bg-white">
                  <div className="text-xs font-bold text-slate-900">{proj.title}</div>
                  <p className="text-[10px] text-slate-600 mb-1">{proj.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {proj.technologies.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-[9px] bg-blue-50 text-blue-700 px-1 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Certs Inline */}
        <div className="grid grid-cols-2 gap-4">
          {data.educations.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-800">{isRtl ? 'التعليم' : 'Education'}</h2>
              {data.educations.map((edu) => (
                <div key={edu.id} className="text-[10.5px]">
                  <div className="font-bold">{edu.degree}</div>
                  <div className="text-slate-600">{edu.institution} ({edu.startDate} – {edu.endDate})</div>
                </div>
              ))}
            </div>
          )}
          {data.certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-800">{isRtl ? 'الشهادات' : 'Certifications'}</h2>
              {data.certifications.map((c) => (
                <div key={c.id} className="text-[10.5px] text-slate-700">
                  <span className="font-bold">{c.name}</span> — {c.issuer}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex justify-between text-[9px] text-slate-400 font-mono">
        <span>// verified developer CV</span>
        <span>A4 Format</span>
      </div>
    </div>
  );
};

/* =========================================================
   5. Creative Emerald Template (Sophisticated Minimal Accent)
   ========================================================= */
const CreativeEmeraldTemplate: React.FC<{
  data: ResumeData;
  isRtl: boolean;
  primaryColor: string;
  fontClass: string;
  containerStyle: React.CSSProperties;
}> = ({ data, isRtl, primaryColor, fontClass, containerStyle }) => {
  const { personalDetails: p, summary: s } = data;

  return (
    <div
      id="resume-printable-node"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={containerStyle}
      className={`a4-page bg-white text-slate-800 ${fontClass} p-8 flex flex-col justify-between`}
    >
      <div>
        {/* Creative Top Bar with emerald/accent tint */}
        <div className="flex justify-between items-end pb-4 mb-6 border-b-2" style={{ borderColor: primaryColor }}>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{p.fullName}</h1>
            <p className="text-sm font-semibold tracking-wide" style={{ color: primaryColor }}>
              {p.professionalTitle}
            </p>
          </div>
          <div className="text-end text-[10.5px] text-slate-500 space-y-0.5">
            <div>{p.email}</div>
            <div dir="ltr">{p.phone}</div>
            <div>{p.location}</div>
          </div>
        </div>

        {/* Summary */}
        {s.content && (
          <div className="mb-6">
            <p className="text-xs font-medium leading-relaxed text-slate-700 italic border-s-2 ps-3" style={{ borderColor: primaryColor }}>
              "{s.content}"
            </p>
          </div>
        )}

        {/* 2-Column Grid */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-5">
            {/* Experience */}
            {data.experiences.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-slate-200" style={{ color: primaryColor }}>
                  {isRtl ? 'التجربة المهنية' : 'Experience'}
                </h2>
                <div className="space-y-4">
                  {data.experiences.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between text-xs font-bold text-slate-900">
                        <span>{exp.role}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <div className="text-[10.5px] font-semibold text-slate-600 mb-1">{exp.company}</div>
                      {exp.bulletPoints && (
                        <ul className="list-disc list-outside ms-3.5 space-y-1 text-[10.5px] text-slate-600">
                          {exp.bulletPoints.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200" style={{ color: primaryColor }}>
                  {isRtl ? 'المشاريع البارزة' : 'Featured Work'}
                </h2>
                <div className="space-y-2">
                  {data.projects.map((proj) => (
                    <div key={proj.id} className="text-[10.5px]">
                      <div className="font-bold text-slate-900">{proj.title}</div>
                      <p className="text-slate-600">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="col-span-4 space-y-5 border-s border-slate-100 ps-4">
            {/* Skills */}
            {data.skills.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200" style={{ color: primaryColor }}>
                  {isRtl ? 'المهارات' : 'Skills'}
                </h2>
                <div className="flex flex-wrap gap-1">
                  {data.skills.map((s) => (
                    <span key={s.id} className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-medium">
                      {s.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {data.educations.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200" style={{ color: primaryColor }}>
                  {isRtl ? 'المؤهلات' : 'Education'}
                </h2>
                <div className="space-y-2 text-[10.5px]">
                  {data.educations.map((edu) => (
                    <div key={edu.id}>
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-slate-600">{edu.institution}</div>
                      <div className="text-[9.5px] text-slate-400">{edu.startDate} – {edu.endDate}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b border-slate-200" style={{ color: primaryColor }}>
                  {isRtl ? 'اللغات' : 'Languages'}
                </h2>
                <div className="space-y-1 text-[10.5px]">
                  {data.languages.map((l) => (
                    <div key={l.id} className="flex justify-between text-slate-700">
                      <span>{l.name}</span>
                      <span className="text-[9.5px] text-slate-500">{l.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-[9px] text-slate-400 text-center">
        {p.fullName} Portfolio Resume
      </div>
    </div>
  );
};

/* =========================================================
   6. Compact Elegance Template (High Density & Space Efficient)
   ========================================================= */
const CompactEleganceTemplate: React.FC<{
  data: ResumeData;
  isRtl: boolean;
  primaryColor: string;
  fontClass: string;
  containerStyle: React.CSSProperties;
}> = ({ data, isRtl, primaryColor, fontClass, containerStyle }) => {
  const { personalDetails: p, summary: s } = data;

  return (
    <div
      id="resume-printable-node"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={containerStyle}
      className={`a4-page bg-white text-slate-900 ${fontClass} p-7 flex flex-col justify-between`}
    >
      <div>
        {/* Compact Header */}
        <div className="flex justify-between items-center pb-2 mb-3 border-b-2" style={{ borderColor: primaryColor }}>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{p.fullName}</h1>
            <p className="text-xs font-semibold" style={{ color: primaryColor }}>{p.professionalTitle}</p>
          </div>
          <div className="text-end text-[10px] text-slate-600">
            <div>{p.email} • <span dir="ltr">{p.phone}</span></div>
            <div>{p.location} {p.linkedin ? `• ${p.linkedin}` : ''}</div>
          </div>
        </div>

        {/* Summary */}
        {s.content && (
          <div className="mb-3 text-[10.5px] leading-snug text-slate-700">
            {s.content}
          </div>
        )}

        {/* Experience */}
        {data.experiences.length > 0 && (
          <section className="mb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b border-slate-200" style={{ color: primaryColor }}>
              {isRtl ? 'الخبرات المهنية' : 'Experience'}
            </h2>
            <div className="space-y-2.5">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>{exp.role} — <span className="font-semibold text-slate-700">{exp.company}</span></span>
                    <span className="text-[9.5px] text-slate-500 font-normal">
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.bulletPoints && (
                    <ul className="list-disc list-outside ms-3 space-y-0.5 text-[10px] text-slate-700 mt-0.5">
                      {exp.bulletPoints.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Skills Grid */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          {data.educations.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1 pb-0.5 border-b border-slate-200" style={{ color: primaryColor }}>
                {isRtl ? 'التعليم' : 'Education'}
              </h2>
              <div className="space-y-1.5 text-[10px]">
                {data.educations.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-bold">{edu.degree} in {edu.fieldOfStudy}</div>
                    <div className="text-slate-600">{edu.institution} ({edu.startDate} – {edu.endDate})</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.skills.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1 pb-0.5 border-b border-slate-200" style={{ color: primaryColor }}>
                {isRtl ? 'المهارات' : 'Skills'}
              </h2>
              <div className="flex flex-wrap gap-1">
                {data.skills.map((sk) => (
                  <span key={sk.id} className="text-[9.5px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
                    {sk.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Certifications & Languages */}
        <div className="grid grid-cols-2 gap-4">
          {data.certifications.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1 pb-0.5 border-b border-slate-200" style={{ color: primaryColor }}>
                {isRtl ? 'الشهادات' : 'Certifications'}
              </h2>
              <div className="text-[9.5px] space-y-0.5">
                {data.certifications.map((c) => (
                  <div key={c.id}>• {c.name} ({c.issuer})</div>
                ))}
              </div>
            </section>
          )}

          {data.languages.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1 pb-0.5 border-b border-slate-200" style={{ color: primaryColor }}>
                {isRtl ? 'اللغات' : 'Languages'}
              </h2>
              <div className="text-[9.5px] space-y-0.5">
                {data.languages.map((l) => (
                  <div key={l.id}>• {l.name}: {l.proficiency}</div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="text-center text-[9px] text-slate-400 pt-2 border-t border-slate-100">
        Curriculum Vitae • A4 Layout
      </div>
    </div>
  );
};
