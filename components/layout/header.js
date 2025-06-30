import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import { LogOut, Settings } from "lucide-react";
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Tabs,
  Tab,
} from "@heroui/react";
import NotificationBadge from "@/components/common/NotificationBadge";

export default function Header({ setShowTab, currentTab }) {
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

  const trainerTabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "messages", label: "Messages" },
    { id: "planner", label: "Planner" },
    { id: "clients", label: "Clients" },
    { id: "workouts", label: "Workouts" },
    { id: "check-ins", label: "Check-Ins" },
    { id: "team", label: "Team" },
    { id: "metrics", label: "Metrics" },
    { id: "nutrition", label: "Nutrition" },
  ];

  const clientTabs = [
    { id: "quick stats", label: "Quick Stats" },
    { id: "messages", label: "Messages" },
    { id: "timeline", label: "Timeline" },
    { id: "diet plan", label: "Diet Plan" },
    { id: "workout plan", label: "Workout Plan" },
    { id: "goal tracker", label: "Goal Tracker" },
  ];

  const handleTabChange = (key) => {
    setShowTab(key);
  };

  // Potentionally convert to a megamenu
  // Clients dropdown has clients images in a carousel to select from in menu dropdown

  return (
    <Navbar
      maxWidth="full"
      classNames={{
        base: "bg-transparent backdrop-blur-none ",
        wrapper: "px-8 py-16",
      }}
    >
      <NavbarBrand>
        <Image
          src="/images/logo/push-logo-white.svg"
          width={180}
          height={200}
          alt="logo"
        />
      </NavbarBrand>

      <NavbarContent className="hidden md:flex gap-2" justify="center">
        {user?.role === "trainer" && (
          <Tabs
            aria-label="Trainer navigation"
            items={trainerTabs}
            selectedKey={currentTab}
            onSelectionChange={handleTabChange}
            radius="full"
            color="white"
            classNames={{
              tabList:
                " w-full relative rounded-none p-1 bg-white/30 backdrop-blur-md rounded-full",
              cursor: "w-full bg-white",
              tab: "max-w-fit px-6 py-6 group-data-[selected=true]:text-black group-data-[selected=true]:font-semibold group-data-[selected=true]:shadow-md group-data-[selected=true]:rounded-full",
              tabContent:
                "text-white font-semibold  group-data-[selected=true]:text-white group-data-[selected=true]:text-black data-[selected=true]:text-black",
            }}
          >
            {(item) => <Tab key={item.id} title={item.label} />}
          </Tabs>
        )}
        {user?.role === "client" && (
          <Tabs
            aria-label="Client navigation"
            items={clientTabs}
            selectedKey={currentTab}
            onSelectionChange={handleTabChange}
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0",
              cursor: "w-full bg-white",
              tab: "max-w-fit px-4 h-12",
              tabContent:
                "group-data-[selected=true]:text-white text-zinc-400 font-semibold",
            }}
          >
            {(item) => <Tab key={item.id} title={item.label} />}
          </Tabs>
        )}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <div
            // isIconOnly
            variant="ghost"
            className="text-white hover:bg-zinc-800"
            size="md"
          >
            <NotificationBadge />
          </div>
        </NavbarItem>
        <NavbarItem>
          <Button
            isIconOnly
            onPress={() => setShowTab("settings")}
            variant="ghost"
            className="text-white hover:bg-zinc-800"
            size="md"
          >
            <Settings size={20} />
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            isIconOnly
            onPress={handleLogout}
            variant="ghost"
            className="text-white hover:bg-zinc-800"
            size="md"
          >
            <LogOut size={20} />
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
