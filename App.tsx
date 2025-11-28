import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_RESUME_STATE, RESUME_TIPS } from './constants';
import { ResumeData, TemplateType, KeywordAnalysis, ReviewResult, ResumeImprovement, UserProfile, ResumeProject, ResumeVersion } from './types';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ImportModal from './components/ImportModal';
import TemplateModal from './components/TemplateModal';
import { optimizeResumeWithJD, generateProfessionalSummary, analyzeResumeKeywords, refineSectionDescription, getResumeImprovements, extractDataFromSource } from './services/geminiService';
import { Printer, LayoutTemplate, Eye, Edit3, ArrowLeft, Save, PenLine, Cloud } from 'lucide-react';
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
  
  // Modal States
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  
  // New Features State
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dailyTip, setDailyTip] = useState('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  // Edit Title State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auth Listener
  useEffect(() => {
    // Set a random tip on load
    const randomTip = RESUME_TIPS[Math.floor(Math.random() * RESUME_TIPS.length)];
    setDailyTip(randomTip);

    // Guard: If auth failed to initialize (e.g. bad config), stop loading
    if (!auth) {
      console.warn("Firebase Auth not initialized");
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
        await fetchProjects(currentUser.uid, false);
      } else {
        setUser(null);
        setView('auth');
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Autosave Effect
  useEffect(() => {
    if (!currentProject) return;
    
    // Avoid saving if data hasn't changed from last saved state
    if (JSON.stringify(resumeData) === JSON.stringify(currentProject.data)) return;

    setIsAutoSaving(true);
    const timer = setTimeout(async () => {
        await handleSaveProject(false);
        setIsAutoSaving(false);
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(timer);
  }, [resumeData]);

  // Database Operations (Abstracted for Guest/Auth)
  const fetchProjects = async (userId: string, isGuest: boolean = false) => {
    if (isGuest) {
      // Guest Mode: Load from LocalStorage
      try {
        const stored = localStorage.getItem('guest_projects');
        if (stored) {
          setProjects(JSON.parse(stored));
        } else {
          setProjects([]);
        }
      } catch (e) {
        console.error("Error loading guest projects", e);
        setProjects([]);
      }
      return;
    }

    // Auth Mode: Load from Firestore
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

  const fetchMasterProfile = async (userId: string, isGuest: boolean = false): Promise<ResumeData | null> => {
    if (isGuest) {
       const stored = localStorage.getItem('guest_master_profile');
       return stored ? JSON.parse(stored) : null;
    }

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
    if (!user) return;
    
    // Try to load master profile first
    const masterProfile = await fetchMasterProfile(user.uid, user.isGuest);
    const initialData = masterProfile || INITIAL_RESUME_STATE;

    const newProjectData: Omit<ResumeProject, 'id'> = {
      userId: user.uid,
      title: "Untitled Resume",
      lastModified: Date.now(),
      data: initialData,
      template: TemplateType.MODERN,
      versions: [],
      scoreHistory: []
    };

    if (user.isGuest) {
      const createdProject = { id: 'guest-proj-' + Date.now(), ...newProjectData };
      const updatedProjects = [createdProject, ...projects];
      setProjects(updatedProjects);
      localStorage.setItem('guest_projects', JSON.stringify(updatedProjects));
      openProject(createdProject);
      return;
    }

    if (!db) return;
    try {
      const docRef = await addDoc(collection(db, "resumes"), newProjectData);
      const createdProject = { id: docRef.id, ...newProjectData };
      setProjects([createdProject, ...projects]);
      openProject(createdProject);
    } catch (e) {
      console.error("Error creating project", e);
    }
  };

  const handleSaveProject = async (createVersion = false) => {
    if (!currentProject || !user) return;
    
    let updatedVersions = currentProject.versions || [];
    
    // Always create version if requested (e.g., explicit Save button click)
    if (createVersion) {
      const newVersion: ResumeVersion = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        data: JSON.parse(JSON.stringify(resumeData)), // Deep copy
        note: `Version ${updatedVersions.length + 1}`
      };
      // Keep last 15 versions to avoid bloat
      updatedVersions = [newVersion, ...updatedVersions].slice(0, 15);
    }

    const updatedProject: ResumeProject = {
      ...currentProject,
      data: resumeData,
      template: template,
      lastModified: Date.now(),
      versions: updatedVersions,
      // scoreHistory is preserved or updated separately
      scoreHistory: currentProject.scoreHistory || [] 
    };

    // Optimistic UI update
    const updatedProjectsList = projects.map(p => p.id === currentProject.id ? updatedProject : p);
    setProjects(updatedProjectsList);
    setCurrentProject(updatedProject);

    if (user.isGuest) {
      localStorage.setItem('guest_projects', JSON.stringify(updatedProjectsList));
      return;
    }

    if (!db) return;
    try {
      await updateDoc(doc(db, "resumes", currentProject.id), {
        data: resumeData,
        template: template,
        lastModified: Date.now(),
        versions: updatedVersions,
        scoreHistory: updatedProject.scoreHistory
      });
    } catch (e) {
      console.error("Error saving project", e);
    }
  };

  const handleRestoreVersion = (version: ResumeVersion) => {
    if(confirm(`Are you sure you want to restore the version from ${new Date(version.timestamp).toLocaleString()}? Current unsaved changes will be lost.`)) {
       setResumeData(version.data);
    }
  };
  
  const handleUpdateTitle = async () => {
    if(!currentProject || !tempTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }
    const updatedProject = { ...currentProject, title: tempTitle };
    setCurrentProject(updatedProject);
    setIsEditingTitle(false);
    
    // Trigger save
    if (user?.isGuest) {
        const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
        setProjects(updatedProjects);
        localStorage.setItem('guest_projects', JSON.stringify(updatedProjects));
    } else if (db) {
         try {
           await updateDoc(doc(db, "resumes", updatedProject.id), { title: tempTitle });
           setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
         } catch(e) { console.error(e); }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this resume?")) {
      
      const filteredProjects = projects.filter(p => p.id !== projectId);
      
      if (user.isGuest) {
        setProjects(filteredProjects);
        localStorage.setItem('guest_projects', JSON.stringify(filteredProjects));
        return;
      }

      if (!db) return;
      try {
        await deleteDoc(doc(db, "resumes", projectId));
        setProjects(filteredProjects);
      } catch (e) {
        console.error("Error deleting project", e);
      }
    }
  };

  const handleSaveToProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);

    if (user.isGuest) {
       localStorage.setItem('guest_master_profile', JSON.stringify(resumeData));
       alert("Profile saved to browser! New guest resumes will start with this data.");
       setIsSavingProfile(false);
       return;
    }

    if (!db) return;
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
    if (user?.isGuest) {
       setUser(null);
       setView('auth');
       return;
    }
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    setView('auth');
  };

  const handleGuestLogin = (guestUser: UserProfile) => {
    setUser(guestUser);
    setView('dashboard');
    fetchProjects(guestUser.uid, true);
  };

  // --- Resume Logic ---

  const handlePrint = () => {
    window.print();
  };

  const handleOptimize = async () => {
    if (!jobDescription.trim()) return;
    
    setIsOptimizing(true);
    try {
      const optimizedData = await optimizeResumeWithJD(resumeData, jobDescription);
      setResumeData(optimizedData);
      handleSaveProject(true); // Auto-save with version on major change
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

      // Save Score History
      if (currentProject) {
        const newScoreRecord = { timestamp: Date.now(), score: result.score };
        const updatedHistory = [...(currentProject.scoreHistory || []), newScoreRecord];
        
        const updatedProject = { ...currentProject, scoreHistory: updatedHistory };
        setCurrentProject(updatedProject);
        
        // Persist
        if (user?.isGuest) {
           const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
           setProjects(updatedProjects);
           localStorage.setItem('guest_projects', JSON.stringify(updatedProjects));
        } else if (db && user) {
           await updateDoc(doc(db, "resumes", currentProject.id), { scoreHistory: updatedHistory });
        }
      }

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
    // Auto-save handles the save
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

  const handleImportSubmit = async (source: { type: 'text' | 'pdf' | 'url', value: string }) => {
    setIsImporting(true);
    try {
      const newData = await extractDataFromSource(source);
      setResumeData(newData);
      setIsImportModalOpen(false);
      // Save version on import
      handleSaveProject(true);
    } catch (e) {
      console.error(e);
      alert("Failed to parse data. The AI response might have been incomplete or invalid.");
    } finally {
      setIsImporting(false);
    }
  };

  // --- Render ---

  if (isLoadingAuth) {
    return <div className="h-[100dvh] flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
  }

  if (view === 'auth') {
    return <Login onLoginSuccess={handleGuestLogin} />;
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
        dailyTip={dailyTip}
      />
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-3 md:px-6 flex-shrink-0 z-10 relative shadow-md no-print">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <button onClick={() => { handleSaveProject(); setView('dashboard'); }} className="p-1.5 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors shrink-0">
            <ArrowLeft size={20} />
          </button>
          
          {/* Editable Project Title */}
          <div className="flex flex-col min-w-0">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                className="bg-slate-700 text-white px-2 py-0.5 rounded text-sm font-bold border border-blue-500 focus:outline-none w-full max-w-[200px]"
                autoFocus
              />
            ) : (
              <div 
                className="group flex items-center gap-2 cursor-pointer" 
                onClick={() => { setTempTitle(currentProject?.title || ''); setIsEditingTitle(true); }}
              >
                <h1 className="text-sm font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors truncate">
                   {currentProject?.title}
                </h1>
                <PenLine size={12} className="text-slate-500 group-hover:text-blue-400 shrink-0" />
              </div>
            )}
            <span className="text-[10px] text-slate-400 flex items-center gap-1 min-w-[100px]">
               {isAutoSaving ? (
                 <span className="text-blue-400 flex items-center gap-1 animate-pulse"><Cloud size={10} /> Saving...</span>
               ) : (
                 <span className="flex items-center gap-1 truncate">
                   {user?.isGuest ? 'Guest' : 'Cloud'} <span className="hidden sm:inline">• Last saved: {currentProject?.lastModified ? new Date(currentProject.lastModified).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                 </span>
               )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
           
            {/* Explicit Save Button - Triggers Version Creation */}
           <button 
             onClick={() => handleSaveProject(true)}
             className="flex items-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
             title="Save Progress"
           >
             <Save size={16} />
             <span className="hidden xl:inline">Save</span>
           </button>

           <button 
             onClick={handlePrint}
             className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-white text-slate-900 text-sm font-medium rounded-lg transition-colors shadow-sm hidden sm:flex"
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
            versions={currentProject?.versions}
            onRestoreVersion={handleRestoreVersion}
            previousScore={currentProject?.scoreHistory && currentProject.scoreHistory.length > 1 ? currentProject.scoreHistory[currentProject.scoreHistory.length - 1].score : undefined}
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
      <TemplateModal 
        isOpen={isTemplateModalOpen} 
        onClose={() => setIsTemplateModalOpen(false)} 
        currentTemplate={template} 
        onSelect={(t) => { setTemplate(t); setIsTemplateModalOpen(false); }} 
      />

      {/* Import Modal */}
      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={handleImportSubmit} 
        isImporting={isImporting} 
      />
    </div>
  );
};

export default App;