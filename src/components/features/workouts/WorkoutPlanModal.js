"use client";

import { useState, useEffect } from "react";
import { X, Plus, Dumbbell, Save, Sparkles, User, Loader } from "lucide-react";
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
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
} from "@heroui/react";
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-zinc-900 border border-zinc-800",
        header: "border-b border-zinc-800",
        body: "py-6",
        footer: "border-t border-zinc-800",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <Dumbbell className="text-blue-400" size={24} />
          <span className="text-white text-xl font-semibold">
            {editPlan ? "Edit Workout Plan" : "Create Workout Plan"}
            {clientName && ` for ${clientName}`}
          </span>
        </ModalHeader>

        <ModalBody>
          {/* Error Display */}
          {errors.general && (
            <Card className="bg-red-900/20 border border-red-500">
              <CardBody>
                <p className="text-red-400 text-sm">{errors.general}</p>
              </CardBody>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Plan Title"
                  placeholder="e.g., 12-Week Strength Building Program"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  isRequired
                  isInvalid={!!errors.title}
                  errorMessage={errors.title}
                  classNames={{
                    base: "max-w-full",
                    input: "text-white",
                    inputWrapper:
                      "bg-zinc-800 border-zinc-700 data-[hover=true]:border-blue-500",
                  }}
                />
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  placeholder="Brief description of the workout plan..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  minRows={3}
                  classNames={{
                    base: "max-w-full",
                    input: "text-white",
                    inputWrapper:
                      "bg-zinc-800 border-zinc-700 data-[hover=true]:border-blue-500",
                  }}
                />
              </div>
            </div>

            {/* Plan Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Workout Type"
                placeholder="Select workout type"
                selectedKeys={
                  formData.workout_type ? [formData.workout_type] : []
                }
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0];
                  handleInputChange("workout_type", selectedKey || "");
                }}
                isRequired
                isInvalid={!!errors.workout_type}
                errorMessage={errors.workout_type}
                classNames={{
                  base: "max-w-full",
                  trigger:
                    "bg-zinc-800 border-zinc-700 data-[hover=true]:border-blue-500",
                  value: "text-white",
                  popoverContent: "bg-zinc-800 border-zinc-700",
                }}
              >
                {WORKOUT_TYPES.map((type) => (
                  <SelectItem
                    key={type.id}
                    value={type.id}
                    classNames={{
                      base: "data-[hover=true]:bg-zinc-700 data-[selected=true]:bg-blue-600",
                      title: "text-white",
                      description: "text-zinc-400",
                    }}
                  >
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-zinc-400">
                        {type.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Fitness Level"
                placeholder="Select fitness level"
                selectedKeys={
                  formData.fitness_level ? [formData.fitness_level] : []
                }
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0];
                  handleInputChange("fitness_level", selectedKey || "");
                }}
                isRequired
                isInvalid={!!errors.fitness_level}
                errorMessage={errors.fitness_level}
                classNames={{
                  base: "max-w-full",
                  trigger:
                    "bg-zinc-800 border-zinc-700 data-[hover=true]:border-blue-500",
                  value: "text-white",
                  popoverContent: "bg-zinc-800 border-zinc-700",
                }}
              >
                {WORKOUT_LEVELS.map((level) => (
                  <SelectItem
                    key={level.id}
                    value={level.id}
                    classNames={{
                      base: "data-[hover=true]:bg-zinc-700 data-[selected=true]:bg-blue-600",
                      title: "text-white",
                      description: "text-zinc-400",
                    }}
                  >
                    <div>
                      <div className="font-medium">{level.name}</div>
                      <div className="text-sm text-zinc-400">
                        {level.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Equipment Level"
                placeholder="Select equipment level"
                selectedKeys={
                  formData.equipment_level ? [formData.equipment_level] : []
                }
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0];
                  handleInputChange("equipment_level", selectedKey || "");
                }}
                isRequired
                isInvalid={!!errors.equipment_level}
                errorMessage={errors.equipment_level}
                classNames={{
                  base: "max-w-full",
                  trigger:
                    "bg-zinc-800 border-zinc-700 data-[hover=true]:border-blue-500",
                  value: "text-white",
                  popoverContent: "bg-zinc-800 border-zinc-700",
                }}
              >
                {WORKOUT_EQUIPMENT.map((equipment) => (
                  <SelectItem
                    key={equipment.id}
                    value={equipment.id}
                    classNames={{
                      base: "data-[hover=true]:bg-zinc-700 data-[selected=true]:bg-blue-600",
                      title: "text-white",
                      description: "text-zinc-400",
                    }}
                  >
                    <div>
                      <div className="font-medium">{equipment.name}</div>
                      <div className="text-sm text-zinc-400">
                        {equipment.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Duration Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Duration (weeks)"
                type="number"
                value={formData.duration_weeks.toString()}
                onChange={(e) =>
                  handleInputChange(
                    "duration_weeks",
                    parseInt(e.target.value) || 4
                  )
                }
                min={1}
                max={52}
                classNames={{
                  base: "max-w-full",
                  input: "text-white",
                  inputWrapper:
                    "bg-zinc-800 border-zinc-700 data-[hover=true]:border-blue-500",
                }}
              />

              <Input
                label="Sessions per week"
                type="number"
                value={formData.sessions_per_week.toString()}
                onChange={(e) =>
                  handleInputChange(
                    "sessions_per_week",
                    parseInt(e.target.value) || 3
                  )
                }
                min={1}
                max={7}
                classNames={{
                  base: "max-w-full",
                  input: "text-white",
                  inputWrapper:
                    "bg-zinc-800 border-zinc-700 data-[hover=true]:border-blue-500",
                }}
              />

              <Input
                label="Session duration (minutes)"
                type="number"
                value={formData.session_duration.toString()}
                onChange={(e) =>
                  handleInputChange(
                    "session_duration",
                    parseInt(e.target.value) || 60
                  )
                }
                min={15}
                max={180}
                classNames={{
                  base: "max-w-full",
                  input: "text-white",
                  inputWrapper:
                    "bg-zinc-800 border-zinc-700 data-[hover=true]:border-blue-500",
                }}
              />
            </div>

            {/* Goals and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="Goals"
                placeholder="Specific goals for this workout plan..."
                value={formData.goals}
                onChange={(e) => handleInputChange("goals", e.target.value)}
                minRows={3}
                classNames={{
                  base: "max-w-full",
                  input: "text-white",
                  inputWrapper:
                    "bg-zinc-800 border-zinc-700 data-[hover=true]:border-blue-500",
                }}
              />

              <Textarea
                label="Notes"
                placeholder="Additional notes or instructions..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                minRows={3}
                classNames={{
                  base: "max-w-full",
                  input: "text-white",
                  inputWrapper:
                    "bg-zinc-800 border-zinc-700 data-[hover=true]:border-blue-500",
                }}
              />
            </div>

            {/* AI Generation Section */}
            <Card className="bg-zinc-800/50 border border-zinc-700">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-yellow-400" size={20} />
                  <span className="text-white font-medium">
                    AI-Powered Workout Generation
                  </span>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <p className="text-zinc-400 text-sm mb-4">
                  Let AI generate a complete workout plan based on your
                  configuration above.
                </p>
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={generateWorkoutPlan}
                  isDisabled={
                    !formData.workout_type ||
                    !formData.fitness_level ||
                    !formData.equipment_level ||
                    generating
                  }
                  startContent={
                    generating ? <Spinner size="sm" /> : <Sparkles size={16} />
                  }
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                  {generating ? "Generating..." : "Generate Workout Plan"}
                </Button>
              </CardBody>
            </Card>

            {/* Exercises Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-lg font-medium">Exercises</h3>
                <Button
                  color="primary"
                  variant="flat"
                  onPress={addExercise}
                  startContent={<Plus size={16} />}
                  size="sm"
                >
                  Add Exercise
                </Button>
              </div>

              {exercises.map((exercise, index) => (
                <Card
                  key={exercise.id}
                  className="bg-zinc-800/50 border border-zinc-700"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white font-medium">
                        Exercise {index + 1}
                      </span>
                      <Button
                        color="danger"
                        variant="light"
                        size="sm"
                        onPress={() => removeExercise(exercise.id)}
                        isIconOnly
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div className="md:col-span-2">
                        <Input
                          label="Exercise Name"
                          placeholder="e.g., Bench Press"
                          value={exercise.name}
                          onChange={(e) =>
                            updateExercise(exercise.id, "name", e.target.value)
                          }
                          size="sm"
                          classNames={{
                            input: "text-white",
                            inputWrapper:
                              "bg-zinc-700 border-zinc-600 data-[hover=true]:border-blue-500",
                          }}
                        />
                      </div>

                      <div>
                        <Input
                          label="Day"
                          type="number"
                          value={exercise.day?.toString() || "1"}
                          onChange={(e) =>
                            updateExercise(
                              exercise.id,
                              "day",
                              parseInt(e.target.value) || 1
                            )
                          }
                          min={1}
                          max={7}
                          size="sm"
                          classNames={{
                            input: "text-white",
                            inputWrapper:
                              "bg-zinc-700 border-zinc-600 data-[hover=true]:border-blue-500",
                          }}
                        />
                      </div>

                      <div>
                        <Input
                          label="Sets"
                          type="number"
                          value={exercise.sets?.toString() || "3"}
                          onChange={(e) =>
                            updateExercise(
                              exercise.id,
                              "sets",
                              parseInt(e.target.value) || 3
                            )
                          }
                          min={1}
                          size="sm"
                          classNames={{
                            input: "text-white",
                            inputWrapper:
                              "bg-zinc-700 border-zinc-600 data-[hover=true]:border-blue-500",
                          }}
                        />
                      </div>

                      <div>
                        <Input
                          label="Reps"
                          placeholder="e.g., 8-12"
                          value={exercise.reps}
                          onChange={(e) =>
                            updateExercise(exercise.id, "reps", e.target.value)
                          }
                          size="sm"
                          classNames={{
                            input: "text-white",
                            inputWrapper:
                              "bg-zinc-700 border-zinc-600 data-[hover=true]:border-blue-500",
                          }}
                        />
                      </div>

                      <div>
                        <Input
                          label="Rest"
                          placeholder="e.g., 60s"
                          value={exercise.rest}
                          onChange={(e) =>
                            updateExercise(exercise.id, "rest", e.target.value)
                          }
                          size="sm"
                          classNames={{
                            input: "text-white",
                            inputWrapper:
                              "bg-zinc-700 border-zinc-600 data-[hover=true]:border-blue-500",
                          }}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Input
                          label="Weight"
                          placeholder="e.g., 135lbs"
                          value={exercise.weight}
                          onChange={(e) =>
                            updateExercise(
                              exercise.id,
                              "weight",
                              e.target.value
                            )
                          }
                          size="sm"
                          classNames={{
                            input: "text-white",
                            inputWrapper:
                              "bg-zinc-700 border-zinc-600 data-[hover=true]:border-blue-500",
                          }}
                        />
                      </div>

                      <div className="md:col-span-4">
                        <Input
                          label="Notes"
                          placeholder="Form notes, modifications, etc."
                          value={exercise.notes}
                          onChange={(e) =>
                            updateExercise(exercise.id, "notes", e.target.value)
                          }
                          size="sm"
                          classNames={{
                            input: "text-white",
                            inputWrapper:
                              "bg-zinc-700 border-zinc-600 data-[hover=true]:border-blue-500",
                          }}
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={loading}
            startContent={loading ? <Spinner size="sm" /> : <Save size={16} />}
          >
            {loading ? "Saving..." : editPlan ? "Update Plan" : "Create Plan"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
