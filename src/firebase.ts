import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { handleFirestoreError, OperationType } from './lib/firestore-error-handler';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Test connection to Firestore
export async function testConnection() {
  try {
    // Attempt to fetch a non-existent document to test connectivity
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firestore connection test successful.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore connection failed: The client is offline. This likely indicates an incorrect Firebase configuration or a network issue.");
    } else {
      // Use the error handler for other types of errors
      try {
        handleFirestoreError(error, OperationType.GET, '_connection_test_/ping');
      } catch (e) {
        // Error handler throws, which is fine
      }
    }
  }
}

export default app;
