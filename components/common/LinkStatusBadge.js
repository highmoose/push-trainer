import React from "react";

export default function LinkStatusBadge({ isTemp, size = "medium" }) {
  const sizeClasses = {
    small: "px-2 py-0.5 text-[10px]",
    medium: "px-3 py-0.5 text-xs",
    large: "px-4 py-1 text-sm",
    extraLarge: "px-5 py-1.5 text-base", // 🆕 extraLarge added
  };

  const baseClass = "flex w-fit items-center rounded-full";
  const textColour = isTemp
    ? "bg-white/30 text-zinc-400/70"
    : "bg-green-100 text-green-500";

  return (
    <div
      className={`${baseClass} ${textColour} ${
        sizeClasses[size] || sizeClasses.medium
      }`}
    >
      {isTemp ? "Unlinked" : "Linked"}
    </div>
  );
}
