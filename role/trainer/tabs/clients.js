"use client";

import AddClientModal from "@/components/trainer/addClientModal";
import DeleteClientModal from "@/components/trainer/deleteClientModal";
import { ChartNoAxesCombinedIcon, Eye, Pencil, Plus, X } from "lucide-react";
import SearchInput from "@/components/common/searchInput";
import { useDispatch, useSelector } from "react-redux";
import DataTable from "@components/common/dataTable";
import React, { useState } from "react";
import ClientInfoModal from "@/components/trainer/clientInfoModal";
import LinkStatusBadge from "@/components/common/LinkStatusBadge";
import AllClientStats from "@/components/trainer/allClientStats";

const columns = [
  { key: "name", label: "Client Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Position" },
  { key: "is_temp_badge", label: "Client Linked" },
  { key: "created_at", label: "Join Date" },
];

export default function Clients() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { list: clients = [], status } = useSelector((state) => state.clients);

  const [selectedClient, setSelectedClient] = useState(null);

  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [viewClientInfoModalOpen, setViewClientInfoModalOpen] = useState(false);
  const [deleteClientModalOpen, setDeleteClientModalOpen] = useState(false);

  const [searchString, setSearchString] = useState("");

  const filteredClients = clients
    .filter((client) => {
      const search = (searchString ?? "").toLowerCase();
      const fullName = `${client.first_name ?? ""} ${
        client.last_name ?? ""
      }`.toLowerCase();
      const email = (client.email ?? "").toLowerCase();

      return fullName.includes(search) || email.includes(search);
    })
    .map((client) => ({
      ...client,
      name: `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim(),
      created_at: new Date(client.created_at).toLocaleDateString(),
      role: client.role.charAt(0).toUpperCase() + client.role.slice(1),
      is_temp_badge: <LinkStatusBadge isTemp={client.is_temp} />,
    }));

  const handleEditClient = (row) => {
    setSelectedClient(row);
    setAddClientModalOpen(true);
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-4 w-full h-full">
        <div className="flex flex-1 p-12 gap-10 bg-zinc-900 h-[600px] w-full">
          <AllClientStats client={selectedClient} />
        </div>
        <div className="flex w-full justify-between h-[54px] bg-zinc-900 rounded p-2">
          <SearchInput
            placeholder="Search Clients"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setAddClientModalOpen(true)}
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
            <div className="flex gap-2 items-center">
              <button
                onClick={() => {
                  setSelectedClient(row);
                  setViewClientInfoModalOpen(true);
                }}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <Eye size={20} />
              </button>
              <button
                onClick={() => {
                  handleEditClient(row);
                }}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <Pencil size={20} />
              </button>
              <button
                onClick={() => handleDeleteClient(row)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <ChartNoAxesCombinedIcon size={20} />
              </button>
              <button
                onClick={() => {
                  setSelectedClient(row);
                  setDeleteClientModalOpen(true);
                }}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X size={24} />
              </button>
            </div>
          )}
        />
        {addClientModalOpen && (
          <AddClientModal
            close={() => setAddClientModalOpen(false)}
            selectedClient={selectedClient}
          />
        )}

        {deleteClientModalOpen && (
          <DeleteClientModal
            close={() => {
              setDeleteClientModalOpen(false);
              setSelectedClient(null);
            }}
            clientName={selectedClient.name}
            clientId={selectedClient.id}
            onConfirm={() => handleDelete(selectedClient.id)}
          />
        )}

        {viewClientInfoModalOpen && (
          <ClientInfoModal
            close={() => setViewClientInfoModalOpen(false)}
            client={selectedClient}
          />
        )}
      </div>
    </div>
  );
}
