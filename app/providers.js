"use client";

import { HeroUIProvider } from "@heroui/react";
import heroUITheme from "@/config/theme";

export function Providers({ children }) {
  return <HeroUIProvider theme={heroUITheme}>{children}</HeroUIProvider>;
}
