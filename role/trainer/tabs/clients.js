"use client";

import AddClientModal from "@/components/trainer/addClientModal";
import { ChartSpline, Pencil, Plus, X } from "lucide-react";
import { fetchClients } from "@/redux/slices/clientSlice";
import SearchInput from "@/components/common/searchInput";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "@components/common/dataTable";
import React, { useEffect, useState } from "react";

const columns = [
  { key: "name", label: "Client Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Position" },
  { key: "created_at", label: "Join Date" },
];

export default function Clients() {
  const dispatch = useDispatch();
  const { list: clients = [], status } = useSelector((state) => state.clients);
  const user = useSelector((state) => state.auth.user);

  const [modalOpen, setModalOpen] = useState(false);

  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    if (user?.role === "trainer") {
      dispatch(fetchClients());
    }
  }, [dispatch, user]);

  const filteredClients = clients
    .filter((client) => {
      const search = searchString.toLowerCase();
      return (
        client.name.toLowerCase().includes(search) ||
        client.email.toLowerCase().includes(search)
      );
    })
    .map((client) => ({
      ...client,
      created_at: new Date(client.created_at).toLocaleDateString(),
      role: client.role.charAt(0).toUpperCase() + client.role.slice(1),
    }));

  const handleEdit = (row) => {
    console.log("Edit clicked for:", row.name);
  };

  const handleDelete = (row) => {
    console.log("Delete clicked for:", row.name);
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-4 w-full h-full">
        <div className="flex flex-1 gap-4 w-full h-[200px] ">
          <div className="w-full h-full bg-zinc-200 rounded"></div>
          <div className="w-full h-full bg-zinc-200 rounded"></div>
          <div className="w-full h-full bg-zinc-200 rounded"></div>
          <div className="w-full h-full bg-zinc-200 rounded"></div>
        </div>
        <div className="flex flex-1 gap-4 w-full h-[200px] ">
          <div className="w-2/3 h-full bg-zinc-200 rounded"></div>
          <div className="w-1/3 h-full bg-zinc-200 rounded"></div>
        </div>
        <div className="flex w-full justify-between h-[54px] bg-zinc-900 rounded p-2">
          <SearchInput
            placeholder="Search Clients"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 font-semibold bg-zinc-800 text-white text-[15px] rounded px-4 py-2 cursor-pointer"
            >
              <p> Add Client </p>
              <Plus size={18} />
            </button>
            <button className="bg-zinc-800 font-semibold text-white text-[15px] rounded px-4 py-2">
              Export
            </button>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filteredClients}
          minRows={6}
          renderActions={(row) => (
            <div className="flex gap-4">
              <button
                onClick={() => handleEdit(row)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <Pencil size={20} />
              </button>
              <button
                onClick={() => handleDelete(row)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <ChartSpline size={20} />
              </button>
              <button
                onClick={() => handleDelete(row)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X size={24} />
              </button>
            </div>
          )}
        />
        {console.log("Modal Open?", modalOpen)}
        <AddClientModal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </div>
  );
}
