"use client";

import CreateWeighInRequestModal from "@/components/trainer/CreateWeighInRequestModal";
import AddClientMetricsModal from "@/components/trainer/AddClientMetricsModal";
import RecurringWeighInModal from "@/components/trainer/RecurringWeighInModal";
import ClientInfoPanel from "@/components/trainer/clients/clientInfoPanel";
import ClientCarousel from "@/components/trainer/clients/clientCarousel";
import DeleteClientModal from "@/components/trainer/deleteClientModal";
import ClientInfoModal from "@/components/trainer/clientInfoModal";
import AddClientModal from "@/components/trainer/addClientModal";
import React, { useState, useEffect } from "react";
import { useClients } from "@/hooks/clients";
import { Plus, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";

// Dynamic chart imports for better performance
const ChartClient = dynamic(
  () => import("@/components/common/chart/ChartClient"),
  { ssr: false }
);

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
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("progress");

  // Update selectedClient when clients are loaded
  useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      const firstClient = clients[0];
      const clientWithName = {
        ...firstClient,
        name: `${firstClient.first_name || ""} ${
          firstClient.last_name || ""
        }`.trim(),
      };
      setSelectedClient(clientWithName);
    }
  }, [clients, selectedClient]);

  const handleEditClient = (client) => {
    setEditingClient(client);
    setAddClientModalOpen(true);
  };

  const handleDeleteClient = (client) => {
    setSelectedClient(client);
    setDeleteClientModalOpen(true);
  };

  return (
    <div className="relative flex-1 w-full">
      {/* Background image/gradient */}
      <Image
        src="/images/background/gradient-light-bg.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="bg-gradient-to-r from-black to-transparent absolute left-0 top-0 h-full w-2/3 opacity-50 pointer-events-none z-10" />
      <div className="bg-gradient-to-l from-black to-transparent absolute right-0 top-0 h-full w-2/3 opacity-50 pointer-events-none z-10" />
      <div className="sticky top-0 z-10 bg-opacity-100 ">
        <div className="flex flex-col flex-1 h-screen">
          <ClientInfoPanel selectedClient={selectedClient} />
          <ClientCarousel clients={clients} />
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
