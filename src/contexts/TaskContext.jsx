import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storage } from '../utils/storage';
import { validateTask, createNewTask } from '../utils/validation';
import { TASK_STATUS } from '../utils/constants';
import { useAuth } from './AuthContext';
import {
  fetchUserTasks,
  saveBatchTasksToFirestore,
  saveTaskToFirestore,
  subscribeToTasks,
  isSyncEnabled,
} from '../firebase/firestore';

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

    case 'SET_SYNCING': {
      return {
        ...state,
        syncing: action.payload,
      };
    }

    case 'SET_SYNC_ERROR': {
      return {
        ...state,
        syncError: action.payload,
        syncing: false,
      };
    }

    case 'CLEAR_SYNC_ERROR': {
      return {
        ...state,
        syncError: null,
      };
    }

    case 'SET_LAST_SYNC_TIME': {
      return {
        ...state,
        lastSyncTime: action.payload,
      };
    }

    case 'SYNC_TASKS': {
      return {
        ...state,
        tasks: action.payload,
        loading: false,
        syncing: false,
        lastSyncTime: new Date().toISOString(),
        syncError: null,
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
  syncing: false,
  lastSyncTime: null,
  syncError: null,
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const auth = useAuth();

  // ローカルタスクの読み込み
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

  // ローカルストレージへの保存
  useEffect(() => {
    if (!state.loading) {
      storage.setTasks(state.tasks);
    }
  }, [state.tasks, state.loading]);

  // Firebase同期機能
  useEffect(() => {
    if (!auth.state.isAuthenticated || !isSyncEnabled()) {
      return;
    }

    dispatch({ type: 'SET_SYNCING', payload: true });

    // 初回同期: Firestoreからタスクを取得
    const initialSync = async () => {
      try {
        const cloudTasks = await fetchUserTasks();
        const localTasks = storage.getTasks();
        
        // ローカルとクラウドのタスクをマージ
        const mergedTasks = mergeTaskData(localTasks, cloudTasks);
        
        dispatch({ type: 'SYNC_TASKS', payload: mergedTasks });
        
        // マージされたタスクをFirestoreにバックアップ
        if (mergedTasks.length > 0) {
          await saveBatchTasksToFirestore(mergedTasks);
        }
      } catch (error) {
        console.error('Initial sync failed:', error);
        dispatch({ type: 'SET_SYNC_ERROR', payload: 'Initial sync failed' });
      }
    };

    // リアルタイム同期の設定
    const unsubscribe = subscribeToTasks(
      (cloudTasks) => {
        // リアルタイムでタスクが更新された場合
        dispatch({ type: 'SYNC_TASKS', payload: cloudTasks });
      },
      (error) => {
        console.error('Real-time sync error:', error);
        dispatch({ type: 'SET_SYNC_ERROR', payload: 'Sync connection lost' });
      }
    );

    initialSync();

    return unsubscribe;
  }, [auth.state.isAuthenticated]);

  // タスクマージロジック
  const mergeTaskData = (localTasks, cloudTasks) => {
    const mergedMap = new Map();
    
    // クラウドタスクを優先してマップに追加
    cloudTasks.forEach(task => {
      mergedMap.set(task.id, task);
    });
    
    // ローカルタスクを追加（クラウドにない場合のみ）
    localTasks.forEach(task => {
      if (!mergedMap.has(task.id)) {
        mergedMap.set(task.id, task);
      } else {
        // 同じIDがある場合、更新日時で判定
        const cloudTask = mergedMap.get(task.id);
        const localUpdated = new Date(task.updatedAt || task.createdAt);
        const cloudUpdated = new Date(cloudTask.updatedAt || cloudTask.createdAt);
        
        if (localUpdated > cloudUpdated) {
          mergedMap.set(task.id, task);
        }
      }
    });
    
    return Array.from(mergedMap.values()).sort((a, b) => a.order - b.order);
  };

  // Firestore同期付きアクション
  const syncTaskAction = async (action) => {
    dispatch(action);
    
    // Firebase同期が有効な場合、変更をクラウドに送信
    if (isSyncEnabled() && auth.state.isAuthenticated) {
      try {
        // 少し遅延を入れて状態の更新を待つ
        setTimeout(async () => {
          const updatedTasks = storage.getTasks();
          const relevantTask = updatedTasks.find(t => 
            action.payload.id ? t.id === action.payload.id : true
          );
          
          if (relevantTask) {
            await saveTaskToFirestore(relevantTask);
          }
        }, 100);
      } catch (error) {
        console.error('Failed to sync task to Firebase:', error);
        dispatch({ type: 'SET_SYNC_ERROR', payload: 'Sync failed' });
      }
    }
  };

  const actions = {
    addTask: async (text, category, priority) => {
      const action = { type: 'ADD_TASK', payload: { text, category, priority } };
      await syncTaskAction(action);
    },

    updateTask: async (id, updates) => {
      const action = { type: 'UPDATE_TASK', payload: { id, updates } };
      await syncTaskAction(action);
    },

    deleteTask: async (id) => {
      const action = { type: 'DELETE_TASK', payload: id };
      await syncTaskAction(action);
    },

    restoreTask: async (id) => {
      const action = { type: 'RESTORE_TASK', payload: id };
      await syncTaskAction(action);
    },

    completeTask: async (id) => {
      const action = { type: 'COMPLETE_TASK', payload: id };
      await syncTaskAction(action);
    },

    uncompleteTask: async (id) => {
      const action = { type: 'UNCOMPLETE_TASK', payload: id };
      await syncTaskAction(action);
    },

    reorderTasks: async (category, status, oldIndex, newIndex) => {
      const action = {
        type: 'REORDER_TASKS',
        payload: { category, status, oldIndex, newIndex },
      };
      await syncTaskAction(action);
    },

    clearCompleted: async () => {
      const action = { type: 'CLEAR_COMPLETED' };
      await syncTaskAction(action);
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

    clearSyncError: () => {
      dispatch({ type: 'CLEAR_SYNC_ERROR' });
    },

    // 手動同期
    manualSync: async () => {
      if (!isSyncEnabled() || !auth.state.isAuthenticated) {
        return;
      }

      dispatch({ type: 'SET_SYNCING', payload: true });

      try {
        const localTasks = storage.getTasks();
        if (localTasks.length > 0) {
          await saveBatchTasksToFirestore(localTasks);
          dispatch({ type: 'SET_LAST_SYNC_TIME', payload: new Date().toISOString() });
        }
      } catch (error) {
        console.error('Manual sync failed:', error);
        dispatch({ type: 'SET_SYNC_ERROR', payload: 'Manual sync failed' });
      } finally {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }
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
