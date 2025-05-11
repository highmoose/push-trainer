"use client";

import { Modal } from "@mantine/core";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { addClient } from "@redux/slices/clientSlice";
import { useState } from "react";

export default function AddClientModal({ opened, onClose }) {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateClient = () => {
    if (!form.name.trim() || !form.email.trim()) return;

    dispatch(addClient(form));

    setForm({ name: "", email: "" });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleCreateClient();
        }
      }}
      size="sm"
      withCloseButton={false}
      radius="md"
      padding="md"
      centered
    >
      <div className="relative flex flex-col gap-4 p-4">
        <X
          onClick={onClose}
          size={20}
          className="absolute -right-2 -top-2 cursor-pointer hover:text-zinc-500"
        />

        <div className="text-center">
          <p className="font-semibold text-lg">Add a new Client</p>
          <p className="text-sm text-zinc-500">Enter client details below</p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-bold text-zinc-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full h-10 px-4 rounded border border-zinc-300 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="John Doe"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-bold text-zinc-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full h-10 px-4 rounded border border-zinc-300 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="john@example.com"
          />
        </div>

        <div className="flex justify-between gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateClient}
            className="px-4 py-2 text-sm text-white bg-zinc-900 rounded hover:bg-zinc-800"
          >
            Add Client
          </button>
        </div>
      </div>
    </Modal>
  );
}
