import Header from "@/components/layout/header";
import React, { useState } from "react";
import Clients from "@role/trainer/tabs/clients";
import Dashboard from "@role/trainer/tabs/dashboard";
import Messages from "@role/trainer/tabs/messages";
import Planner from "@role/trainer/tabs/planner";
import Settings from "@role/trainer/tabs/settings";
import Metrics from "@role/trainer/tabs/metrics";
import Blueprints from "@role/trainer/tabs/blueprints";
import Footer from "@/components/layout/footer";

export default function trainerDashboard() {
  const [showTab, setShowTab] = useState("dashboard");

  return (
    <div className="flex flex-col w-full h-screen ">
      <Header showTab={showTab} setShowTab={setShowTab} />
      <div className="flex-1 w-full px-8 pb-8">
        {/* Menu Tabs  */}
        {showTab === "dashboard" && <Dashboard />}
        {showTab === "messages" && <Messages />}
        {showTab === "planner" && <Planner />}
        {showTab === "clients" && <Clients />}
        {showTab === "metrics" && <Metrics />}
        {showTab === "blueprints" && <Blueprints />}
        {/* Control Tabs */}
        {showTab === "settings" && <Settings />}
        {/* {showTab === "profile" && <Profile />} */}
      </div>
      <Footer />
    </div>
  );
}
