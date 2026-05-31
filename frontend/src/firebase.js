import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "mindcare-ai-819fd.firebaseapp.com",
  projectId: "mindcare-ai-819fd",
  storageBucket: "mindcare-ai-819fd.firebasestorage.app",
  messagingSenderId: "1041030728176",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);