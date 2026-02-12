import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxNYKtg0PTjjNHCZvMe080i3Mg7QDOOUo",
  authDomain: "kaamsetu-9e9d8.firebaseapp.com",
  projectId: "kaamsetu-9e9d8",
  storageBucket: "kaamsetu-9e9d8.firebasestorage.app",
  messagingSenderId: "371648899365",
  appId: "1:371648899365:web:1d9a2eb4754eec53cad2cc",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// DEBUG ONLY: expose Firebase auth globally for token inspection
window.auth = auth;

export { app, auth, db };