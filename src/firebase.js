import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAP3MWmPC2uSGE6L_gsCiUZwucqVl6QnDQ",
  authDomain: "santasphere-868ad.firebaseapp.com",
  databaseURL: "https://santasphere-868ad-default-rtdb.firebaseio.com",
  projectId: "santasphere-868ad",
  storageBucket: "santasphere-868ad.firebasestorage.app",
  messagingSenderId: "996735124325",
  appId: "1:996735124325:web:0149740831f6361a4f978c",
  measurementId: "G-FR08S4JW1Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app);