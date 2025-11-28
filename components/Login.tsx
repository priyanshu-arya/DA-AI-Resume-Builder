import React, { useState } from 'react';
import { signInWithPopup, Auth, AuthProvider } from 'firebase/auth';
import { auth, googleProvider, linkedinProvider } from '../firebaseConfig';
import { Sparkles, FileText, CheckCircle, AlertTriangle, XCircle, User, Linkedin } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  
  // Check if config is likely default/invalid
  // We cast auth to any to safely check internal options without TS errors if auth is null
  const isConfigValid = auth && (auth as any).app?.options?.apiKey && (auth as any).app.options.apiKey !== "YOUR_API_KEY_HERE";

  const handleGoogleLogin = async () => {
    setError(null);
    if (!auth || !isConfigValid) {
      setError("Firebase is not configured. Please update firebaseConfig.ts with your project keys.");
      return;
    }
    try {
      const result = await signInWithPopup(auth as Auth, googleProvider as AuthProvider);
      onLoginSuccess({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL
      });
    } catch (err: any) {
      console.error("Login failed", err);
      // Format the error message to be helpful
      let errorMessage = err.message;
      if (err.code === 'auth/unauthorized-domain') {
        const hostname = window.location.hostname;
        errorMessage = `Domain not authorized: '${hostname}'. Go to Firebase Console -> Authentication -> Settings -> Authorized Domains and add '${hostname}'. Also ensure you are editing the correct project 'da-ai-resume-builder'.`;
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = "Google Sign-In is disabled. Go to Firebase Console -> Authentication -> Sign-in method and enable 'Google'.";
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in cancelled.";
      }
      setError(errorMessage);
    }
  };

  const handleLinkedInLogin = async () => {
    setError(null);
    if (!auth || !isConfigValid || !linkedinProvider) {
      setError("Firebase or LinkedIn provider is not configured.");
      return;
    }
    try {
      // Cast to strict types for TypeScript compliance
      const result = await signInWithPopup(auth as Auth, linkedinProvider as AuthProvider);
      onLoginSuccess({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL
      });
    } catch (err: any) {
      console.error("LinkedIn Login failed", err);
      let errorMessage = err.message;
      if (err.code === 'auth/operation-not-allowed') {
        errorMessage = "LinkedIn Sign-In is disabled. Enable 'LinkedIn' in Firebase Console -> Authentication -> Sign-in method.";
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in cancelled.";
      }
      setError(errorMessage);
    }
  };

  const handleGuestLogin = () => {
    onLoginSuccess({
      uid: 'guest-' + Math.random().toString(36).substr(2, 9),
      displayName: 'Guest User',
      email: 'guest@example.com',
      photoURL: null,
      isGuest: true
    });
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
            onClick={handleLinkedInLogin}
            disabled={!isConfigValid}
            className="w-full bg-[#0077b5] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#006396] transition-colors flex items-center justify-center gap-3 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Linkedin size={20} />
            Sign in with LinkedIn
          </button>
          
          <div className="relative flex py-2 items-center">
             <div className="flex-grow border-t border-slate-700"></div>
             <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider">Or</span>
             <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <button 
            onClick={handleGuestLogin}
            className="w-full bg-slate-800 text-slate-300 font-semibold py-3 px-6 rounded-lg hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-3 shadow-md border border-slate-700"
          >
            <User size={20} />
            Continue as Guest
          </button>
        </div>
        
        <p className="mt-6 text-xs text-slate-500">
          Guest data is saved to your browser only. Sign in to sync across devices.
        </p>
      </div>
    </div>
  );
};

export default Login;