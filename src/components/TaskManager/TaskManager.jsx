import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTask } from '../../contexts/TaskContext';
import SearchBar from '../SearchBar/SearchBar';
import styles from './TaskManager.module.css';

const TaskManager = ({ category }) => {
  const { state, actions } = useTask();

  const filterTasks = (tasks) => {
    let filtered = tasks;

    // カテゴリフィルタ
    filtered = filtered.filter((task) => task.category === category);

    // ステータスフィルタ
    if (state.filter !== 'all') {
      filtered = filtered.filter((task) => task.status === state.filter);
    }

    // 検索フィルタ
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter((task) =>
        task.text.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredTasks = filterTasks(state.tasks);

  const activeTasks = filteredTasks.filter((task) => task.status === 'active');
  const completedTasks = filteredTasks.filter(
    (task) => task.status === 'completed'
  );

  const handleAddTask = (text) => {
    if (text.trim()) {
      actions.addTask(text.trim(), category);
    }
  };

  if (state.loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {state.error && (
        <div className={styles.error}>
          <p>{state.error}</p>
          <button onClick={actions.clearError} className={styles.errorClose}>
            ×
          </button>
        </div>
      )}

      <div className={styles.inputSection}>
        <TaskInput onAdd={handleAddTask} />
      </div>

      <SearchBar />

      <div className={styles.tasksSection}>
        {activeTasks.length === 0 && completedTasks.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📝</div>
            <h3>タスクがありません</h3>
            <p>上記のフォームから新しいタスクを追加してください。</p>
          </div>
        ) : (
          <>
            {activeTasks.length > 0 && (
              <div className={styles.taskGroup}>
                <h3 className={styles.groupTitle}>
                  アクティブなタスク ({activeTasks.length})
                </h3>
                <TaskList tasks={activeTasks} />
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className={styles.taskGroup}>
                <div className={styles.groupHeader}>
                  <h3 className={styles.groupTitle}>
                    完了したタスク ({completedTasks.length})
                  </h3>
                  <button
                    onClick={actions.clearCompleted}
                    className={styles.clearButton}
                  >
                    すべて削除
                  </button>
                </div>
                <TaskList tasks={completedTasks} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Placeholder components - will be implemented later
const TaskInput = ({ onAdd }) => {
  const [text, setText] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.inputForm}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="新しいタスクを入力..."
        className={styles.input}
        maxLength={500}
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className={styles.addButton}
      >
        追加
      </button>
    </form>
  );
};

const TaskList = ({ tasks }) => {
  const { actions } = useTask();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // マウス/タッチでの移動距離が8px以上の場合のみドラッグ開始
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      // タッチのアクティベーション設定
      activationConstraint: {
        delay: 250, // 250ms長押しでドラッグ開始
        tolerance: 8, // 8px以内の移動は許可
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);

      if (tasks.length > 0) {
        const category = tasks[0].category;
        const status = tasks[0].status;
        actions.reorderTasks(category, status, oldIndex, newIndex);
      }
    }
  };

  const taskIds = tasks.map((task) => task.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className={styles.taskList}>
          {tasks.map((task) => (
            <SortableTaskItem key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

const SortableTaskItem = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.taskItem} ${task.status === 'completed' ? styles.completed : ''} ${isDragging ? styles.dragging : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className={styles.dragHandle}
        aria-label="タスクをドラッグして並び替え"
      >
        ⋮⋮
      </div>
      <TaskItem task={task} />
    </div>
  );
};

const TaskItem = ({ task }) => {
  const { actions } = useTask();

  const handleToggle = () => {
    if (task.status === 'active') {
      actions.completeTask(task.id);
    } else {
      actions.uncompleteTask(task.id);
    }
  };

  const handleDelete = () => {
    actions.deleteTask(task.id);
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className={styles.checkbox}
        aria-label={
          task.status === 'active' ? 'タスクを完了' : 'タスクを未完了に戻す'
        }
      >
        {task.status === 'completed' ? '✅' : '⚪'}
      </button>

      <span className={styles.taskText}>{task.text}</span>

      <button
        onClick={handleDelete}
        className={styles.deleteButton}
        aria-label="タスクを削除"
      >
        🗑️
      </button>
    </>
  );
};

export default TaskManager;
