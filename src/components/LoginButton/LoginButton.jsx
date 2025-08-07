import React, { useState } from 'react';
import { signInWithGoogle, signOut } from '../../firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginButton.module.css';

const LoginButton = () => {
  const { state, actions } = useAuth();
  const [loading, setLoading] = useState(false);

  // Firebase未設定の場合は表示しない
  if (!state.firebaseConfigured) {
    return null;
  }

  const handleSignIn = async () => {
    if (loading) return;

    setLoading(true);
    actions.clearError();

    try {
      await signInWithGoogle();
    } catch (error) {
      actions.setError(`ログインに失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (loading) return;

    setLoading(true);
    actions.clearError();

    try {
      await signOut();
    } catch (error) {
      actions.setError(`ログアウトに失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (state.loading) {
    return (
      <div className={styles.container}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (state.isAuthenticated && state.user) {
    return (
      <div className={styles.container}>
        <div className={styles.userInfo}>
          {state.user.photoURL && (
            <img
              src={state.user.photoURL}
              alt={state.user.displayName || 'User'}
              className={styles.avatar}
            />
          )}
          <div className={styles.userDetails}>
            <span className={styles.userName}>
              {state.user.displayName || 'ユーザー'}
            </span>
            <span className={styles.syncStatus}>🔄 同期中</span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className={styles.signOutButton}
          aria-label="ログアウト"
        >
          {loading ? '⏳' : '👋'}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button
        onClick={handleSignIn}
        disabled={loading}
        className={styles.signInButton}
      >
        {loading ? (
          <>
            <span className={styles.spinner}></span>
            <span>ログイン中...</span>
          </>
        ) : (
          <>
            <span className={styles.googleIcon}>🔗</span>
            <span>Googleでログイン</span>
          </>
        )}
      </button>
      <p className={styles.description}>複数デバイス間でタスクを同期できます</p>
    </div>
  );
};

export default LoginButton;
