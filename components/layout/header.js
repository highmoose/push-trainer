import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import { Bell, LogOut, Settings, X } from "lucide-react";

export default function Header({ setShowTab }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state) => state.auth.user);
  console.log(user);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap(); // logout thunk
      router.push("/welcome"); // redirect
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const trainerMenu = [
    { label: "Dashboard" },
    { label: "Messages" },
    { label: "Planner" },
    { label: "Clients" },
    { label: "Metrics" },
    { label: "Blueprints" },
  ];

  const clientMenu = [
    { label: "Quick Stats" },
    { label: "Messages" },
    { label: "Diet Plan" },
    { label: "Workout Plan" },
    { label: "Goal Tracker" },
  ];

  // Potentionally convert to a megamenu
  // Clients dropdown has clients images in a carousel to select from in menu dropdown

  return (
    <div className="flex items-center justify-between font-semibold w-full p-8">
      <Image
        src="/images/logo/push-logo-white.svg"
        width={190}
        height={200}
        alt="logo"
      />

      {user?.role === "trainer" && (
        <div className="flex gap-2">
          {trainerMenu.map((item, index) => (
            <button
              key={index}
              onClick={() => setShowTab(item.label.toLowerCase())}
              className="bg-zinc-900 hover:bg-zinc-800 py-3 px-6 text-[15px] font-semibold rounded cursor-pointer transition-colors duration-300"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      {user?.role === "client" && (
        <div className="flex gap-2">
          {clientMenu.map((item, index) => (
            <button
              key={index}
              onClick={() => setShowTab(item.label.toLowerCase())}
              className="bg-zinc-900 hover:bg-zinc-800 py-3 px-6 text-[15px] font-semibold rounded cursor-pointer transition-colors duration-300"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button className="relative bg-zinc-900 hover:bg-zinc-800 py-3 px-4 text-[15px] font-semibold rounded cursor-pointer transition-colors duration-300">
          <Bell size={20} />
          <div className="w-2 h-2 bg-yellow-300 rounded-full absolute top-2 right-2"></div>
        </button>
        <button
          onClick={() => setShowTab("settings")}
          className="bg-zinc-900 hover:bg-zinc-800 py-3 px-4 text-[15px] font-semibold rounded cursor-pointer transition-colors duration-300"
        >
          <Settings size={20} />
        </button>
        <button
          onClick={handleLogout}
          className="bg-zinc-900 hover:bg-zinc-800 py-3 px-4 text-[15px] font-semibold rounded cursor-pointer transition-colors duration-300"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
}
