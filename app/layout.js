"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import store from "@redux/store";
import AuthHydration from "@redux/store/AuthHydration";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

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
        <MantineProvider withGlobalStyles withNormalizeCSS>
          <ReduxProvider store={store}>
            <Notifications />
            <AuthHydration />
            {children}
          </ReduxProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
