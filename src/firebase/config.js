import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';

// Firebase設定（環境変数から取得）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase初期化（設定が揃っている場合のみ）
let app = null;
let auth = null;
let db = null;

// 環境変数が設定されているかチェック
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId;
};

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // オフライン対応を有効にする
    if (db) {
      // Firestoreのオフライン永続化を有効にする
      enableNetwork(db).catch((error) => {
        console.warn('Firebase offline support initialization failed:', error);
      });
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
}

export { auth, db, isFirebaseConfigured, enableNetwork, disableNetwork };
export default app;