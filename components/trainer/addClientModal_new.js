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
} from "@redux/slices/clientSlice";
import { useEffect, useState } from "react";

export default function AddClientModal({ close, selectedClient = "" }) {
  const [view, setView] = useState("select"); // 'select', 'create', 'invite'
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("basic");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  const [form, setForm] = useState({
    // Basic Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    gym: "",

    // Fitness Information
    height: "",
    weight: "",
    fitnessGoals: "",
    fitnessExperience: "",
    fitnessLevel: "",
    measurements: "",

    // Nutrition Information
    foodLikes: "",
    foodDislikes: "",
    allergies: "",
    medicalConditions: "",

    // Additional
    notes: "",
  });

  useEffect(() => {
    if (selectedClient) {
      setView("create");
      setForm({
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
      });
    }
  }, [selectedClient]);

  const tabs = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "fitness", label: "Fitness", icon: Dumbbell },
    { id: "nutrition", label: "Nutrition", icon: Apple },
    { id: "additional", label: "Additional", icon: FileText },
  ];

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
      // Call API to send invite email
      const response = await fetch("/api/invite-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail,
          invite_link: inviteLink,
        }),
      });

      if (response.ok) {
        alert("Invitation email sent successfully!");
        close();
      } else {
        throw new Error("Failed to send email");
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

  const SelectionView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Add New Client</h2>
        <p className="text-zinc-400">
          Choose how you'd like to add this client
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Add Client Details Option */}
        <button
          onClick={() => setView("create")}
          className="p-6 bg-zinc-900 border border-zinc-700 rounded-lg hover:border-blue-500 transition-all group"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 bg-blue-500/20 rounded-full group-hover:bg-blue-500/30 transition-colors">
              <UserPlus className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">
                Add Client Details
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Manually enter all client information yourself
              </p>
            </div>
          </div>
        </button>

        {/* Invite Client Option */}
        <button
          onClick={async () => {
            const link = await generateInviteLink();
            setView("invite");
          }}
          className="p-6 bg-zinc-900 border border-zinc-700 rounded-lg hover:border-green-500 transition-all group"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 bg-green-500/20 rounded-full group-hover:bg-green-500/30 transition-colors">
              <MailPlus className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">
                Invite Client to Sign Up
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Send them a link to register and fill out their own details
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const InviteView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setView("select")}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">Invite Client</h2>
          <p className="text-zinc-400">
            Send an invitation link to your client
          </p>
        </div>
      </div>

      {/* Generated Link */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Invitation Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
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

        <div className="text-center text-zinc-500">
          <div className="flex items-center gap-2 justify-center">
            <div className="h-px bg-zinc-700 flex-1"></div>
            <span className="text-sm">OR</span>
            <div className="h-px bg-zinc-700 flex-1"></div>
          </div>
        </div>

        {/* Email Invitation */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Send via Email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="client@example.com"
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500"
            />
            <button
              onClick={sendInviteEmail}
              disabled={emailSending}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {emailSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CreateView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setView("select")}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">
            {selectedClient ? "Edit Client" : "Add Client Details"}
          </h2>
          <p className="text-zinc-400">Fill in the client information</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-zinc-900 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="First Name*"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              icon={User}
              required
            />
            <InputField
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              icon={User}
            />
            <InputField
              label="Email*"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              icon={Mail}
              required
            />
            <InputField
              label="Phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              icon={Phone}
            />
            <InputField
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              icon={Calendar}
            />
            <InputField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              icon={MapPin}
            />
            <InputField
              label="Gym"
              name="gym"
              value={form.gym}
              onChange={handleChange}
              icon={Building}
              className="md:col-span-2"
            />
          </div>
        )}

        {activeTab === "fitness" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Height (cm)"
              name="height"
              type="number"
              value={form.height}
              onChange={handleChange}
              icon={Ruler}
            />
            <InputField
              label="Weight (kg)"
              name="weight"
              type="number"
              value={form.weight}
              onChange={handleChange}
              icon={Weight}
            />
            <SelectField
              label="Fitness Goals"
              name="fitnessGoals"
              value={form.fitnessGoals}
              onChange={handleChange}
              icon={Target}
              options={[
                { value: "", label: "Select goal..." },
                { value: "weight_loss", label: "Weight Loss" },
                { value: "muscle_gain", label: "Muscle Gain" },
                { value: "general_fitness", label: "General Fitness" },
                { value: "strength", label: "Strength Training" },
                { value: "endurance", label: "Endurance" },
                { value: "flexibility", label: "Flexibility" },
              ]}
            />
            <SelectField
              label="Fitness Experience"
              name="fitnessExperience"
              value={form.fitnessExperience}
              onChange={handleChange}
              icon={Activity}
              options={[
                { value: "", label: "Select experience..." },
                { value: "beginner", label: "Beginner (0-6 months)" },
                {
                  value: "intermediate",
                  label: "Intermediate (6 months - 2 years)",
                },
                { value: "advanced", label: "Advanced (2+ years)" },
              ]}
            />
            <SelectField
              label="Fitness Level"
              name="fitnessLevel"
              value={form.fitnessLevel}
              onChange={handleChange}
              icon={Activity}
              options={[
                { value: "", label: "Select level..." },
                { value: "sedentary", label: "Sedentary" },
                { value: "lightly_active", label: "Lightly Active" },
                { value: "moderately_active", label: "Moderately Active" },
                { value: "very_active", label: "Very Active" },
                { value: "extremely_active", label: "Extremely Active" },
              ]}
              className="md:col-span-2"
            />
            <TextAreaField
              label="Measurements"
              name="measurements"
              value={form.measurements}
              onChange={handleChange}
              placeholder="e.g., Chest: 100cm, Waist: 80cm, Arms: 35cm..."
              className="md:col-span-2"
            />
          </div>
        )}

        {activeTab === "nutrition" && (
          <div className="space-y-4">
            <TextAreaField
              label="Food Likes"
              name="foodLikes"
              value={form.foodLikes}
              onChange={handleChange}
              placeholder="Foods the client enjoys eating..."
              icon={ChefHat}
            />
            <TextAreaField
              label="Food Dislikes"
              name="foodDislikes"
              value={form.foodDislikes}
              onChange={handleChange}
              placeholder="Foods the client wants to avoid..."
              icon={ChefHat}
            />
            <TextAreaField
              label="Allergies"
              name="allergies"
              value={form.allergies}
              onChange={handleChange}
              placeholder="Any food allergies or intolerances..."
              icon={AlertTriangle}
            />
            <TextAreaField
              label="Medical Conditions"
              name="medicalConditions"
              value={form.medicalConditions}
              onChange={handleChange}
              placeholder="Any medical conditions that may affect diet or exercise..."
              icon={Heart}
            />
          </div>
        )}

        {activeTab === "additional" && (
          <div className="space-y-4">
            <TextAreaField
              label="Notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes about the client..."
              icon={FileText}
              rows={6}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700">
        <button
          onClick={() => setView("select")}
          className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={selectedClient ? handleUpdateClient : handleCreateClient}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {selectedClient ? "Update Client" : "Create Client"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 bg-opacity-50 backdrop-blur-xs z-50">
      <div className="bg-zinc-950 relative flex flex-col rounded-xl shadow-2xl shadow-white/10 gap-6 p-8 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer z-10"
        >
          <X size={22} />
        </button>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {view === "select" && <SelectionView />}
          {view === "invite" && <InviteView />}
          {view === "create" && <CreateView />}
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component
function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  icon: Icon,
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-zinc-300 mb-1">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full ${
            Icon ? "pl-10" : "pl-3"
          } pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none`}
          required={required}
          {...props}
        />
      </div>
    </div>
  );
}

// Reusable Select Component
function SelectField({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  options,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-zinc-300 mb-1">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full ${
            Icon ? "pl-10" : "pl-3"
          } pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-blue-500 focus:outline-none appearance-none`}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-zinc-800"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// Reusable TextArea Component
function TextAreaField({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  rows = 3,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-zinc-300 mb-1">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none resize-vertical"
        {...props}
      />
    </div>
  );
}
