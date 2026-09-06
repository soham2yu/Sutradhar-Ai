import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAM20Yd2V-XqePkJNnGUrwxzbn223QNNc8",
  authDomain: "biomed-86b23.firebaseapp.com",
  projectId: "biomed-86b23",
  storageBucket: "biomed-86b23.firebasestorage.app",
  messagingSenderId: "222504395323",
  appId: "1:222504395323:web:33c53584efe0ae35a5f21e",
  measurementId: "G-WJZ33ZM466"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Analytics only on the client side
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((yes) => yes && (analytics = getAnalytics(app)));
}

export { app, auth, analytics };
