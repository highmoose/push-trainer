"use client";

import { deleteClient } from "@/redux/slices/clientSlice";
import { X, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DeleteClientConfirmationModal({
  close,
  clientName = "",
  clientId = "",
}) {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");

  const isMatch =
    input.trim().toLowerCase() === clientName.trim().toLowerCase();

  const handleDeleteClient = () => {
    dispatch(deleteClient(clientId));
    close();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xs z-50">
      <div className="bg-zinc-950 relative flex flex-col rounded-xl shadow-2xl shadow-white/10 gap-6 p-10 max-w-[500px] w-full overflow-hidden">
        <X
          onClick={close}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
          size={22}
        />

        <div className="flex items-center gap-4 text-red-400">
          <Trash2 size={32} />
          <h2 className="text-xl font-semibold text-white">
            Confirm Client Deletion
          </h2>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed">
          You are about to{" "}
          <span className="text-red-400 font-semibold">Permanently Delete</span>{" "}
          the client <span className="text-white font-bold">{clientName}</span>.
          This action cannot be undone.
        </p>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-zinc-400">
            Type <span className="text-white font-semibold">{clientName}</span>{" "}
            to confirm
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-zinc-900 text-white rounded-md px-3 py-3 text-sm"
            placeholder="Enter name to confirm"
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
          <button
            onClick={close}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteClient}
            disabled={!isMatch}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-md text-sm transition-colors disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            Delete Client
          </button>
        </div>
      </div>
    </div>
  );
}
