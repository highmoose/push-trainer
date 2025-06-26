"use client";

import React from "react";
import { Input } from "@heroui/react";
import { Search } from "lucide-react";

export default function SearchInput({
  placeholder = "Search...",
  value = "",
  onChange,
  onEnter,
  className = "",
  size = "md",
  variant = "bordered",
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onEnter) {
      onEnter(e);
    }
  };

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      variant={variant}
      size={size}
      classNames={{
        base: `w-[400px] ${className}`,
        input: "text-white placeholder:text-zinc-400",
        inputWrapper:
          "bg-zinc-900 border-zinc-700 hover:border-zinc-600 group-data-[focus=true]:border-zinc-500",
      }}
      startContent={
        <Search className="w-4 h-4 text-zinc-400 pointer-events-none flex-shrink-0" />
      }
    />
  );
}
