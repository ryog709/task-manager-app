import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { onAuthChange } from '../firebase/auth';
import { isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null,
        loading: false,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_FIREBASE_STATUS':
      return {
        ...state,
        firebaseConfigured: action.payload,
      };

    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  firebaseConfigured: false,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Firebase設定状態をチェック
    dispatch({ type: 'SET_FIREBASE_STATUS', payload: isFirebaseConfigured() });

    if (!isFirebaseConfigured()) {
      // Firebase未設定の場合は未認証として扱う
      dispatch({ type: 'SET_USER', payload: null });
      return;
    }

    // 認証状態の監視
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        dispatch({
          type: 'SET_USER',
          payload: {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          },
        });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    });

    return unsubscribe;
  }, []);

  const actions = {
    setError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },

    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    },

    setLoading: (loading) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
  };

  return (
    <AuthContext.Provider value={{ state, actions }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
