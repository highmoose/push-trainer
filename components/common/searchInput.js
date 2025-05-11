"use client";

import React from "react";

export default function SearchInput({
  placeholder = "Search...",
  value = "",
  onChange,
  onEnter,
  className = "",
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onEnter) {
      onEnter(e);
    }
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      className={`w-[400px] border border-zinc-700 rounded h-[40px] px-4 placeholder:text-[15px] ${className}`}
      value={value}
      onChange={(e) => onChange?.(e)}
      onKeyDown={handleKeyDown}
    />
  );
}
