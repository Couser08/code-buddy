import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { Task } from '../../types/database';
import { useSessionStore } from '../../stores/sessionStore';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: (task: Task) => void;
}

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
}) => {
  const { currentSession, addTask } = useSessionStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [initialCode, setInitialCode] = useState(`#include <stdio.h>

int main() {
    // Write your code here
    
    return 0;
}`);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      session_id: currentSession?.id || 'demo-session',
      title: title.trim(),
      description: description.trim(),
      initial_code: initialCode,
      language_id: 50,
      created_at: new Date().toISOString(),
    };

    addTask(newTask);
    if (onTaskCreated) {
      onTaskCreated(newTask);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">Create New C Task</h3>
            <p className="text-xs text-slate-400">Broadcasts assignment to all students in live session</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Reverse an Array in Place"
              className="w-full px-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Task Description & Constraints
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the student needs to implement, expected inputs, and edge cases..."
              className="w-full p-3 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Initial Starter Code (C GCC)
            </label>
            <textarea
              rows={5}
              value={initialCode}
              onChange={(e) => setInitialCode(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-200 rounded-xl border border-slate-800 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create & Broadcast Task</span>
          </button>
        </form>
      </div>
    </div>
  );
};
