"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { Button } from "@heroui/react";

export default function WelcomePage() {
  const router = useRouter();
  const { user, hydrated } = useSelector((state) => state.auth);

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (hydrated && user) {
      console.log("✅ User already authenticated, redirecting to dashboard");
      router.replace("/dashboard");
    }
  }, [hydrated, user, router]);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="max-w-md w-full">
        <div className="flex flex-col gap-2 justify-between items-center w-full">
          <Image
            src="/images/logo/push-logo-white.svg"
            width={200}
            height={200}
            alt="logo"
            className="mb-6"
          />

          <p className="text-2xl font-bold text-white">Welcome to Push Inc.</p>
          <p className="text-md text-white text-center">
            Please select how you'd like to get started
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 mx-10 my-6 rounded">
          <div className="flex flex-col gap-4 w-full">
            <Button
              onClick={() => router.push("/sign-in")}
              color="primary"
              variant="solid"
              className="w-full bg-white text-black hover:bg-zinc-100 h-12 rounded-lg"
            >
              Sign In
            </Button>

            <div className="flex items-center gap-4 text-lg text-zinc-500">
              <hr className="flex-1 border-zinc-300 dark:border-zinc-700" />
              <span className="whitespace-nowrap">or</span>
              <hr className="flex-1 border-zinc-300 dark:border-zinc-700" />
            </div>

            <Button
              onClick={() => router.push("/sign-up")}
              color="primary"
              variant="bordered"
              className="w-full border  bg-transparent hover:bg-zinc-800 border-zinc-700 text-white  h-12 mb-4"
            >
              Create Account
            </Button>

            <p className="mx-auto text-xs text-center text-zinc-400 max-w-xs mb-2">
              By continuing, you agree to our{" "}
              <span className="underline cursor-pointer">Terms of Service</span>{" "}
              and{" "}
              <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
