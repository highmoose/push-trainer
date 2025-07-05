"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { login, resetAuthStatus } from "@/redux/slices/authSlice";
import { Input, Button } from "@heroui/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const { user, status, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
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
      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Login failed:", err);
      setLocalError(err);
    }
  };

  useEffect(() => {
    dispatch(resetAuthStatus());
  }, [dispatch]);

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

          <p className="text-2xl font-bold text-white">Welcome to Push Inc. </p>
          <p className="text-md text-white">
            Don't have an account? <a className="underline">Sign up</a>
          </p>
          {isSessionExpired && (
            <p className="text-sm text-red-400 ">
              Your session expired due to inactivity. Please login again.
            </p>
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4 mx-10 my-6 rounded"
        >
          {(error || localError) && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error || localError}
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              autoComplete="email"
              size="sm"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={status === "loading"}
              autoComplete="current-password"
              className="mb-4"
              size="sm"
            />
            <Button
              type="submit"
              color="primary"
              variant="solid"
              className="w-full  bg-white text-black hover:bg-zinc-100 h-12 rounded-lg"
              disabled={status === "loading" || !email || !password}
            >
              {status === "loading" ? "Logging in..." : "Login"}
            </Button>
            <div className="flex items-center gap-4 text-lg text-zinc-500 ">
              <hr className="flex-1 border-zinc-300 dark:border-zinc-700" />
              <span className="whitespace-nowrap">or</span>
              <hr className="flex-1 border-zinc-300 dark:border-zinc-700" />
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                color="primary"
                variant="bordered"
                className="w-full border  bg-transparent hover:bg-zinc-800 border-zinc-700 text-white  h-12 mb-4"
                disabled={status === "loading" || !email || !password}
                size="sm"
              >
                <Image
                  src="/images/icons/google.svg"
                  width={20}
                  height={20}
                  alt="Google"
                  className="text-white"
                />
                Google
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="bordered"
                className="w-full border  bg-transparent hover:bg-zinc-800 border-zinc-700 text-white  h-12 mb-4"
                disabled={status === "loading" || !email || !password}
                size="sm"
              >
                <Image
                  src="/images/icons/apple.svg"
                  width={20}
                  height={20}
                  alt="apple"
                  className="text-white"
                />
                Apple
              </Button>
            </div>
            <p className="mx-auto text-xs text-center text-zinc-400 max-w-xs  mb-2">
              By clicking continue, you agree to our{" "}
              <span className="underline">Terms of Service</span> and{" "}
              <span className="underline">Privacy Policy</span>.
            </p>
            <Button
              color="primary"
              variant="solid"
              className=" bg-zinc-800 text-white hover:bg-zinc-700 w-fit mx-auto"
              onClick={() => router.push("/welcome")}
              size="md"
            >
              Go back
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
