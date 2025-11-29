import React, { useState } from 'react';
import { ResumeData, Experience, Education, Project, Certificate, Award, KeywordAnalysis, ResumeImprovement, ReviewResult, ResumeVersion } from '../types';
import { Plus, Trash2, ChevronDown, ChevronUp, Sparkles, PenTool, Target, AlertCircle, CheckCircle, ArrowRight, Lightbulb, Wand2, Upload, Save, History, Clock, RotateCcw, X, Link as LinkIcon } from 'lucide-react';

interface EditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  jobDescription: string;
  onJobDescriptionChange: (jd: string) => void;
  onAutoGenerateSummary: (jd: string) => Promise<void>;
  onAnalyzeJD: () => Promise<void>;
  onOptimize: () => Promise<void>;
  onEnhanceDescription: (id: string, section: 'experience' | 'projects' | 'awards') => Promise<void>;
  onGetImprovements: () => Promise<void>;
  onApplyImprovement: (improvement: ResumeImprovement) => void;
  analysisResult: KeywordAnalysis | null;
  reviewResult: ReviewResult | null;
  isAnalyzing: boolean;
  isOptimizing: boolean;
  isGeneratingSummary: boolean;
  isReviewing: boolean;
  enhancingId: string | null;
  onOpenImport: () => void;
  onSaveProfile: () => void;
  isSavingProfile: boolean;
  onImportData?: (source: { type: 'text' | 'pdf' | 'url', value: string }) => Promise<void>;
  versions?: ResumeVersion[];
  onRestoreVersion?: (version: ResumeVersion) => void;
  previousScore?: number;
}

const Editor: React.FC<EditorProps> = ({ 
  data, 
  onChange, 
  jobDescription, 
  onJobDescriptionChange,
  onAutoGenerateSummary,
  onAnalyzeJD,
  onOptimize,
  onEnhanceDescription,
  onGetImprovements,
  onApplyImprovement,
  analysisResult,
  reviewResult,
  isAnalyzing,
  isOptimizing,
  isGeneratingSummary,
  isReviewing,
  enhancingId,
  onOpenImport,
  onSaveProfile,
  isSavingProfile,
  onImportData,
  versions,
  onRestoreVersion,
  previousScore
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'review' | 'jd'>('editor');
  const [activeSection, setActiveSection] = useState<string | null>('personal');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Robust URL validation that handles various formats
  const validateUrl = (value: string) => {
    if (!value) return true;
    try {
      // Check for basic structure first
      if (!value.includes('.')) return false;
      
      const urlToCheck = /^https?:\/\//i.test(value) ? value : `https://${value}`;
      new URL(urlToCheck);
      return true;
    } catch {
      return false;
    }
  };
  
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });

    // Validate LinkedIn
    if (field === 'linkedin') {
      const isValidFormat = validateUrl(value);
      // Strictly check for linkedin.com to be ATS friendly
      const hasDomain = value.toLowerCase().includes('linkedin.com');
      
      if (value && (!isValidFormat || !hasDomain)) {
        setValidationErrors(prev => ({ ...prev, 'personal-linkedin': 'Please enter a valid LinkedIn URL (e.g. linkedin.com/in/name)' }));
      } else {
        setValidationErrors(prev => {
          const newErr = { ...prev };
          delete newErr['personal-linkedin'];
          return newErr;
        });
      }
    }

    // Validate Website
    if (field === 'website') {
      if (value && !validateUrl(value)) {
        setValidationErrors(prev => ({ ...prev, 'personal-website': 'Please enter a valid URL' }));
      } else {
        setValidationErrors(prev => {
          const newErr = { ...prev };
          delete newErr['personal-website'];
          return newErr;
        });
      }
    }
  };

  const updateSkills = (value: string) => {
    const skillsArray = value.split(',').map(s => s.trim()).filter(s => s);
    onChange({ ...data, skills: skillsArray });
  };
  
  const updateItem = <T extends { id: string }>(
    section: keyof ResumeData,
    id: string,
    field: keyof T,
    value: string
  ) => {
    const list = data[section] as unknown as T[];
    const newList = list.map(item => item.id === id ? { ...item, [field]: value } : item);
    onChange({ ...data, [section]: newList });
  };

  const addItem = (section: keyof ResumeData, newItem: any) => {
    const list = data[section] as any[];
    onChange({ ...data, [section]: [...list, { ...newItem, id: Math.random().toString(36).substr(2, 9) }] });
  };

  const removeItem = (section: keyof ResumeData, id: string) => {
    const list = data[section] as any[];
    onChange({ ...data, [section]: list.filter(item => item.id !== id) });
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleProjectLinkChange = (id: string, value: string) => {
    updateItem<Project>('projects', id, 'link', value);
    if (!validateUrl(value)) {
      setValidationErrors(prev => ({ ...prev, [`proj-link-${id}`]: 'Please enter a valid URL (e.g. github.com/username)' }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`proj-link-${id}`];
        return newErrors;
      });
    }
  };

  const SectionHeader = ({ title, name }: { title: string, name: string }) => (
    <button
      onClick={() => toggleSection(name)}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border-b transition-colors"
    >
      <span className="font-semibold text-slate-700">{title}</span>
      {activeSection === name ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-slate-100 border-r border-slate-200 relative">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white">
        <button 
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'editor' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <PenTool size={16} /> <span className="hidden sm:inline">Edit</span>
        </button>
        <button 
          onClick={() => setActiveTab('review')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'review' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Lightbulb size={16} /> <span className="hidden sm:inline">Review</span>
        </button>
        <button 
          onClick={() => setActiveTab('jd')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'jd' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Target size={16} /> <span className="hidden sm:inline">Tailor</span>
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {activeTab === 'editor' && (
          <div className="flex flex-col">
            
            {/* Quick Actions Toolbar */}
            <div className="p-3 bg-white border-b border-slate-200 flex gap-2 overflow-x-auto items-center no-scrollbar">
               <button 
                 onClick={onOpenImport}
                 className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
                 title="Import from LinkedIn or PDF"
               >
                 <Upload size={14} /> Import
               </button>
               <button 
                 onClick={onSaveProfile}
                 disabled={isSavingProfile}
                 className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
                 title="Save as default for future resumes"
               >
                 {isSavingProfile ? <span className="animate-spin">⏳</span> : <Save size={14} />} 
                 Save to Profile
               </button>
               
               <div className="flex-1"></div>
               
               {versions && versions.length > 0 && (
                 <button 
                   onClick={() => setIsHistoryOpen(true)}
                   className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors whitespace-nowrap"
                   title="Version History"
                 >
                   <History size={14} /> <span className="hidden sm:inline">History</span>
                 </button>
               )}
            </div>

            {/* Personal Info */}
            <div className="border-b border-slate-200 bg-white">
              <SectionHeader title="Personal Information" name="personal" />
              {activeSection === 'personal' && (
                <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" value={data.personalInfo.fullName} onChange={(v: string) => updatePersonalInfo('fullName', v)} />
                    <Input label="Email" value={data.personalInfo.email} onChange={(v: string) => updatePersonalInfo('email', v)} />
                    <Input label="Phone" value={data.personalInfo.phone} onChange={(v: string) => updatePersonalInfo('phone', v)} />
                    <Input label="Location" value={data.personalInfo.location} onChange={(v: string) => updatePersonalInfo('location', v)} />
                    <Input 
                      label="LinkedIn" 
                      value={data.personalInfo.linkedin} 
                      onChange={(v: string) => updatePersonalInfo('linkedin', v)} 
                      error={validationErrors['personal-linkedin']}
                      placeholder="linkedin.com/in/username"
                    />
                    <Input 
                      label="Website" 
                      value={data.personalInfo.website} 
                      onChange={(v: string) => updatePersonalInfo('website', v)} 
                      error={validationErrors['personal-website']}
                      placeholder="yourname.com"
                    />
                  </div>
                  
                  <div className="relative">
                    <TextArea 
                      label="Professional Summary" 
                      value={data.personalInfo.summary} 
                      onChange={(v: string) => updatePersonalInfo('summary', v)}
                      rows={6} 
                    />
                     <button
                        onClick={() => onAutoGenerateSummary(jobDescription)}
                        disabled={isGeneratingSummary}
                        className="absolute right-2 top-0 text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100 flex items-center gap-1 transition-colors disabled:opacity-50"
                        title="Enhance Professional Summary with AI"
                      >
                        {isGeneratingSummary ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <Sparkles size={12} />
                        )}
                        Enhance with AI
                      </button>
                  </div>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="border-b border-slate-200 bg-white">
              <SectionHeader title="Skills" name="skills" />
              {activeSection === 'skills' && (
                <div className="p-4 space-y-4">
                  <TextArea 
                    label="Skills (Comma separated)" 
                    value={data.skills.join(', ')} 
                    onChange={updateSkills}
                    placeholder="React, Node.js, Python..."
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="border-b border-slate-200 bg-white">
              <SectionHeader title="Experience" name="experience" />
              {activeSection === 'experience' && (
                <div className="p-4 space-y-6">
                  {data.experience.map((exp) => (
                    <div key={exp.id} className="p-4 border rounded-lg bg-slate-50 relative group">
                      <button 
                        onClick={() => removeItem('experience', exp.id)} 
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Experience"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <Input 
                          label="Position" 
                          value={exp.position} 
                          onChange={(v: string) => updateItem<Experience>('experience', exp.id, 'position', v)} 
                          className="md:col-span-2"
                          placeholder="e.g. Senior Frontend Developer" 
                        />
                        <Input 
                          label="Company" 
                          value={exp.company} 
                          onChange={(v: string) => updateItem<Experience>('experience', exp.id, 'company', v)} 
                          placeholder="e.g. Tech Solutions Inc."
                        />
                        <Input 
                          label="Location" 
                          value={exp.location} 
                          onChange={(v: string) => updateItem<Experience>('experience', exp.id, 'location', v)} 
                          placeholder="e.g. New York, NY"
                        />
                        <Input 
                          label="Start Date" 
                          value={exp.startDate} 
                          onChange={(v: string) => updateItem<Experience>('experience', exp.id, 'startDate', v)} 
                          placeholder="e.g. 2021-03"
                        />
                        <Input 
                          label="End Date" 
                          value={exp.endDate} 
                          onChange={(v: string) => updateItem<Experience>('experience', exp.id, 'endDate', v)} 
                          placeholder="e.g. Present"
                        />
                      </div>
                      <div className="relative">
                        <TextArea 
                          label="Description" 
                          value={exp.description} 
                          onChange={(v: string) => updateItem<Experience>('experience', exp.id, 'description', v)}
                          rows={5}
                          placeholder="• Led a team of 5 developers...&#10;• Achieved X result..."
                        />
                         <button
                            onClick={() => onEnhanceDescription(exp.id, 'experience')}
                            disabled={enhancingId === exp.id}
                            className="absolute right-2 top-0 text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100 flex items-center gap-1 transition-colors disabled:opacity-50"
                            title="Enhance with AI"
                          >
                            {enhancingId === exp.id ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <Sparkles size={12} />
                            )}
                            Enhance
                          </button>
                      </div>
                    </div>
                  ))}
                  <Button onClick={() => addItem('experience', { company: '', position: '', startDate: '', endDate: '', location: '', description: '' })}>
                    <Plus size={16} className="mr-2" /> Add Experience
                  </Button>
                </div>
              )}
            </div>

            {/* Education */}
            <div className="border-b border-slate-200 bg-white">
              <SectionHeader title="Education" name="education" />
              {activeSection === 'education' && (
                <div className="p-4 space-y-6">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="p-4 border rounded-lg bg-slate-50 relative group">
                      <button 
                        onClick={() => removeItem('education', edu.id)} 
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <Input label="School" value={edu.school} onChange={(v: string) => updateItem<Education>('education', edu.id, 'school', v)} />
                        <Input label="Degree" value={edu.degree} onChange={(v: string) => updateItem<Education>('education', edu.id, 'degree', v)} />
                        <Input label="Start Date" value={edu.startDate} onChange={(v: string) => updateItem<Education>('education', edu.id, 'startDate', v)} />
                        <Input label="End Date" value={edu.endDate} onChange={(v: string) => updateItem<Education>('education', edu.id, 'endDate', v)} />
                        <Input label="Location" value={edu.location} onChange={(v: string) => updateItem<Education>('education', edu.id, 'location', v)} />
                        <Input label="GPA (Optional)" value={edu.gpa || ''} onChange={(v: string) => updateItem<Education>('education', edu.id, 'gpa', v)} placeholder="e.g. 3.8/4.0" />
                        <Input label="CGPA (Optional)" value={edu.cgpa || ''} onChange={(v: string) => updateItem<Education>('education', edu.id, 'cgpa', v)} placeholder="e.g. 9.5/10" />
                        <Input label="Coursework (Optional)" value={edu.coursework || ''} onChange={(v: string) => updateItem<Education>('education', edu.id, 'coursework', v)} className="md:col-span-2" placeholder="e.g. Data Structures, Algorithms..." />
                      </div>
                      <TextArea 
                        label="Description" 
                        value={edu.description} 
                        onChange={(v: string) => updateItem<Education>('education', edu.id, 'description', v)}
                      />
                    </div>
                  ))}
                  <Button onClick={() => addItem('education', { school: '', degree: '', startDate: '', endDate: '', location: '', description: '' })}>
                    <Plus size={16} className="mr-2" /> Add Education
                  </Button>
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="border-b border-slate-200 bg-white">
              <SectionHeader title="Projects" name="projects" />
              {activeSection === 'projects' && (
                <div className="p-4 space-y-6">
                  {data.projects.map((proj) => (
                    <div key={proj.id} className="p-4 border rounded-lg bg-slate-50 relative group">
                      <button 
                        onClick={() => removeItem('projects', proj.id)} 
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <Input label="Project Name" value={proj.name} onChange={(v: string) => updateItem<Project>('projects', proj.id, 'name', v)} />
                        <Input 
                          label="Link" 
                          value={proj.link} 
                          onChange={(v: string) => handleProjectLinkChange(proj.id, v)} 
                          placeholder="e.g. github.com/username/project" 
                          error={validationErrors[`proj-link-${proj.id}`]}
                        />
                        <Input label="Date (Timeline)" value={proj.date || ''} onChange={(v: string) => updateItem<Project>('projects', proj.id, 'date', v)} placeholder="e.g. Jan 2023 - Mar 2023" />
                        <Input label="Technologies" value={proj.technologies} onChange={(v: string) => updateItem<Project>('projects', proj.id, 'technologies', v)} className="md:col-span-1" placeholder="React, Node.js..." />
                      </div>
                      <div className="relative">
                        <TextArea 
                          label="Description" 
                          value={proj.description} 
                          onChange={(v: string) => updateItem<Project>('projects', proj.id, 'description', v)}
                          rows={4}
                          placeholder="• Built feature A...&#10;• Optimized feature B..."
                        />
                         <button
                            onClick={() => onEnhanceDescription(proj.id, 'projects')}
                            disabled={enhancingId === proj.id}
                            className="absolute right-2 top-0 text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100 flex items-center gap-1 transition-colors disabled:opacity-50"
                            title="Enhance with AI"
                          >
                            {enhancingId === proj.id ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <Sparkles size={12} />
                            )}
                            Enhance
                          </button>
                      </div>
                    </div>
                  ))}
                  <Button onClick={() => addItem('projects', { name: '', technologies: '', link: '', date: '', description: '' })}>
                    <Plus size={16} className="mr-2" /> Add Project
                  </Button>
                </div>
              )}
            </div>

            {/* Awards */}
            <div className="border-b border-slate-200 bg-white">
              <SectionHeader title="Awards" name="awards" />
              {activeSection === 'awards' && (
                <div className="p-4 space-y-6">
                  {data.awards.map((award) => (
                    <div key={award.id} className="p-4 border rounded-lg bg-slate-50 relative group">
                      <button 
                        onClick={() => removeItem('awards', award.id)} 
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <Input label="Title" value={award.title} onChange={(v: string) => updateItem<Award>('awards', award.id, 'title', v)} />
                        <Input label="Issuer" value={award.issuer} onChange={(v: string) => updateItem<Award>('awards', award.id, 'issuer', v)} />
                        <Input label="Date" value={award.date} onChange={(v: string) => updateItem<Award>('awards', award.id, 'date', v)} />
                      </div>
                      <div className="relative">
                        <TextArea 
                          label="Description" 
                          value={award.description} 
                          onChange={(v: string) => updateItem<Award>('awards', award.id, 'description', v)}
                        />
                         <button
                            onClick={() => onEnhanceDescription(award.id, 'awards')}
                            disabled={enhancingId === award.id}
                            className="absolute right-2 top-0 text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100 flex items-center gap-1 transition-colors disabled:opacity-50"
                            title="Enhance with AI"
                          >
                            {enhancingId === award.id ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <Sparkles size={12} />
                            )}
                            Enhance with AI
                          </button>
                      </div>
                    </div>
                  ))}
                  <Button onClick={() => addItem('awards', { title: '', issuer: '', date: '', description: '' })}>
                    <Plus size={16} className="mr-2" /> Add Award
                  </Button>
                </div>
              )}
            </div>

            {/* Certificates */}
            <div className="border-b border-slate-200 bg-white mb-20">
              <SectionHeader title="Certificates" name="certificates" />
              {activeSection === 'certificates' && (
                <div className="p-4 space-y-6">
                  {data.certificates.map((cert) => (
                    <div key={cert.id} className="p-4 border rounded-lg bg-slate-50 relative group">
                      <button 
                        onClick={() => removeItem('certificates', cert.id)} 
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Name" value={cert.name} onChange={(v: string) => updateItem<Certificate>('certificates', cert.id, 'name', v)} />
                        <Input label="Issuer" value={cert.issuer} onChange={(v: string) => updateItem<Certificate>('certificates', cert.id, 'issuer', v)} />
                        <Input label="Date" value={cert.date} onChange={(v: string) => updateItem<Certificate>('certificates', cert.id, 'date', v)} />
                      </div>
                    </div>
                  ))}
                  <Button onClick={() => addItem('certificates', { name: '', issuer: '', date: '' })}>
                    <Plus size={16} className="mr-2" /> Add Certificate
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'review' && (
          <div className="p-4 space-y-6">
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
               <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                 <Wand2 size={18} /> Professional Resume Review
               </h3>
               <p className="text-sm text-purple-800 mb-4">
                 Get actionable suggestions to improve your resume's impact, clarity, and SEO ranking.
               </p>
               <button 
                 onClick={onGetImprovements}
                 disabled={isReviewing}
                 className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {isReviewing ? <span className="animate-spin">⏳</span> : <Sparkles size={16} />}
                 {reviewResult ? 'Re-Audit Resume' : 'Audit Resume'}
               </button>
            </div>

            {reviewResult && (
               <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                            <circle 
                              cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
                              className={reviewResult.score >= 80 ? "text-green-500" : reviewResult.score >= 50 ? "text-yellow-500" : "text-red-500"}
                              strokeDasharray={175.9}
                              strokeDashoffset={175.9 - (175.9 * reviewResult.score) / 100}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute text-sm font-bold text-slate-800">{reviewResult.score}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">Resume Score</h4>
                        <p className="text-xs text-slate-500">{reviewResult.summary}</p>
                      </div>
                    </div>

                    {/* Score Comparison */}
                    {previousScore !== undefined && (
                      <div className="flex flex-col items-end text-xs font-medium">
                        <span className="text-slate-400 mb-1">vs Last Score: {previousScore}</span>
                        {reviewResult.score > previousScore ? (
                          <span className="text-green-600 flex items-center bg-green-50 px-2 py-0.5 rounded-full">
                            ▲ +{reviewResult.score - previousScore}
                          </span>
                        ) : reviewResult.score < previousScore ? (
                          <span className="text-red-600 flex items-center bg-red-50 px-2 py-0.5 rounded-full">
                             ▼ {reviewResult.score - previousScore}
                          </span>
                        ) : (
                          <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            = No Change
                          </span>
                        )}
                      </div>
                    )}
                 </div>

                 {reviewResult.improvements.length === 0 ? (
                    <div className="text-center py-6 bg-green-50 rounded-lg border border-green-100">
                       <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                       <p className="text-green-800 font-medium text-sm">Great job! No critical issues found.</p>
                    </div>
                 ) : (
                    reviewResult.improvements.map((imp) => (
                      <div key={imp.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded">
                            {imp.section} • {imp.field}
                          </span>
                          <span className="text-xs text-red-500 font-medium">{imp.issue}</span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-sm font-medium text-slate-800 bg-green-50 p-2 rounded border border-green-100">
                            "{imp.suggestion}"
                          </div>
                        </div>

                        <button 
                          onClick={() => onApplyImprovement(imp)}
                          className="w-full py-1.5 border border-green-600 text-green-700 hover:bg-green-50 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle size={12} /> Apply Fix
                        </button>
                      </div>
                    ))
                 )}
               </div>
            )}
          </div>
        )}

        {/* Analyze with JD Tab */}
        {activeTab === 'jd' && (
          <div className="p-4 space-y-6">
             <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Target Job Description</label>
                <textarea
                  className="w-full h-40 p-3 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="Paste the Job Description here to analyze your resume..."
                  value={jobDescription}
                  onChange={(e) => onJobDescriptionChange(e.target.value)}
                ></textarea>
                <div className="mt-3 flex gap-2">
                   <button 
                     onClick={onAnalyzeJD}
                     disabled={isAnalyzing || !jobDescription.trim()}
                     className="flex-1 py-2 bg-emerald-700 text-white rounded-md text-sm font-medium hover:bg-emerald-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     {isAnalyzing ? <span className="animate-spin">⏳</span> : <Target size={14} />}
                     Analyze Score
                   </button>
                   <button 
                     onClick={onOptimize}
                     disabled={isOptimizing || !jobDescription.trim()}
                     className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md text-sm font-medium hover:from-blue-500 hover:to-indigo-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     {isOptimizing ? <span className="animate-spin">⏳</span> : <Sparkles size={14} />}
                     Tailor Resume (Fast)
                   </button>
                </div>
             </div>

             {/* Results */}
             {analysisResult && (
               <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                 {/* Score */}
                 <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-semibold text-slate-700">ATS Compatibility Score</span>
                       <span className={`text-lg font-bold ${analysisResult.score >= 80 ? 'text-green-600' : analysisResult.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                         {analysisResult.score}%
                       </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                       <div 
                         className={`h-2.5 rounded-full ${analysisResult.score >= 80 ? 'bg-green-600' : analysisResult.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                         style={{ width: `${analysisResult.score}%` }}
                       ></div>
                    </div>
                 </div>

                 {/* Keywords */}
                 <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Keyword Analysis</h3>
                    
                    <div className="mb-4">
                       <h4 className="text-xs font-bold text-green-700 uppercase mb-2 flex items-center gap-1"><CheckCircle size={12}/> Matches Found</h4>
                       <div className="flex flex-wrap gap-2">
                          {analysisResult.matchingKeywords.length > 0 ? (
                            analysisResult.matchingKeywords.map(k => (
                              <span key={k} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md border border-green-100">{k}</span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No matching keywords found.</span>
                          )}
                       </div>
                    </div>

                    <div>
                       <h4 className="text-xs font-bold text-red-700 uppercase mb-2 flex items-center gap-1"><AlertCircle size={12}/> Missing Keywords</h4>
                       <div className="flex flex-wrap gap-2">
                          {analysisResult.missingKeywords.length > 0 ? (
                             analysisResult.missingKeywords.map(k => (
                              <span key={k} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md border border-red-100">{k}</span>
                            ))
                          ) : (
                             <span className="text-xs text-slate-400 italic">Great job! No major keywords missing.</span>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Suggestions */}
                 {analysisResult.suggestions.length > 0 && (
                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">General Suggestions</h3>
                      <ul className="space-y-2">
                        {analysisResult.suggestions.map((s, i) => (
                           <li key={i} className="text-xs text-blue-800 flex gap-2">
                             <ArrowRight size={12} className="mt-0.5 shrink-0" />
                             {s}
                           </li>
                        ))}
                      </ul>
                   </div>
                 )}
               </div>
             )}
          </div>
        )}
      </div>

      {/* Version History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex justify-end" onClick={() => setIsHistoryOpen(false)}>
           <div className="w-full sm:w-80 bg-white h-full shadow-2xl p-4 flex flex-col animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={18} /> Version History</h3>
                 <button onClick={() => setIsHistoryOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3">
                 {!versions || versions.length === 0 ? (
                    <div className="text-center text-slate-400 py-10 text-sm">
                       No history available yet. <br/> Save your resume to create versions.
                    </div>
                 ) : (
                    versions.map((version) => (
                       <div key={version.id} className="p-3 border rounded-lg hover:bg-slate-50 transition-colors group">
                          <div className="flex justify-between items-start mb-1">
                             <span className="font-medium text-slate-800 text-sm">{version.note || 'Auto-save'}</span>
                             <span className="text-xs text-slate-400">{new Date(version.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <div className="text-xs text-slate-500 mb-2">
                             {new Date(version.timestamp).toLocaleDateString()}
                          </div>
                          {onRestoreVersion && (
                            <button 
                              onClick={() => { onRestoreVersion(version); setIsHistoryOpen(false); }}
                              className="w-full py-1.5 text-xs bg-white border border-blue-200 text-blue-600 rounded hover:bg-blue-50 flex items-center justify-center gap-1 font-medium"
                            >
                               <RotateCcw size={12} /> Restore this version
                            </button>
                          )}
                       </div>
                    ))
                 )}
              </div>

              {/* Explicit Close Button for Mobile/Ease of Use */}
              <div className="pt-4 border-t mt-2">
                 <button 
                   onClick={() => setIsHistoryOpen(false)}
                   className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                 >
                   Close History
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

// Properly typed Input component to avoid implicit any errors
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, value, onChange, className = '', placeholder = '', error }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`}
    />
    {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
  </div>
);

const TextArea = ({ label, value, onChange, rows = 3, placeholder = '' }: any) => (
  <div className="flex flex-col h-full">
    <div className="flex justify-between items-center mb-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    </div>
    <textarea 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
    />
  </div>
);

const Button = ({ children, onClick, className = '' }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-md hover:bg-blue-100 transition-colors text-sm ${className}`}
  >
    {children}
  </button>
);

export default Editor;