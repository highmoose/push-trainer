"use client";

import { Delete, Eye, Pencil, X, Plus, Activity } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tab,
  Tabs,
  Card,
  CardBody,
} from "@heroui/react";
import LinkStatusBadge from "../common/LinkStatusBadge";
import AddClientMetricsModal from "./AddClientMetricsModal";
import ClientTimeline from "./ClientTimelineOld";
import { useState } from "react";

export default function ClientInfoModal({ close, client }) {
  const [showAddMetricsModal, setShowAddMetricsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const handleMetricsAdded = (newMetrics) => {
    // Optionally refresh client data or show success message
    console.log("New metrics added:", newMetrics);
  };

  return (
    <>
      <Modal
        isOpen={true}
        onClose={close}
        size="5xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/80 backdrop-blur-sm",
          base: "bg-zinc-950 border border-zinc-900",
          header: "border-b border-zinc-800",
          body: "py-6",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">
              Client: {client.name}
            </h2>
            <Button
              color="primary"
              variant="flat"
              onPress={() => setShowAddMetricsModal(true)}
              startContent={<Plus size={16} />}
              size="sm"
            >
              Add Metrics
            </Button>
          </ModalHeader>

          <ModalBody>
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={setActiveTab}
              classNames={{
                tabList:
                  "gap-6 w-full relative rounded-none p-0 border-b border-zinc-700",
                cursor: "w-full bg-blue-500",
                tab: "max-w-fit px-0 h-12",
                tabContent:
                  "group-data-[selected=true]:text-white text-zinc-400",
              }}
            >
              <Tab key="info" title="Client Info">
                {/* Informational Block */}
                <Card className="bg-zinc-900 border border-zinc-800 mb-4">
                  <CardBody className="flex flex-row items-center gap-4">
                    <Eye size={22} className="text-zinc-400" />
                    <p className="text-sm text-zinc-400">
                      You&apos;re viewing this client&apos;s data. To make
                      changes, click "Edit Client Info" at the bottom of this
                      screen.
                    </p>
                  </CardBody>
                </Card>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white">
                  {/* ...existing grid content... */}
                  <div className="flex flex-col gap-3">
                    <Section label="Client Name" value={client.name} />
                    <Section label="Email" value={client.email} />
                    <Section label="Phone" value={client.phone} />
                    <Section label="Age" value={client.age} />
                    <Section label="Address" value={client.address} />
                    <Section label="Gym" value={client.gym} />
                    <Section label="Date Joined" value={client.dateJoined} />
                    <Section label="Position" value={client.position} />
                    <div className="flex gap-2 items-center mt-2">
                      <p className="text-sm text-zinc-400">Client Linked</p>
                      <LinkStatusBadge isTemp={client.is_temp} size="large" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Section label="Height (cm)" value={client.height} />
                    <Section label="Weight (kg)" value={client.weight} />
                    <Section
                      label="Fitness Goals"
                      value={client.fitnessGoals}
                    />
                    <Section
                      label="Fitness Experience"
                      value={client.fitnessExperience}
                    />
                    <Section
                      label="Fitness Level"
                      value={client.fitnessLevel}
                    />
                    <Section label="Measurements" value={client.measurements} />
                    <div className="flex flex-col gap-2 mt-4">
                      <p className="text-sm text-zinc-400">
                        Workout Plan (Active)
                      </p>
                      <Button
                        color="default"
                        variant="solid"
                        size="sm"
                        startContent={<Eye size={18} />}
                        className="w-fit"
                      >
                        View Workout Plan
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Section label="Food Likes" value={client.foodLikes} />
                    <Section
                      label="Food Dislikes"
                      value={client.foodDislikes}
                    />
                    <Section label="Allergies" value={client.allergies} />
                    <Section
                      label="Medical Conditions"
                      value={client.medicalConditions}
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-zinc-400">Notes</p>
                      <p className="whitespace-pre-line text-sm">
                        {client.notes}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      <p className="text-sm text-zinc-400">
                        Diet Plan (Active)
                      </p>
                      <Button
                        color="default"
                        variant="solid"
                        size="sm"
                        startContent={<Eye size={18} />}
                        className="w-fit"
                      >
                        View Diet Plan
                      </Button>
                    </div>
                  </div>
                </div>
              </Tab>

              <Tab key="timeline" title="Timeline">
                <ClientTimeline client={client} isTrainerView={true} />
              </Tab>
            </Tabs>
          </ModalBody>

          <ModalFooter className="justify-between">
            <div className="flex gap-3">
              <Button
                color="default"
                variant="flat"
                onPress={close}
                startContent={<Pencil size={16} />}
              >
                Edit Client Info
              </Button>
              <Button
                color="danger"
                variant="flat"
                onPress={close}
                startContent={<X size={16} />}
              >
                Delete Client
              </Button>
            </div>
            <Button color="default" variant="solid" onPress={close}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Metrics Modal */}
      {showAddMetricsModal && (
        <AddClientMetricsModal
          close={() => setShowAddMetricsModal(false)}
          client={client}
          onMetricsAdded={handleMetricsAdded}
        />
      )}
    </>
  );
}

// Reusable section renderer
function Section({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  );
}
