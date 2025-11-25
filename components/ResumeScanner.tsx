import React, { useState } from 'react';
import { X, Upload, Sparkles, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { scanResumeText } from '../services/geminiService';
import { ReviewResult } from '../types';

interface ResumeScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResumeScanner: React.FC<ResumeScannerProps> = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);

  if (!isOpen) return null;

  const handleScan = async () => {
    if (!text.trim()) return;
    setIsScanning(true);
    try {
      const res = await scanResumeText(text);
      setResult(res);
    } catch (e) {
      console.error(e);
      alert("Failed to scan resume.");
    } finally {
      setIsScanning(false);
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
              <h2 className="text-lg font-bold text-slate-900">AI Resume Scanner</h2>
              <p className="text-xs text-slate-500">Get an instant ATS score for your current resume.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {!result ? (
            <div className="space-y-4">
               <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 text-blue-800 text-sm">
                 <AlertCircle size={20} className="shrink-0" />
                 <p>For best results, copy and paste the raw text content of your resume below. PDF parsing is currently experimental.</p>
               </div>
               
               <textarea
                 className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none font-mono text-xs"
                 placeholder="Paste your resume text here..."
                 value={text}
                 onChange={(e) => setText(e.target.value)}
               ></textarea>

               <button
                 onClick={handleScan}
                 disabled={isScanning || !text.trim()}
                 className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold shadow-md hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {isScanning ? (
                   <>
                     <span className="animate-spin">⏳</span> Scanning...
                   </>
                 ) : (
                   <>
                     <Upload size={18} /> Generate Score
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
                    <h3 className="text-xl font-bold text-slate-900 mb-1">ATS Compatibility Score</h3>
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
                onClick={() => setResult(null)}
                className="w-full py-2 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Scan Another Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeScanner;