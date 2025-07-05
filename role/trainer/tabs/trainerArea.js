import Header from "@/components/layout/header";
import React, { useEffect, useState } from "react";
import Clients from "@role/trainer/tabs/clients";
import Dashboard from "@role/trainer/tabs/dashboard";
import Messages from "@role/trainer/tabs/messages";
import Planner from "@role/trainer/tabs/planner";
import Workouts from "@role/trainer/tabs/workouts";
import CheckIns from "@role/trainer/tabs/checkins";
import Team from "@role/trainer/tabs/team";
import Settings from "@role/trainer/tabs/settings";
import Metrics from "@role/trainer/tabs/metrics";
import Nutrition from "@role/trainer/tabs/nutrition";

import { useSelector } from "react-redux";
import { useClients } from "@/hooks/clients";
import { useSessions } from "@/hooks/session";
import { useTasks } from "@/hooks/tasks";
import { useMessaging } from "@/hooks/messaging";

export default function trainerDashboard() {
  const user = useSelector((state) => state.auth.user);
  const [showTab, setShowTab] = useState("clients"); // Default tab
  const authUser = useSelector((state) => state.auth.user);
  const authUserId = authUser?.id;

  // Initialize hooks - they will fetch data automatically on mount
  useClients();
  useSessions();
  useTasks();
  const { fetchConversations } = useMessaging(authUserId);

  // Only fetch conversations once since messaging hook doesn't auto-fetch
  useEffect(() => {
    if (user?.role === "trainer" && authUserId) {
      fetchConversations();
    }
  }, [user, authUserId]); // Remove fetchConversations from dependencies
  return (
    <div className="relative flex  w-full minh-screen justify-between overflow-hidden">
      <Header showTab={showTab} setShowTab={setShowTab} />
      <div className="w-full overflow-hidden">
        {/* Menu Tabs  */}
        {showTab === "dashboard" && <Dashboard />}
        {showTab === "messages" && <Messages authUserId={authUserId} />}
        {showTab === "planner" && <Planner />}
        {showTab === "clients" && <Clients />}
        {showTab === "workouts" && <Workouts />}
        {showTab === "check-ins" && <CheckIns />}
        {showTab === "team" && <Team />}
        {showTab === "metrics" && <Metrics />}
        {showTab === "nutrition" && <Nutrition />}
        {/* Control Tabs */}
        {showTab === "settings" && <Settings />}
        {/* {showTab === "profile" && <Profile />} */}
      </div>
    </div>
  );
}
