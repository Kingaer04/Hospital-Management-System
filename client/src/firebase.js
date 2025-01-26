// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "hospital-management-syst-19855.firebaseapp.com",
  projectId: "hospital-management-syst-19855",
  storageBucket: "hospital-management-syst-19855.firebasestorage.app",
  messagingSenderId: "1072072073540",
  appId: "1:1072072073540:web:77d8dc4ca8f4a4551ab711"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);