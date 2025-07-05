"use client";

import CreateWeighInRequestModal from "@/components/trainer/CreateWeighInRequestModal";
import AddClientMetricsModal from "@/components/trainer/AddClientMetricsModal";
import RecurringWeighInModal from "@/components/trainer/RecurringWeighInModal";
import ClientInfoPanel from "@/components/trainer/clients/clientInfoPanel";
import ClientCarousel from "@/components/trainer/clients/clientCarousel";
import DeleteClientModal from "@/components/trainer/deleteClientModal";
import ClientInfoModal from "@/components/trainer/clientInfoModal";
import ClientTopBar from "@/components/trainer/clients/clientTopBar";
import AddClientModal from "@/components/trainer/addClientModal";
import React, { useState, useEffect } from "react";
import { useClients } from "@/hooks/clients";
import { Plus, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import ClientTopChart from "@/components/trainer/clients/clientTopChart";

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
              <div className="flex w-full h-1/2">
                <div className="flex w-2/3 ">
                  <ClientTopChart />
                </div>
                <div className="flex relative w-1/3 flex-1 bg-white">
                  <Image
                    src="/images/placeholder/profile-image-placeholder-2.png"
                    width={500}
                    height={750}
                    alt="logo"
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent z-50"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-50">
                    <h2 className="text-4xl font-bold text-white">
                      {selectedClient?.first_name}
                    </h2>
                    <h2 className="text-4xl font-bold text-white -mt-3">
                      {selectedClient?.last_name}
                    </h2>
                    <p className="text-sm text-white">
                      {selectedClient?.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex w-full h-1/2">
                <div className="flex w-2/3 bg-zinc-900"></div>
                <div className="flex w-1/3 flex-1 bg-white"></div>
              </div>
            </div>
          </div>

          {/* <ClientInfoPanel selectedClient={selectedClient} /> */}
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
