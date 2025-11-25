import React, { useState, useEffect } from 'react';
import { INITIAL_RESUME_STATE } from './constants';
import { ResumeData, TemplateType, KeywordAnalysis, ReviewResult, ResumeImprovement, UserProfile, ResumeProject } from './types';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { optimizeResumeWithJD, generateProfessionalSummary, analyzeResumeKeywords, refineSectionDescription, getResumeImprovements, parseResumeContent } from './services/geminiService';
import { FileText, Printer, Download, LayoutTemplate, X, Check, ChevronRight, Eye, Edit3, ArrowLeft, Upload, Save } from 'lucide-react';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where, setDoc, getDoc } from 'firebase/firestore';

const App: React.FC = () => {
  // View State
  const [view, setView] = useState<'auth' | 'dashboard' | 'editor'>('auth');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<ResumeProject[]>([]);
  const [currentProject, setCurrentProject] = useState<ResumeProject | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Resume State (for the active project)
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_STATE);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [template, setTemplate] = useState<TemplateType>(TemplateType.MODERN);
  
  // Logic State
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<KeywordAnalysis | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  
  // New Features State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Auth Listener
  useEffect(() => {
    if (!auth) {
      setIsLoadingAuth(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL
        });
        setView('dashboard');
        await fetchProjects(currentUser.uid);
      } else {
        setUser(null);
        setView('auth');
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Database Operations
  const fetchProjects = async (userId: string) => {
    if (!db) return;
    try {
      const q = query(collection(db, "resumes"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const loadedProjects: ResumeProject[] = [];
      querySnapshot.forEach((doc) => {
        loadedProjects.push({ id: doc.id, ...doc.data() } as ResumeProject);
      });
      // Sort by last modified descending
      loadedProjects.sort((a, b) => b.lastModified - a.lastModified);
      setProjects(loadedProjects);
    } catch (e) {
      console.error("Error fetching projects", e);
    }
  };

  const fetchMasterProfile = async (userId: string): Promise<ResumeData | null> => {
    if (!db) return null;
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().masterProfile) {
        return docSnap.data().masterProfile as ResumeData;
      }
    } catch (e) {
      console.error("Error fetching master profile", e);
    }
    return null;
  };

  const handleCreateProject = async () => {
    if (!user || !db) return;
    
    // Try to load master profile first
    const masterProfile = await fetchMasterProfile(user.uid);
    const initialData = masterProfile || INITIAL_RESUME_STATE;

    const newProject: Omit<ResumeProject, 'id'> = {
      userId: user.uid,
      title: "Untitled Resume",
      lastModified: Date.now(),
      data: initialData,
      template: TemplateType.MODERN
    };
    try {
      const docRef = await addDoc(collection(db, "resumes"), newProject);
      const createdProject = { id: docRef.id, ...newProject };
      setProjects([createdProject, ...projects]);
      openProject(createdProject);
    } catch (e) {
      console.error("Error creating project", e);
    }
  };

  const handleSaveProject = async () => {
    if (!currentProject || !db) return;
    const updatedProject = {
      ...currentProject,
      data: resumeData,
      template: template,
      lastModified: Date.now()
    };
    try {
      await updateDoc(doc(db, "resumes", currentProject.id), {
        data: resumeData,
        template: template,
        lastModified: Date.now()
      });
      setProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
      setCurrentProject(updatedProject); // Update current project state as well
    } catch (e) {
      console.error("Error saving project", e);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!db) return;
    if (confirm("Are you sure you want to delete this resume?")) {
      try {
        await deleteDoc(doc(db, "resumes", projectId));
        setProjects(projects.filter(p => p.id !== projectId));
      } catch (e) {
        console.error("Error deleting project", e);
      }
    }
  };

  const handleSaveToProfile = async () => {
    if (!user || !db) return;
    setIsSavingProfile(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        masterProfile: resumeData,
        lastUpdated: Date.now()
      }, { merge: true });
      alert("Profile updated! New resumes will now start with this data.");
    } catch (e) {
      console.error("Error saving master profile", e);
      alert("Failed to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const openProject = (project: ResumeProject) => {
    setCurrentProject(project);
    setResumeData(project.data);
    setTemplate(project.template);
    setJobDescription('');
    setAnalysisResult(null);
    setReviewResult(null);
    setView('editor');
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    setView('auth');
  };

  // --- Resume Logic ---

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resume-${resumeData.personalInfo.fullName.replace(/\s+/g, '_').toLowerCase() || 'draft'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOptimize = async () => {
    if (!jobDescription.trim()) return;
    
    setIsOptimizing(true);
    try {
      const optimizedData = await optimizeResumeWithJD(resumeData, jobDescription);
      setResumeData(optimizedData);
      handleSaveProject(); // Auto-save
      await handleAnalyzeJD(optimizedData);
    } catch (err) {
      console.error("Optimization failed", err);
      alert("Failed to optimize resume. Please check your API key.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAnalyzeJD = async (dataToAnalyze = resumeData) => {
    if (!jobDescription.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeResumeKeywords(dataToAnalyze, jobDescription);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Analysis failed", err);
      alert("Failed to analyze job description.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetImprovements = async () => {
    setIsReviewing(true);
    try {
      const result = await getResumeImprovements(resumeData, jobDescription);
      setReviewResult(result);
    } catch (err) {
      console.error("Review failed", err);
      alert("Failed to generate improvements.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleApplyImprovement = (imp: ResumeImprovement) => {
    setResumeData(prev => {
      const newData = { ...prev };
      
      if (imp.section === 'personalInfo') {
        newData.personalInfo = { ...newData.personalInfo, [imp.field]: imp.suggestion };
      } else if (imp.section === 'skills') {
        newData.skills = imp.suggestion.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        const list = newData[imp.section as keyof ResumeData];
        if (Array.isArray(list) && imp.itemId) {
           // @ts-ignore
           newData[imp.section] = list.map(item => 
             item.id === imp.itemId ? { ...item, [imp.field]: imp.suggestion } : item
           );
        }
      }
      return newData;
    });

    if (reviewResult) {
      setReviewResult({
        ...reviewResult,
        improvements: reviewResult.improvements.filter(i => i.id !== imp.id)
      });
    }
    handleSaveProject(); // Auto-save on fix
  };

  const handleGenerateSummary = async (jd?: string) => {
    setIsGeneratingSummary(true);
    try {
      const targetJd = typeof jd === 'string' ? jd : jobDescription;
      const summary = await generateProfessionalSummary(resumeData, targetJd);
      setResumeData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, summary }
      }));
    } catch (err) {
       console.error("Summary generation failed", err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleEnhanceDescription = async (id: string, section: 'experience' | 'projects' | 'awards') => {
    setEnhancingId(id);
    try {
      let item: any;
      if (section === 'experience') {
        item = resumeData.experience.find(e => e.id === id);
      } else if (section === 'projects') {
        item = resumeData.projects.find(p => p.id === id);
      } else {
        item = resumeData.awards.find(a => a.id === id);
      }

      if (!item) return;

      let title = '';
      let subtitle = '';

      if (section === 'experience') {
        title = item.position;
        subtitle = item.company;
      } else if (section === 'projects') {
        title = item.name;
        subtitle = item.technologies;
      } else {
        title = item.title;
        subtitle = item.issuer;
      }

      const context = `${title} from ${subtitle}`;
      const refinedText = await refineSectionDescription(item.description, context, jobDescription);

      setResumeData(prev => ({
        ...prev,
        [section]: prev[section].map((it: any) => it.id === id ? { ...it, description: refinedText } : it)
      }));

    } catch (err) {
      console.error("Enhancement failed", err);
    } finally {
      setEnhancingId(null);
    }
  };

  const handleImportData = async () => {
    if (!importText.trim()) return;
    setIsImporting(true);
    try {
      const newData = await parseResumeContent(importText);
      // Merge strategy: Overwrite
      setResumeData(newData);
      setIsImportModalOpen(false);
      setImportText('');
    } catch (e) {
      console.error(e);
      alert("Failed to parse text.");
    } finally {
      setIsImporting(false);
    }
  };

  // --- Render ---

  if (isLoadingAuth) {
    return <div className="h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }

  if (view === 'auth') {
    return <Login onLoginSuccess={(u) => { setUser(u); setView('dashboard'); fetchProjects(u.uid); }} />;
  }

  if (view === 'dashboard' && user) {
    return (
      <Dashboard 
        user={user} 
        projects={projects} 
        onLogout={handleLogout}
        onCreateProject={handleCreateProject}
        onOpenProject={openProject}
        onDeleteProject={handleDeleteProject}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-3 md:px-6 flex-shrink-0 z-10 relative shadow-md no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => { handleSaveProject(); setView('dashboard'); }} className="p-1.5 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-white">{currentProject?.title}</h1>
            <span className="text-[10px] text-slate-400">Last saved: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
           {/* Mobile View Toggle */}
           <div className="flex md:hidden bg-slate-700 rounded-lg p-1 border border-slate-600 mr-1">
              <button 
                onClick={() => setMobileView('editor')}
                className={`p-1.5 rounded-md transition-colors ${mobileView === 'editor' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400'}`}
                title="Edit Resume"
              >
                <Edit3 size={18} />
              </button>
              <button 
                onClick={() => setMobileView('preview')}
                className={`p-1.5 rounded-md transition-colors ${mobileView === 'preview' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400'}`}
                title="View Preview"
              >
                <Eye size={18} />
              </button>
           </div>

           {/* Template Selector Trigger */}
           <button 
             onClick={() => setIsTemplateModalOpen(true)}
             className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors group"
             title="Change Template"
           >
              <LayoutTemplate size={16} />
              <span className="hidden lg:inline">Template</span>
           </button>

           <div className="h-6 w-px bg-slate-700 mx-1 hidden md:block"></div>

           <button 
             onClick={handleDownloadJson}
             className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
             title="Save JSON"
           >
             <Download size={16} />
             <span className="hidden xl:inline">Save JSON</span>
           </button>

           <button 
             onClick={handlePrint}
             className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-white text-slate-900 text-sm font-medium rounded-lg transition-colors shadow-sm"
             title="Export PDF"
           >
             <Printer size={16} />
             <span className="hidden xl:inline">Export PDF</span>
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        {/* Left: Editor */}
        <div className={`w-full md:w-[450px] lg:w-[500px] flex-shrink-0 h-full overflow-hidden flex-col no-print bg-slate-100 z-0 border-r border-slate-200 
          ${mobileView === 'editor' ? 'flex' : 'hidden md:flex'}`}>
          <Editor 
            data={resumeData} 
            onChange={setResumeData} 
            jobDescription={jobDescription}
            onJobDescriptionChange={setJobDescription}
            onAutoGenerateSummary={handleGenerateSummary}
            onAnalyzeJD={() => handleAnalyzeJD()}
            onOptimize={handleOptimize}
            onEnhanceDescription={handleEnhanceDescription}
            onGetImprovements={handleGetImprovements}
            onApplyImprovement={handleApplyImprovement}
            analysisResult={analysisResult}
            reviewResult={reviewResult}
            isAnalyzing={isAnalyzing}
            isOptimizing={isOptimizing}
            isGeneratingSummary={isGeneratingSummary}
            isReviewing={isReviewing}
            enhancingId={enhancingId}
            onOpenImport={() => setIsImportModalOpen(true)}
            onSaveProfile={handleSaveToProfile}
            isSavingProfile={isSavingProfile}
          />
        </div>

        {/* Right: Preview */}
        <div className={`flex-1 bg-slate-800 overflow-y-auto overflow-x-hidden p-4 md:p-8 flex justify-center items-start print:p-0 print:bg-white print:w-full print:block print:overflow-visible
          ${mobileView === 'preview' ? 'flex' : 'hidden md:flex'}`}>
           <div 
             className="transform origin-top transition-transform duration-200 print:transform-none print:w-full print:absolute print:top-0 print:left-0 print:m-0
               scale-[0.35] min-[375px]:scale-[0.4] min-[425px]:scale-[0.45] sm:scale-[0.55] md:scale-[0.65] lg:scale-[0.75] xl:scale-[0.9] 2xl:scale-100"
           >
              <Preview data={resumeData} template={template} />
           </div>
        </div>
      </main>

      {/* Template Selection Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsTemplateModalOpen(false)}>
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Choose a Template</h2>
                <p className="text-sm text-slate-500">Select a layout that best fits your professional profile.</p>
              </div>
              <button 
                onClick={() => setIsTemplateModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-slate-50 grid grid-cols-1 md:grid-cols-4 gap-8">
              <TemplateOption 
                id={TemplateType.MODERN}
                name="Modern"
                description="Professional two-column layout with a sidebar. Ideal for tech, creative, and digital roles."
                isSelected={template === TemplateType.MODERN}
                onSelect={() => { setTemplate(TemplateType.MODERN); setIsTemplateModalOpen(false); }}
                preview={<ModernPreview />}
              />
              <TemplateOption 
                id={TemplateType.CLASSIC}
                name="Classic"
                description="Traditional single-column layout with serif typography. Best for academic, legal, and corporate roles."
                isSelected={template === TemplateType.CLASSIC}
                onSelect={() => { setTemplate(TemplateType.CLASSIC); setIsTemplateModalOpen(false); }}
                preview={<ClassicPreview />}
              />
              <TemplateOption 
                id={TemplateType.MINIMAL}
                name="Minimal"
                description="Clean, distraction-free design focusing purely on content. Great for senior roles and executives."
                isSelected={template === TemplateType.MINIMAL}
                onSelect={() => { setTemplate(TemplateType.MINIMAL); setIsTemplateModalOpen(false); }}
                preview={<MinimalPreview />}
              />
               <TemplateOption 
                id={TemplateType.TECH}
                name="Tech"
                description="Dense, high-information density layout modeled after 'Deedy/Harshibar'. Perfect for Software Engineers."
                isSelected={template === TemplateType.TECH}
                onSelect={() => { setTemplate(TemplateType.TECH); setIsTemplateModalOpen(false); }}
                preview={<TechPreview />}
              />
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsImportModalOpen(false)}>
          <div 
             className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
             onClick={e => e.stopPropagation()}
          >
             <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                   <Upload size={18} className="text-blue-600"/> Import Data
                </h3>
                <button onClick={() => setIsImportModalOpen(false)}><X size={20}/></button>
             </div>
             <div className="p-6 bg-slate-50 overflow-y-auto">
                <p className="text-sm text-slate-600 mb-4">
                  Paste your LinkedIn "About" section, Experience, or raw text from an old resume here. 
                  Our AI will parse and format it into the builder automatically.
                </p>
                <textarea 
                  className="w-full h-64 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm mb-4"
                  placeholder="Paste text here..."
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                ></textarea>
                <div className="flex justify-end gap-3">
                   <button 
                     onClick={() => setIsImportModalOpen(false)}
                     className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-md font-medium"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleImportData}
                     disabled={isImporting || !importText.trim()}
                     className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                   >
                     {isImporting ? <span className="animate-spin">⏳</span> : <Upload size={16} />}
                     Parse & Import
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ... (Sub-components remain unchanged) ...
const TemplateOption = ({ id, name, description, isSelected, onSelect, preview }: any) => (
  <button 
    onClick={onSelect}
    className={`relative group flex flex-col items-stretch text-left rounded-xl transition-all duration-200 outline-none
      ${isSelected 
        ? 'ring-2 ring-blue-600 shadow-xl scale-[1.02] bg-white' 
        : 'hover:shadow-lg hover:-translate-y-1 bg-white border border-slate-200'
      }`}
  >
    <div className="h-48 bg-slate-100 rounded-t-xl overflow-hidden border-b border-slate-100 relative">
       <div className="w-full h-full transform scale-[0.8] origin-center flex items-center justify-center pointer-events-none select-none">
          {preview}
       </div>
       {isSelected && (
         <div className="absolute top-3 right-3 bg-blue-600 text-white p-1 rounded-full shadow-lg z-10">
           <Check size={16} />
         </div>
       )}
    </div>
    <div className="p-5 flex-1 flex flex-col">
      <h3 className={`font-bold text-lg mb-2 ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
        {name}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
        {description}
      </p>
      <div className={`text-sm font-medium flex items-center gap-1 ${isSelected ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`}>
        {isSelected ? 'Selected' : 'Select Template'} 
        {!isSelected && <ChevronRight size={14} />}
      </div>
    </div>
  </button>
);

const ModernPreview = () => (
  <div className="w-40 h-56 bg-white shadow-sm flex flex-row border border-slate-200 text-[2px]">
    <div className="w-1/3 bg-slate-800 h-full p-2 flex flex-col gap-2">
      <div className="w-8 h-8 rounded-full bg-slate-600/50 mx-auto"></div>
      <div className="w-full h-1 bg-slate-600/50 rounded"></div>
      <div className="w-full h-1 bg-slate-600/50 rounded"></div>
      <div className="mt-4 w-full h-1 bg-slate-600/30 rounded"></div>
      <div className="w-2/3 h-1 bg-slate-600/30 rounded"></div>
    </div>
    <div className="w-2/3 h-full p-2 flex flex-col gap-2">
      <div className="w-1/2 h-2 bg-slate-200 rounded mb-2"></div>
      <div className="w-full h-1 bg-slate-100 rounded"></div>
      <div className="w-full h-1 bg-slate-100 rounded"></div>
      <div className="w-full h-1 bg-slate-100 rounded"></div>
      <div className="w-5/6 h-1 bg-slate-100 rounded"></div>
      <div className="mt-2 w-1/3 h-1.5 bg-slate-200 rounded"></div>
      <div className="w-full h-1 bg-slate-100 rounded"></div>
      <div className="w-full h-1 bg-slate-100 rounded"></div>
    </div>
  </div>
);

const ClassicPreview = () => (
  <div className="w-40 h-56 bg-white shadow-sm flex flex-col p-3 items-center border border-slate-200 text-[2px]">
    <div className="w-1/2 h-2 bg-slate-800 rounded mb-1"></div>
    <div className="w-3/4 h-1 bg-slate-400 rounded mb-2"></div>
    <div className="w-full h-px bg-slate-300 mb-3"></div>
    <div className="w-full flex flex-col gap-1.5 items-start">
      <div className="w-1/4 h-1.5 bg-slate-300 rounded mb-0.5"></div>
      <div className="w-full h-1 bg-slate-100 rounded"></div>
      <div className="w-full h-1 bg-slate-100 rounded"></div>
      <div className="w-full h-1 bg-slate-100 rounded"></div>
    </div>
    <div className="w-full flex flex-col gap-1.5 items-start mt-3">
      <div className="w-1/4 h-1.5 bg-slate-300 rounded mb-0.5"></div>
      <div className="w-full h-1 bg-slate-100 rounded"></div>
      <div className="w-full h-1 bg-slate-100 rounded"></div>
    </div>
  </div>
);

const MinimalPreview = () => (
  <div className="w-40 h-56 bg-white shadow-sm flex flex-col p-4 border border-slate-200 text-[2px]">
    <div className="w-2/3 h-3 bg-slate-900 rounded mb-1"></div>
    <div className="w-1/2 h-1 bg-slate-400 rounded mb-4"></div>
    
    <div className="w-full flex flex-col gap-1.5 mb-3">
      <div className="w-1/5 h-1.5 bg-slate-300 rounded"></div>
      <div className="w-full h-1 bg-slate-100 rounded"></div>
      <div className="w-5/6 h-1 bg-slate-100 rounded"></div>
    </div>
    
    <div className="w-full flex flex-col gap-1.5">
      <div className="w-1/5 h-1.5 bg-slate-300 rounded"></div>
      <div className="w-full h-1 bg-slate-100 rounded"></div>
      <div className="w-5/6 h-1 bg-slate-100 rounded"></div>
    </div>
  </div>
);

const TechPreview = () => (
  <div className="w-40 h-56 bg-white shadow-sm flex flex-col p-3 border border-slate-200 text-[2px]">
    <div className="w-full text-center mb-2">
       <div className="w-1/2 h-2 bg-slate-900 mx-auto rounded"></div>
       <div className="w-1/3 h-1 bg-slate-400 mx-auto rounded mt-1"></div>
    </div>
    
    <div className="w-full border-t border-slate-200 pt-1 mb-1">
       <div className="w-1/4 h-1.5 bg-slate-800 mb-1"></div>
       <div className="flex justify-between mb-0.5">
          <div className="w-1/3 h-1 bg-slate-700"></div>
          <div className="w-1/4 h-1 bg-slate-400"></div>
       </div>
       <div className="w-full h-0.5 bg-slate-100 mb-0.5"></div>
       <div className="w-full h-0.5 bg-slate-100 mb-0.5"></div>
    </div>

     <div className="w-full pt-1 mb-1">
       <div className="w-1/4 h-1.5 bg-slate-800 mb-1"></div>
       <div className="flex justify-between mb-0.5">
          <div className="w-1/3 h-1 bg-slate-700"></div>
          <div className="w-1/4 h-1 bg-slate-400"></div>
       </div>
       <div className="w-full h-0.5 bg-slate-100 mb-0.5"></div>
    </div>
  </div>
);

export default App;