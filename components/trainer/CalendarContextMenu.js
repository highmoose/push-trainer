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
      className="fixed z-50"
      style={{ left: position.x - 24, top: position.y }}
    >
      {/* Main menu container with arrow */}
      <div className="relative">
        {/* Menu box */}
        <div
          ref={menuRef}
          className="bg-zinc-900 border border-zinc-800 rounded shadow-2xl min-w-[200px] shadow-black/50"
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

        {/* Arrow pointing right to the highlighted section */}
        <div className="absolute right-[-8px] top-1/2 transform -translate-y-1/2">
          {/* Outer triangle for border */}
          <div className="w-0 h-0 border-l-[9px] border-l-zinc-800 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent"></div>
          {/* Inner triangle for fill */}
          <div className="absolute top-[1px] left-[0px] w-0 h-0 border-l-[8px] border-l-zinc-900 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
        </div>
      </div>
    </div>
  );
}
