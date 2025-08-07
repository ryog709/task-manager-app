import React, { useState } from 'react';
import { useTask } from '../../contexts/TaskContext';
import StatsModal from '../StatsModal/StatsModal';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import styles from './Header.module.css';

const Header = () => {
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
            <ThemeToggle />
          </div>
        </div>
      </div>

      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} />
    </header>
  );
};

export default Header;
