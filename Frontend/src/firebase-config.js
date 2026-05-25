import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAD0gs9x-2oChTUn-FyipOU8mJ-hG03OyY",
  authDomain: "it4409-6fb08.firebaseapp.com",
  projectId: "it4409-6fb08",
  storageBucket: "it4409-6fb08.firebasestorage.app",
  messagingSenderId: "978348829443",
  appId: "1:978348829443:web:a848ae549420d538279736",
  measurementId: "G-CSJL0BHQLH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
