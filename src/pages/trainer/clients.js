"use client";

import CreateWeighInRequestModal from "@/features/clients/CreateWeighInRequestModal";
import AddClientMetricsModal from "@/features/clients/AddClientMetricsModal";
import RecurringWeighInModal from "@/features/clients/RecurringWeighInModal";
import DeleteClientModal from "@/features/clients/deleteClientModal";
import ClientInfoModal from "@/features/clients/clientInfoModal";
import ClientTopBar from "@/features/clients/clients/clientTopBar";
import AddClientModal from "@/features/clients/addClientModal";
import React, { useState, useEffect } from "react";
import { useClients } from "@/hooks/clients";
import ClientTopChart from "@/features/clients/clients/clientTopChart";
import ClientImageCard from "@/features/clients/clients/clientImageCard";
import ClientGoalChart from "@/features/clients/clients/clientGoalChart";
import ClientActivePlans from "@/features/clients/clients/clientActivePlans";
import ClientActivityLog from "@/features/clients/clients/clientActivityLog";
import ClientTimeline from "@/features/clients/clients/clientTimeline";
import { usePersistentClientSelection } from "@/hooks/usePersistentClientSelection";

export default function Clients() {
  const { clients, loading, error, fetchClients } = useClients();
  const { selectedClient, setSelectedClient, isInitialized } =
    usePersistentClientSelection(clients);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null); // Separate state for editing
  const [viewClientInfoModalOpen, setViewClientInfoModalOpen] = useState(false);
  const [deleteClientModalOpen, setDeleteClientModalOpen] = useState(false);
  const [addMetricsModalOpen, setAddMetricsModalOpen] = useState(false);
  const [weighInRequestModalOpen, setWeighInRequestModalOpen] = useState(false);
  const [recurringWeighInModalOpen, setRecurringWeighInModalOpen] =
    useState(false);

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
    <div className=" flex-1 w-full ">
      {loading || !isInitialized ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
          <p className="ml-3 text-zinc-400">Loading clients...</p>
        </div>
      ) : (
        <div className="flex">
          <div className="flex flex-col flex-1 h-screen ">
            <div className="p-2">
              <ClientTopBar
                clients={clients}
                setAddClientModalOpen={setAddClientModalOpen}
                setSelectedClient={setSelectedClient}
                selectedClient={selectedClient}
              />
            </div>
            <div className="flex w-full h-full gap-2  px-2 pb-2">
              <ClientTimeline selectedClient={selectedClient} />
              <div className="flex flex-col w-full h-full gap-2">
                {/* Top row */}
                <div className="flex w-full h-1/2 gap-2">
                  <div className="flex w-3/4 overflow-hidden rounded-3xl">
                    <ClientTopChart selectedClient={selectedClient} />
                  </div>
                  <div className="flex relative w-1/4 bg-panel overflow-hidden rounded-3xl ">
                    <ClientImageCard selectedClient={selectedClient} />
                  </div>
                </div>
                {/* Bottom row */}
                <div className="flex w-full h-1/2 gap-2">
                  <div className="flex w-3/4 h-full  overflow-hidden  gap-2">
                    <div className="flex w-1/2 h-full bg-panel overflow-hidden rounded-3xl ">
                      <ClientActivePlans selectedClient={selectedClient} />
                    </div>
                    <div className="flex w-1/2 h-full bg-panel overflow-hidden rounded-3xl">
                      <ClientActivityLog selectedClient={selectedClient} />
                    </div>
                  </div>
                  <div className="flex w-1/4 overflow-hidden rounded-3xl">
                    <ClientGoalChart selectedClient={selectedClient} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
      )}
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
      )}
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
