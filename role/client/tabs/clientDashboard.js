import React from "react";
import DataTable from "@components/common/dataTable";

const columns = [
  { key: "product", label: "Product Name" },
  { key: "color", label: "Color" },
  { key: "category", label: "Category" },
  { key: "accessories", label: "Accessories" },
  { key: "available", label: "Available" },
  { key: "price", label: "Price" },
  { key: "weight", label: "Weight" },
];

const data = [
  {
    product: 'Apple MacBook Pro 17"',
    color: "Silver",
    category: "Laptop",
    accessories: "Yes",
    available: "Yes",
    price: "$2999",
    weight: "3.0 lb.",
  },
  {
    product: "Microsoft Surface Pro",
    color: "White",
    category: "Laptop PC",
    accessories: "No",
    available: "Yes",
    price: "$1999",
    weight: "1.0 lb.",
  },
];

export default function clientDashboard() {
  return (
    <div>
      <div className="text-3xl mb-4">Client Dashboard</div>
      <div className="text-xl">Quick Stats</div>
      <div className="text-xl">My Diet Plan</div>
      <div className="text-xl">My Workout Plan,</div>
      <div className="text-xl">Goals</div>
      <div className="text-xl">Messages...</div>
      <DataTable columns={columns} data={data} minRows={5} />
    </div>
  );
}
