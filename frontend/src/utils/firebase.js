import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Replace with actual config from Firebase Console
const firebaseConfig = {
  apiKey: "dummy-api-key",
  authDomain: "eventpulse-demo.firebaseapp.com",
  projectId: "eventpulse-demo",
  storageBucket: "eventpulse-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
