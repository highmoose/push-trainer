"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { login, resetAuthStatus } from "@/redux/slices/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const { user, status, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  // Check for session expiration message
  const reason = searchParams.get("reason");
  const isSessionExpired = reason === "session_expired";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Please enter both email and password");
      return;
    }

    try {
      await dispatch(login({ email, password })).unwrap();
      console.log("✅ Logged in successfully!");
      // AuthGuard will handle the redirect to dashboard
    } catch (err) {
      console.error("❌ Login failed:", err);
      setLocalError(err);
    }
  };

  // Clear any previous auth errors when component mounts
  useEffect(() => {
    dispatch(resetAuthStatus());
  }, [dispatch]);

  // Redirect is handled by AuthGuard, no need to manually redirect here

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="">
        <div className="flex justify-between items-center gap-4 w-full">
          <div>
            <p className="text-xl font-bold text-white -mt-4">Account Login</p>
            <p className="text-sm text-zinc-400 -mt-1">
              Enter your email and password
            </p>
            {isSessionExpired && (
              <p className="text-sm text-red-400 mt-2">
                Your session expired due to inactivity. Please login again.
              </p>
            )}
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
          {(error || localError) && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error || localError}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="bg-zinc-50 placeholder:text-sm text-zinc-500 rounded py-2 px-2 min-w-[300px]"
              disabled={status === "loading"}
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="bg-zinc-50 placeholder:text-sm text-zinc-500 rounded py-2 px-2 min-w-[300px]"
              disabled={status === "loading"}
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading" || !email || !password}
            className="bg-zinc-100 hover:bg-zinc-300 disabled:bg-zinc-300 disabled:cursor-not-allowed transition duration-300 text-black rounded py-2 px-10 cursor-pointer min-w-[120px]"
          >
            {status === "loading" ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>{" "}
      <button
        onClick={() => router.push("/welcome")}
        className="mt-2 text-zinc-400 hover:text-white transition-colors"
        disabled={status === "loading"}
      >
        Go back
      </button>
    </div>
  );
}
