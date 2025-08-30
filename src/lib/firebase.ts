
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvgWppRYjPIP22U9-vu-J2dwrhJ2Klvpc",
  authDomain: "pmj-hmsj.firebaseapp.com",
  projectId: "pmj-hmsj",
  storageBucket: "pmj-hmsj.appspot.com",
  messagingSenderId: "226296836721",
  appId: "1:226296836721:web:56561b2612ba0ef4e6e1d0",
  measurementId: "G-CTWJR46VSH"
};

// Initialize Firebase
// Evita reinicialização em ambientes de desenvolvimento (HMR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporta as instâncias dos serviços para serem usadas na aplicação
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
