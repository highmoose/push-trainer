"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div>
        <div className="flex justify-between items-center gap-4 w-full">
          <div>
            <p className="text-xl font-bold text-white -mt-4">Select Login</p>
            <p className="text-sm text-zinc-400 -mt-1">
              Please select which type of user you are
            </p>
          </div>
          <Image
            src="/images/logo/push-logo-white.svg"
            width={170}
            height={160}
            alt="logo"
            className="mb-3"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/sign-in")}
            className="flex flex-col items-center gap-4 bg-zinc-200 p-10 rounded w-[240px] cursor-pointer"
          >
            <p className="text-xl font-bold text-black">Im a Client</p>
            <p className="text-sm text-black">
              If you are a client you can login here
            </p>
          </button>
          <button
            onClick={() => router.push("/sign-up")}
            className="flex flex-col items-center gap-4 bg-zinc-200 p-10 rounded w-[240px] cursor-pointer"
          >
            <p className="text-xl font-bold text-black">Im a Trainer</p>
            <p className="text-sm text-black">
              If you are a trainer you can login here
            </p>
          </button>
        </div>
        <div>
          <button
            className=" text-white p-2 rounded mt-2 w-full cursor-pointer"
            onClick={() => router.push("/sign-up")}
          >
            Not yet registered? Click here to{" "}
            <strong> create an account</strong>
          </button>
        </div>
      </div>
    </div>
  );
}
