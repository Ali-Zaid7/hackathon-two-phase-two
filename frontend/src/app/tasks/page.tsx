'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { TaskResponse, TaskCreate, TaskUpdate } from '@/types/task';
import { getTasks, createTask, updateTask, deleteTask, toggleTaskCompletion } from '@/lib/api';
import { useApiStatus } from '@/hooks/useApiStatus';

const TaskListPage = () => {
  const { user, loading, authChecked } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);

  // Use API status for operations
  const { executeWithStatus } = useApiStatus();

  // Redirect to login if not authenticated (only after auth check completes)
  useEffect(() => {
    // Wait for authChecked to be true before redirecting
    // This prevents redirect loops caused by race conditions
    if (authChecked && !user) {
      console.log('[TASKS] Auth checked, no user - redirecting to login');
      router.push('/login');
    }
  }, [user, authChecked, router]);

  // Load tasks when component mounts or user changes
  useEffect(() => {
    if (authChecked && user) {
      fetchTasks();
    }
  }, [user, authChecked]);

  const fetchTasks = async () => {
    if (!user) return;

    await executeWithStatus(
      async () => {
        setLoadingTasks(true);
        const userTasks = await getTasks(user.id);
        setTasks(userTasks);
        return userTasks;
      },
      undefined, // No success message for loading
      'Failed to load tasks. Please try again.'
    ).finally(() => {
      setLoadingTasks(false);
    });
  };

  const handleCreateTask = async (taskData: TaskCreate) => {
    if (!user) {
      console.error('[TASK DEBUG] No user object available');
      return;
    }

    console.log('[TASK DEBUG] User object:', user);
    console.log('[TASK DEBUG] User.id:', user.id);
    console.log('[TASK DEBUG] Creating task with data:', taskData);

    if (!user.id) {
      console.error('[TASK DEBUG] ERROR: user.id is undefined!');
      return;
    }

    await executeWithStatus(
      async () => {
        const newTask = await createTask(user.id, taskData);
        setTasks([...tasks, newTask]);
        setShowCreateForm(false);
        console.log('[TASK DEBUG] Task created successfully:', newTask);
        return newTask;
      },
      'Task created successfully!',
      'Failed to create task. Please try again.'
    );
  };

  const handleUpdateTask = async (taskId: string, taskData: TaskUpdate) => {
    if (!user) return;

    await executeWithStatus(
      async () => {
        const updatedTask = await updateTask(user.id, taskId, taskData);

        setTasks(tasks.map(task =>
          task.id === taskId ? updatedTask : task
        ));

        setEditingTask(null);
        return updatedTask;
      },
      'Task updated successfully!',
      'Failed to update task. Please try again.'
    );
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;

    if (window.confirm('Are you sure you want to delete this task?')) {
      await executeWithStatus(
        async () => {
          await deleteTask(user.id, taskId);
          setTasks(tasks.filter(task => task.id !== taskId));
        },
        'Task deleted successfully!',
        'Failed to delete task. Please try again.'
      );
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    if (!user) return;

    await executeWithStatus(
      async () => {
        const updatedTask = await toggleTaskCompletion(user.id, taskId);

        setTasks(tasks.map(task =>
          task.id === taskId ? updatedTask : task
        ));

        return updatedTask;
      },
      updatedTask => updatedTask.is_completed ? 'Task marked as complete!' : 'Task marked as incomplete!',
      'Failed to update task. Please try again.'
    );
  };

  // Show loading while checking auth state (use authChecked for stability)
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tasks</h1>
          <p className="text-gray-600">Manage your tasks efficiently</p>
        </div>


        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
          <button
            onClick={() => {
              setShowCreateForm(true);
              setEditingTask(null);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add New Task
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
            <TaskForm
              onSubmit={(formData: TaskCreate | TaskUpdate) => handleCreateTask(formData as TaskCreate)}
              onCancel={() => setShowCreateForm(false)}
              submitLabel="Create Task"
            />
          </div>
        )}

        {editingTask && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>
            <TaskForm
              task={editingTask}
              onSubmit={(formData) => handleUpdateTask(editingTask.id, formData as TaskUpdate)}
              onCancel={() => setEditingTask(null)}
              submitLabel="Update Task"
            />
          </div>
        )}

        {loadingTasks ? (
          <div className="text-center py-8">
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No tasks yet. Create your first task!</p>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
            </div>
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={() => handleToggleComplete(task.id)}
                  onEdit={() => {
                    setEditingTask(task);
                    setShowCreateForm(false);
                  }}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListPage;