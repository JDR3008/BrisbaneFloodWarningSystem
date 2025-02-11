// firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiH9sFXnU0ssBIEmQn8GFsQadCJPmBvwg",
  authDomain: "floodapp-5c46b.firebaseapp.com",
  databaseURL: "https://floodapp-5c46b-default-rtdb.firebaseio.com",
  projectId: "floodapp-5c46b",
  storageBucket: "floodapp-5c46b.appspot.com",
  messagingSenderId: "1062508909899",
  appId: "1:1062508909899:ios:ca0bd7e892875db7d144ce",
};

// Initialize Firebase only once
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig); // Initialize if no apps have been created yet
} else {
  app = getApp(); // Use the already initialized app
}

const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
