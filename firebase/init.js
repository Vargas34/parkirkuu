import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD5DlldflHFLbf1WOMIFEDHH512ZKfCCF0",
  authDomain: "parkir-8e631.firebaseapp.com",
  databaseURL: "https://parkir-8e631-default-rtdb.firebaseio.com",
  projectId: "parkir-8e631",
  storageBucket: "parkir-8e631.appspot.com",
  messagingSenderId: "214391307323",
  appId: "1:214391307323:web:81656c5bcd6280f782b01e",
  measurementId: "G-J3XLN9ZE8B",
};

// Supaya tidak double inisialisasi
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getDatabase(app);
