import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  enableNetwork,
  disableNetwork,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { getCurrentUser } from './auth';

// ユーザーのタスクコレクションへの参照を取得
const getUserTasksCollection = (userId) => {
  if (!db || !userId) return null;
  return collection(db, 'users', userId, 'tasks');
};

// タスクデータをFirestore用に変換
const taskToFirestoreDoc = (task) => {
  return {
    ...task,
    createdAt: task.createdAt ? new Date(task.createdAt) : serverTimestamp(),
    updatedAt: task.updatedAt ? new Date(task.updatedAt) : serverTimestamp(),
    completedAt: task.completedAt ? new Date(task.completedAt) : null,
    deletedAt: task.deletedAt ? new Date(task.deletedAt) : null,
    syncedAt: serverTimestamp(),
  };
};

// Firestoreドキュメントをタスクデータに変換
const firestoreDocToTask = (doc) => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt:
      data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    updatedAt:
      data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
    completedAt: data.completedAt?.toDate()?.toISOString() || null,
    deletedAt: data.deletedAt?.toDate()?.toISOString() || null,
    syncedAt: data.syncedAt?.toDate()?.toISOString() || null,
  };
};

// 全タスクをFirestoreから取得
export const fetchUserTasks = async () => {
  if (!isFirebaseConfigured()) {
    return [];
  }

  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const tasksCollection = getUserTasksCollection(user.uid);
    if (!tasksCollection) return [];

    const q = query(tasksCollection, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);

    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push(firestoreDocToTask(doc));
    });

    return tasks;
  } catch (error) {
    console.error('Failed to fetch tasks from Firestore:', error);
    throw error;
  }
};

// タスクをFirestoreに保存/更新
export const saveTaskToFirestore = async (task) => {
  if (!isFirebaseConfigured()) {
    return false;
  }

  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const tasksCollection = getUserTasksCollection(user.uid);
    if (!tasksCollection) return false;

    const taskDoc = doc(tasksCollection, task.id);
    await setDoc(taskDoc, taskToFirestoreDoc(task), { merge: true });

    return true;
  } catch (error) {
    console.error('Failed to save task to Firestore:', error);
    throw error;
  }
};

// 複数タスクをFirestoreに一括保存
export const saveBatchTasksToFirestore = async (tasks) => {
  if (!isFirebaseConfigured() || !tasks.length) {
    return false;
  }

  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const tasksCollection = getUserTasksCollection(user.uid);
    if (!tasksCollection) return false;

    // 並列処理で高速化
    const savePromises = tasks.map((task) => {
      const taskDoc = doc(tasksCollection, task.id);
      return setDoc(taskDoc, taskToFirestoreDoc(task), { merge: true });
    });

    await Promise.all(savePromises);
    return true;
  } catch (error) {
    console.error('Failed to save batch tasks to Firestore:', error);
    throw error;
  }
};

// タスクをFirestoreから削除
export const deleteTaskFromFirestore = async (taskId) => {
  if (!isFirebaseConfigured()) {
    return false;
  }

  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const tasksCollection = getUserTasksCollection(user.uid);
    if (!tasksCollection) return false;

    const taskDoc = doc(tasksCollection, taskId);
    await deleteDoc(taskDoc);

    return true;
  } catch (error) {
    console.error('Failed to delete task from Firestore:', error);
    throw error;
  }
};

// Firestoreのリアルタイム同期を開始
export const subscribeToTasks = (onTasksChange, onError) => {
  if (!isFirebaseConfigured()) {
    // Firebase未設定の場合は空の関数を返す
    return () => {};
  }

  const user = getCurrentUser();
  if (!user) {
    onError?.(new Error('User not authenticated'));
    return () => {};
  }

  try {
    const tasksCollection = getUserTasksCollection(user.uid);
    if (!tasksCollection) return () => {};

    const q = query(tasksCollection, orderBy('order', 'asc'));

    return onSnapshot(
      q,
      (querySnapshot) => {
        const tasks = [];
        querySnapshot.forEach((doc) => {
          tasks.push(firestoreDocToTask(doc));
        });
        onTasksChange(tasks);
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        onError?.(error);
      }
    );
  } catch (error) {
    console.error('Failed to subscribe to tasks:', error);
    onError?.(error);
    return () => {};
  }
};

// オンライン/オフライン制御
export const goOnline = async () => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    await enableNetwork(db);
  } catch (error) {
    console.error('Failed to enable network:', error);
  }
};

export const goOffline = async () => {
  if (!isFirebaseConfigured() || !db) return;

  try {
    await disableNetwork(db);
  } catch (error) {
    console.error('Failed to disable network:', error);
  }
};

// 同期ステータスチェック
export const isSyncEnabled = () => {
  return isFirebaseConfigured() && getCurrentUser() !== null;
};
