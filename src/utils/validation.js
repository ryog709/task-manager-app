import { CATEGORIES, TASK_STATUS, TASK_PRIORITY } from './constants';

export const validateTask = (task) => {
  const errors = [];

  if (!task.id) {
    errors.push('Task ID is required');
  }

  if (!task.text || task.text.trim().length === 0) {
    errors.push('Task text is required');
  }

  if (task.text && task.text.length > 500) {
    errors.push('Task text must be less than 500 characters');
  }

  if (!task.category || !Object.keys(CATEGORIES).includes(task.category)) {
    errors.push('Valid category is required');
  }

  if (!task.status || !Object.values(TASK_STATUS).includes(task.status)) {
    errors.push('Valid status is required');
  }

  if (!task.priority || !Object.values(TASK_PRIORITY).includes(task.priority)) {
    errors.push('Valid priority is required');
  }

  if (!task.createdAt || isNaN(Date.parse(task.createdAt))) {
    errors.push('Valid createdAt date is required');
  }

  if (!task.updatedAt || isNaN(Date.parse(task.updatedAt))) {
    errors.push('Valid updatedAt date is required');
  }

  if (typeof task.order !== 'number' || task.order < 0) {
    errors.push('Valid order number is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sanitizeTaskText = (text) => {
  return text.trim().replace(/[<>]/g, '').substring(0, 500);
};

export const generateTaskId = () => {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export const createNewTask = (
  text,
  category,
  priority = TASK_PRIORITY.MEDIUM
) => {
  const now = new Date().toISOString();
  return {
    id: generateTaskId(),
    text: sanitizeTaskText(text),
    category,
    status: TASK_STATUS.ACTIVE,
    priority,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    deletedAt: null,
    order: Date.now(),
    tags: [],
  };
};
