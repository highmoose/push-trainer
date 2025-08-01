"use client";

import {
  Info,
  MailPlus,
  Upload,
  UserPlus,
  X,
  Dumbbell,
  Apple,
  ChartNoAxesCombinedIcon,
  Heart,
  HeartPulse,
  Copy,
  Send,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Ruler,
  Weight,
  Target,
  Activity,
  ChefHat,
  AlertTriangle,
  FileText,
  Check,
} from "lucide-react";
import { useDispatch } from "react-redux";
import {
  addClient,
  addTempClient,
  updateClient,
  sendClientInvite,
} from "@/store/slices/clientSlice";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Card,
  CardBody,
} from "@heroui/react";

// Static tabs configuration - moved outside to prevent re-creation
const tabs = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "nutrition", label: "Nutrition", icon: Apple },
  { id: "additional", label: "Additional", icon: FileText },
];

function AddClientModal({ close, selectedClient = "" }) {
  const [view, setView] = useState(selectedClient ? "create" : "select");
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("basic");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  // Initialize form state with stable initial values
  const [form, setForm] = useState(() => {
    if (selectedClient) {
      return {
        firstName: selectedClient.first_name || "",
        lastName: selectedClient.last_name || "",
        email: selectedClient.email || "",
        phone: selectedClient.phone || "",
        dateOfBirth: selectedClient.date_of_birth || "",
        address: selectedClient.address || "",
        gym: selectedClient.gym || "",
        height: selectedClient.height || "",
        weight: selectedClient.weight || "",
        fitnessGoals: selectedClient.fitness_goals || "",
        fitnessExperience: selectedClient.fitness_experience || "",
        fitnessLevel: selectedClient.fitness_level || "",
        measurements: selectedClient.measurements || "",
        foodLikes: selectedClient.food_likes || "",
        foodDislikes: selectedClient.food_dislikes || "",
        allergies: selectedClient.allergies || "",
        medicalConditions: selectedClient.medical_conditions || "",
        notes: selectedClient.notes || "",
      };
    }
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      gym: "",
      height: "",
      weight: "",
      fitnessGoals: "",
      fitnessExperience: "",
      fitnessLevel: "",
      measurements: "",
      foodLikes: "",
      foodDislikes: "",
      allergies: "",
      medicalConditions: "",
      notes: "",
    };
  });
  // Stable handleChange using useCallback to prevent re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Only set view, don't reset form state during typing
  useEffect(() => {
    if (selectedClient) {
      setView("create");
    }
  }, [selectedClient]);

  const generateInviteLink = async () => {
    // Generate a unique token for the invite
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/register?invite_token=${token}&trainer_id=${1}`; // Replace with actual trainer ID
    setInviteLink(link);
    return link;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
  const sendInviteEmail = async () => {
    if (!inviteEmail.trim()) {
      alert("Please enter an email address");
      return;
    }

    setEmailSending(true);
    try {
      const result = await dispatch(sendClientInvite(inviteEmail));

      if (sendClientInvite.fulfilled.match(result)) {
        alert("Invitation email sent successfully!");
        close();
      } else {
        throw new Error(result.payload || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invite email:", error);
      alert("Failed to send invitation email. Please try again.");
    } finally {
      setEmailSending(false);
    }
  };

  const handleCreateClient = async () => {
    if (!form.firstName.trim() || !form.email.trim()) {
      alert("Please fill in required fields (Name and Email)");
      return;
    }

    try {
      const clientData = {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        date_of_birth: form.dateOfBirth,
        address: form.address,
        gym: form.gym,
        height: form.height,
        weight: form.weight,
        fitness_goals: form.fitnessGoals,
        fitness_experience: form.fitnessExperience,
        fitness_level: form.fitnessLevel,
        measurements: form.measurements,
        food_likes: form.foodLikes,
        food_dislikes: form.foodDislikes,
        allergies: form.allergies,
        medical_conditions: form.medicalConditions,
        notes: form.notes,
      };

      dispatch(addClient(clientData));
      close();
    } catch (error) {
      console.error("Error creating client:", error);
      alert("Failed to create client. Please try again.");
    }
  };

  const handleUpdateClient = () => {
    if (!selectedClient?.id) return;

    const updateData = {
      id: selectedClient.id,
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
      date_of_birth: form.dateOfBirth,
      address: form.address,
      gym: form.gym,
      height: form.height,
      weight: form.weight,
      fitness_goals: form.fitnessGoals,
      fitness_experience: form.fitnessExperience,
      fitness_level: form.fitnessLevel,
      measurements: form.measurements,
      food_likes: form.foodLikes,
      food_dislikes: form.foodDislikes,
      allergies: form.allergies,
      medical_conditions: form.medicalConditions,
      notes: form.notes,
    };
    dispatch(updateClient(updateData));
    close();
  };
  return (
    <Modal
      isOpen={true}
      onOpenChange={(isOpen) => !isOpen && close()}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "p-6",
        header: "border-b border-zinc-800",
      }}
    >
      <ModalContent className="bg-zinc-950 border border-zinc-900">
        <ModalHeader className="flex items-center justify-between bg-zinc-900">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-white">
              {view === "select" && "Add New Client"}
              {view === "create" &&
                (selectedClient ? "Edit Client" : "Add Client Details")}
              {view === "invite" && "Invite Client"}
            </h2>
          </div>
        </ModalHeader>

        <ModalBody className="bg-zinc-900">
          {view === "select" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-3">
                  Client Addition Method
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Add Client Details Option */}
                  <Card
                    isPressable
                    onPress={() => setView("create")}
                    className="border-2 border-zinc-800 bg-zinc-900 hover:border-white hover:bg-white group transition-all cursor-pointer"
                  >
                    <CardBody className="p-3">
                      <div className="flex items-center gap-3">
                        <UserPlus className="w-5 h-5 text-blue-400 group-hover:text-black" />
                        <div>
                          <div className="font-medium text-sm text-white group-hover:text-black">
                            Add Client Details
                          </div>
                          <div className="text-zinc-400 group-hover:text-zinc-600 text-xs mt-1">
                            Manually enter client information
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Invite Client Option */}
                  <Card
                    isPressable
                    onPress={async () => {
                      const link = await generateInviteLink();
                      setView("invite");
                    }}
                    className="border-2 border-zinc-800 bg-zinc-900 hover:border-white hover:bg-white group transition-all cursor-pointer"
                  >
                    <CardBody className="p-3">
                      <div className="flex items-center gap-3">
                        <MailPlus className="w-5 h-5 text-green-400 group-hover:text-black" />
                        <div>
                          <div className="font-medium text-sm text-white group-hover:text-black">
                            Invite Client to Sign Up
                          </div>
                          <div className="text-zinc-400 group-hover:text-zinc-600 text-xs mt-1">
                            Send invitation link via email
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {view === "invite" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Button
                  onPress={() => setView("select")}
                  variant="ghost"
                  isIconOnly
                  className="text-zinc-400 hover:text-white"
                  aria-label="Back to selection"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="text-sm text-zinc-400">Back to selection</div>
              </div>

              {/* Generated Link */}
              <Card className="bg-zinc-900 border border-zinc-800">
                <CardBody className="p-3">
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">
                    Invitation Link
                  </h3>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={inviteLink}
                      isReadOnly
                      className="flex-1"
                      classNames={{
                        input: "bg-zinc-800 text-white",
                        inputWrapper: "bg-zinc-800 border-zinc-700",
                      }}
                    />
                    <Button
                      onPress={copyToClipboard}
                      variant="solid"
                      className="bg-zinc-800 hover:bg-white hover:text-black text-white"
                    >
                      {linkCopied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {linkCopied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Email Invitation */}
              <Card className="bg-zinc-900 border border-zinc-800">
                <CardBody className="p-3">
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">
                    Send via Email
                  </h3>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={inviteEmail}
                      onValueChange={setInviteEmail}
                      placeholder="client@example.com"
                      className="flex-1"
                      classNames={{
                        input: "bg-zinc-800 text-white placeholder-zinc-500",
                        inputWrapper: "bg-zinc-800 border-zinc-700",
                      }}
                    />
                    <Button
                      onPress={sendInviteEmail}
                      isDisabled={emailSending}
                      variant="solid"
                      className="bg-zinc-800 hover:bg-white hover:text-black text-white disabled:bg-zinc-700 disabled:text-zinc-400"
                    >
                      <Send className="w-4 h-4" />
                      {emailSending ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {view === "create" && (
            <div className="space-y-4">
              {/* Back Navigation - only show if not editing existing client */}
              {!selectedClient && (
                <div className="flex items-center gap-3 mb-4">
                  <Button
                    onPress={() => setView("select")}
                    variant="ghost"
                    isIconOnly
                    className="text-zinc-400 hover:text-white"
                    aria-label="Back to selection"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-sm text-zinc-400">Back to selection</div>
                </div>
              )}

              {/* Client Information Tabs */}
              <Card className="bg-zinc-900 border border-zinc-800">
                <CardBody className="p-3">
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">
                    Client Information
                  </h3>

                  <Tabs
                    selectedKey={activeTab}
                    onSelectionChange={setActiveTab}
                    variant="solid"
                    color="primary"
                    classNames={{
                      tabList: "bg-zinc-800",
                      cursor: "bg-blue-500",
                      tab: "text-zinc-400 data-[selected=true]:text-white",
                      tabContent: "group-data-[selected=true]:text-white",
                    }}
                  >
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <Tab
                          key={tab.id}
                          title={
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {tab.label}
                            </div>
                          }
                        />
                      );
                    })}
                  </Tabs>
                </CardBody>
              </Card>

              {/* Tab Content */}
              <Card className="bg-zinc-900 border border-zinc-800">
                <CardBody className="p-3">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {activeTab === "basic" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="text"
                          label="First Name"
                          name="firstName"
                          value={form.firstName}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, firstName: value }))
                          }
                          isRequired
                          classNames={{
                            input: "bg-zinc-800 text-white",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                        <Input
                          type="text"
                          label="Last Name"
                          name="lastName"
                          value={form.lastName}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, lastName: value }))
                          }
                          classNames={{
                            input: "bg-zinc-800 text-white",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                        <Input
                          type="email"
                          label="Email"
                          name="email"
                          value={form.email}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, email: value }))
                          }
                          isRequired
                          classNames={{
                            input: "bg-zinc-800 text-white",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                        <Input
                          type="tel"
                          label="Phone"
                          name="phone"
                          value={form.phone}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, phone: value }))
                          }
                          classNames={{
                            input: "bg-zinc-800 text-white",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                        <Input
                          type="date"
                          label="Date of Birth"
                          name="dateOfBirth"
                          value={form.dateOfBirth}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, dateOfBirth: value }))
                          }
                          classNames={{
                            input: "bg-zinc-800 text-white",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                        <Input
                          type="text"
                          label="Address"
                          name="address"
                          value={form.address}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, address: value }))
                          }
                          classNames={{
                            input: "bg-zinc-800 text-white",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                        <Input
                          type="text"
                          label="Gym"
                          name="gym"
                          value={form.gym}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, gym: value }))
                          }
                          className="md:col-span-2"
                          classNames={{
                            input: "bg-zinc-800 text-white",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                      </div>
                    )}

                    {activeTab === "fitness" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="number"
                          label="Height (cm)"
                          name="height"
                          value={form.height}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, height: value }))
                          }
                          classNames={{
                            input: "bg-zinc-800 text-white",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                        <Input
                          type="number"
                          label="Weight (kg)"
                          name="weight"
                          value={form.weight}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, weight: value }))
                          }
                          classNames={{
                            input: "bg-zinc-800 text-white",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                        <Select
                          label="Fitness Goals"
                          placeholder="Select goal..."
                          selectedKeys={
                            form.fitnessGoals ? [form.fitnessGoals] : []
                          }
                          onSelectionChange={(keys) => {
                            const selectedValue = Array.from(keys)[0];
                            setForm((prev) => ({
                              ...prev,
                              fitnessGoals: selectedValue || "",
                            }));
                          }}
                          classNames={{
                            trigger: "bg-zinc-800 border-zinc-700",
                            value: "text-white",
                            label: "text-zinc-300",
                            listboxWrapper: "bg-zinc-800",
                            popoverContent: "bg-zinc-800",
                          }}
                        >
                          <SelectItem key="weight_loss" className="text-white">
                            Weight Loss
                          </SelectItem>
                          <SelectItem key="muscle_gain" className="text-white">
                            Muscle Gain
                          </SelectItem>
                          <SelectItem
                            key="general_fitness"
                            className="text-white"
                          >
                            General Fitness
                          </SelectItem>
                          <SelectItem key="strength" className="text-white">
                            Strength Training
                          </SelectItem>
                          <SelectItem key="endurance" className="text-white">
                            Endurance
                          </SelectItem>
                          <SelectItem key="flexibility" className="text-white">
                            Flexibility
                          </SelectItem>
                        </Select>
                        <Select
                          label="Fitness Experience"
                          placeholder="Select experience..."
                          selectedKeys={
                            form.fitnessExperience
                              ? [form.fitnessExperience]
                              : []
                          }
                          onSelectionChange={(keys) => {
                            const selectedValue = Array.from(keys)[0];
                            setForm((prev) => ({
                              ...prev,
                              fitnessExperience: selectedValue || "",
                            }));
                          }}
                          classNames={{
                            trigger: "bg-zinc-800 border-zinc-700",
                            value: "text-white",
                            label: "text-zinc-300",
                            listboxWrapper: "bg-zinc-800",
                            popoverContent: "bg-zinc-800",
                          }}
                        >
                          <SelectItem key="beginner" className="text-white">
                            Beginner (0-6 months)
                          </SelectItem>
                          <SelectItem key="intermediate" className="text-white">
                            Intermediate (6 months - 2 years)
                          </SelectItem>
                          <SelectItem key="advanced" className="text-white">
                            Advanced (2+ years)
                          </SelectItem>
                        </Select>
                        <Select
                          label="Fitness Level"
                          placeholder="Select level..."
                          selectedKeys={
                            form.fitnessLevel ? [form.fitnessLevel] : []
                          }
                          onSelectionChange={(keys) => {
                            const selectedValue = Array.from(keys)[0];
                            setForm((prev) => ({
                              ...prev,
                              fitnessLevel: selectedValue || "",
                            }));
                          }}
                          className="md:col-span-2"
                          classNames={{
                            trigger: "bg-zinc-800 border-zinc-700",
                            value: "text-white",
                            label: "text-zinc-300",
                            listboxWrapper: "bg-zinc-800",
                            popoverContent: "bg-zinc-800",
                          }}
                        >
                          <SelectItem key="sedentary" className="text-white">
                            Sedentary
                          </SelectItem>
                          <SelectItem
                            key="lightly_active"
                            className="text-white"
                          >
                            Lightly Active
                          </SelectItem>
                          <SelectItem
                            key="moderately_active"
                            className="text-white"
                          >
                            Moderately Active
                          </SelectItem>
                          <SelectItem key="very_active" className="text-white">
                            Very Active
                          </SelectItem>
                          <SelectItem
                            key="extremely_active"
                            className="text-white"
                          >
                            Extremely Active
                          </SelectItem>
                        </Select>
                        <Textarea
                          label="Measurements"
                          name="measurements"
                          value={form.measurements}
                          onValueChange={(value) =>
                            setForm((prev) => ({
                              ...prev,
                              measurements: value,
                            }))
                          }
                          placeholder="e.g., Chest: 100cm, Waist: 80cm, Arms: 35cm..."
                          rows={3}
                          className="md:col-span-2"
                          classNames={{
                            input: "bg-zinc-800 text-white resize-none",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                      </div>
                    )}

                    {activeTab === "nutrition" && (
                      <div className="space-y-4">
                        <Textarea
                          label="Food Likes"
                          name="foodLikes"
                          value={form.foodLikes}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, foodLikes: value }))
                          }
                          placeholder="Foods the client enjoys eating..."
                          rows={3}
                          classNames={{
                            input: "bg-zinc-800 text-white resize-none",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                        <Textarea
                          label="Food Dislikes"
                          name="foodDislikes"
                          value={form.foodDislikes}
                          onValueChange={(value) =>
                            setForm((prev) => ({
                              ...prev,
                              foodDislikes: value,
                            }))
                          }
                          placeholder="Foods the client wants to avoid..."
                          rows={3}
                          classNames={{
                            input: "bg-zinc-800 text-white resize-none",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                        <Textarea
                          label="Allergies"
                          name="allergies"
                          value={form.allergies}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, allergies: value }))
                          }
                          placeholder="Any food allergies or intolerances..."
                          rows={3}
                          classNames={{
                            input: "bg-zinc-800 text-white resize-none",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                        <Textarea
                          label="Medical Conditions"
                          name="medicalConditions"
                          value={form.medicalConditions}
                          onValueChange={(value) =>
                            setForm((prev) => ({
                              ...prev,
                              medicalConditions: value,
                            }))
                          }
                          placeholder="Any medical conditions that may affect diet or exercise..."
                          rows={3}
                          classNames={{
                            input: "bg-zinc-800 text-white resize-none",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                      </div>
                    )}

                    {activeTab === "additional" && (
                      <div className="space-y-4">
                        <Textarea
                          label="Notes"
                          name="notes"
                          value={form.notes}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, notes: value }))
                          }
                          placeholder="Additional notes about the client..."
                          rows={6}
                          classNames={{
                            input: "bg-zinc-800 text-white resize-none",
                            inputWrapper: "bg-zinc-800 border-zinc-700",
                            label: "text-zinc-300",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </ModalBody>

        {view === "create" && (
          <ModalFooter className="bg-zinc-900 border-t border-zinc-800">
            <Button
              onPress={selectedClient ? close : () => setView("select")}
              variant="ghost"
              className="text-zinc-400 hover:text-white"
            >
              {selectedClient ? "Cancel" : "Back"}
            </Button>
            <Button
              onPress={selectedClient ? handleUpdateClient : handleCreateClient}
              color="primary"
              className="bg-zinc-800 hover:bg-white hover:text-black text-white"
            >
              <User className="w-4 h-4" />
              {selectedClient ? "Update Client" : "Create Client"}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}

// Export the component WITHOUT React.memo
export default AddClientModal;
