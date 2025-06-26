"use client";

import { HeroUIProvider } from "@heroui/react";
import heroUITheme from "../heroUITheme";

export function Providers({ children }) {
  return <HeroUIProvider theme={heroUITheme}>{children}</HeroUIProvider>;
}
