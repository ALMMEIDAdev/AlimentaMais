
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCPKuw5mr033AT6YBuGVzeKIRtY5xLrjJ4",
  authDomain: "alimentamais-4bdf4.firebaseapp.com",
  projectId: "alimentamais-4bdf4",
  storageBucket: "alimentamais-4bdf4.firebasestorage.app",
  messagingSenderId: "484799326297",
  appId: "1:484799326297:web:00b667313823b06e512948"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
