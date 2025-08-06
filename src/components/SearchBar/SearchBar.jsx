import React, { useState } from 'react';
import { useTask } from '../../contexts/TaskContext';
import { useDebounce } from '../../hooks/useDebounce';
import styles from './SearchBar.module.css';

const SearchBar = () => {
  const { state, actions } = useTask();
  const [localSearch, setLocalSearch] = useState(state.searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  React.useEffect(() => {
    actions.setSearch(debouncedSearch);
  }, [debouncedSearch, actions]);

  const handleClear = () => {
    setLocalSearch('');
    actions.setSearch('');
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBox}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="タスクを検索..."
          className={styles.searchInput}
        />
        {localSearch && (
          <button
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="検索をクリア"
          >
            ✕
          </button>
        )}
      </div>

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
