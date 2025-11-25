import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import { Sparkles, FileText, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  
  // Check if config is likely default/invalid
  const isConfigValid = auth && auth.app.options.apiKey && auth.app.options.apiKey !== "YOUR_API_KEY_HERE";

  const handleGoogleLogin = async () => {
    setError(null);
    if (!auth || !isConfigValid) {
      setError("Firebase is not configured. Please update firebaseConfig.ts with your project keys.");
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLoginSuccess(result.user);
    } catch (err: any) {
      console.error("Login failed", err);
      // Format the error message to be helpful
      let errorMessage = err.message;
      if (err.code === 'auth/unauthorized-domain') {
        errorMessage = "Domain not authorized. Go to Firebase Console -> Authentication -> Settings -> Authorized Domains and add 'localhost' or your current domain.";
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = "Google Sign-In is disabled. Go to Firebase Console -> Authentication -> Sign-in method and enable 'Google'.";
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in cancelled.";
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl max-w-md w-full z-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-3 rounded-xl shadow-lg">
            <FileText size={40} className="text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">ATS Resume AI</h1>
        <p className="text-slate-300 mb-8">
          Build ATS-friendly resumes tailored to job descriptions in seconds with Gemini AI.
        </p>

        {/* Configuration Warning */}
        {!isConfigValid && (
           <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-4 mb-6 text-left">
             <div className="flex items-center gap-2 text-orange-400 font-bold mb-1">
                <AlertTriangle size={18} /> Configuration Required
             </div>
             <p className="text-xs text-orange-200">
               Please edit <code>firebaseConfig.ts</code> with your project keys.
             </p>
           </div>
        )}

        {/* Error Display */}
        {error && (
           <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 text-left animate-in fade-in slide-in-from-top-2">
             <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                <XCircle size={18} /> Login Error
             </div>
             <p className="text-xs text-red-200 leading-relaxed">
               {error}
             </p>
           </div>
        )}

        <ul className="text-left space-y-3 mb-8 text-slate-300 text-sm">
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> AI-Powered Resume Scoring</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Tailored Content for Job Descriptions</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Modern, Printable Templates</li>
        </ul>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={!isConfigValid}
            className="w-full bg-white text-slate-900 font-semibold py-3 px-6 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-3 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>
          
          <button 
            className="w-full bg-[#0077b5] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#006399] transition-colors flex items-center justify-center gap-3 shadow-md opacity-70 cursor-not-allowed"
            title="Linkedin Auth requires backend setup, unavailable in demo"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            Sign in with LinkedIn
          </button>
        </div>
        
        <p className="mt-6 text-xs text-slate-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;