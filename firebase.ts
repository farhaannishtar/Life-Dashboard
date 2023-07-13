import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: "life-dashboard-8ae30",
  storageBucket: "life-dashboard-8ae30.appspot.com",
  messagingSenderId: "1044811632027",
  appId: "1:1044811632027:web:64d8b0c74d3933c05fa53e",
  measurementId: "G-K6TKMSF65K",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

export { app, analytics, db };
