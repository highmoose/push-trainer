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
} from "@redux/slices/clientSlice";
import React, { useEffect, useState, useRef, useCallback } from "react";

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
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-950 border border-zinc-900 rounded max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex bg-zinc-900 items-center justify-between p-4 px-8 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">
            {view === "select" && "Add New Client"}
            {view === "create" &&
              (selectedClient ? "Edit Client" : "Add Client Details")}
            {view === "invite" && "Invite Client"}
          </h2>
          <button
            onClick={close}
            className="text-zinc-400 hover:text-white p-2 rounded hover:bg-zinc-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-dark p-4 px-8 bg-zinc-900">
          {view === "select" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-3">
                  Client Addition Method
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Add Client Details Option */}
                  <button
                    onClick={() => setView("create")}
                    className="p-3 rounded border-2 border-zinc-800 bg-zinc-900 text-white hover:border-white hover:bg-white hover:text-black transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <UserPlus className="w-5 h-5 text-blue-400 group-hover:text-black" />
                      <div>
                        <div className="font-medium text-sm group-hover:text-black">
                          Add Client Details
                        </div>
                        <div className="text-zinc-400 group-hover:text-zinc-600 text-xs mt-1">
                          Manually enter client information
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Invite Client Option */}
                  <button
                    onClick={async () => {
                      const link = await generateInviteLink();
                      setView("invite");
                    }}
                    className="p-3 rounded border-2 border-zinc-800 bg-zinc-900 text-white hover:border-white hover:bg-white hover:text-black transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <MailPlus className="w-5 h-5 text-green-400 group-hover:text-black" />
                      <div>
                        <div className="font-medium text-sm group-hover:text-black">
                          Invite Client to Sign Up
                        </div>
                        <div className="text-zinc-400 group-hover:text-zinc-600 text-xs mt-1">
                          Send invitation link via email
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === "invite" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setView("select")}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-sm text-zinc-400">Back to selection</div>
              </div>

              {/* Generated Link */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">
                  Invitation Link
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-zinc-800 hover:bg-white hover:text-black text-white rounded transition-colors flex items-center gap-2"
                  >
                    {linkCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {linkCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Email Invitation */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">
                  Send via Email
                </h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="flex-1 p-2 rounded bg-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    onClick={sendInviteEmail}
                    disabled={emailSending}
                    className="px-4 py-2 bg-zinc-800 hover:bg-white hover:text-black disabled:bg-zinc-700 disabled:text-zinc-400 text-white rounded transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {emailSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === "create" && (
            <div className="space-y-4">
              {/* Back Navigation - only show if not editing existing client */}
              {!selectedClient && (
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setView("select")}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="text-sm text-zinc-400">Back to selection</div>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                <h3 className="text-sm font-medium text-zinc-300 mb-3">
                  Client Information
                </h3>
                <div className="flex space-x-1 bg-zinc-800 rounded p-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                          activeTab === tab.id
                            ? "bg-blue-500 text-white"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {activeTab === "basic" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          First Name*
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Email*
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={form.dateOfBirth}
                          onChange={handleChange}
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Gym
                        </label>
                        <input
                          type="text"
                          name="gym"
                          value={form.gym}
                          onChange={handleChange}
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "fitness" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          name="height"
                          value={form.height}
                          onChange={handleChange}
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={form.weight}
                          onChange={handleChange}
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Fitness Goals
                        </label>{" "}
                        <select
                          name="fitnessGoals"
                          value={form.fitnessGoals}
                          onChange={handleChange}
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                          <option value="" className="bg-zinc-800">
                            Select goal...
                          </option>
                          <option value="weight_loss" className="bg-zinc-800">
                            Weight Loss
                          </option>
                          <option value="muscle_gain" className="bg-zinc-800">
                            Muscle Gain
                          </option>
                          <option
                            value="general_fitness"
                            className="bg-zinc-800"
                          >
                            General Fitness
                          </option>
                          <option value="strength" className="bg-zinc-800">
                            Strength Training
                          </option>
                          <option value="endurance" className="bg-zinc-800">
                            Endurance
                          </option>
                          <option value="flexibility" className="bg-zinc-800">
                            Flexibility
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Fitness Experience
                        </label>{" "}
                        <select
                          name="fitnessExperience"
                          value={form.fitnessExperience}
                          onChange={handleChange}
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                          <option value="" className="bg-zinc-800">
                            Select experience...
                          </option>
                          <option value="beginner" className="bg-zinc-800">
                            Beginner (0-6 months)
                          </option>
                          <option value="intermediate" className="bg-zinc-800">
                            Intermediate (6 months - 2 years)
                          </option>
                          <option value="advanced" className="bg-zinc-800">
                            Advanced (2+ years)
                          </option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Fitness Level
                        </label>{" "}
                        <select
                          name="fitnessLevel"
                          value={form.fitnessLevel}
                          onChange={handleChange}
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                          <option value="" className="bg-zinc-800">
                            Select level...
                          </option>
                          <option value="sedentary" className="bg-zinc-800">
                            Sedentary
                          </option>
                          <option
                            value="lightly_active"
                            className="bg-zinc-800"
                          >
                            Lightly Active
                          </option>
                          <option
                            value="moderately_active"
                            className="bg-zinc-800"
                          >
                            Moderately Active
                          </option>
                          <option value="very_active" className="bg-zinc-800">
                            Very Active
                          </option>
                          <option
                            value="extremely_active"
                            className="bg-zinc-800"
                          >
                            Extremely Active
                          </option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Measurements
                        </label>{" "}
                        <textarea
                          name="measurements"
                          value={form.measurements}
                          onChange={handleChange}
                          rows="3"
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                          placeholder="e.g., Chest: 100cm, Waist: 80cm, Arms: 35cm..."
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "nutrition" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Food Likes
                        </label>{" "}
                        <textarea
                          name="foodLikes"
                          value={form.foodLikes}
                          onChange={handleChange}
                          rows="3"
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                          placeholder="Foods the client enjoys eating..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Food Dislikes
                        </label>{" "}
                        <textarea
                          name="foodDislikes"
                          value={form.foodDislikes}
                          onChange={handleChange}
                          rows="3"
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                          placeholder="Foods the client wants to avoid..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Allergies
                        </label>{" "}
                        <textarea
                          name="allergies"
                          value={form.allergies}
                          onChange={handleChange}
                          rows="3"
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                          placeholder="Any food allergies or intolerances..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Medical Conditions
                        </label>{" "}
                        <textarea
                          name="medicalConditions"
                          value={form.medicalConditions}
                          onChange={handleChange}
                          rows="3"
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                          placeholder="Any medical conditions that may affect diet or exercise..."
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "additional" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                          Notes
                        </label>{" "}
                        <textarea
                          name="notes"
                          value={form.notes}
                          onChange={handleChange}
                          rows="6"
                          className="w-full p-2 rounded bg-zinc-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                          placeholder="Additional notes about the client..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer with Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800 bg-zinc-900">
                <button
                  onClick={selectedClient ? close : () => setView("select")}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {selectedClient ? "Cancel" : "Back"}
                </button>
                <button
                  onClick={
                    selectedClient ? handleUpdateClient : handleCreateClient
                  }
                  className="px-6 py-2 bg-zinc-800 hover:bg-white hover:text-black text-white rounded transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {selectedClient ? "Update Client" : "Create Client"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export the component WITHOUT React.memo
export default AddClientModal;
