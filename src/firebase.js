// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCb5lY7aq-k9rb43-NXj58yj9REUtS97DE",
  authDomain: "kaamsetu-27fb9.firebaseapp.com",
  projectId: "kaamsetu-27fb9",
  storageBucket: "kaamsetu-27fb9.firebasestorage.app",
  messagingSenderId: "472600112110",
  appId: "1:472600112110:web:560e506818585bbcf1fcff",
  measurementId: "G-6NPXD8M2RB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);