import { Plus } from "lucide-react";
import React, { useState } from "react";
import { Select, SelectItem, Button } from "@heroui/react";

export default function clientTopBar({
  clients,
  setAddClientModalOpen,
  setSelectedClient,
  selectedClient,
}) {
  const handleSelectionChange = (keys) => {
    const selectedKey = Array.from(keys)[0];
    const client = clients.find((c) => String(c.id) === String(selectedKey));
    setSelectedClient(client || null);
  };

  return (
    <div className="w-full border-r border-zinc-800  px-8  flex flex-col bg-zinc-900 rounded-2xl">
      <div className="flex items-center justify-between gap-4 py-6 border-zinc-800 ">
        <div className="flex gap-4 items-center ">
          <Select
            placeholder="Select a client..."
            selectedKeys={
              selectedClient ? new Set([String(selectedClient.id)]) : new Set()
            }
            onSelectionChange={handleSelectionChange}
            className="w-[400px]"
            classNames={{
              trigger: "bg-chip rounded-none border-none h-12",
              value: "text-white",
              popoverContent: "bg-zinc-900 border-zinc-700 rounded-none",
            }}
          >
            {clients && clients.length > 0 ? (
              clients.map((client) => (
                <SelectItem
                  key={String(client.id)}
                  textValue={`${client.first_name || ""} ${
                    client.last_name || ""
                  }`}
                  className="text-white"
                >
                  {client.first_name || "Unknown"}{" "}
                  {client.last_name || "Client"}
                </SelectItem>
              ))
            ) : (
              <SelectItem key="no-clients" textValue="No clients available">
                No clients available
              </SelectItem>
            )}
          </Select>

          <Button
            onClick={() => setAddClientModalOpen(true)}
            className="bg-chip rounded-none h-12 px-6 "
          >
            <Plus size={16} /> Add Client
          </Button>
        </div>
      </div>
    </div>
  );
}
