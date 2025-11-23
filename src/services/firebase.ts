import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyADr4P98D6BPc6g6Eu-Uv3_gS6_jatxdto",
    authDomain: "mtt-working-space-580ce.firebaseapp.com",
    projectId: "mtt-working-space-580ce",
    storageBucket: "mtt-working-space-580ce.firebasestorage.app",
    messagingSenderId: "482789301752",
    appId: "1:482789301752:web:acbb41082e8249c8674a0d",
    measurementId: "G-LYGJW7MJWR"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// export const analytics = getAnalytics(app);

