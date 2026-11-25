
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBZ6aZnhy8JGcQs3-ZPhNkk5S6Kg8IWfW0",
  authDomain: "polleria-6f9f8.firebaseapp.com",
  databaseURL: "https://polleria-6f9f8-default-rtdb.firebaseio.com",
  projectId: "polleria-6f9f8",
  storageBucket: "polleria-6f9f8.firebasestorage.app",
  messagingSenderId: "928528373416",
  appId: "1:928528373416:web:4097a84cd93cab8718d49d",
  measurementId: "G-PBKNMRCMJK"
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);

