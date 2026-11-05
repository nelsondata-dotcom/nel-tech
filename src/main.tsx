import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { doc, getDocFromCache } from 'firebase/firestore';
import { db } from './lib/firebase';

async function testConnection() {
  try {
    // Attempting to read a non-existent doc just to check if the client can reach the service
    await getDocFromCache(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error.message?.includes('Failed to get document from cache')) {
       // This is fine, just means cache is empty
    } else {
      console.warn("Firebase connection status:", error.message);
    }
  }
}
testConnection();

createRoot(document.getElementById('root')!).render(<App />);
