import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import clearAllCaches from "@/lib/clearAllCaches";
import {
  LogOut,
  Settings,
  Home,
  MessageSquare,
  Calendar,
  Dumbbell,
  UserPlus,
  Utensils,
  User,
} from "lucide-react";
import { Button, Tabs, Tab } from "@heroui/react";
import NotificationBadge from "@/components/common/NotificationBadge";

export default function Header({ setShowTab, currentTab }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      // Clear all application caches before logout
      clearAllCaches();

      await dispatch(logout()).unwrap(); // logout thunk
      console.log("✅ Logout completed successfully");
      router.push("/welcome"); // redirect
    } catch (err) {
      // Since logout always proceeds (see authSlice), this shouldn't happen
      // But if it does, we still want to complete the logout process
      console.warn("⚠️ Logout completed with warnings:", err);
      clearAllCaches();
      router.push("/welcome");
    }
  };

  const trainerTabs = [
    { id: "dashboard", icon: <Home size={24} /> },
    { id: "messages", icon: <MessageSquare size={24} /> },
    { id: "planner", icon: <Calendar size={24} /> },
    { id: "clients", icon: <User size={24} /> },
    { id: "workouts", icon: <Dumbbell size={24} /> },
    { id: "team", icon: <UserPlus size={24} /> },
    { id: "nutrition", icon: <Utensils size={24} /> },
  ];

  const handleTabChange = (key) => {
    setShowTab(key);
  };
  return (
    <div className="w-[120px] bg-[#121214]">
      <div className="flex flex-col h-full items-center justify-between px-6 py-8">
        <div>
          <Image
            src="/images/logo/push-logo-emblem.svg"
            width={46}
            height={46}
            alt="logo"
          />
        </div>

        <div className="flex flex-col gap-2  justify-center">
          <Tabs
            aria-label="Trainer navigation"
            items={trainerTabs}
            selectedKey={currentTab}
            onSelectionChange={handleTabChange}
            orientation="vertical"
            radius="none"
            color="white"
            classNames={{
              tabList:
                "flex-col gap-6 w-full relative rounded-none p-1 bg-transparent",
              cursor: "bg-panel backdrop-blur-sm",
              tab: "h-14 w-14 group-data-[selected=true]:bg-white/20 group-data-[selected=true]:backdrop-blur-sm group-data-[selected=true]:rounded-none",
              tabContent:
                "text-white font-medium flex items-center gap-2 group-data-[selected=true]:text-white group-data-[selected=true]:font-semibold",
            }}
          >
            {(item) => (
              <Tab
                key={item.id}
                title={
                  <div className="flex items-center text-zinc-700 ">
                    {item.icon}
                  </div>
                }
              />
            )}
          </Tabs>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div
            variant="ghost"
            className="text-white hover:bg-zinc-800"
            size="md"
          >
            <NotificationBadge />
          </div>
          {/* <Button
            isIconOnly
            onPress={() => setShowTab("settings")}
            variant="ghost"
            className="text-white hover:bg-zinc-800"
            size="md"
          >
            <Settings size={20} />
          </Button> */}
          <Button
            isIconOnly
            onPress={handleLogout}
            variant="ghost"
            className="text-white hover:bg-zinc-800"
            size="md"
          >
            <LogOut size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
