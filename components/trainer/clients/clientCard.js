import ChartClient from "@/components/common/chart/ChartClient";
import { Apple, Check, ClipboardCheck, Heart } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function ClientCard({ client, onClick }) {
  const clientChips = [
    { label: "Weight", value: "190kg" },
    { label: "Height", value: "175cm" },
    { label: "Goal", value: "Fat Loss" },
    { label: "Activity Level", value: "Moderate" },
    { label: "Gym", value: "Corpus Gym" },
  ];

  return (
    <div
      key={client.id}
      onClick={() => setSelectedClient(client)}
      className="flex p-6 bg-panel rounded-[30px] min-w-[500px] cursor-pointer transition-all"
    >
      <div className="flex gap-6 flex-col justify-between items-start w-4/5">
        <div className="flex gap-4 ">
          <Image
            src="/images/placeholder/profile-image-placeholder.png"
            alt="Client Avatar"
            width={70}
            height={70}
            className="rounded-xl h-[42px] w-[42px] object-cover"
          />
          <div>
            <h3 className="text-white  text-xl mb-1 -mt-1">{client.name}</h3>
            <div className="flex gap-2">
              <p className="text-xs text-zinc-500">Last Update:</p>

              <p className="text-xs text-zinc-200">2 Days ago</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 w-4/5">
          {clientChips.map((chip, index) => (
            <div
              key={index}
              className="flex items-center gap-2 py-3 px-5 bg-chip rounded-full w-fit flex-wrap"
            >
              <div className="flex items-center gap-1">
                <span className=" text-zinc-400 text-xs">{chip.value}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <ClipboardCheck size={18} className="" />
          <div className="">16 Workouts Completed</div>
        </div>
      </div>
      <div className="relative flex-1 flex items-end justify-end">
        <div className="absolute flex-1 h-full bottom-0 right-0 max-w-[110px] max-h-[110px] flex items-center justify-center ">
          <ChartClient
            options={{
              chart: {
                type: "radialBar",
                background: "transparent",
                toolbar: { show: false },
              },
              plotOptions: {
                radialBar: {
                  startAngle: -270, // 0deg is 3 o'clock with inverseOrder
                  endAngle: 90, // 360deg is 3 o'clock with inverseOrder
                  hollow: {
                    margin: 0,
                    size: "64%",
                    background: "transparent",
                  },
                  track: {
                    background: "#222",
                    strokeWidth: "100%",
                  },
                  dataLabels: {
                    show: true,
                    name: {
                      show: true,
                      offsetY: 20,
                      color: "#71717a",
                      fontSize: "0.7rem",
                      fontWeight: 300,
                      formatter: () => "Progress",
                    },
                    value: {
                      show: true,
                      fontSize: "1.8rem",
                      fontWeight: 400,
                      color: "#fff",
                      offsetY: -12,
                      formatter: (val) => `${val}%`,
                    },
                  },
                },
              },
              fill: {
                colors: ["#baf05d"],
                type: "solid",
              },
              stroke: {
                lineCap: "round",
                color: "",
              },
              labels: ["Progress"],
            }}
            series={[90]}
            type="radialBar"
            height={160}
            width={0}
          />
        </div>
        <button className="absolute flex items-center justify-center right-[120px] h-12 w-12 bg-chip rounded-full">
          <Check size={20} />
        </button>
        <button className="absolute flex items-center justify-center right-[120px] bottom-[70px] h-12 w-12 bg-primary rounded-full">
          <Heart size={20} className="text-panel" />
        </button>
        <button className=" absolute flex items-center justify-center right-[70px] bottom-[120px] h-12 w-12 bg-chip rounded-full">
          <ClipboardCheck size={20} />
        </button>
        <button className="absolute flex items-center justify-center bottom-[120px] h-12 w-12 bg-chip rounded-full">
          <Apple size={20} />
        </button>
      </div>
      {/* <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(client);
                        setViewClientInfoModalOpen(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClient(client);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div> */}
    </div>
  );
}
