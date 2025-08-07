import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storage } from '../utils/storage';
import { validateTask, createNewTask } from '../utils/validation';
import { TASK_STATUS } from '../utils/constants';

const TaskContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_TASKS': {
      return {
        ...state,
        tasks: action.payload,
        loading: false,
        error: null,
      };
    }

    case 'ADD_TASK': {
      const newTask = createNewTask(
        action.payload.text,
        action.payload.category,
        action.payload.priority
      );

      const validation = validateTask(newTask);
      if (!validation.isValid) {
        return {
          ...state,
          error: validation.errors.join(', '),
        };
      }

      return {
        ...state,
        tasks: [...state.tasks, newTask],
        error: null,
      };
    }

    case 'UPDATE_TASK': {
      const updatedTasks = state.tasks.map((task) =>
        task.id === action.payload.id
          ? {
              ...task,
              ...action.payload.updates,
              updatedAt: new Date().toISOString(),
            }
          : task
      );

      return {
        ...state,
        tasks: updatedTasks,
        error: null,
      };
    }

    case 'DELETE_TASK': {
      const updatedTasks = state.tasks.map((task) =>
        task.id === action.payload
          ? {
              ...task,
              status: TASK_STATUS.DELETED,
              deletedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : task
      );

      return {
        ...state,
        tasks: updatedTasks,
        error: null,
      };
    }

    case 'RESTORE_TASK': {
      const updatedTasks = state.tasks.map((task) =>
        task.id === action.payload
          ? {
              ...task,
              status: TASK_STATUS.ACTIVE,
              deletedAt: null,
              updatedAt: new Date().toISOString(),
            }
          : task
      );

      return {
        ...state,
        tasks: updatedTasks,
        error: null,
      };
    }

    case 'COMPLETE_TASK': {
      const updatedTasks = state.tasks.map((task) =>
        task.id === action.payload
          ? {
              ...task,
              status: TASK_STATUS.COMPLETED,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : task
      );

      return {
        ...state,
        tasks: updatedTasks,
        error: null,
      };
    }

    case 'UNCOMPLETE_TASK': {
      const updatedTasks = state.tasks.map((task) =>
        task.id === action.payload
          ? {
              ...task,
              status: TASK_STATUS.ACTIVE,
              completedAt: null,
              updatedAt: new Date().toISOString(),
            }
          : task
      );

      return {
        ...state,
        tasks: updatedTasks,
        error: null,
      };
    }

    case 'REORDER_TASKS': {
      const { category, status, oldIndex, newIndex } = action.payload;
      
      // Filter tasks by category and status
      const targetTasks = state.tasks.filter(
        (task) => task.category === category && task.status === status
      );
      const otherTasks = state.tasks.filter(
        (task) => !(task.category === category && task.status === status)
      );

      const reorderedTasks = [...targetTasks];
      const [moved] = reorderedTasks.splice(oldIndex, 1);
      reorderedTasks.splice(newIndex, 0, moved);

      // Update order values for reordered tasks
      const updatedTargetTasks = reorderedTasks.map((task, index) => ({
        ...task,
        order: Date.now() + index,
        updatedAt: new Date().toISOString(),
      }));

      return {
        ...state,
        tasks: [...otherTasks, ...updatedTargetTasks].sort(
          (a, b) => a.order - b.order
        ),
        error: null,
      };
    }

    case 'CLEAR_COMPLETED': {
      const updatedTasks = state.tasks.filter(
        (task) => task.status !== TASK_STATUS.COMPLETED
      );

      return {
        ...state,
        tasks: updatedTasks,
        error: null,
      };
    }

    case 'SET_FILTER': {
      return {
        ...state,
        filter: action.payload,
      };
    }

    case 'SET_SEARCH': {
      return {
        ...state,
        searchQuery: action.payload,
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload,
      };
    }

    case 'CLEAR_ERROR': {
      return {
        ...state,
        error: null,
      };
    }

    default:
      return state;
  }
};

const initialState = {
  tasks: [],
  loading: true,
  error: null,
  filter: 'all',
  searchQuery: '',
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = storage.getTasks();
        dispatch({ type: 'LOAD_TASKS', payload: savedTasks });
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load tasks' });
      }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    if (!state.loading) {
      storage.setTasks(state.tasks);
    }
  }, [state.tasks, state.loading]);

  const actions = {
    addTask: (text, category, priority) => {
      dispatch({ type: 'ADD_TASK', payload: { text, category, priority } });
    },

    updateTask: (id, updates) => {
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    },

    deleteTask: (id) => {
      dispatch({ type: 'DELETE_TASK', payload: id });
    },

    restoreTask: (id) => {
      dispatch({ type: 'RESTORE_TASK', payload: id });
    },

    completeTask: (id) => {
      dispatch({ type: 'COMPLETE_TASK', payload: id });
    },

    uncompleteTask: (id) => {
      dispatch({ type: 'UNCOMPLETE_TASK', payload: id });
    },

    reorderTasks: (category, status, oldIndex, newIndex) => {
      dispatch({
        type: 'REORDER_TASKS',
        payload: { category, status, oldIndex, newIndex },
      });
    },

    clearCompleted: () => {
      dispatch({ type: 'CLEAR_COMPLETED' });
    },

    setFilter: (filter) => {
      dispatch({ type: 'SET_FILTER', payload: filter });
    },

    setSearch: (query) => {
      dispatch({ type: 'SET_SEARCH', payload: query });
    },

    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    },
  };

  return (
    <TaskContext.Provider value={{ state, actions }}>
      {children}
    </TaskContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
