import React, { useState } from 'react';
import { X, Upload, FileText as FileTextIcon, Link } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (source: { type: 'text' | 'pdf' | 'url', value: string }) => Promise<void>;
  isImporting: boolean;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport, isImporting }) => {
  const [importMode, setImportMode] = useState<'pdf' | 'link'>('pdf');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importUrl, setImportUrl] = useState('');

  if (!isOpen) return null;

  // Helper to read file as base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImportSubmit = async () => {
    try {
      let source: { type: 'text' | 'pdf' | 'url', value: string } | null = null;
      
      if (importMode === 'pdf' && importFile) {
        const base64 = await fileToBase64(importFile);
        source = { type: 'pdf', value: base64 };
      } else if (importMode === 'link' && importUrl) {
        source = { type: 'url', value: importUrl };
      }

      if (source) {
        await onImport(source);
        // Reset state after successful import
        setImportFile(null);
        setImportUrl('');
      }
    } catch (e) {
      console.error(e);
      alert("Failed to process import. Please check your file or URL.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
         className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
         onClick={e => e.stopPropagation()}
      >
         <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
               <Upload size={18} className="text-blue-600"/> Import Career Profile
            </h3>
            <button onClick={onClose}><X size={20}/></button>
         </div>
         
         <div className="p-6 bg-slate-50">
            {/* Tabs for Import Type */}
            <div className="flex p-1 bg-slate-200 rounded-lg mb-6">
               <button 
                 onClick={() => setImportMode('pdf')}
                 className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${importMode === 'pdf' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <FileTextIcon size={16} /> Upload PDF
               </button>
               <button 
                 onClick={() => setImportMode('link')}
                 className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${importMode === 'link' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <Link size={16} /> LinkedIn URL
               </button>
            </div>

            {importMode === 'pdf' ? (
               <div 
                 className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer mb-6 ${importFile ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-100'}`}
                 onDragOver={(e) => e.preventDefault()}
                 onDrop={(e) => {
                    e.preventDefault();
                    if(e.dataTransfer.files?.[0]?.type === 'application/pdf') {
                       setImportFile(e.dataTransfer.files[0]);
                    } else {
                       alert("Please upload a PDF file.");
                    }
                 }}
                 onClick={() => document.getElementById('import-file-upload')?.click()}
               >
                 <input 
                   type="file" 
                   id="import-file-upload" 
                   className="hidden" 
                   accept="application/pdf"
                   onChange={(e) => {
                      if(e.target.files?.[0]) setImportFile(e.target.files[0]);
                   }}
                 />
                 {importFile ? (
                    <>
                       <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                          <FileTextIcon size={24} />
                       </div>
                       <p className="font-semibold text-slate-900 text-sm">{importFile.name}</p>
                       <p className="text-xs text-slate-500 mt-1">{(importFile.size / 1024 / 1024).toFixed(2)} MB</p>
                       <button onClick={(e) => { e.stopPropagation(); setImportFile(null); }} className="text-xs text-red-500 mt-2 hover:underline">Remove</button>
                    </>
                 ) : (
                    <>
                       <Upload size={32} className="text-slate-400 mb-3" />
                       <p className="text-sm font-medium text-slate-700">Click to upload or drag PDF</p>
                       <p className="text-xs text-slate-400 mt-1">Previous resume or LinkedIn PDF export</p>
                    </>
                 )}
               </div>
            ) : (
               <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Public Profile Link</label>
                  <input 
                    type="url" 
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Note: Works best with public profiles. For private profiles, please use the "Upload PDF" option using the "Save to PDF" feature on LinkedIn.
                  </p>
               </div>
            )}
            
            <div className="flex justify-end gap-3">
               <button 
                 onClick={onClose}
                 className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-md font-medium text-sm"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleImportSubmit}
                 disabled={isImporting || (importMode === 'pdf' && !importFile) || (importMode === 'link' && !importUrl)}
                 className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm"
               >
                 {isImporting ? <span className="animate-spin">⏳</span> : <Upload size={16} />}
                 Import Data
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ImportModal;