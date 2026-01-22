'use client';

import React from 'react';
import { TaskResponse } from '@/types/task';

interface TaskCardProps {
  task: TaskResponse;
  onToggleComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete
}) => {
  const handleToggleComplete = () => {
    onToggleComplete?.(task.id);
  };

  const handleEdit = () => {
    onEdit?.(task.id);
  };

  const handleDelete = () => {
    onDelete?.(task.id);
  };

  // Determine priority color based on priority level
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5:
        return 'border-l-red-500 bg-red-50';
      case 4:
        return 'border-l-orange-500 bg-orange-50';
      case 3:
        return 'border-l-yellow-500 bg-yellow-50';
      case 2:
        return 'border-l-blue-500 bg-blue-50';
      case 1:
      default:
        return 'border-l-green-500 bg-green-50';
    }
  };

  return (
    <div className={`border-l-4 rounded-lg shadow-sm p-4 mb-3 transition-all duration-200 hover:shadow-md ${getPriorityColor(task.priority)} ${task.is_completed ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={task.is_completed}
            onChange={handleToggleComplete}
            className="h-5 w-5 mr-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <div>
            <h3 className={`text-lg font-medium ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`mt-1 text-sm ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            aria-label="Edit task"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            aria-label="Delete task"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
        <span>Priority: {task.priority}/5</span>
        <div>
          <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
          {task.updated_at !== task.created_at && (
            <span className="ml-2">Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;