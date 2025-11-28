import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: User must replace these with their own Firebase project configuration
// Go to Firebase Console -> Project Settings -> General -> Your apps -> SDK setup and config
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjS3R-EVHKZ5tclrxDsmcLkn6YKRR0mzk",
  authDomain: "da-ai-resume-builder.firebaseapp.com",
  projectId: "da-ai-resume-builder",
  storageBucket: "da-ai-resume-builder.firebasestorage.app",
  messagingSenderId: "537077279310",
  appId: "1:537077279310:web:1bf7a1803f0df683a0f11f",
  measurementId: "G-WEBWRVE858"
};

// Initialize Firebase
// We wrap this in a try-catch or check for existing apps to avoid double-init in dev mode if HMR triggers
let app;
let auth;
let db;
let googleProvider;
let linkedinProvider;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    linkedinProvider = new OAuthProvider('linkedin.com');
} catch (error) {
    console.warn("Firebase initialization failed. Ensure you have set valid config in firebaseConfig.ts");
    console.error(error);
}

export { auth, db, googleProvider, linkedinProvider };