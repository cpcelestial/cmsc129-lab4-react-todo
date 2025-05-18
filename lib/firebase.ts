import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDcmO9i4eYtvI6ODzB0fEpOUs-0JRes6EE",
  authDomain: "taskmaster-cfcd4.firebaseapp.com",
  projectId: "taskmaster-cfcd4",
  storageBucket: "taskmaster-cfcd4.firebasestorage.app",
  messagingSenderId: "1014805559001",
  appId: "1:1014805559001:web:d32f53dc99b8000205f0c8",
  measurementId: "G-D3NHNJJG2W",
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
