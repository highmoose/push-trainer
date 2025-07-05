import React from "react";
import dynamic from "next/dynamic";
import { Apple, ChartPie, Dumbbell, NotebookPen } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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

const convo = [
  {
    name: "You",
    data: "Hi, it's nice to meet you, I'll be your personal trainer going forward.",
  },
  {
    name: "Client",
    data: "Hello, how are you?",
  },
  {
    name: "You",
    data: "I'm doing great, thanks! Excited to start this journey with you. How are you feeling today?",
  },
  {
    name: "Client",
    data: "Pretty good! Looking forward to getting started.",
  },
  {
    name: "You",
    data: "Awesome! First off, do you have any current fitness goals you're aiming for?",
  },
  {
    name: "Client",
    data: "I mainly want to lose some weight and build a bit of muscle.",
  },
  {
    name: "You",
    data: "Great goals. Do you have a specific timeline in mind for your goals, or are you just looking to build consistency?",
  },
  {
    name: "Client",
    data: "Ideally, I'd like to see results in the next 3 months.",
  },
  {
    name: "You",
    data: "Totally doable with the right approach. Are you currently working out or starting fresh?",
  },
  {
    name: "Client",
    data: "Starting fresh. Haven't really been to the gym in a while.",
  },
  {
    name: "You",
    data: "No worries at all, we'll start at your level and build from there. Do you have any injuries or medical conditions I should know about?",
  },
  {
    name: "Client",
    data: "Nothing major, just occasional lower back pain if I sit too long.",
  },
  {
    name: "You",
    data: "Thanks for letting me know — we'll work around that and strengthen your core to support your back over time.",
  },
  {
    name: "You",
    data: "How many days a week are you looking to train?",
  },
  {
    name: "Client",
    data: "I think I can do 3 days a week to start.",
  },
  {
    name: "You",
    data: "Perfect. I’ll build a plan around that. Do you prefer mornings, evenings, or are you flexible?",
  },
  {
    name: "Client",
    data: "Evenings work best for me after work.",
  },
  {
    name: "You",
    data: "Got it. I'll put together a custom plan and we’ll ease into it. You’ll also get nutrition tips along the way.",
  },
  {
    name: "Client",
    data: "That sounds great, I’ve been wanting to get better with my meals too.",
  },
  {
    name: "You",
    data: "Fantastic — we’ll track both workouts and food so you see full progress. I'll send over the onboarding form shortly.",
  },
  {
    name: "Client",
    data: "Looking forward to it! Thanks for all the help already.",
  },
  {
    name: "You",
    data: "You're welcome! Let’s crush these goals together 💪",
  },
];

export default function PushChat() {
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
    <div className="flex-1 flex items-center w-full p-4 gap-4">
      <div className="flex flex-col gap-1 w-[400px] h-[800px] ">
        <div className="flex-1 flex flex-col h-full my-auto bg-zinc-200 p-4 py-8 rounded-lg ">
          {/* Header */}
          <div className="flex w-full justify-between">
            <div className="flex items-center gap-4 w-full mb-4">
              <div className="relative rounded-full bg-zinc-300 w-14 h-14 overflow-hidden">
                <Image
                  src="/images/placeholder/profile-placeholder.png"
                  alt="placeholder"
                  layout="fill"
                  objectFit="cover"
                  className="p-0.5 mt-1"
                />
              </div>
              <div>
                <p className="font-semibold text-lg text-zinc-900">
                  Jacob Langley
                </p>
                <p className="text-sm font-extralight text-zinc-900 -mt-2">
                  Phoenix Gym
                </p>
                <p className="text-xs font-extralight text-zinc-900">
                  Last active 28m ago
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-center h-[29px] w-[29px] rounded bg-zinc-00 hover:bg-zinc-300 hover:shadow-inner">
                  <ChartPie size={20} className="text-zinc-400" />
                </div>
                <div className="flex items-center justify-center h-[29px] w-[29px] rounded bg-zinc-00 hover:bg-zinc-300 hover:shadow-inner">
                  <Apple size={20} className="text-zinc-400" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-center h-[29px] w-[29px] rounded bg-zinc-00 hover:bg-zinc-300 hover:shadow-inner">
                  <Dumbbell size={20} className="text-zinc-400" />
                </div>
                <div className="flex items-center justify-center h-[29px] w-[29px] rounded bg-zinc-00 hover:bg-zinc-300 hover:shadow-inner">
                  <NotebookPen size={20} className="text-zinc-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content that fills the rest */}
          <div className="flex flex-col gap-2 flex-1 max-h-[510px] ">
            <div className="flex-1 w-full rounded  mb-1 overflow-y-scroll ">
              {convo.map((item, index) =>
                item.name === "You" ? (
                  <div
                    key={index}
                    className="flex flex-row-reverse items-center gap-2 p-2 pl-16"
                  >
                    <div className="bg-white/40 text-black px-4 py-2 rounded-lg max-w-xs text-[15px] leading-tight">
                      {item.data}
                    </div>
                  </div>
                ) : (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 pr-10"
                  >
                    <div className="bg-zinc-300/50 text-black px-4 py-2 rounded-lg max-w-xs text-[15px] leading-tigh">
                      {item.data}
                    </div>
                  </div>
                )
              )}
            </div>

            <textarea
              className="h-10 w-full border-t border-zinc-300 resize-none p-2 text-black placeholder:text-black/30 placeholder:text-sm text-sm focus:outline-none"
              placeholder="Type a message..."
            />
          </div>
        </div>
        <div
          onMouseEnter={() => setChartHovered(true)}
          onMouseLeave={() => setChartHovered(false)}
          className="p-8 bg-zinc-900 rounded-lg"
        >
          <div>
            <ChartClient
              options={options}
              series={series}
              type="line"
              height={60}
            />
          </div>
          <div className="flex justify-between">
            <p className="text-xs font-b text-zinc-500">Engagement</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF4560]"></div>
              <p className="text-xs  text-zinc-500">You</p>
              <div className="w-2 h-2 rounded-full bg-[#EEEEEE]"></div>
              <p className="text-xs  text-zinc-500">Client</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
