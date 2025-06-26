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
} from "@heroui/react";
import NotificationBadge from "@/components/common/NotificationBadge";

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
    { label: "Workouts" },
    { label: "Check-Ins" },
    { label: "Team" },
    { label: "Metrics" },
    { label: "Nutrition" },
  ];
  const clientMenu = [
    { label: "Quick Stats" },
    { label: "Messages" },
    { label: "Timeline" },
    { label: "Diet Plan" },
    { label: "Workout Plan" },
    { label: "Goal Tracker" },
  ];

  // Potentionally convert to a megamenu
  // Clients dropdown has clients images in a carousel to select from in menu dropdown

  return (
    <Navbar
      maxWidth="full"
      classNames={{
        base: "bg-black/95 backdrop-blur-md",
        wrapper: "px-8 py-4",
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
          <>
            {trainerMenu.map((item, index) => (
              <NavbarItem key={index}>
                <Button
                  onPress={() => setShowTab(item.label.toLowerCase())}
                  variant="ghost"
                  className="text-white hover:bg-zinc-800 font-semibold transition-colors"
                  size="md"
                >
                  {item.label}
                </Button>
              </NavbarItem>
            ))}
          </>
        )}
        {user?.role === "client" && (
          <>
            {clientMenu.map((item, index) => (
              <NavbarItem key={index}>
                <Button
                  onPress={() => setShowTab(item.label.toLowerCase())}
                  variant="ghost"
                  className="text-white hover:bg-zinc-800 font-semibold transition-colors"
                  size="md"
                >
                  {item.label}
                </Button>
              </NavbarItem>
            ))}
          </>
        )}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            isIconOnly
            variant="ghost"
            className="text-white hover:bg-zinc-800"
            size="md"
          >
            <NotificationBadge />
          </Button>
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
