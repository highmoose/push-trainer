"use client";

import {
  Info,
  MailPlus,
  Upload,
  UserPlus,
  X,
  Dumbbell,
  Apple,
  ChartNoAxesCombinedIcon,
  Heart,
  HeartPulse,
} from "lucide-react";
import { useDispatch } from "react-redux";
import {
  addClient,
  addTempClient,
  updateClient,
} from "@redux/slices/clientSlice";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function AddClientModal({ close, selectedClient = "" }) {
  const [view, setView] = useState("select");
  const dispatch = useDispatch();
  const [infoView, setInfoView] = useState("information");

  const [activeTab, setActiveTab] = useState("select");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dob: "",
    gym: "",
    location: "",
  });

  useEffect(() => {
    if (selectedClient) {
      setView("create");
      setForm({
        firstName: selectedClient.first_name,
        lastName: selectedClient.last_name,
        phone: selectedClient.phone,
        email: selectedClient.email,
        dob: selectedClient.dob,
        gym: selectedClient.gym,
        location: selectedClient.location,
      });
    }
  }, [selectedClient]);

  const tabs = [
    { id: "select", label: "Information", icon: Info },
    { id: "metrics", label: "Metrics", icon: Dumbbell },
    { id: "nutrition", label: "Nutrition", icon: Apple },
  ];

  console.log("Form data:", form);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateClient = () => {
    if (!form.firstName.trim()) return;

    dispatch(
      addTempClient({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        location: form.location,
        gym: form.gym,
        date_of_birth: form.dob,
      })
    );

    setForm({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      dob: "",
      gym: "",
      location: "",
    });

    close();
  };

  const handleUpdateClient = () => {
    if (!selectedClient?.id) return;

    dispatch(
      updateClient({
        id: selectedClient.id,
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          email: form.email,
          location: form.location,
          gym: form.gym,
          date_of_birth: form.dob,
        },
      })
    );

    close();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 bg-opacity-50 backdrop-blur-xs">
      {view === "select" && (
        <div className="bg-zinc-950 relative flex rounded-xl shadow-2xl shadow-white/10 overflow-hidden h-[400px] w-full max-w-[900px]">
          {/* Left Image Panel */}
          <div className="relative min-w-[320px] h-full">
            <Image
              src="/images/trainer/clients/onboard-client-gym-dumbell.png"
              alt="Onboard Client"
              fill
              className="absolute object-cover brightness-50 rounded-l-xl"
              unoptimized
            />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white text-center px-6">
              <p className="text-4xl font-bold leading-tight">
                Onboard a new client
              </p>
              <p className="mt-2 text-zinc-300 text-sm">
                How would you like to add a client?
              </p>
            </div>
          </div>

          {/* Right Interaction Panel */}
          <div className="flex flex-col justify-center flex-1 relative p-10">
            <X
              onClick={close}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
              size={22}
            />

            <div className="flex flex-col gap-6 h-full justify-center">
              {/* Option: Manual Entry */}
              <div
                onClick={() => setView("create")}
                className="flex flex-col gap-4 justify-center  hover:bg-zinc-900 hover:border-transparent rounded-lg p-6 cursor-pointer transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <UserPlus size={28} className="text-white" />
                  <p className="text-white text-xl font-semibold">
                    Add Client Details
                  </p>
                </div>
                <p className="text-sm text-zinc-300 leading-tight">
                  Fill out the client's details yourself, including their name,
                  email, and fitness metrics. You can assign this to a real
                  client later when they sign up for the platform.
                </p>
              </div>

              {/* Option: Invite Client */}
              <div
                onClick={() => setView("invite")}
                className="flex flex-col gap-4 justify-center  hover:bg-zinc-900 hover:border-transparent rounded-lg p-6 cursor-pointer transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <MailPlus size={28} className="text-white" />
                  <p className="text-white text-xl font-semibold">
                    Invite Client to Sign Up
                  </p>
                </div>
                <p className="text-sm text-zinc-300 leading-tight">
                  Send an invite link or email to let the client join and fill
                  in their own details. Once they sign up, they’ll automatically
                  appear on your clients page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {view === "create" && (
        <div className="bg-zinc-950 relative flex flex-col rounded-xl shadow-2xl shadow-white/10 gap-4 p-10 max-w-[800px] max-h-[90vh] w-full overflow-y-auto scrollbar-dark overflow-hidden">
          {/* Close Icon */}
          <X
            onClick={close}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer z-10"
            size={22}
          />

          <h2 className="text-white text-xl text-center font-semibold">
            Add Client
          </h2>

          <div className="flex items-center p-6 gap-4 bg-zinc-900 rounded-xl mb-4">
            <Info size={30} className="text-zinc-400 w-[5+0px]" />
            <p className="text-sm text-zinc-400">
              Fill out the client's details. Only a name is required. You can
              complete the remaining client information later by visiting the
              client info page.
            </p>
          </div>

          <div className="flex gap-8">
            {/* Client Image Upload */}
            <div className="flex flex-col gap-2 w-full max-w-[118px]">
              <label className="text-sm text-zinc-400">Client Image</label>
              <div className="flex flex-col gap-[18px]">
                <div className="flex justify-center items-center w-full aspect-square max-w-[118px] bg-zinc-900 rounded-md cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload size={30} className="text-zinc-500" />
                    <span className="text-sm text-zinc-500">Upload Image</span>
                  </div>
                </div>
                <div className="w-full flex gap-4">
                  <div className="w-1/2 bg-zinc-500 aspect-square rounded"></div>
                  <div className="w-1/2 bg-zinc-600 aspect-square rounded"></div>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-4">
              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-400">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="bg-zinc-900 text-white rounded-md px-3 py-3 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-400">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="bg-zinc-900 text-white rounded-md px-3 py-3 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-400">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="bg-zinc-900 text-white rounded-md px-3 py-3 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-400">Client Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="bg-zinc-900 text-white rounded-md px-3 py-3 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-400">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    className="bg-zinc-900 text-white rounded-md px-3 py-3 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-400">Gym</label>
                  <input
                    type="text"
                    name="gym"
                    value={form.gym}
                    onChange={handleChange}
                    className="bg-zinc-900 text-white rounded-md px-3 py-3 text-sm"
                  />
                </div>
              </div>

              {/* Phone & location */}

              <div className="flex flex-col gap-2 col-span-4 mb-4">
                <label className="text-sm text-zinc-400">Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="bg-zinc-900 text-white rounded-md px-3 py-3 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
            <button
              onClick={() => setView("select")}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Back to Selection
            </button>
            <button
              onClick={selectedClient ? handleUpdateClient : handleCreateClient}
              disabled={!form.firstName.trim()}
              className="bg-zinc-400 hover:bg-lime-500 text-white font-bold px-6 py-2 rounded-md text-sm transition-colors disabled:bg-zinc-900 disabled:text-zinc-400"
            >
              Confirm Client
            </button>
          </div>
        </div>
      )}

      {view === "invite" && (
        <div className="bg-zinc-950 relative flex rounded-xl shadow-2xl shadow-white/10 overflow-hidden h-[500px] w-[900px]">
          <X
            onClick={close}
            className="absolute top-4 right-4 text-zinc-300 hover:text-white cursor-pointer"
            size={22}
          />
        </div>
      )}
    </div>
  );
}
