import React, { useState } from "react";
import DataTable from "@components/common/dataTable";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Messages from "@/role/client/tabs/messages";
import ClientProgressTimeline from "@/components/client/ClientProgressTimeline";

const columns = [
  { key: "product", label: "Product Name" },
  { key: "color", label: "Color" },
  { key: "category", label: "Category" },
  { key: "accessories", label: "Accessories" },
  { key: "available", label: "Available" },
  { key: "price", label: "Price" },
  { key: "weight", label: "Weight" },
];

export default function clientDashboard() {
  const [showTab, setShowTab] = useState("dashboard");

  return (
    <div className="flex flex-col w-full min-h-screen ">
      <Header showTab={showTab} setShowTab={setShowTab} />
      <div className="flex-1 w-full px-8 pb-8">
        {showTab === "messages" && <Messages />}
        {showTab === "timeline" && <ClientProgressTimeline />}
      </div>
      <Footer />
    </div>
  );
}
