import React from 'react';
import { useTask } from '../../contexts/TaskContext';
import { CATEGORIES } from '../../utils/constants';
import { isToday, isThisWeek, isThisMonth } from '../../utils/date';
import { useEscapeKey } from '../../hooks/useKeyboard';
import styles from './StatsModal.module.css';

const StatsModal = ({ isOpen, onClose }) => {
  const { state } = useTask();

  useEscapeKey(() => {
    if (isOpen) {
      onClose();
    }
  });

  if (!isOpen) return null;

  const calculateStats = () => {
    const { tasks } = state;

    const totalTasks = tasks.length;
    const activeTasks = tasks.filter((task) => task.status === 'active');
    const completedTasks = tasks.filter((task) => task.status === 'completed');
    const deletedTasks = tasks.filter((task) => task.status === 'deleted');

    const completionRate =
      totalTasks > 0
        ? Math.round(
            (completedTasks.length / (totalTasks - deletedTasks.length)) * 100
          )
        : 0;

    // カテゴリ別統計
    const categoryStats = Object.keys(CATEGORIES).map((categoryKey) => {
      const categoryTasks = tasks.filter(
        (task) => task.category === categoryKey
      );
      const active = categoryTasks.filter(
        (task) => task.status === 'active'
      ).length;
      const completed = categoryTasks.filter(
        (task) => task.status === 'completed'
      ).length;
      const total = categoryTasks.length;

      return {
        category: categoryKey,
        ...CATEGORIES[categoryKey],
        active,
        completed,
        total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    // 期間別統計
    const todayTasks = tasks.filter((task) => isToday(task.createdAt));
    const weekTasks = tasks.filter((task) => isThisWeek(task.createdAt));
    const monthTasks = tasks.filter((task) => isThisMonth(task.createdAt));

    const todayCompleted = todayTasks.filter(
      (task) => task.status === 'completed'
    ).length;
    const weekCompleted = weekTasks.filter(
      (task) => task.status === 'completed'
    ).length;
    const monthCompleted = monthTasks.filter(
      (task) => task.status === 'completed'
    ).length;

    return {
      totalTasks,
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      deletedTasks: deletedTasks.length,
      completionRate,
      categoryStats,
      periodStats: {
        today: { total: todayTasks.length, completed: todayCompleted },
        week: { total: weekTasks.length, completed: weekCompleted },
        month: { total: monthTasks.length, completed: monthCompleted },
      },
    };
  };

  const stats = calculateStats();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>📊 統計ダッシュボード</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="統計ダッシュボードを閉じる"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {/* 全体統計 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>全体統計</h3>
            <div className={styles.statsGrid}>
              <StatCard
                icon="📋"
                label="総タスク数"
                value={stats.totalTasks}
                color="var(--primary-color)"
              />
              <StatCard
                icon="⏳"
                label="アクティブ"
                value={stats.activeTasks}
                color="var(--warning)"
              />
              <StatCard
                icon="✅"
                label="完了"
                value={stats.completedTasks}
                color="var(--success)"
              />
              <StatCard
                icon="📈"
                label="完了率"
                value={`${stats.completionRate}%`}
                color="var(--info)"
              />
            </div>
          </div>

          {/* カテゴリ別統計 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>カテゴリ別統計</h3>
            <div className={styles.categoryStats}>
              {stats.categoryStats.map((category) => (
                <div key={category.category} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryIcon}>{category.icon}</span>
                    <span className={styles.categoryLabel}>
                      {category.label}
                    </span>
                  </div>
                  <div className={styles.categoryProgress}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${category.completionRate}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                    <span className={styles.progressText}>
                      {category.completed}/{category.total} (
                      {category.completionRate}%)
                    </span>
                  </div>
                  <div className={styles.categoryDetails}>
                    <span>アクティブ: {category.active}</span>
                    <span>完了: {category.completed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 期間別統計 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>期間別統計</h3>
            <div className={styles.periodStats}>
              <PeriodStat
                icon="📅"
                label="今日"
                completed={stats.periodStats.today.completed}
                total={stats.periodStats.today.total}
              />
              <PeriodStat
                icon="📊"
                label="今週"
                completed={stats.periodStats.week.completed}
                total={stats.periodStats.week.total}
              />
              <PeriodStat
                icon="📈"
                label="今月"
                completed={stats.periodStats.month.completed}
                total={stats.periodStats.month.total}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon} style={{ color }}>
      {icon}
    </div>
    <div className={styles.statValue} style={{ color }}>
      {value}
    </div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

const PeriodStat = ({ icon, label, completed, total }) => {
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={styles.periodCard}>
      <div className={styles.periodHeader}>
        <span className={styles.periodIcon}>{icon}</span>
        <span className={styles.periodLabel}>{label}</span>
      </div>
      <div className={styles.periodValue}>
        {completed}/{total}
      </div>
      <div className={styles.periodRate}>{rate}%</div>
    </div>
  );
};

export default StatsModal;
