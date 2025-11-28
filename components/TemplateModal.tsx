import React from 'react';
import { X, Check, ChevronRight } from 'lucide-react';
import { TemplateType, ResumeData } from '../types';
import Preview from './Preview';
import { INITIAL_RESUME_STATE } from '../constants'; // Use initial state for preview if needed, or pass dummy data

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: TemplateType;
  onSelect: (template: TemplateType) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, currentTemplate, onSelect }) => {
  if (!isOpen) return null;
  
  // We use dummy data for the previews in the modal to ensure they look populated
  const previewData = INITIAL_RESUME_STATE;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
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
            onClick={onClose} 
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
            isSelected={currentTemplate === TemplateType.MODERN}
            onSelect={() => onSelect(TemplateType.MODERN)}
            preview={<ModernPreview />}
          />
          <TemplateOption 
            id={TemplateType.CLASSIC}
            name="Classic"
            description="Traditional single-column layout with serif typography. Best for academic, legal, and corporate roles."
            isSelected={currentTemplate === TemplateType.CLASSIC}
            onSelect={() => onSelect(TemplateType.CLASSIC)}
            preview={<ClassicPreview />}
          />
          <TemplateOption 
            id={TemplateType.MINIMAL}
            name="Minimal"
            description="Clean, distraction-free design focusing purely on content. Great for senior roles and executives."
            isSelected={currentTemplate === TemplateType.MINIMAL}
            onSelect={() => onSelect(TemplateType.MINIMAL)}
            preview={<MinimalPreview />}
          />
           <TemplateOption 
            id={TemplateType.TECH}
            name="Tech"
            description="Dense, high-information density layout modeled after 'Deedy/Harshibar'. Perfect for Software Engineers."
            isSelected={currentTemplate === TemplateType.TECH}
            onSelect={() => onSelect(TemplateType.TECH)}
            preview={<TechPreview />}
          />
        </div>
      </div>
    </div>
  );
};

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

// Preview components kept here as they are specific to selection visualization
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

export default TemplateModal;