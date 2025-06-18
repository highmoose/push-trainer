"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Provider as ReduxProvider } from "react-redux";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import store from "@redux/store";
import AuthHydration from "@redux/store/AuthHydration";
import AuthGuard from "@/components/auth/AuthGuard";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./globals.css";
import mantineTheme from "mantineTheme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <div id="mantine-portal" />

        <ReduxProvider store={store}>
          <AuthHydration />
          <AuthGuard>
            <MantineProvider
              withGlobalStyles
              withNormalizeCSS
              theme={mantineTheme}
            >
              <DatesProvider settings={{ locale: "en", firstDayOfWeek: 1 }}>
                <div className="h-full">{children}</div>
              </DatesProvider>
            </MantineProvider>
          </AuthGuard>
        </ReduxProvider>
      </body>
    </html>
  );
}
