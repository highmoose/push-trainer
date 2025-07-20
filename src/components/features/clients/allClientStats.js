import React, { useState } from "react";
import dynamic from "next/dynamic";

const series = [
  {
    name: " You",
    data: [1, 3, 3, 2, 7, 5, 2, 6, 5, 7, 1, 2, 3, 10],
  },
  {
    name: " Client",
    data: [2, 6, 8, 7, 8, 6, 2, 4, 1, 6, 7, 4, 3, 8],
  },
];

const sessionsBooked = [
  {
    name: " Client",
    data: [2, 3, 4, 3, 5, 6, 4, 6, 7, 5, 4, 4, 3, 6],
  },
];

const clientsOnboarded = [
  {
    name: " You",
    data: [1, 2, 1, 2, 3, 2, 2, 3, 4, 3, 3, 2, 2, 4],
  },
];

const messagesSent = [
  {
    name: " You",
    data: [20, 25, 30, 35, 40, 38, 42, 50, 48, 47, 44, 45, 41, 49],
  },
  {
    name: " Client",
    data: [10, 15, 18, 20, 22, 25, 28, 30, 27, 25, 24, 22, 20, 29],
  },
];

const assessmentsCompleted = [
  {
    name: " You",
    data: [3, 4, 5, 4, 6, 5, 6, 7, 6, 5, 6, 6, 7, 8],
  },
];

const totalMembers = [
  {
    name: " You",
    data: [15, 17, 18, 20, 21, 23, 24, 26, 28, 30, 29, 31, 32, 33],
  },
];

const radialChartSeries = [99, 80, 70, 60, 20, 100, 50]; // Example data for radial chart

const radialChartOptions = {
  chart: {
    type: "radialBar",
    offsetY: 0,
    height: 400,
  },
  colors: ["#3B82F6", "#6366F1", "#06B6D4", "#22C55E"], // Example blue/green shades
  plotOptions: {
    radialBar: {
      dataLabels: {
        name: {
          fontSize: "14px",
          color: "#aaa",
        },
        value: {
          fontSize: "16px",
          color: "#fff",
        },
        total: {
          show: true,
          label: "Total",
          formatter: function (w) {
            // Custom sum of all series values
            const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
            return total;
          },
        },
      },
      track: {
        background: "transparent",
        strokeWidth: "100%",
        margin: 0,
      },
      stroke: {
        lineCap: "round",
      },
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      shade: "dark",
      shadeIntensity: 0.15,
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 50, 65, 91],
    },
  },
  stroke: {
    dashArray: 4,
  },
  labels: ["Apples", "Oranges", "Bananas", "Berries"],
};

export default function AllClientStats({ client }) {
  const [chartHovered, setChartHovered] = useState(false);

  const options = {
    chart: {
      id: "basic-bar",
      toolbar: { show: false },
    },
    legend: {
      show: false,
    },
    grid: {
      padding: chartHovered
        ? { top: -20, bottom: -20, left: 1, right: 10 } // when hovered
        : { top: -20, bottom: -20, left: 0, right: 10 }, // default
      xaxis: {
        lines: { show: false },
      },
      yaxis: {
        lines: { show: false },
      },
    },
    colors: ["#EEEEEE", "#FF4560"],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: chartHovered ? true : false, // hides entire Y axis (labels, ticks, border)
    },
  };

  return (
    <div className="relative flex w-full">
      {/* Left Side Metric Panel */}
      <div className="absolute -top-6 -right-6 flex">
        <div className="h-7 px-2 flex items-center text-xs rounded-l bg-zinc-800">
          {" "}
          30 Days
        </div>
        <div className="h-7 px-2 flex items-center text-xs bg-zinc-800">
          {" "}
          3 Months{" "}
        </div>
        <div className="h-7 px-2 flex items-center text-xs rounded-r bg-zinc-800">
          {" "}
          1 Year
        </div>
      </div>

      <div className="w-1/2 gap-16 flex h-full ">
        {/* Left Charts */}
        <div className="flex flex-col justify-between gap-4 w-full h-full">
          <div>
            <div className="text-sm font-bold text-zinc-500">Engagement</div>
            <ChartClient
              options={options}
              series={series}
              type="line"
              height={60}
            />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-500">
              Sessions Booked
            </div>
            <ChartClient
              options={options}
              series={sessionsBooked}
              type="line"
              height={60}
            />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-500">
              Clients Onboarded
            </div>
            <ChartClient
              options={options}
              series={clientsOnboarded}
              type="line"
              height={60}
            />
          </div>
        </div>
        {/* Right Charts */}
        <div className="flex flex-col justify-between gap-4 w-full h-full">
          <div>
            <div className="text-sm font-bold text-zinc-500">Messages Sent</div>
            <ChartClient
              options={options}
              series={messagesSent}
              type="line"
              height={60}
            />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-500">
              Check-ins Completed
            </div>
            <ChartClient
              options={options}
              series={assessmentsCompleted}
              type="line"
              height={60}
            />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-500">Total Members</div>
            <ChartClient
              options={options}
              series={totalMembers}
              type="line"
              height={60}
            />
          </div>
        </div>
      </div>
      {/* Right Sie Metric Panel */}
      <div className="w-1/2 flex-1 justify-end items-center flex flex-col h-full">
        {/* Left Side */}
      </div>
    </div>
  );
}
