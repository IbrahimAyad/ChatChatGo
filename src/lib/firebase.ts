import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development (commented out to avoid TypeScript issues)
// if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
//   const connectToEmulators = () => {
//     try {
//       connectFirestoreEmulator(db, 'localhost', 8080);
//       connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
//       connectStorageEmulator(storage, 'localhost', 9199);
//       connectFunctionsEmulator(functions, 'localhost', 5001);
//     } catch (error) {
//       console.warn('Firebase emulator connection failed:', error);
//     }
//   };
//   connectToEmulators();
// }

export default app; 