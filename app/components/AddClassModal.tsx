import { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddClassModal({ isOpen, onClose }: AddClassModalProps) {
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [instructor, setInstructor] = useState("");
  const [creditHours, setCreditHours] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [deliveryFormat, setDeliveryFormat] = useState<"in-person" | "virtual" | "">("");
  const [deliveryMode, setDeliveryMode] = useState<"synchronous" | "asynchronous" | "">("");
  const [meetingDays, setMeetingDays] = useState<string[]>([]);
  const [meetingStart, setMeetingStart] = useState("");
  const [meetingEnd, setMeetingEnd] = useState("");
  const [room, setRoom] = useState("");
  const [building, setBuilding] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Get user's terms for the dropdown
  const terms = useQuery(
    api.terms.getUserTermsByClerkId,
    user?.id ? { clerkUserId: user.id } : "skip"
  );
  
  // Mutation to create course
  const createCourse = useMutation(api.courses.createCourse);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setCourseCode("");
      setInstructor("");
      setCreditHours("");
      setSelectedTermId("");
      setDeliveryFormat("");
      setDeliveryMode("");
      setMeetingDays([]);
      setMeetingStart("");
      setMeetingEnd("");
      setRoom("");
      setBuilding("");
      setIsSubmitting(false);
      titleInputRef.current?.focus();
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic required fields
    if (!title.trim() || !courseCode.trim() || !instructor.trim() || !creditHours || !selectedTermId || !deliveryFormat) return;
    
    // Conditional validation based on delivery format
    if (deliveryFormat === "in-person") {
      if (!meetingDays.length || !meetingStart || !meetingEnd || !room || !building) return;
    } else if (deliveryFormat === "virtual") {
      if (!deliveryMode) return;
      if (deliveryMode === "synchronous" && (!meetingDays.length || !meetingStart || !meetingEnd)) return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createCourse({
        title: title.trim(),
        code: courseCode.trim(),
        instructor: instructor.trim(),
        creditHours: parseInt(creditHours),
        termId: selectedTermId as any,
        deliveryFormat,
        deliveryMode: deliveryMode || undefined,
        meetingDays: meetingDays.length > 0 ? meetingDays : undefined,
        meetingStart: meetingStart || undefined,
        meetingEnd: meetingEnd || undefined,
        room: room || undefined,
        building: building || undefined,
      });
      
      onClose();
    } catch (error) {
      console.error("Failed to create class:", error);
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

  const weekDays = [
    { value: "M", label: "Mon" },
    { value: "T", label: "Tue" },
    { value: "W", label: "Wed" },
    { value: "R", label: "Thu" },
    { value: "F", label: "Fri" },
    { value: "S", label: "Sat" },
    { value: "U", label: "Sun" },
  ];

  const handleDayToggle = (day: string) => {
    setMeetingDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => weekDays.findIndex(w => w.value === a) - weekDays.findIndex(w => w.value === b))
    );
  };

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
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Class</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create a new class to track</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded border">
              <span className="font-mono font-medium">ESC</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {/* Class Name and Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Class Name *
              </label>
              <input
                ref={titleInputRef}
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Calculus II"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Code *
              </label>
              <input
                id="courseCode"
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g., MATH 201"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Instructor and Credits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructor *
              </label>
              <input
                id="instructor"
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="e.g., Prof. Johnson"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="creditHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Credit Hours *
              </label>
              <input
                id="creditHours"
                type="number"
                value={creditHours}
                onChange={(e) => setCreditHours(e.target.value)}
                placeholder="3"
                min="1"
                max="6"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Term Selection */}
          <div>
            <label htmlFor="term" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Term *
            </label>
            <select
              id="term"
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              <option value="">Select a term...</option>
              {terms?.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Class Format *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deliveryFormat"
                  value="in-person"
                  checked={deliveryFormat === "in-person"}
                  onChange={(e) => {
                    setDeliveryFormat(e.target.value as "in-person");
                    setDeliveryMode(""); // Reset delivery mode when format changes
                  }}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">In-Person</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deliveryFormat"
                  value="virtual"
                  checked={deliveryFormat === "virtual"}
                  onChange={(e) => {
                    setDeliveryFormat(e.target.value as "virtual");
                    setDeliveryMode(""); // Reset delivery mode when format changes
                  }}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Virtual</span>
              </label>
            </div>
          </div>

          {/* Virtual Delivery Mode (only show if virtual is selected) */}
          {deliveryFormat === "virtual" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Virtual Class Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryMode"
                    value="synchronous"
                    checked={deliveryMode === "synchronous"}
                    onChange={(e) => setDeliveryMode(e.target.value as "synchronous")}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Synchronous (Live classes)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryMode"
                    value="asynchronous"
                    checked={deliveryMode === "asynchronous"}
                    onChange={(e) => setDeliveryMode(e.target.value as "asynchronous")}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Asynchronous (Self-paced)</span>
                </label>
              </div>
            </div>
          )}

          {/* Meeting Days - conditional based on format and mode */}
          {(deliveryFormat === "in-person" || (deliveryFormat === "virtual" && deliveryMode === "synchronous")) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meeting Days {deliveryFormat === "in-person" || (deliveryFormat === "virtual" && deliveryMode === "synchronous") ? "*" : "(Optional)"}
              </label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    meetingDays.includes(day.value)
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            </div>
          )}

          {/* Meeting Times - conditional based on format and mode */}
          {(deliveryFormat === "in-person" || (deliveryFormat === "virtual" && deliveryMode === "synchronous")) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="meetingStart" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time {deliveryFormat === "in-person" || (deliveryFormat === "virtual" && deliveryMode === "synchronous") ? "*" : "(Optional)"}
              </label>
              <input
                id="meetingStart"
                type="time"
                value={meetingStart}
                onChange={(e) => setMeetingStart(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="meetingEnd" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Time {deliveryFormat === "in-person" || (deliveryFormat === "virtual" && deliveryMode === "synchronous") ? "*" : "(Optional)"}
              </label>
              <input
                id="meetingEnd"
                type="time"
                value={meetingEnd}
                onChange={(e) => setMeetingEnd(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
          )}

          {/* Location - only show for in-person classes */}
          {deliveryFormat === "in-person" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room *
              </label>
              <input
                id="room"
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g., Room 204"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="building" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Building *
              </label>
              <input
                id="building"
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="e.g., Science Hall"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50 flex-shrink-0">
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
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={
                  !title.trim() || 
                  !courseCode.trim() || 
                  !instructor.trim() || 
                  !creditHours || 
                  !selectedTermId || 
                  !deliveryFormat ||
                  (deliveryFormat === "in-person" && (!meetingDays.length || !meetingStart || !meetingEnd || !room || !building)) ||
                  (deliveryFormat === "virtual" && !deliveryMode) ||
                  (deliveryFormat === "virtual" && deliveryMode === "synchronous" && (!meetingDays.length || !meetingStart || !meetingEnd)) ||
                  isSubmitting
                }
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-purple-600 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Add Class"
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
