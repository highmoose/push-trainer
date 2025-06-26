"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="max-w-lg w-full">
        <div className="flex flex-col gap-2 justify-between items-center w-full">
          <Image
            src="/images/logo/push-logo-white.svg"
            width={300}
            height={200}
            alt="logo"
            className="mb-6"
          />

          <p className="text-3xl font-bold text-white">Welcome to Push Inc.</p>
          <p className="text-lg text-white text-center">
            Please select how you'd like to get started
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 p-10 rounded">
          <div className="flex flex-col gap-4 w-full">
            <Button
              onClick={() => router.push("/sign-in")}
              color="primary"
              variant="solid"
              className="w-full text-lg bg-white text-black hover:bg-zinc-100 h-14"
            >
              Sign In
            </Button>

            <div className="flex items-center gap-4 text-lg text-zinc-500 my-2">
              <hr className="flex-1 border-zinc-300 dark:border-zinc-700" />
              <span className="whitespace-nowrap">or</span>
              <hr className="flex-1 border-zinc-300 dark:border-zinc-700" />
            </div>

            <Button
              onClick={() => router.push("/sign-up")}
              color="primary"
              variant="bordered"
              className="w-full border-1 bg-transparent text-lg border-zinc-700 text-white hover:bg-zinc-800 h-14"
            >
              Create Account
            </Button>

            <p className="mx-auto text-sm text-center text-zinc-400 max-w-xs mt-4">
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
