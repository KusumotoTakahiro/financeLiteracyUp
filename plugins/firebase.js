import { initializeApp } from "firebase/app";
import {
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
} from 'firebase/firestore'

const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};

export const firebaseApp = initializeApp(config);
export const fireStore = getFirestore(firebaseApp);
