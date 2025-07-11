"use client";

import { Saira } from "next/font/google";
import { Provider as ReduxProvider } from "react-redux";
import store from "@redux/store";
import AuthHydration from "@redux/store/AuthHydration";
import "./globals.css";
import { Providers } from "./providers";

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full dark">
      <body className={`${saira.variable} antialiased h-full font-sans`}>
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
