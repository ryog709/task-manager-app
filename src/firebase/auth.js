import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

// Google認証プロバイダー
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Google認証でログイン
export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user,
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
      uid: result.user.uid,
    };
  } catch (error) {
    console.error('Google sign-in failed:', error);
    throw {
      success: false,
      error: error.code,
      message: error.message,
    };
  }
};

// ログアウト
export const signOut = async () => {
  if (!isFirebaseConfigured()) {
    return { success: true }; // Firebase未設定の場合はそのまま成功
  }

  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign-out failed:', error);
    throw {
      success: false,
      error: error.code,
      message: error.message,
    };
  }
};

// 認証状態の監視
export const onAuthChange = (callback) => {
  if (!isFirebaseConfigured()) {
    // Firebase未設定の場合は未認証として扱う
    callback(null);
    return () => {}; // cleanup function
  }

  return onAuthStateChanged(auth, callback);
};

// 現在のユーザー情報を取得
export const getCurrentUser = () => {
  if (!isFirebaseConfigured()) {
    return null;
  }

  return auth?.currentUser || null;
};

// ユーザーがログインしているかチェック
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};
