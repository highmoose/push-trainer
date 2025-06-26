import React from "react";
import { Chip } from "@heroui/react";

export default function Footer() {
  return (
    <div className="flex justify-between items-center bg-zinc-900 px-8 py-2">
      <div className="flex items-center gap-2">
        <span className="text-zinc-500 text-sm">Active Members:</span>
        <Chip
          color="success"
          variant="flat"
          size="sm"
          className="text-white bg-green-500/20"
        >
          10
        </Chip>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-zinc-500 text-sm">Membership:</span>
        <Chip color="primary" variant="solid" size="sm" className="text-white">
          Active
        </Chip>
      </div>
    </div>
  );
}
