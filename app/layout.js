"use client";

import { Onest } from "next/font/google";
import { Provider as ReduxProvider } from "react-redux";
import store from "@/store/store";
import AuthHydration from "@/store/store/AuthHydration";
import "./globals.css";
import { Providers } from "./providers";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full dark">
      <body className={`${onest.variable} antialiased h-full font-sans`}>
        <ReduxProvider store={store}>
          <AuthHydration />
          <Providers>
            <div className="h-full">{children}</div>
          </Providers>
        </ReduxProvider>
      </body>
    </html>
  );
}
