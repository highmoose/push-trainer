"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Provider as ReduxProvider } from "react-redux";
import store from "@redux/store";
import AuthHydration from "@redux/store/AuthHydration";
import AuthGuard from "@/components/auth/AuthGuard";
import "./globals.css";
import { Providers } from "./providers";

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
    <html lang="en" className="h-full dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <ReduxProvider store={store}>
          <AuthHydration />
          <AuthGuard>
            <Providers>
              <div className="h-full">{children}</div>
            </Providers>
          </AuthGuard>
        </ReduxProvider>
      </body>
    </html>
  );
}
