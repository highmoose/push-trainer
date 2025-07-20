import React from "react";
import { Chip } from "@heroui/react";

export default function LinkStatusBadge({ isTemp, size = "medium" }) {
  const sizeMap = {
    small: "sm",
    medium: "md",
    large: "lg",
    extraLarge: "lg", // Hero UI doesn't have extraLarge, use lg
  };

  return (
    <Chip
      color={isTemp ? "default" : "success"}
      variant={isTemp ? "flat" : "solid"}
      size={sizeMap[size] || "md"}
      classNames={{
        base: isTemp ? "bg-white/20 border-zinc-600" : "",
        content: isTemp ? "text-zinc-400" : "text-white",
      }}
    >
      {isTemp ? "Unlinked" : "Linked"}
    </Chip>
  );
}
