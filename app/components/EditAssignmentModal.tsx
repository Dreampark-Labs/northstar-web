import { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Id } from "../../convex/_generated/dataModel";

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: Id<"assignments"> | null;
}

export default function EditAssignmentModal({ isOpen, onClose, assignmentId }: EditAssignmentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("23:59");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [assignmentType, setAssignmentType] = useState("assignment");
  const [maxPoints, setMaxPoints] = useState("");
  const [grade, setGrade] = useState("");
  const [status, setStatus] = useState("todo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Get user's courses for the dropdown
  const courses = useQuery(
    api.courses.getUserCourses,
    user?.id ? { clerkUserId: user.id } : "skip"
  );
  
  // Get assignment data for editing
  const assignment = useQuery(
    api.assignments.getAssignment,
    assignmentId ? { assignmentId } : "skip"
  );
  
  // Mutations
  const updateAssignment = useMutation(api.assignments.updateAssignment);
  const deleteAssignment = useMutation(api.assignments.deleteAssignment);

  // Populate form when assignment data loads
  useEffect(() => {
    if (assignment && isOpen) {
      setTitle(assignment.title);
      setDescription(assignment.notes || "");
      
      // Convert timestamp to date and time
      const dueDateTime = new Date(assignment.dueAt);
      setDueDate(dueDateTime.toISOString().split('T')[0]);
      setDueTime(dueDateTime.toTimeString().slice(0, 5));
      
      setSelectedCourseId(assignment.courseId);
      setAssignmentType("assignment"); // Default since type isn't in schema
      setMaxPoints(""); // Not in current schema
      setGrade(assignment.grade?.toString() || "");
      setStatus(assignment.status);
    }
  }, [assignment, isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && !assignment) {
      setTitle("");
      setDescription("");
      setDueDate("");
      setDueTime("23:59");
      setSelectedCourseId("");
      setAssignmentType("assignment");
      setMaxPoints("");
      setGrade("");
      setStatus("todo");
      setIsSubmitting(false);
      titleInputRef.current?.focus();
    }
  }, [isOpen, assignment]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedCourseId || !dueDate || !dueTime || !assignmentId) return;
    
    setIsSubmitting(true);
    
    try {
      // Combine date and time properly without timezone conversion issues
      const dueDateTimeString = `${dueDate}T${dueTime}:00`;
      const dueDateTimeLocal = new Date(dueDateTimeString);
      
      await updateAssignment({
        assignmentId,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDateTimeLocal.getTime(),
        grade: grade ? parseFloat(grade) : undefined,
        status: status
      });
      
      onClose();
    } catch (error) {
      console.error("Failed to update assignment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!assignmentId) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this assignment? This action cannot be undone.");
    if (!confirmed) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteAssignment({ assignmentId });
      onClose();
    } catch (error) {
      console.error("Failed to delete assignment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.16, 1, 0.3, 1], // Custom cubic bezier for smooth motion
              scale: { duration: 0.35 },
              y: { duration: 0.4 }
            }}
            className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
          >
        
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Assignment</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Update assignment details, add grades, or upload files</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Press</span>
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded border">
                <span className="font-mono font-medium">ESC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assignment Title *
            </label>
            <input
              ref={titleInputRef}
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter assignment title..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              required
            />
          </div>

          {/* Course Selection */}
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course *
            </label>
            <select
              id="course"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              required
            >
              <option value="">Select a course...</option>
              {courses?.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Assignment Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              id="type"
              value={assignmentType}
              onChange={(e) => setAssignmentType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
              <option value="exam">Exam</option>
              <option value="project">Project</option>
              <option value="homework">Homework</option>
              <option value="lab">Lab</option>
            </select>
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date *
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                required
              />
            </div>

            {/* Due Time */}
            <div>
              <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Time *
              </label>
              <input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Grade and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grade */}
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grade (Optional)
              </label>
              <input
                id="grade"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Enter grade (0-100)..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="todo">To Do</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional notes or description..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* File Upload Section (Placeholder) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Files (Coming Soon)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">File upload functionality coming soon</p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-1 py-0.5 rounded text-xs font-mono border border-gray-200 dark:border-gray-500">ESC</kbd>
                to close
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!title.trim() || !selectedCourseId || !dueDate || !dueTime || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-purple-600 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Assignment"
                )}
              </button>
            </div>
          </div>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
