import React from 'react';
import { useTask } from '../../contexts/TaskContext';
import styles from './SearchBar.module.css';

const SearchBar = () => {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.filterSection}>
        <FilterButtons />
      </div>
    </div>
  );
};

const FilterButtons = () => {
  const { state, actions } = useTask();

  const filters = [
    { key: 'all', label: 'すべて', icon: '📋' },
    { key: 'active', label: 'アクティブ', icon: '⏳' },
    { key: 'completed', label: '完了', icon: '✅' },
  ];

  return (
    <div className={styles.filterButtons}>
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => actions.setFilter(filter.key)}
          className={`${styles.filterButton} ${
            state.filter === filter.key ? styles.active : ''
          }`}
        >
          <span className={styles.filterIcon}>{filter.icon}</span>
          <span className={styles.filterLabel}>{filter.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SearchBar;
