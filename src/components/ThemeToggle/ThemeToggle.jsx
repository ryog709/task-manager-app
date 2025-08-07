import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      className={`${styles.toggle} ${isDark ? styles.dark : styles.light}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
    >
      <span className={styles.slider}>
        <span className={styles.icon}>{isDark ? '🌙' : '☀️'}</span>
      </span>
      <span className={styles.label}>{isDark ? 'ダーク' : 'ライト'}</span>
    </button>
  );
};

export default ThemeToggle;
