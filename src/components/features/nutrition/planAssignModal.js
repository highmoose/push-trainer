"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  Avatar,
  Chip,
  Divider,
  Spinner,
} from "@heroui/react";
import {
  Search,
  X,
  User,
  Users,
  Plus,
  Check,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { useClients } from "@/hooks/clients";
import { useDietPlans } from "@/hooks/diet";

const PlanAssignModal = ({ isOpen, onClose, selectedPlan, onSuccess }) => {
  // Hooks
  const { clients, loading: clientsLoading } = useClients();
  const {
    assignPlanToClient,
    unassignPlanFromClient,
    loading: planLoading,
  } = useDietPlans();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedClients, setAssignedClients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Load existing assignments when modal opens
  useEffect(() => {
    const loadExistingAssignments = () => {
      if (isOpen && selectedPlan?.assigned_clients) {
        setAssignedClients(selectedPlan.assigned_clients || []);
      }
    };

    loadExistingAssignments();
  }, [isOpen, selectedPlan?.assigned_clients]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setAssignedClients([]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!clients) return [];

    const searchLower = searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        `${client.first_name} ${client.last_name}`
          .toLowerCase()
          .includes(searchLower)
    );
  }, [clients, searchTerm]);

  // Get clients that aren't already assigned
  const availableClients = useMemo(() => {
    const assignedIds = assignedClients.map((client) => client.id);
    return filteredClients.filter((client) => !assignedIds.includes(client.id));
  }, [filteredClients, assignedClients]);

  // Handle assigning a client - optimistic update happens in hook
  const handleAssignClient = async (client) => {
    console.log("Assigning client:", client);

    // Immediate optimistic update to local state for instant UI feedback
    setAssignedClients((prev) => [
      ...prev,
      { ...client, assigned_at: new Date(), optimistic: true },
    ]);

    try {
      await assignPlanToClient(selectedPlan.id, [client.id]);

      // Success - update local state with confirmed data
      setAssignedClients((prev) =>
        prev.map((c) =>
          c.id === client.id
            ? { ...client, assigned_at: new Date(), optimistic: false }
            : c
        )
      );

      // Show success message (you can add toast here)
      console.log(
        `Successfully assigned ${
          client.name || `${client.first_name} ${client.last_name}`
        } to plan`
      );
    } catch (error) {
      // Rollback optimistic update on error
      setAssignedClients((prev) => prev.filter((c) => c.id !== client.id));
      console.error("Failed to assign client:", error);
      // Show error message (you can add toast here)
    }
  };

  // Handle removing a client - optimistic update happens in hook
  const handleRemoveClient = async (client) => {
    // Immediate optimistic removal for instant UI feedback
    setAssignedClients((prev) => prev.filter((c) => c.id !== client.id));

    try {
      await unassignPlanFromClient(selectedPlan.id, client.id);

      // Success - local state already updated optimistically
      console.log(
        `Successfully removed ${
          client.name || `${client.first_name} ${client.last_name}`
        } from plan`
      );
    } catch (error) {
      // Rollback optimistic removal on error
      setAssignedClients((prev) => [
        ...prev,
        { ...client, assigned_at: client.assigned_at || new Date() },
      ]);
      console.error("Failed to remove client:", error);
      // Show error message
    }
  };

  // Handle modal close
  const handleClose = () => {
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  // Get client display name
  const getClientName = (client) => {
    return (
      client.name ||
      `${client.first_name || ""} ${client.last_name || ""}`.trim() ||
      "Unknown Client"
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Assign Plan to Clients</span>
          </div>
          {selectedPlan && (
            <p className="text-sm text-default-600 font-normal">
              {selectedPlan.title}
            </p>
          )}
        </ModalHeader>

        <ModalBody>
          {/* Assigned Clients Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-4 h-4 text-success" />
              <h3 className="text-lg font-semibold">
                Assigned Clients ({assignedClients.length})
              </h3>
            </div>

            {loadingAssignments ? (
              <div className="flex items-center justify-center py-4">
                <Spinner size="sm" />
                <span className="ml-2 text-sm text-default-600">
                  Loading assignments...
                </span>
              </div>
            ) : assignedClients.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-4 bg-success-50 rounded-lg border border-success-200">
                {assignedClients.map((client) => (
                  <Chip
                    key={client.id}
                    color="success"
                    variant="flat"
                    onClose={() => handleRemoveClient(client)}
                    startContent={
                      <Avatar
                        src={client.avatar}
                        name={getClientName(client)}
                        size="sm"
                        className="w-4 h-4"
                      />
                    }
                  >
                    {getClientName(client)}
                  </Chip>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-default-50 rounded-lg border border-dashed border-default-200 text-center">
                <Users className="w-8 h-8 text-default-400 mx-auto mb-2" />
                <p className="text-default-600">No clients assigned yet</p>
                <p className="text-sm text-default-500">
                  Search and assign clients below
                </p>
              </div>
            )}
          </div>

          <Divider />

          {/* Search and Available Clients */}
          <div className="mt-6">
            {/* Search Box */}
            <div className="mb-4">
              <Input
                placeholder="Search for clients by name or email..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                startContent={<Search className="w-4 h-4 text-default-400" />}
                isClearable
                onClear={() => setSearchTerm("")}
                variant="bordered"
                classNames={{
                  input: "text-sm",
                  inputWrapper: "bg-default-50",
                }}
              />
            </div>

            {/* Available Clients List */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                Available Clients ({availableClients.length})
              </h3>

              {clientsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                  <span className="ml-2">Loading clients...</span>
                </div>
              ) : availableClients.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availableClients.map((client) => (
                    <Card
                      key={client.id}
                      className="border border-default-200 hover:border-primary-300 transition-colors w-full"
                    >
                      <CardBody className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={client.avatar}
                              name={getClientName(client)}
                              size="sm"
                              className="text-tiny"
                            />
                            <div>
                              <p className="font-medium text-sm">
                                {getClientName(client)}
                              </p>
                              {client.email && (
                                <p className="text-xs text-default-600">
                                  {client.email}
                                </p>
                              )}
                            </div>
                          </div>

                          <Button
                            color="primary"
                            size="sm"
                            variant="flat"
                            startContent={<Plus className="w-4 h-4" />}
                            onClick={() => handleAssignClient(client)}
                            isLoading={planLoading}
                            isDisabled={planLoading}
                          >
                            Assign
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <User className="w-12 h-12 text-default-400 mx-auto mb-3" />
                  <p className="text-default-600">
                    {searchTerm
                      ? "No clients found matching your search"
                      : "All clients are already assigned to this plan"}
                  </p>
                  {searchTerm && (
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            Close
          </Button>
          <Button
            color="primary"
            onPress={handleClose}
            startContent={<Check className="w-4 h-4" />}
          >
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PlanAssignModal;
