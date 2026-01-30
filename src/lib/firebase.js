import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
   apiKey: "AIzaSyDoqn6an_WfDd-jGVa_8agWiudCgdR1TFs",
  authDomain: "lookbook-72b47.firebaseapp.com",
  projectId: "lookbook-72b47",
  storageBucket: "lookbook-72b47.appspot.com",
  messagingSenderId: "372969546338",
  appId: "1:372969546338:web:ac576179e812fde7a7673b",
  measurementId: "G-V72KDN3Q6L"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
