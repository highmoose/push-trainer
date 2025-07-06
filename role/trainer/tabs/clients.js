"use client";

import CreateWeighInRequestModal from "@/components/trainer/CreateWeighInRequestModal";
import AddClientMetricsModal from "@/components/trainer/AddClientMetricsModal";
import RecurringWeighInModal from "@/components/trainer/RecurringWeighInModal";
import DeleteClientModal from "@/components/trainer/deleteClientModal";
import ClientInfoModal from "@/components/trainer/clientInfoModal";
import ClientTopBar from "@/components/trainer/clients/clientTopBar";
import AddClientModal from "@/components/trainer/addClientModal";
import React, { useState, useEffect } from "react";
import { useClients } from "@/hooks/clients";
import ClientTopChart from "@/components/trainer/clients/clientTopChart";
import ClientImageCard from "@/components/trainer/clients/clientImageCard";
import ClientGoalChart from "@/components/trainer/clients/clientGoalChart";
import ClientActivePlans from "@/components/trainer/clients/clientActivePlans";

export default function Clients() {
  const { clients, loading, error, fetchClients } = useClients();
  const [selectedClient, setSelectedClient] = useState(null);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null); // Separate state for editing
  const [viewClientInfoModalOpen, setViewClientInfoModalOpen] = useState(false);
  const [deleteClientModalOpen, setDeleteClientModalOpen] = useState(false);
  const [addMetricsModalOpen, setAddMetricsModalOpen] = useState(false);
  const [weighInRequestModalOpen, setWeighInRequestModalOpen] = useState(false);
  const [recurringWeighInModalOpen, setRecurringWeighInModalOpen] =
    useState(false);

  const [expandTimeline, setExpandTimeline] = useState(false);

  useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      const firstClient = clients[0];
    }
  }, [clients, selectedClient]);

  useEffect(() => {
    setSelectedClient(clients[0]);
  }, [clients]);

  console.log("Selected Client:", selectedClient);

  const handleEditClient = (client) => {
    setEditingClient(client);
    setAddClientModalOpen(true);
  };

  const handleDeleteClient = (client) => {
    setSelectedClient(client);
    setDeleteClientModalOpen(true);
  };

  return (
    <div className=" flex-1 w-full">
      <div className="flex">
        <div className="flex flex-col flex-1 h-screen">
          <ClientTopBar
            clients={clients}
            setAddClientModalOpen={setAddClientModalOpen}
            setSelectedClient={setSelectedClient}
            selectedClient={selectedClient}
          />
          <div className="flex w-full h-full">
            <div
              onMouseEnter={() => setExpandTimeline(true)}
              onMouseLeave={() => setExpandTimeline(false)}
              className={`bg-zinc-800 h-full transition-all delay-100 duration-700  ${
                expandTimeline ? "w-1/3" : "w-[100px]"
              } `}
            >
              <p className="text-sm items-center"> Click to open timeline</p>
            </div>
            <div className="flex flex-col w-full h-full">
              {/* Top row */}
              <div className="flex w-full h-1/2">
                <div className="flex w-3/4 ">
                  <ClientTopChart selectedClient={selectedClient} />
                </div>
                <div className="flex relative w-1/4 flex-1 bg-white">
                  <ClientImageCard selectedClient={selectedClient} />
                </div>
              </div>
              {/* Bottom row */}
              <div className="flex w-full h-1/2">
                <div className="flex w-3/4 h-full bg-zinc-900">
                  <div className="flex w-1/2 h-full bg-black"></div>
                  <div className="flex w-1/2 h-full ">
                    <ClientActivePlans selectedClient={selectedClient} />
                  </div>
                </div>
                <div className="flex w-1/4 ">
                  <ClientGoalChart selectedClient={selectedClient} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
      {addClientModalOpen && (
        <AddClientModal
          close={() => {
            setAddClientModalOpen(false);
            setEditingClient(null);
          }}
          selectedClient={editingClient}
        />
      )}
      {deleteClientModalOpen && (
        <DeleteClientModal
          close={() => {
            setDeleteClientModalOpen(false);
            setSelectedClient(null);
          }}
          clientName={selectedClient?.name}
          clientId={selectedClient?.id}
          onConfirm={() => {
            // Handle delete logic here
            setDeleteClientModalOpen(false);
            setSelectedClient(null);
          }}
        />
      )}
      {viewClientInfoModalOpen && (
        <ClientInfoModal
          close={() => setViewClientInfoModalOpen(false)}
          client={selectedClient}
        />
      )}{" "}
      {addMetricsModalOpen && (
        <AddClientMetricsModal
          isOpen={addMetricsModalOpen}
          onClose={() => setAddMetricsModalOpen(false)}
          clientId={selectedClient?.id}
          clientName={selectedClient?.name}
          onMetricsAdded={(metricsData) => {
            // Refresh clients data to show updated metrics
            fetchClients();
            console.log("Metrics added successfully:", metricsData);
          }}
        />
      )}{" "}
      {weighInRequestModalOpen && (
        <CreateWeighInRequestModal
          isOpen={weighInRequestModalOpen}
          onClose={() => setWeighInRequestModalOpen(false)}
          clientId={selectedClient?.id}
          clientName={selectedClient?.name}
        />
      )}
      {recurringWeighInModalOpen && (
        <RecurringWeighInModal
          isOpen={recurringWeighInModalOpen}
          onClose={() => setRecurringWeighInModalOpen(false)}
          clientId={selectedClient?.id}
          clientName={selectedClient?.name}
          existingSettings={selectedClient?.recurring_check_in}
        />
      )}
    </div>
  );
}
