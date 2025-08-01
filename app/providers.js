"use client";

import { HeroUIProvider } from "@heroui/react";
import heroUITheme from "@/config/theme";
import { ToastProvider } from "@heroui/toast";
import { X } from "lucide-react";

export function Providers({ children }) {
  return (
    <HeroUIProvider theme={heroUITheme}>
      <ToastProvider
        toastOffset={16}
        toastProps={{
          classNames: {
            base: "bg-panel border border-zinc-700/10 shadow-lg backdrop-blur-sm",
            title: "text-white font-medium",
            description: "text-zinc-300",
            closeButton:
              "opacity-100 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white absolute right-2 top-2",
          },
        }}
      />
      {children}
    </HeroUIProvider>
  );
}
