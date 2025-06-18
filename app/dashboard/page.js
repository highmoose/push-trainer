"use client";

import React from "react";
import Header from "@/components/layout/header";
import { useSelector } from "react-redux";
import TrainerArea from "@role/trainer/tabs/trainerArea";
import ClientDashboard from "@role/client/tabs/clientDashboard";
import GymOwnerDashboard from "@role/gym-owner/tabs/gymOwnerDashboard";

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);

  // AuthGuard handles authentication, so we can safely assume user exists here
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen justify-center items-center ">
      <div className="flex w-full h-full">
        {user?.role === "trainer" && <TrainerArea />}
        {user?.role === "client" && <ClientDashboard />}
        {user?.role === "gym_owner" && <GymOwnerDashboard />}
      </div>
    </div>
  );
}
