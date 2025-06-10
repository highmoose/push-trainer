"use client";

import React, { useEffect } from "react";
import Header from "@/components/layout/header";
import { useSelector } from "react-redux";
import TrainerArea from "@role/trainer/tabs/trainerArea";
import ClientDashboard from "@role/client/tabs/clientDashboard";
import GymOwnerDashboard from "@role/gym-owner/tabs/gymOwnerDashboard";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) {
      router.push("/welcome");
    }
  }, [user]);

  return (
    <div className="flex flex-col w-full min-h-screen justify-center items-center ">
      <div className="flex w-full h-full">
        {user?.role === "trainer" && <TrainerArea />}
        {user?.role === "client" && <ClientDashboard />}
        {/* {user?.role === "gym_owner" && <GymOwnerDashboard />} */}
      </div>
    </div>
  );
}
