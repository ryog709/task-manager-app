import React from 'react';
import { useTask } from '../../contexts/TaskContext';
import { CATEGORIES } from '../../utils/constants';
import styles from './TabNavigation.module.css';

const TabNavigation = ({ currentCategory, onCategoryChange }) => {
  const { state } = useTask();

  const getCategoryCount = (category) => {
    return state.tasks.filter(
      (task) => task.category === category && task.status === 'active'
    ).length;
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.tabs}>
        {Object.entries(CATEGORIES).map(([key, category]) => {
          const count = getCategoryCount(key);
          const isActive = currentCategory === key;

          return (
            <button
              key={key}
              className={`${styles.tab} ${isActive ? styles.active : ''}`}
              onClick={() => onCategoryChange(key)}
              aria-pressed={isActive}
            >
              <span className={styles.icon}>{category.icon}</span>
              <span className={styles.label}>{category.label}</span>
              {count > 0 && (
                <span
                  className={styles.badge}
                  style={{ backgroundColor: category.color }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default TabNavigation;
