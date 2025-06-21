// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCW8yv8dSOFV75tAfOf6zEIdLbo5TWO6tc",
  authDomain: "shiftmate-f8d70.firebaseapp.com",
  projectId: "shiftmate-f8d70",
  storageBucket: "shiftmate-f8d70.appspot.com",
  messagingSenderId: "861383211364",
  appId: "1:861383211364:web:1d2c3b47b8bf2da0672271",
  measurementId: "G-EGNWKTJP6R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported and not on localhost
let analytics = null;
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

if (!isLocalhost) {
  isSupported().then(yes => yes ? getAnalytics(app) : null).catch(() => {
    console.log('Analytics not supported');
  });
}

// Экспорт для авторизации и Firestore
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export { signInWithRedirect, signOut };