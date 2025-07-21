import React from "react";
import { ChefHat, Plus } from "lucide-react";
import { Input } from "@heroui/react";
import Button from "@/common/button";

/**
 * Hero Section Component for Nutrition Page
 * Contains the main title, description, and quick plan creation
 */
const NutritionHeroSection = ({
  quickPlanName,
  setQuickPlanName,
  onCreatePlan,
}) => {
  return (
    <div className="flex items-center justify-center min-h-[40vh] w-full z-10 px-8">
      <div className="flex flex-col gap-8 mx-auto justify-center items-center text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full">
              <ChefHat className="h-20 w-20 text-white" />
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-zinc-100 bg-clip-text text-transparent">
              Nutrition Plans
            </h1>
          </div>
          <p className="text-xl text-zinc-400 max-w-2xl">
            Create personalized nutrition plans powered by AI to help your
            clients achieve their health goals
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg">
          <Input
            placeholder="e.g., John's Muscle Gain Plan"
            value={quickPlanName}
            onChange={(e) => setQuickPlanName(e.target.value)}
            className="flex-1"
            size="lg"
            radius="lg"
            classNames={{
              input: "text-white",
              inputWrapper:
                "bg-zinc-800/50 group-data-[focus=true]:bg-zinc-800/70",
            }}
          />

          <Button
            onClick={onCreatePlan}
            className="flex items-center gap-2 bg-gradient-to-r from-zinc-600 to-zinc-600 hover:from-zinc-700 hover:to-zinc-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Create Plan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NutritionHeroSection;
