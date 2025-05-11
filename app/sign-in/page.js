"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/slices/authSlice";

// Redux
// import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
// import { login } from "@/redux/store/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      console.log("✅ Logged in!");
    } catch (err) {
      console.error("❌ Login failed:", err);
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/dashboard"); // ✅ redirect after login
    }
  }, [user]);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="">
        <div className="flex justify-between items-center gap-4 w-full">
          <div>
            <p className="text-xl font-bold text-white -mt-4">Account Login</p>
            <p className="text-sm text-zinc-400 -mt-1">
              Enter your email and password
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
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4 bg-zinc-200 p-10 rounded"
        >
          <div className="flex flex-col gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="bg-zinc-50 placeholder:text-sm text-zinc-500 rounded py-2 px-2 min-w-[300px]"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="bg-zinc-50 placeholder:text-sm text-zinc-500 rounded py-2 px-2 min-w-[300px]"
            />
          </div>
          <button
            type="submit"
            className="bg-zinc-100 hover:bg-zinc-300 transition duration-300 text-black rounded py-2 px-10 cursor-pointer "
          >
            Login
          </button>
        </form>
      </div>
      <button onClick={() => router.push("/welcome")} className="mt-2">
        Go back
      </button>
    </div>
  );
}
