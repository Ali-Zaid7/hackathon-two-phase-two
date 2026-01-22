'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { TaskResponse, TaskUpdate } from '@/types/task';
import { getTask, updateTask, deleteTask, toggleTaskCompletion } from '@/lib/api';

const TaskDetailPage = () => {
  const { id: taskId } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && taskId && !loading) {
      fetchTask();
    }
  }, [user, taskId, loading]);

  const fetchTask = async () => {
    if (!user || !taskId) return;

    try {
      setLoadingTask(true);
      const fetchedTask = await getTask(user.id, taskId);
      setTask(fetchedTask);
      setError(null);
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Failed to load task. It may not exist or you may not have permission to view it.');
    } finally {
      setLoadingTask(false);
    }
  };

  const handleUpdateTask = async (taskData: TaskUpdate) => {
    if (!user || !taskId) return;

    try {
      const updatedTask = await updateTask(user.id, taskId, taskData);

      setTask(updatedTask);
      setShowEditForm(false);
      setError(null);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async () => {
    if (!user || !taskId) return;

    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await deleteTask(user.id, taskId);
        // Redirect to tasks list after deletion
        window.location.href = '/tasks';
        setError(null);
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task. Please try again.');
      }
    }
  };

  const handleToggleComplete = async () => {
    if (!user || !taskId) return;

    try {
      const updatedTask = await toggleTaskCompletion(user.id, taskId);
      setTask(updatedTask);
      setError(null);
    } catch (err) {
      console.error('Error toggling task completion:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  if (loading || loadingTask) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Please log in to view this task.</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Task not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Task Details</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {showEditForm ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Task</h2>
            <TaskForm
              task={task}
              onSubmit={handleUpdateTask}
              onCancel={() => setShowEditForm(false)}
              submitLabel="Update Task"
            />
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Task Information</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
                <button
                  onClick={handleToggleComplete}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    task.is_completed
                      ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
                  }`}
                >
                  {task.is_completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>

            <TaskCard
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={() => setShowEditForm(true)}
              onDelete={handleDeleteTask}
            />
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;