import React from 'react';
import { ResumeData, TemplateType } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

interface PreviewProps {
  data: ResumeData;
  template: TemplateType;
}

const Preview: React.FC<PreviewProps> = ({ data, template }) => {
  if (template === TemplateType.MODERN) {
    return <ModernTemplate data={data} />;
  }
  if (template === TemplateType.MINIMAL) {
    return <MinimalTemplate data={data} />;
  }
  if (template === TemplateType.TECH) {
    return <TechTemplate data={data} />;
  }
  return <ClassicTemplate data={data} />;
};

// Helper for A4 consistency
const A4_CLASS = "w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg print:shadow-none overflow-hidden text-[10.5pt]";

const ClassicTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, experience, education, projects, skills, certificates, awards } = data;
  return (
    <div className={`${A4_CLASS} p-[20mm] font-serif leading-relaxed text-slate-900`} id="resume-preview">
      {/* Header */}
      <div className="text-center border-b-2 border-slate-900 pb-5 mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wide mb-3 text-slate-950">{personalInfo.fullName}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-slate-700 text-[9pt]">
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.website && <span>{personalInfo.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-[11pt] font-bold uppercase border-b border-slate-300 mb-3 pb-1 tracking-wider text-slate-950">Professional Summary</h2>
          <p className="text-justify text-slate-800">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[11pt] font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-wider text-slate-950">Experience</h2>
          <div className="space-y-5">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <h3 className="text-[11pt]">{exp.position}</h3>
                  <span className="text-[9pt]">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="flex justify-between items-center mb-1.5 italic text-slate-700">
                  <span>{exp.company}</span>
                  <span className="text-[9pt]">{exp.location}</span>
                </div>
                <p className="whitespace-pre-line text-slate-800">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[11pt] font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-wider text-slate-950">Projects</h2>
          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <h3 className="text-[11pt]">{proj.name}</h3>
                  <span className="text-[9pt]">{proj.date}</span>
                </div>
                 {proj.link && <div className="text-[9pt] font-normal text-slate-600 italic -mt-1 mb-1">{proj.link}</div>}
                {proj.technologies && <p className="text-[9pt] text-slate-600 mb-1 italic">Technologies: {proj.technologies}</p>}
                <p className="whitespace-pre-line text-slate-800">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
           <h2 className="text-[11pt] font-bold uppercase border-b border-slate-300 mb-3 pb-1 tracking-wider text-slate-950">Skills</h2>
           <p className="text-slate-800">{skills.join(' • ')}</p>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[11pt] font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-wider text-slate-950">Education</h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                 <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <h3 className="text-[11pt]">{edu.school}</h3>
                  <span className="text-[9pt]">{edu.startDate} - {edu.endDate}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="italic">{edu.degree}</span>
                  <span className="text-[9pt]">{edu.location}</span>
                </div>
                
                {/* GPA & CGPA Row */}
                {(edu.gpa || edu.cgpa) && (
                  <div className="flex gap-4 mt-1 text-[9pt] text-slate-700 font-medium">
                     {edu.gpa && <span>GPA: {edu.gpa}</span>}
                     {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                  </div>
                )}
                
                {/* Coursework */}
                {edu.coursework && (
                    <div className="text-[9pt] mt-1 text-slate-700">
                      <span className="font-bold text-slate-800">Coursework:</span> {edu.coursework}
                    </div>
                )}

                {edu.description && <p className="text-slate-800 mt-1">{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Awards & Certs split if needed or stacked */}
      {(awards.length > 0 || certificates.length > 0) && (
        <div className="mb-6 grid grid-cols-1 gap-6">
           {awards.length > 0 && (
              <div>
                <h2 className="text-[11pt] font-bold uppercase border-b border-slate-300 mb-3 pb-1 tracking-wider text-slate-950">Awards</h2>
                <div className="space-y-3">
                  {awards.map((award) => (
                    <div key={award.id}>
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <h3>{award.title}</h3>
                        <span className="text-[9pt]">{award.date}</span>
                      </div>
                      <div className="text-slate-700 italic text-[9pt] mb-1">{award.issuer}</div>
                      {award.description && <p className="text-slate-800">{award.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
           )}
           
           {certificates.length > 0 && (
              <div>
                <h2 className="text-[11pt] font-bold uppercase border-b border-slate-300 mb-3 pb-1 tracking-wider text-slate-950">Certificates</h2>
                <div className="grid grid-cols-1 gap-1">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex justify-between text-slate-800">
                      <span className="font-semibold">{cert.name} <span className="font-normal text-slate-600">| {cert.issuer}</span></span>
                      <span className="text-[9pt]">{cert.date}</span>
                    </div>
                  ))}
                </div>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

const MinimalTemplate = ({ data }: { data: ResumeData }) => {
    // Left aligned, clean, sans-serif
    const { personalInfo, experience, education, projects, skills, certificates, awards } = data;
    return (
      <div className={`${A4_CLASS} p-[20mm] font-sans text-slate-800`} id="resume-preview">
        {/* Header */}
        <div className="mb-8 border-b pb-6 border-slate-100">
            <h1 className="text-4xl font-light tracking-tight mb-3 text-slate-950">{personalInfo.fullName}</h1>
            <div className="text-slate-500 text-[9pt] flex flex-wrap gap-x-5 gap-y-1">
                {personalInfo.location && <span>{personalInfo.location}</span>}
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
                {personalInfo.website && <span>{personalInfo.website}</span>}
            </div>
        </div>

        {/* Summary */}
        {personalInfo.summary && (
            <div className="mb-8">
                <h3 className="text-[9pt] font-bold uppercase tracking-widest text-slate-400 mb-3">Profile</h3>
                <p className="text-slate-700 max-w-3xl leading-relaxed">{personalInfo.summary}</p>
            </div>
        )}

        <div className="space-y-8">
            {experience.length > 0 && (
                <div>
                    <h3 className="text-[9pt] font-bold uppercase tracking-widest text-slate-400 mb-5">Experience</h3>
                    <div className="space-y-6">
                        {experience.map(exp => (
                            <div key={exp.id} className="relative pl-4 border-l-2 border-slate-100">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-semibold text-[11pt] text-slate-900">{exp.position}</h4>
                                    <span className="text-slate-400 text-[9pt]">{exp.startDate} – {exp.endDate}</span>
                                </div>
                                <div className="text-slate-500 mb-2 text-[9pt] font-medium uppercase">{exp.company}, {exp.location}</div>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {projects.length > 0 && (
                <div>
                    <h3 className="text-[9pt] font-bold uppercase tracking-widest text-slate-400 mb-5">Projects</h3>
                    <div className="space-y-5">
                        {projects.map(proj => (
                            <div key={proj.id} className="relative pl-4 border-l-2 border-slate-100">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-semibold text-slate-900">{proj.name}</h4>
                                    <span className="text-slate-400 text-[9pt]">{proj.date}</span>
                                </div>
                                {proj.link && <div className="text-slate-400 text-[9pt] mb-1">{proj.link}</div>}
                                <div className="text-slate-500 text-[9pt] mb-2 font-mono">{proj.technologies}</div>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

             {awards && awards.length > 0 && (
                <div>
                    <h3 className="text-[9pt] font-bold uppercase tracking-widest text-slate-400 mb-4">Awards</h3>
                    <div className="space-y-4">
                        {awards.map(award => (
                            <div key={award.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-semibold text-slate-900">{award.title}</h4>
                                    <span className="text-slate-400 text-[9pt]">{award.date}</span>
                                </div>
                                <div className="text-slate-500 text-[9pt] mb-1">{award.issuer}</div>
                                <p className="text-slate-600 whitespace-pre-line">{award.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {education.length > 0 && (
                <div>
                    <h3 className="text-[9pt] font-bold uppercase tracking-widest text-slate-400 mb-4">Education</h3>
                     <div className="space-y-4">
                        {education.map(edu => (
                            <div key={edu.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-semibold text-slate-900">{edu.school}</h4>
                                    <span className="text-slate-400 text-[9pt]">{edu.startDate} – {edu.endDate}</span>
                                </div>
                                <div className="text-slate-500 text-[9pt]">{edu.degree}</div>
                                
                                {(edu.gpa || edu.cgpa) && (
                                   <div className="flex gap-3 text-[9pt] text-slate-500 mt-1">
                                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                                      {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                                   </div>
                                )}
                                
                                {edu.coursework && (
                                  <div className="text-[9pt] text-slate-500 mt-1 italic">
                                     Coursework: {edu.coursework}
                                  </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {skills.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-[9pt] font-bold uppercase tracking-widest text-slate-400 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-x-2 gap-y-2">
                        {skills.map((skill, i) => (
                             <span key={i} className="bg-slate-100 px-3 py-1 rounded text-slate-700 text-[9pt]">{skill}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    ); 
};

const ModernTemplate = ({ data }: { data: ResumeData }) => {
    // Two column layout with sidebar - optimized for A4
    const { personalInfo, experience, education, projects, skills, certificates, awards } = data;
    return (
      <div className={`${A4_CLASS} flex flex-col md:flex-row font-sans`} id="resume-preview">
        {/* Sidebar - Approx 1/3 width */}
        <div className="w-full md:w-[65mm] bg-slate-800 text-slate-100 p-[8mm] flex flex-col gap-6 print:bg-slate-800 print:text-white shrink-0">
            <div className="mb-4">
                <h1 className="text-2xl font-bold leading-tight mb-2 text-white break-words">{personalInfo.fullName}</h1>
                <p className="text-blue-300 font-medium text-[10pt]">{experience[0]?.position}</p>
            </div>

            <div className="space-y-6 text-[9pt]">
                <div>
                    <h3 className="font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-600 pb-1 text-[8pt]">Contact</h3>
                    <div className="space-y-2.5">
                        {personalInfo.email && <div className="flex items-start gap-2 break-all"><Mail size={12} className="mt-0.5 shrink-0"/> <span>{personalInfo.email}</span></div>}
                        {personalInfo.phone && <div className="flex items-center gap-2"><Phone size={12} className="shrink-0"/> <span>{personalInfo.phone}</span></div>}
                        {personalInfo.location && <div className="flex items-center gap-2"><MapPin size={12} className="shrink-0"/> <span>{personalInfo.location}</span></div>}
                        {personalInfo.linkedin && <div className="flex items-start gap-2 break-all"><Linkedin size={12} className="mt-0.5 shrink-0"/> <span>{personalInfo.linkedin}</span></div>}
                        {personalInfo.website && <div className="flex items-start gap-2 break-all"><Globe size={12} className="mt-0.5 shrink-0"/> <span>{personalInfo.website}</span></div>}
                    </div>
                </div>

                {education.length > 0 && (
                    <div>
                         <h3 className="font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-600 pb-1 text-[8pt]">Education</h3>
                         <div className="space-y-4">
                            {education.map(edu => (
                                <div key={edu.id}>
                                    <div className="font-bold text-white text-[9.5pt]">{edu.school}</div>
                                    <div className="text-blue-200">{edu.degree}</div>
                                    <div className="text-slate-400 mt-0.5 text-[8pt]">{edu.startDate} - {edu.endDate}</div>
                                    {(edu.gpa || edu.cgpa) && (
                                       <div className="text-slate-300 text-[8pt] mt-1">
                                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
                                          {edu.gpa && edu.cgpa && <span> • </span>}
                                          {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                                       </div>
                                    )}
                                </div>
                            ))}
                         </div>
                    </div>
                )}

                 {skills.length > 0 && (
                    <div>
                        <h3 className="font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-600 pb-1 text-[8pt]">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, i) => (
                                <span key={i} className="text-slate-200 bg-slate-700 px-2 py-1 rounded">{skill}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-[10mm] text-slate-800">
             {personalInfo.summary && (
                <div className="mb-8">
                    <h2 className="text-[12pt] font-bold text-slate-900 mb-3 uppercase tracking-wide border-b-2 border-slate-100 pb-1">Profile</h2>
                    <p className="text-slate-700 leading-relaxed text-[10pt]">{personalInfo.summary}</p>
                </div>
            )}

            {experience.length > 0 && (
                <div className="mb-8">
                     <h2 className="text-[12pt] font-bold text-slate-900 mb-4 uppercase tracking-wide border-b-2 border-slate-100 pb-1">Experience</h2>
                    <div className="space-y-6">
                        {experience.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-[11pt] text-slate-900">{exp.position}</h3>
                                    <span className="text-slate-400 text-[9pt] font-medium">{exp.startDate} - {exp.endDate}</span>
                                </div>
                                <div className="text-blue-700 font-medium mb-2 text-[10pt]">{exp.company} <span className="text-slate-400 font-normal">| {exp.location}</span></div>
                                <p className="text-slate-700 whitespace-pre-line text-[10pt]">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {projects.length > 0 && (
                <div className="mb-8">
                     <h2 className="text-[12pt] font-bold text-slate-900 mb-4 uppercase tracking-wide border-b-2 border-slate-100 pb-1">Projects</h2>
                    <div className="space-y-5">
                        {projects.map(proj => (
                            <div key={proj.id}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-slate-900 text-[10.5pt]">{proj.name}</h3>
                                    <span className="text-slate-400 text-[9pt]">{proj.date}</span>
                                </div>
                                {proj.link && <span className="text-blue-600 text-[9pt] block mb-1">{proj.link}</span>}
                                <div className="text-[9pt] text-slate-500 font-medium mb-1.5">{proj.technologies}</div>
                                <p className="text-slate-700 text-[10pt] whitespace-pre-line">{proj.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

             {awards && awards.length > 0 && (
                <div className="mb-6">
                     <h2 className="text-[12pt] font-bold text-slate-900 mb-4 uppercase tracking-wide border-b-2 border-slate-100 pb-1">Awards</h2>
                    <div className="space-y-4">
                        {awards.map(award => (
                            <div key={award.id}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-slate-900 text-[10.5pt]">{award.title}</h3>
                                    <span className="text-slate-400 text-[9pt] font-medium">{award.date}</span>
                                </div>
                                <div className="text-blue-700 font-medium mb-1 text-[9pt]">{award.issuer}</div>
                                <p className="text-slate-700 text-[10pt] whitespace-pre-line">{award.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    );
};

const TechTemplate = ({ data }: { data: ResumeData }) => {
  // Dense, highly readable, single column, serif headings/sans body mix or all serif. 
  // Based on Deedy/Harshibar style: Header with links, Skills section, Experience with tight spacing.
  
  const { personalInfo, experience, education, projects, skills, certificates, awards } = data;

  return (
     <div className={`${A4_CLASS} p-[15mm] font-sans text-slate-900 leading-tight`} id="resume-preview">
        {/* Header */}
        <div className="text-center mb-6">
           <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">{personalInfo.fullName}</h1>
           <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[9pt]">
              {personalInfo.email && <div className="flex items-center gap-1"><Mail size={12}/>{personalInfo.email}</div>}
              {personalInfo.phone && <div className="flex items-center gap-1"><Phone size={12}/>{personalInfo.phone}</div>}
              {personalInfo.linkedin && <div className="flex items-center gap-1"><Linkedin size={12}/>{personalInfo.linkedin}</div>}
              {personalInfo.website && <div className="flex items-center gap-1"><Globe size={12}/>{personalInfo.website}</div>}
           </div>
        </div>

        {/* Education - Tech resumes often put this top if student/new grad, or bottom if senior. We'll stick to user order or just top for this template style */}
        {education.length > 0 && (
           <div className="mb-5">
              <h2 className="text-[10pt] font-bold uppercase border-b border-slate-400 mb-2 pb-0.5">Education</h2>
              <div className="space-y-2">
                 {education.map(edu => (
                    <div key={edu.id}>
                       <div className="flex justify-between font-bold text-[10pt]">
                          <span>{edu.school}</span>
                          <span>{edu.location}</span>
                       </div>
                       <div className="flex justify-between text-[9pt]">
                          <span className="italic">{edu.degree}</span>
                          <span>{edu.startDate} - {edu.endDate}</span>
                       </div>
                        {(edu.gpa || edu.cgpa) && (
                          <div className="text-[9pt] mt-0.5">
                              {edu.gpa && <span>GPA: {edu.gpa} </span>}
                              {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                          </div>
                        )}
                        {edu.coursework && <div className="text-[9pt] mt-0.5"><span className="font-semibold">Coursework:</span> {edu.coursework}</div>}
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
           <div className="mb-5">
              <h2 className="text-[10pt] font-bold uppercase border-b border-slate-400 mb-2 pb-0.5">Skills</h2>
              <div className="text-[9pt]">
                 <span className="font-semibold">Languages & Tools:</span> {skills.join(', ')}
              </div>
           </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
           <div className="mb-5">
              <h2 className="text-[10pt] font-bold uppercase border-b border-slate-400 mb-2 pb-0.5">Experience</h2>
              <div className="space-y-4">
                 {experience.map(exp => (
                    <div key={exp.id}>
                       <div className="flex justify-between font-bold text-[10pt]">
                          <span>{exp.position}</span>
                          <span>{exp.startDate} – {exp.endDate}</span>
                       </div>
                       <div className="flex justify-between text-[9pt] mb-1 italic">
                          <span>{exp.company}</span>
                          <span>{exp.location}</span>
                       </div>
                       <p className="text-[9.5pt] whitespace-pre-line leading-snug">{exp.description}</p>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
           <div className="mb-5">
              <h2 className="text-[10pt] font-bold uppercase border-b border-slate-400 mb-2 pb-0.5">Projects</h2>
              <div className="space-y-4">
                 {projects.map(proj => (
                    <div key={proj.id}>
                       <div className="flex justify-between font-bold text-[10pt]">
                          <span>{proj.name}</span>
                          <span>{proj.date}</span>
                       </div>
                       <div className="text-[9pt] italic mb-1">
                          {proj.technologies} {proj.link && <span> | {proj.link}</span>}
                       </div>
                       <p className="text-[9.5pt] whitespace-pre-line leading-snug">{proj.description}</p>
                    </div>
                 ))}
              </div>
           </div>
        )}
        
        {/* Awards */}
        {awards.length > 0 && (
            <div className="mb-5">
               <h2 className="text-[10pt] font-bold uppercase border-b border-slate-400 mb-2 pb-0.5">Awards</h2>
                <div className="space-y-2">
                 {awards.map(award => (
                    <div key={award.id}>
                       <div className="flex justify-between font-bold text-[10pt]">
                          <span>{award.title}</span>
                          <span>{award.date}</span>
                       </div>
                       <div className="text-[9pt] italic">{award.issuer}</div>
                       <p className="text-[9.5pt]">{award.description}</p>
                    </div>
                 ))}
              </div>
            </div>
        )}
     </div>
  );
};

export default Preview;