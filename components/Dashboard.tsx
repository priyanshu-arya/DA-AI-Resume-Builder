import React, { useState } from 'react';
import { UserProfile, ResumeProject } from '../types';
import { Plus, FileText, Trash2, Edit3, LogOut, Search, Clock, MoreVertical, Layout, Upload } from 'lucide-react';
import ResumeScanner from './ResumeScanner';

interface DashboardProps {
  user: UserProfile;
  projects: ResumeProject[];
  onLogout: () => void;
  onCreateProject: () => void;
  onOpenProject: (project: ResumeProject) => void;
  onDeleteProject: (projectId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  projects, 
  onLogout, 
  onCreateProject, 
  onOpenProject,
  onDeleteProject 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
         <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full rounded-full" />
                  ) : (
                    user.displayName?.charAt(0) || 'U'
                  )}
               </div>
               <div className="overflow-hidden">
                  <h3 className="text-white font-semibold truncate">{user.displayName}</h3>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
               </div>
            </div>
            
            <button 
              onClick={onCreateProject}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
               <Plus size={18} /> New Resume
            </button>
         </div>

         <nav className="flex-1 p-4 space-y-1">
            <button className="w-full text-left px-4 py-2 rounded-md bg-slate-800 text-white font-medium flex items-center gap-3">
               <Layout size={18} /> All Projects
            </button>
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="w-full text-left px-4 py-2 rounded-md hover:bg-slate-800/50 transition-colors flex items-center gap-3"
            >
               <Upload size={18} /> Score Uploaded Resume
            </button>
         </nav>

         <div className="p-4 border-t border-slate-800">
            <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm px-4">
               <LogOut size={16} /> Sign Out
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
         
         <div className="max-w-6xl mx-auto">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
               <h1 className="text-2xl font-bold text-slate-800">All Projects</h1>
               <div className="relative w-full md:w-80">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search projects..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            {/* Project List */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
               {/* Table Header */}
               <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wide">
                  <div className="col-span-8 md:col-span-6">Title</div>
                  <div className="hidden md:block col-span-3">Owner</div>
                  <div className="col-span-4 md:col-span-3 text-right pr-4">Last Modified</div>
               </div>

               {/* Table Body */}
               {filteredProjects.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                     <FileText size={48} className="mx-auto mb-4 opacity-20" />
                     <p>No projects found. Create one to get started!</p>
                  </div>
               ) : (
                  <div>
                     {filteredProjects.map((project) => (
                        <div key={project.id} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 items-center hover:bg-slate-50 transition-colors group">
                           <div className="col-span-8 md:col-span-6 flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                 <FileText size={16} />
                              </div>
                              <div className="truncate font-medium text-slate-800 cursor-pointer hover:text-blue-600" onClick={() => onOpenProject(project)}>
                                 {project.title}
                              </div>
                           </div>
                           <div className="hidden md:block col-span-3 text-sm text-slate-500">
                              You
                           </div>
                           <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-4">
                              <span className="text-sm text-slate-500 hidden sm:block">
                                 {new Date(project.lastModified).toLocaleDateString()}
                              </span>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => onOpenProject(project)}
                                   className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                   title="Edit"
                                 >
                                    <Edit3 size={16} />
                                 </button>
                                 <button 
                                   onClick={() => onDeleteProject(project.id)}
                                   className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                   title="Delete"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </main>

      <ResumeScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
};

export default Dashboard;