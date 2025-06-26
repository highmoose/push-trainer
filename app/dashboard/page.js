"use client";

import React from "react";
import Header from "@/components/layout/header";
import { useSelector } from "react-redux";
import { Spinner } from "@heroui/react";
import TrainerArea from "@role/trainer/tabs/trainerArea";
import ClientDashboard from "@role/client/tabs/clientDashboard";
import GymOwnerDashboard from "@role/gym-owner/tabs/gymOwnerDashboard";

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }
  return (
    <div className="flex flex-col w-full h-screen justify-center items-center overflow-hidden">
      <div className="flex w-full h-full">
        {user?.role === "trainer" && <TrainerArea />}
        {user?.role === "client" && <ClientDashboard />}
        {user?.role === "gym_owner" && <GymOwnerDashboard />}
      </div>
    </div>
  );
}
