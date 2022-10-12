import { initializeApp } from "firebase/app";
import {
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
} from 'firebase/firestore'

const config = {
  apiKey: "AIzaSyCazp1pnz1QMrN0m1aU23xZp78HMkhXaLw",
  authDomain: "financeliteracyupproject.firebaseapp.com",
  databaseURL: "https://financeliteracyupproject-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "financeliteracyupproject",
  storageBucket: "financeliteracyupproject.appspot.com",
  messagingSenderId: "275175016474",
  appId: "1:275175016474:web:5c7cbd25b9a5751169a9a3",
  measurementId: "G-WFSW16WRS1"
};

export const firebaseApp = initializeApp(config);
export const fireStore = getFirestore(firebaseApp);
export const func = async function() {
  try {
    const q = collection(fireStore, "users");
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
      console.log(doc.data());
    })
  }
  catch(error) {
    console.log(error)
  }
}

// export default {
//   firebaseApp,
// }