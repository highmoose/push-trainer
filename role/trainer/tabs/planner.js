"use client";

import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import CreateSessionModal from "@/components/trainer/createSessionModal";

const views = ["day", "week", "month", "year"];
const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM
const fifteenMinutes = Array.from({ length: 4 }, (_, i) => i * 15).map((m) =>
  m.toString().padStart(2, "0")
);

export default function TrainerCalendarPage() {
  const calendarRef = useRef(null);
  const hoverLineRef = useRef(null);

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

  const [hoveredLine, setHoveredLine] = useState(null);

  const renderWeekGridWithTimes = () => {
    const days = [...Array(7)].map((_, i) =>
      currentDate.startOf("week").add(i, "day")
    );

    return (
      <div ref={calendarRef} className="relative h-0 ">
        <div
          ref={hoverLineRef}
          className="absolute left-[50px] right-0 border-t border-dashed border-zinc-500 z-40 pointer-events-none "
          style={{ display: "none" }} // hidden by default
        />
        {hoveredLine !== null && (
          <div
            className="absolute left-[50px] right-0 border-t border-dashed border-zinc-500 z-40 pointer-events-none"
            style={{ top: hoveredLine }}
          />
        )}
        <div className="grid grid-cols-[50px_repeat(7,minmax(0,1fr))] pb-4 ">
          {/* Header row */}
          <div className="text-xs text-zinc-400 p-2 "></div>
          {days.map((day, idx) => (
            <div
              key={idx}
              className="text-center text-xs font-semibold text-white p-2 sticky top-0 z-20 border-b border-zinc-800 bg-zinc-900/50"
            >
              {day.format("ddd D MMM")}
            </div>
          ))}

          {/* Hour rows */}
          {hours.map((hour) => (
            <div key={`hour-row-${hour}`} className="contents">
              {/* Time label column */}
              <div className="text-[11px] text-end text-zinc-500 -mt-3 px-2 py-1 bg-zinc-900/50">
                {dayjs()
                  .hour(hour - 1)
                  .minute(0)
                  .format("h A")}
              </div>

              {days.map((day, i) => {
                return (
                  <div
                    key={`cell-${day.toString()}-${hour}`}
                    className="relative border-b border-l border-zinc-800/60 h-[60px] bg-zinc-900/50 cursor-"
                  >
                    {/* Invisible 15-minute hover zones */}
                    {[0, 15, 30, 45].map((minutes, idx) => {
                      const top = (minutes / 60) * 60; // 15, 30, 45
                      const clickedTime = day
                        .hour(hour)
                        .minute(minutes)
                        .second(0);

                      return (
                        <div
                          key={`hover-${idx}`}
                          className="absolute inset-x-0 h-[15px] z-0"
                          style={{ top }}
                          onMouseEnter={(e) => {
                            const lineTop =
                              e.currentTarget.getBoundingClientRect().top -
                              calendarRef.current.getBoundingClientRect().top;

                            const el = hoverLineRef.current;
                            if (el) {
                              el.style.top = `${lineTop}px`;
                              el.style.display = "block";
                            }
                          }}
                          onMouseLeave={() => {
                            if (hoverLineRef.current) {
                              hoverLineRef.current.style.display = "none";
                            }
                          }}
                          onClick={() => {
                            setSelectedSession({
                              start_time: clickedTime.toISOString(),
                              end_time: clickedTime
                                .add(30, "minute")
                                .toISOString(),
                              status: "scheduled",
                              notes: "",
                              gym: "",
                              first_name: "",
                              last_name: "",
                            });
                            setCreateModalOpen(true);
                          }}
                        />
                      );
                    })}

                    {/* Existing sessions */}
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
                            className={`absolute left-1 right-1  text-xs p-2 rounded shadow cursor-pointer z-10 ${
                              s.status === "scheduled" &&
                              "bg-zinc-200 hover:bg-zinc-100 text-black"
                            } ${
                              s.status === "pending" &&
                              "bg-zinc-950 hover:bg-zinc-900 text-white border-2 border-zinc-400 diagonal-stripes overflow-hiddens"
                            } ${
                              s.status === "completed" &&
                              "bg-[#041c00] hover:bg-[#042900] text-white border-2 border-green-400 inset-0"
                            } ${
                              s.status === "cancelled" &&
                              "bg-[#1c0000] hover:bg-[#290000] text-white border-2 border-red-400 inset-0"
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
                            <div className="relative z-20">
                              <div className="font-semibold truncate ">
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
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGrid = () => {
    if (currentView === "week")
      return (
        <div className="min-h-full overflow-y-auto scrollbar-dark">
          {renderWeekGridWithTimes()}
        </div>
      );
    return (
      <div className="text-center text-zinc-400">
        Only week view is styled for now
      </div>
    );
  };

  return (
    <div className="w-full h-full flex bg-zinc-900 text-white overflow-hidden rounded">
      <div className="w-52 p-4 border-r border-zinc-800 bg-zinc-800 flex flex-col">
        <button
          className="bg-transparent hover:bg-zinc-700 border-white border-2 text-sm px-3 py-2 rounded mb-4 font-bold"
          onClick={() => setCreateModalOpen(true)}
        >
          + New
        </button>
        {/* <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2 text-sm">
            <li>Agenda</li>
            <li className="font-bold">Calendar</li>
            <li>Projects & Tasks</li>
            <li>Team Schedule</li>
            <li>Tutorials</li>
          </ul>
        </nav> */}
      </div>

      <div className="w-full flex flex-col h-full overflow-hidden">
        {/* Header bar (does not shrink) */}
        <div className="px-4 py-4 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">
              {currentDate.format("MMMM YYYY")}
            </h1>
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

        {/* Calendar grid (scrolls) */}
        <div className="flex-1 h-0  b-4">{renderGrid()}</div>
      </div>

      {createModalOpen && (
        <CreateSessionModal
          mode="create"
          close={() => setCreateModalOpen(false)}
          initialValues={selectedSession || {}} // <-- fallback to empty object
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
