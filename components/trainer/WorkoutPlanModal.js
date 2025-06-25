"use client";

import { useState, useEffect } from "react";
import { X, Plus, Dumbbell, Save, Sparkles, User, Loader } from "lucide-react";
import axios from "@/lib/axios";

const WORKOUT_TYPES = [
  {
    id: "strength",
    name: "Strength Training",
    description: "Build muscle and power",
  },
  {
    id: "cardio",
    name: "Cardio Focus",
    description: "Improve cardiovascular fitness",
  },
  {
    id: "hiit",
    name: "HIIT Training",
    description: "High-intensity interval training",
  },
  {
    id: "flexibility",
    name: "Flexibility & Mobility",
    description: "Improve range of motion",
  },
  {
    id: "powerlifting",
    name: "Powerlifting",
    description: "Focus on compound movements",
  },
  {
    id: "bodybuilding",
    name: "Bodybuilding",
    description: "Muscle building and definition",
  },
  {
    id: "functional",
    name: "Functional Training",
    description: "Real-world movement patterns",
  },
  {
    id: "rehabilitation",
    name: "Rehabilitation",
    description: "Recovery and injury prevention",
  },
];

const WORKOUT_LEVELS = [
  { id: "beginner", name: "Beginner", description: "New to fitness" },
  {
    id: "intermediate",
    name: "Intermediate",
    description: "Some fitness experience",
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "Experienced fitness enthusiast",
  },
  { id: "expert", name: "Expert", description: "Elite level training" },
];

const WORKOUT_EQUIPMENT = [
  {
    id: "bodyweight",
    name: "Bodyweight Only",
    description: "No equipment required",
  },
  {
    id: "basic",
    name: "Basic Equipment",
    description: "Dumbbells, resistance bands",
  },
  { id: "full_gym", name: "Full Gym", description: "Complete gym equipment" },
  { id: "home_gym", name: "Home Gym", description: "Basic home gym setup" },
];

export default function WorkoutPlanModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  onPlanCreated,
  editPlan = null,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    workout_type: "",
    fitness_level: "",
    equipment_level: "",
    duration_weeks: 4,
    sessions_per_week: 3,
    session_duration: 60,
    goals: "",
    notes: "",
  });

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editPlan) {
      setFormData({
        title: editPlan.title || "",
        description: editPlan.description || "",
        workout_type: editPlan.workout_type || "",
        fitness_level: editPlan.fitness_level || "",
        equipment_level: editPlan.equipment_level || "",
        duration_weeks: editPlan.duration_weeks || 4,
        sessions_per_week: editPlan.sessions_per_week || 3,
        session_duration: editPlan.session_duration || 60,
        goals: editPlan.goals || "",
        notes: editPlan.notes || "",
      });
      setExercises(editPlan.exercises || []);
    }
  }, [editPlan]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const addExercise = () => {
    const newExercise = {
      id: Date.now(),
      name: "",
      sets: 3,
      reps: "10-12",
      rest: "60s",
      weight: "",
      notes: "",
      day: 1,
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (id, field, value) => {
    setExercises(
      exercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const generateWorkoutPlan = async () => {
    if (
      !formData.workout_type ||
      !formData.fitness_level ||
      !formData.equipment_level
    ) {
      setErrors({
        general:
          "Please fill in workout type, fitness level, and equipment level before generating.",
      });
      return;
    }

    setGenerating(true);
    setErrors({});

    try {
      const workoutTypeData = WORKOUT_TYPES.find(
        (t) => t.id === formData.workout_type
      );
      const levelData = WORKOUT_LEVELS.find(
        (l) => l.id === formData.fitness_level
      );
      const equipmentData = WORKOUT_EQUIPMENT.find(
        (e) => e.id === formData.equipment_level
      );

      const prompt = `Create a comprehensive ${
        workoutTypeData?.name
      } workout plan with the following specifications:

PLAN REQUIREMENTS:
- Training Style: ${workoutTypeData?.name} - ${workoutTypeData?.description}
- Fitness Level: ${levelData?.name} - ${levelData?.description}
- Equipment: ${equipmentData?.name} - ${equipmentData?.description}
- Duration: ${formData.duration_weeks} weeks
- Sessions per week: ${formData.sessions_per_week}
- Session duration: ${formData.session_duration} minutes
${formData.goals ? `- Goals: ${formData.goals}` : ""}
${clientName ? `- Client: ${clientName}` : ""}

REQUIREMENTS:
1. Create a structured workout plan with specific exercises
2. Include sets, reps, and rest periods for each exercise
3. Organize exercises by training day/session
4. Ensure exercises match the specified equipment level
5. Progress exercises appropriately for the fitness level
6. Include warm-up and cool-down recommendations
7. Provide notes for proper form and safety

Please format the response as a structured workout plan that can be easily followed.`;

      const response = await axios.post("/api/workout-plans/generate", {
        prompt,
        client_id: clientId,
        title:
          formData.title ||
          `${workoutTypeData?.name} Plan - ${clientName || "Custom"}`,
        workout_type: formData.workout_type,
        fitness_level: formData.fitness_level,
        equipment_level: formData.equipment_level,
        duration_weeks: formData.duration_weeks,
        sessions_per_week: formData.sessions_per_week,
        session_duration: formData.session_duration,
        goals: formData.goals,
      });

      if (response.data.success) {
        const generatedPlan = response.data.plan;

        // Update form with generated data
        if (generatedPlan.title && !formData.title) {
          setFormData((prev) => ({ ...prev, title: generatedPlan.title }));
        }
        if (generatedPlan.description) {
          setFormData((prev) => ({
            ...prev,
            description: generatedPlan.description,
          }));
        }

        // Set generated exercises
        if (generatedPlan.exercises) {
          setExercises(
            generatedPlan.exercises.map((ex, index) => ({
              ...ex,
              id: Date.now() + index,
            }))
          );
        }
      } else {
        setErrors({
          general: response.data.message || "Failed to generate workout plan",
        });
      }
    } catch (error) {
      console.error("Error generating workout plan:", error);
      setErrors({
        general:
          error.response?.data?.message ||
          "Failed to generate workout plan. Please try again.",
      });
    } finally {
      setGenerating(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.workout_type) {
      newErrors.workout_type = "Workout type is required";
    }
    if (!formData.fitness_level) {
      newErrors.fitness_level = "Fitness level is required";
    }
    if (!formData.equipment_level) {
      newErrors.equipment_level = "Equipment level is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const planData = {
        ...formData,
        client_id: clientId,
        exercises: exercises,
      };

      let response;
      if (editPlan) {
        response = await axios.put(
          `/api/workout-plans/${editPlan.id}`,
          planData
        );
      } else {
        response = await axios.post("/api/workout-plans", planData);
      }

      if (response.data.success) {
        onPlanCreated?.(response.data.plan);
        onClose();
      } else {
        setErrors({
          general: response.data.message || "Failed to save workout plan",
        });
      }
    } catch (error) {
      console.error("Error saving workout plan:", error);
      setErrors({
        general:
          error.response?.data?.message ||
          "Failed to save workout plan. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Dumbbell className="text-blue-400" size={24} />
            <h2 className="text-white text-xl font-semibold">
              {editPlan ? "Edit Workout Plan" : "Create Workout Plan"}
              {clientName && ` for ${clientName}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Display */}
        {errors.general && (
          <div className="mx-6 mt-4 bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 text-sm">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Plan Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g., 12-Week Strength Building Program"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
                className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Brief description of the workout plan..."
              />
            </div>
          </div>

          {/* Plan Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Workout Type *
              </label>
              <select
                value={formData.workout_type}
                onChange={(e) =>
                  handleInputChange("workout_type", e.target.value)
                }
                className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select type...</option>
                {WORKOUT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.workout_type && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.workout_type}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Fitness Level *
              </label>
              <select
                value={formData.fitness_level}
                onChange={(e) =>
                  handleInputChange("fitness_level", e.target.value)
                }
                className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select level...</option>
                {WORKOUT_LEVELS.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
              {errors.fitness_level && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.fitness_level}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Equipment *
              </label>
              <select
                value={formData.equipment_level}
                onChange={(e) =>
                  handleInputChange("equipment_level", e.target.value)
                }
                className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select equipment...</option>
                {WORKOUT_EQUIPMENT.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>
                    {equipment.name}
                  </option>
                ))}
              </select>
              {errors.equipment_level && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.equipment_level}
                </p>
              )}
            </div>
          </div>

          {/* Duration & Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Duration (weeks)
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={formData.duration_weeks}
                onChange={(e) =>
                  handleInputChange(
                    "duration_weeks",
                    parseInt(e.target.value) || 1
                  )
                }
                className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Sessions/Week
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={formData.sessions_per_week}
                onChange={(e) =>
                  handleInputChange(
                    "sessions_per_week",
                    parseInt(e.target.value) || 1
                  )
                }
                className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Session Duration (min)
              </label>
              <input
                type="number"
                min="15"
                max="180"
                step="15"
                value={formData.session_duration}
                onChange={(e) =>
                  handleInputChange(
                    "session_duration",
                    parseInt(e.target.value) || 60
                  )
                }
                className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Goals & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Goals
              </label>
              <textarea
                value={formData.goals}
                onChange={(e) => handleInputChange("goals", e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g., Build muscle mass, improve strength, lose weight..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Additional notes, modifications, or instructions..."
              />
            </div>
          </div>

          {/* AI Generation Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={generateWorkoutPlan}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Workout Plan with AI
                </>
              )}
            </button>
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Exercises</h3>
              <button
                type="button"
                onClick={addExercise}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add Exercise
              </button>
            </div>

            {exercises.length === 0 && (
              <div className="text-center py-8 text-zinc-400">
                <Dumbbell className="mx-auto mb-2 opacity-50" size={48} />
                <p>
                  No exercises added yet. Generate a plan with AI or add
                  exercises manually.
                </p>
              </div>
            )}

            {exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="bg-zinc-800 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-300">
                    Exercise {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExercise(exercise.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) =>
                        updateExercise(exercise.id, "name", e.target.value)
                      }
                      placeholder="Exercise name"
                      className="w-full p-2 rounded bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Day
                    </label>
                    <select
                      value={exercise.day}
                      onChange={(e) =>
                        updateExercise(
                          exercise.id,
                          "day",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full p-2 rounded bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500"
                    >
                      {Array.from(
                        { length: formData.sessions_per_week },
                        (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Day {i + 1}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Sets
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) =>
                        updateExercise(
                          exercise.id,
                          "sets",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-full p-2 rounded bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Reps
                    </label>
                    <input
                      type="text"
                      value={exercise.reps}
                      onChange={(e) =>
                        updateExercise(exercise.id, "reps", e.target.value)
                      }
                      placeholder="e.g., 10-12"
                      className="w-full p-2 rounded bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Rest
                    </label>
                    <input
                      type="text"
                      value={exercise.rest}
                      onChange={(e) =>
                        updateExercise(exercise.id, "rest", e.target.value)
                      }
                      placeholder="e.g., 60s"
                      className="w-full p-2 rounded bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-zinc-400 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={exercise.notes}
                      onChange={(e) =>
                        updateExercise(exercise.id, "notes", e.target.value)
                      }
                      placeholder="Form notes, modifications, etc."
                      className="w-full p-2 rounded bg-zinc-700 text-white border border-zinc-600 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {editPlan ? "Update Plan" : "Create Plan"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
