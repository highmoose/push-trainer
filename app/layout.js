"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Provider as ReduxProvider } from "react-redux";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import store from "@redux/store";
import AuthHydration from "@redux/store/AuthHydration";
import "./globals.css";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div id="mantine-portal" />

        <ReduxProvider store={store}>
          <AuthHydration />
          <MantineProvider withGlobalStyles withNormalizeCSS>
            <DatesProvider settings={{ locale: "en", firstDayOfWeek: 1 }}>
              {children}
            </DatesProvider>
          </MantineProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
