import Header from "@/components/layout/header";
import React, { useEffect, useState } from "react";
import Clients from "@/pages/trainer/clients";
import Dashboard from "@/pages/trainer/dashboard";
import Messages from "@/pages/trainer/messages";
import Sessions from "@/pages/trainer/sessions";
import Workouts from "@/pages/trainer/workouts";
// import Team from "@/pages/trainer/team";
import Settings from "@/pages/trainer/settings";
import Metrics from "@/pages/trainer/metrics";
import Nutrition from "@/pages/trainer/nutrition";

import { useSelector } from "react-redux";
import { useMessaging } from "@/hooks/messaging";

export default function trainerDashboard() {
  const user = useSelector((state) => state.auth.user);
  const [showTab, setShowTab] = useState("clients"); // Default tab
  const authUserId = user?.id;

  // Initialize messaging hook only
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
        {showTab === "planner" && <Sessions />}
        {showTab === "clients" && <Clients />}
        {showTab === "workouts" && <Workouts />}
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
