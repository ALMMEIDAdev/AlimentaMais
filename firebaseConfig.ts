// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPKuw5mr033AT6YBuGVzeKIRtY5xLrjJ4",
  authDomain: "alimentamais-4bdf4.firebaseapp.com",
  projectId: "alimentamais-4bdf4",
  storageBucket: "alimentamais-4bdf4.firebasestorage.app",
  messagingSenderId: "484799326297",
  appId: "1:484799326297:web:00b667313823b06e512948"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);   // <-- export nomeado
export default app;