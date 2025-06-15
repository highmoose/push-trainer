"use client";

import { useEffect, useRef } from "react";
import { User, ClipboardCheck, X } from "lucide-react";

export default function CalendarContextMenu({
  isOpen,
  position,
  onClose,
  onCreateSession,
  onCreateTask,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      ref={menuRef}
      className="fixed bg-zinc-900 border border-zinc-800 rounded shadow-xl z-50 min-w-[200px]"
      style={{
        left: position.x - 2, // Offset to avoid edge clipping
        top: position.y,
      }}
    >
      {/* Menu Options */}
      <div className="">
        <button
          onClick={() => {
            onCreateSession();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:text-black bg-zinc-900 hover:bg-white rounded-t group transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-zinc-900 group-hover:bg-zinc-900 rounded">
            <User className="w-4 h-4 text-white " />
          </div>
          <div>
            <div className="font-medium text-sm">Create Session</div>
            <div className="text-xs text-zinc-400 group-hover:text-zinc-600">
              Schedule a training session
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            onCreateTask();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:text-black bg-zinc-900 hover:bg-white rounded-b group transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-zinc-900 group-hover:bg-zinc-900 rounded">
            <ClipboardCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-sm">Create Task</div>
            <div className="text-xs text-zinc-400 group-hover:text-zinc-600">
              Add a personal task
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
