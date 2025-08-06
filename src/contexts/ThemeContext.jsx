import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { THEME } from '../utils/constants';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage('theme', THEME.SYSTEM);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const isDark =
    theme === THEME.DARK || (theme === THEME.SYSTEM && prefersDark);

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextTheme = isDark ? THEME.LIGHT : THEME.DARK;
    setTheme(nextTheme);
  };

  const setSystemTheme = () => {
    setTheme(THEME.SYSTEM);
  };

  const value = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    setSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
