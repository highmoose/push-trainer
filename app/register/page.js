"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
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
  Eye,
  EyeOff,
  Lock,
  Check,
  X,
} from "lucide-react";

export default function ClientRegistration() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    password: "",
    passwordConfirmation: "",

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
  });

  const inviteToken = searchParams.get("invite_token");
  const trainerId = searchParams.get("trainer_id");

  useEffect(() => {
    if (!inviteToken) {
      alert("Invalid invitation link");
      router.push("/");
    }
  }, [inviteToken, router]);

  const tabs = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "fitness", label: "Fitness", icon: Activity },
    { id: "nutrition", label: "Nutrition", icon: ChefHat },
  ];

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.email.trim() || !form.password.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (form.password !== form.passwordConfirmation) {
      alert("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/clients/accept-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invite_token: inviteToken,
          password: form.password,
          password_confirmation: form.passwordConfirmation,
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          date_of_birth: form.dateOfBirth,
          address: form.address,
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
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration completed successfully! You can now log in.");
        router.push("/sign-in");
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCompletionPercentage = () => {
    const requiredFields = [
      "firstName",
      "email",
      "password",
      "passwordConfirmation",
    ];
    const optionalFields = [
      "lastName",
      "phone",
      "dateOfBirth",
      "address",
      "height",
      "weight",
    ];

    const requiredCompleted = requiredFields.filter((field) =>
      form[field].trim()
    ).length;
    const optionalCompleted = optionalFields.filter((field) =>
      form[field].trim()
    ).length;

    const requiredPercent = (requiredCompleted / requiredFields.length) * 70; // 70% for required
    const optionalPercent = (optionalCompleted / optionalFields.length) * 30; // 30% for optional

    return Math.round(requiredPercent + optionalPercent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
      <div className="bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h1 className="text-3xl font-bold">Complete Your Registration</h1>
          <p className="text-blue-100 mt-2">
            Fill out your information to get started with your trainer
          </p>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Profile Completion</span>
              <span>{getCompletionPercentage()}%</span>
            </div>
            <div className="w-full bg-blue-800 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-zinc-900 rounded-lg p-1 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
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
          <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
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

                {/* Password Fields */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Password*
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      aria-label="Password"
                      className="w-full pl-10 pr-10 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Confirm Password*
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="passwordConfirmation"
                      value={form.passwordConfirmation}
                      onChange={handleChange}
                      aria-label="Confirm Password"
                      className="w-full pl-10 pr-10 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

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
                  placeholder="e.g., 175"
                />
                <InputField
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={form.weight}
                  onChange={handleChange}
                  icon={Weight}
                  placeholder="e.g., 70"
                />
                <SelectField
                  label="Fitness Goals"
                  name="fitnessGoals"
                  value={form.fitnessGoals}
                  onChange={handleChange}
                  icon={Target}
                  options={[
                    { value: "", label: "Select your primary goal..." },
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
                    { value: "", label: "Select your experience..." },
                    { value: "beginner", label: "Beginner (0-6 months)" },
                    {
                      value: "intermediate",
                      label: "Intermediate (6 months - 2 years)",
                    },
                    { value: "advanced", label: "Advanced (2+ years)" },
                  ]}
                />
                <SelectField
                  label="Activity Level"
                  name="fitnessLevel"
                  value={form.fitnessLevel}
                  onChange={handleChange}
                  icon={Activity}
                  options={[
                    { value: "", label: "Select your activity level..." },
                    {
                      value: "sedentary",
                      label: "Sedentary (little to no exercise)",
                    },
                    {
                      value: "lightly_active",
                      label: "Lightly Active (1-3 days/week)",
                    },
                    {
                      value: "moderately_active",
                      label: "Moderately Active (3-5 days/week)",
                    },
                    {
                      value: "very_active",
                      label: "Very Active (6-7 days/week)",
                    },
                    {
                      value: "extremely_active",
                      label: "Extremely Active (2x/day)",
                    },
                  ]}
                  className="md:col-span-2"
                />
                <TextAreaField
                  label="Current Measurements (Optional)"
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
                  label="Foods You Enjoy"
                  name="foodLikes"
                  value={form.foodLikes}
                  onChange={handleChange}
                  placeholder="List foods you love eating..."
                  icon={ChefHat}
                />
                <TextAreaField
                  label="Foods You Dislike"
                  name="foodDislikes"
                  value={form.foodDislikes}
                  onChange={handleChange}
                  placeholder="List foods you prefer to avoid..."
                  icon={ChefHat}
                />
                <TextAreaField
                  label="Allergies & Intolerances"
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  placeholder="Any food allergies or intolerances (very important for meal planning)..."
                  icon={AlertTriangle}
                />
                <TextAreaField
                  label="Medical Conditions"
                  name="medicalConditions"
                  value={form.medicalConditions}
                  onChange={handleChange}
                  placeholder="Any medical conditions that may affect your diet or exercise routine..."
                  icon={FileText}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                submitting ||
                !form.firstName.trim() ||
                !form.email.trim() ||
                !form.password.trim() ||
                form.password !== form.passwordConfirmation
              }
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 font-medium disabled:cursor-not-allowed"
            >
              {submitting ? "Creating Account..." : "Complete Registration"}
            </button>
          </div>
        </form>
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
          aria-label={label}
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
          aria-label={label}
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
        aria-label={label}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none resize-vertical"
        {...props}
      />
    </div>
  );
}
