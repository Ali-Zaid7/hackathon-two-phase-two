"use client";

import React, { useState, useEffect } from "react";
import { TaskResponse, TaskCreate, TaskUpdate } from "@/types/task";

interface TaskFormProps {
  task?: TaskResponse; // Optional for edit mode
  onSubmit: (formData: TaskCreate | TaskUpdate) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  submitLabel,
}) => {
  const isEditing = !!task;

  const [formData, setFormData] = useState<TaskCreate>({
    title: "",
    description: "",
    priority: 1,
    is_completed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        is_completed: task.is_completed,
      });
    }
  }, [task, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    let processedValue: string | number | boolean = value;
    if (type === "number") {
      processedValue = parseInt(value, 10);
    } else if (type === "checkbox") {
      processedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 255) {
      newErrors.title = "Title must be 255 characters or less";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Description must be 1000 characters or less";
    }

    if (
      formData.priority !== undefined &&
      (formData.priority < 1 || formData.priority > 5)
    ) {
      newErrors.priority = "Priority must be between 1 and 5";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (validate()) {
      setSubmitting(true);
      try {
        const submitData = isEditing
          ? ({ ...formData } as TaskUpdate)
          : { ...formData };

        await onSubmit(submitData);
      } catch (error: any) {
        console.error("Form submission error:", error);
        setSubmitError(
          error.message || "Failed to save task. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            errors.title
              ? "border-red-500 text-gray-900"
              : "border-gray-300 text-gray-900"
          }`}
          placeholder="Enter task title"
          disabled={submitting}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-900 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter task description (optional)"
          disabled={submitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-900 mb-1"
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.priority
                ? "border-red-500 text-gray-900"
                : "border-gray-300 text-gray-900"
            }`}
            disabled={submitting}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} -{" "}
                {num === 1
                  ? "Low"
                  : num === 2
                    ? "Medium Low"
                    : num === 3
                      ? "Medium"
                      : num === 4
                        ? "High"
                        : "Critical"}
              </option>
            ))}
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
          )}
        </div>

        {isEditing && (
          <div className="flex items-end">
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                id="is_completed"
                name="is_completed"
                checked={formData.is_completed}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                disabled={submitting}
              />
              <label
                htmlFor="is_completed"
                className="ml-2 block text-sm text-gray-900"
              >
                Completed
              </label>
            </div>
          </div>
        )}
      </div>

      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{submitError}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
        >
          {submitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
