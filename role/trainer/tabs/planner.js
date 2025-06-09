"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import CreateSessionModal from "@/components/trainer/createSessionModal";

const views = ["day", "week", "month", "year"];
const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM

export default function TrainerCalendarPage() {
  const { list: sessions = [] } = useSelector((state) => state.sessions);
  const { list: clients = [], status } = useSelector((state) => state.clients);

  console.log("clients", clients);
  console.log("sessions", sessions);

  const [selectedSession, setSelectedSession] = useState(null);
  console.log("selectedSession", selectedSession);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [currentView, setCurrentView] = useState("week");

  const renderWeekGridWithTimes = () => {
    const days = [...Array(7)].map((_, i) =>
      currentDate.startOf("week").add(i, "day")
    );

    return (
      <div className="grid grid-cols-[50px_repeat(7,minmax(0,1fr))] ">
        {/* Header row */}
        <div className="text-xs text-zinc-400 p-2 "></div>
        {days.map((day, idx) => (
          <div
            key={idx}
            className="text-center text-xs font-semibold text-white   p-2"
          >
            {day.format("ddd D MMM")}
          </div>
        ))}

        {/* Hour rows */}
        {hours.map((hour) => (
          <div key={`hour-row-${hour}`} className="contents">
            <div className="text-xs text-zinc-500 -mt-3  px-1 py-1">
              {`${hour}:00`}
            </div>
            {days.map((day, i) => (
              <div
                key={`cell-${day.toString()}-${hour}`}
                className="relative border-b border-l border-zinc-900 h-[60px]"
              >
                {sessions
                  .filter((s) => dayjs(s.start_time).isSame(day, "day"))
                  .filter((s) => dayjs(s.start_time).hour() === hour)
                  .map((s, j) => {
                    const start = dayjs(s.start_time);
                    const end = dayjs(s.end_time);
                    const duration = end.diff(start, "minute");
                    return (
                      <div
                        key={j}
                        className={`absolute left-1 right-1 text-white text-xs p-2 rounded shadow cursor-pointer z-1  ${
                          s.status === "scheduled" &&
                          "bg-zinc-700 hover:bg-zinc-600"
                        } ${
                          s.status === "pending" &&
                          "bg-zinc-950 hover:bg-zinc-900 border-2 border-zinc-800 diagonal-stripes"
                        }  ${
                          s.status === "completed" &&
                          "bg-[#041c00] hover:bg-[#042900] border-2 border-green-950 inset-0"
                        } ${
                          s.status === "cancelled" &&
                          "bg-[#1c0000] hover:bg-[#290000] border-2 border-red-950 inset-0"
                        }`}
                        style={{
                          top: `${(start.minute() / 60) * 60}px`,
                          height: `${(duration / 60) * 60}px`,
                        }}
                        onClick={() => {
                          setSelectedSession(s);
                          setEditModalOpen(true);
                        }}
                      >
                        <div className="relative z-2">
                          <div className="font-semibold truncate text-white">
                            {s.first_name + " " + s.last_name || "Client"}
                          </div>

                          <p>{s.gym}</p>
                          <p>{s.notes}</p>
                          <div>
                            {start.format("HH:mm")} - {end.format("HH:mm")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderGrid = () => {
    if (currentView === "week") return renderWeekGridWithTimes();
    return (
      <div className="text-center text-zinc-400">
        Only week view is styled for now
      </div>
    );
  };

  return (
    <div className="w-full h-screen flex bg-zinc-950 text-white">
      <div className="w-64 p-4 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        <h2 className="text-lg font-semibold mb-6">Adam</h2>
        <button
          className="bg-sky-600 hover:bg-sky-500 text-sm px-3 py-2 rounded mb-4"
          onClick={() => setCreateModalOpen(true)}
        >
          + New
        </button>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2 text-sm">
            <li>Agenda</li>
            <li className="font-bold">Calendar</li>
            <li>Projects & Tasks</li>
            <li>Team Schedule</li>
            <li>Tutorials</li>
          </ul>
        </nav>
      </div>

      <div className="flex-1 p-4 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {currentDate.format("MMMM YYYY")}
            </h1>
            <p className="text-sm text-zinc-400 capitalize">
              {currentView} view
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <select
              value={currentView}
              onChange={(e) => setCurrentView(e.target.value)}
              className="bg-zinc-800 px-2 py-1 rounded text-sm"
            >
              {views.map((view) => (
                <option key={view} value={view}>
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                setCurrentDate(currentDate.subtract(1, currentView))
              }
              className="bg-zinc-800 px-4 py-1 rounded"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentDate(dayjs())}
              className="bg-zinc-800 px-4 py-1 rounded"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(currentDate.add(1, currentView))}
              className="bg-zinc-800 px-4 py-1 rounded"
            >
              Next →
            </button>
          </div>
        </div>

        {renderGrid()}
      </div>

      {createModalOpen && (
        <CreateSessionModal
          close={() => setCreateModalOpen(false)}
          mode="create"
        />
      )}

      {editModalOpen && selectedSession && (
        <CreateSessionModal
          mode="edit"
          close={() => setEditModalOpen(false)}
          initialValues={selectedSession}
        />
      )}
    </div>
  );
}
