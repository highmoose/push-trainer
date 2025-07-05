import { Plus } from "lucide-react";
import React, { useState } from "react";
import { Input, Button } from "@heroui/react";

export default function ClientCarousel({ setAddClientModalOpen }) {
  const [searchString, setSearchString] = useState("");

  return (
    <div className="w-full  border-r border-zinc-800 flex flex-col bg-zinc-950">
      <div className="flex px-4 items-center justify-between gap-4 py-6 border-zinc-800 ">
        <div className="flex gap-4 items-center ">
          <Input
            placeholder="Search clients..."
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            className="w-[400px]"
            classNames={{
              input: "bg-transparent",
              inputWrapper: "bg-chip rounded-none border-none h-12",
            }}
            startContent={
              <div className="pointer-events-none flex items-center">
                <svg
                  className="w-4 h-4 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            }
          />

          <Button
            onClick={() => setAddClientModalOpen(true)}
            className="bg-chip rounded-none h-12 px-6"
          >
            <Plus size={16} /> Add Client
          </Button>
        </div>
      </div>
    </div>
  );
}
