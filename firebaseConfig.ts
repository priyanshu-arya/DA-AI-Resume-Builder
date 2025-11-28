import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, Auth, AuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// TODO: User must replace these with their own Firebase project configuration
// Go to Firebase Console -> Project Settings -> General -> Your apps -> SDK setup and config
const firebaseConfig = {
  apiKey: "AIzaSyAjS3R-EVHKZ5tclrxDsmcLkn6YKRR0mzk",
  authDomain: "da-ai-resume-builder.firebaseapp.com",
  projectId: "da-ai-resume-builder",
  storageBucket: "da-ai-resume-builder.firebasestorage.app",
  messagingSenderId: "537077279310",
  appId: "1:537077279310:web:1bf7a1803f0df683a0f11f",
  measurementId: "G-WEBWRVE858"
};

// Initialize Firebase variables with explicit types
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: AuthProvider | undefined;
let linkedinProvider: AuthProvider | undefined;

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