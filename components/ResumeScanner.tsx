import React, { useState } from 'react';
import { X, Upload, Sparkles, AlertCircle, CheckCircle, FileText, FileUp } from 'lucide-react';
import { scanResumeContent } from '../services/geminiService';
import { ReviewResult } from '../types';

interface ResumeScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResumeScanner: React.FC<ResumeScannerProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);

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

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await scanResumeContent({ type: 'pdf', value: base64 });
      setResult(res);
    } catch (e) {
      console.error(e);
      alert("Failed to scan resume.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       const droppedFile = e.dataTransfer.files[0];
       if(droppedFile.type === 'application/pdf') {
          setFile(droppedFile);
       } else {
         alert("Please upload a PDF file.");
       }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Resume Auditor</h2>
              <p className="text-xs text-slate-500">Upload your existing resume (PDF) for a professional ATS audit.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {!result ? (
            <div className="space-y-6">
               <div 
                 className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${file ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:border-purple-400 hover:bg-slate-100'}`}
                 onDragOver={(e) => e.preventDefault()}
                 onDrop={handleDrop}
                 onClick={() => document.getElementById('resume-upload')?.click()}
               >
                 <input 
                   type="file" 
                   id="resume-upload" 
                   className="hidden" 
                   accept="application/pdf"
                   onChange={(e) => {
                      if(e.target.files?.[0]) setFile(e.target.files[0]);
                   }}
                 />
                 
                 {file ? (
                   <>
                     <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                        <FileText size={32} />
                     </div>
                     <p className="font-semibold text-slate-900">{file.name}</p>
                     <p className="text-sm text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                     <button 
                       onClick={(e) => { e.stopPropagation(); setFile(null); }}
                       className="mt-4 text-xs text-red-500 hover:underline"
                     >
                       Remove file
                     </button>
                   </>
                 ) : (
                   <>
                     <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                        <FileUp size={32} />
                     </div>
                     <p className="font-semibold text-slate-700">Click to upload or drag and drop</p>
                     <p className="text-sm text-slate-500 mt-1">PDF files only (Max 10MB)</p>
                   </>
                 )}
               </div>

               <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 text-blue-800 text-sm">
                 <AlertCircle size={20} className="shrink-0" />
                 <p>Our AI analyzes formatting, keyword density, and impact metrics to give you a real ATS score.</p>
               </div>
               
               <button
                 onClick={handleScan}
                 disabled={isScanning || !file}
                 className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold shadow-md hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {isScanning ? (
                   <>
                     <span className="animate-spin">⏳</span> Auditing Resume...
                   </>
                 ) : (
                   <>
                     <Upload size={18} /> Generate Audit Report
                   </>
                 )}
               </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {/* Score Card */}
              <div className="flex items-center gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                      <circle 
                        cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        className={result.score >= 80 ? "text-green-500" : result.score >= 50 ? "text-yellow-500" : "text-red-500"}
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * result.score) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-2xl font-bold text-slate-800">{result.score}</span>
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Audit Score</h3>
                    <p className="text-slate-600 text-sm">{result.summary}</p>
                 </div>
              </div>

              {/* Improvements */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Critical Improvements</h3>
                {result.improvements.length > 0 ? (
                  <div className="space-y-3">
                    {result.improvements.map((imp, i) => (
                      <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex gap-2 items-start mb-2">
                           <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                           <span className="text-sm font-semibold text-slate-700">{imp.issue}</span>
                        </div>
                        <div className="ml-6 bg-green-50 text-green-800 text-sm p-2 rounded border border-green-100">
                           "{imp.suggestion}"
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-50 p-6 rounded-lg text-center border border-green-100">
                     <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                     <p className="text-green-800 font-medium">Excellent work! No critical issues found.</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => { setResult(null); setFile(null); }}
                className="w-full py-2 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Audit Another Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeScanner;