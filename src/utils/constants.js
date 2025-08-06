export const CATEGORIES = {
  work: { 
    label: '仕事', 
    icon: '💼', 
    color: '#667eea',
    order: 1 
  },
  private: { 
    label: 'プライベート', 
    icon: '🏠', 
    color: '#764ba2',
    order: 2 
  },
  study: { 
    label: '勉強', 
    icon: '📚', 
    color: '#f093fb',
    order: 3 
  }
};

export const TASK_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DELETED: 'deleted'
};

export const TASK_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const STORAGE_KEYS = {
  TASKS: 'taskManager_tasks_v2',
  SETTINGS: 'taskManager_settings_v2',
  STATS: 'taskManager_stats_v2',
  BACKUP: 'taskManager_backup_v2'
};

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};