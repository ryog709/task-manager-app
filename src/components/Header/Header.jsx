import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTask } from '../../contexts/TaskContext';
import StatsModal from '../StatsModal/StatsModal';
import styles from './Header.module.css';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { state } = useTask();
  const [showStats, setShowStats] = useState(false);

  const activeTasks = state.tasks.filter((task) => task.status === 'active');
  const completedTasks = state.tasks.filter(
    (task) => task.status === 'completed'
  );

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.brand}>
            <h1 className={styles.title}>
              <span className={styles.icon}>✅</span>
              Task Manager
            </h1>
            <div className={styles.stats}>
              <span className={styles.stat}>
                {activeTasks.length} アクティブ
              </span>
              <span className={styles.separator}>•</span>
              <span className={styles.stat}>{completedTasks.length} 完了</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.statsButton}
              onClick={() => setShowStats(true)}
              aria-label="統計を表示"
            >
              📊
            </button>
            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label={
                isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'
              }
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} />
    </header>
  );
};

export default Header;
