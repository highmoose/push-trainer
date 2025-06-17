"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { register } from "@/redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/slices/authSlice";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);
  const [user, setUser] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState("client");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      password_confirmation: passwordConfirm,
      role,
    };

    try {
      await dispatch(register(payload)).unwrap();
      router.push("/dashboard");
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user]);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div>
        <div className="flex justify-between items-center gap-4 w-full">
          <div>
            <p className="text-xl font-bold text-white -mt-4">Create Account</p>
            <p className="text-sm text-zinc-400 -mt-1">Enter your details</p>
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
          {" "}
          <div className="flex flex-col gap-2">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="bg-zinc-50 placeholder:text-sm text-zinc-500 rounded py-2 px-2 inner-shadow min-w-[300px]"
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="bg-zinc-50 placeholder:text-sm text-zinc-500 rounded py-2 px-2 inner-shadow min-w-[300px]"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="bg-zinc-50 placeholder:text-sm text-zinc-500 rounded py-2 px-2 inner-shadow min-w-[300px]"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="bg-zinc-50 placeholder:text-sm text-zinc-500 rounded py-2 px-2"
            />
            <input
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              type="password"
              placeholder="Confirm Password"
              className="bg-zinc-50 placeholder:text-sm text-zinc-500 rounded py-2 px-2"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-zinc-50 placeholder:text-sm text-zinc-500 rounded py-2 px-2"
            >
              <option value="client">Client</option>
              <option value="trainer">Personal Trainer</option>
              <option value="gym_owner">Gym Owner</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-zinc-100 hover:bg-zinc-300 transition duration-300 text-black rounded py-2 px-10 cursor-pointer"
          >
            Register
          </button>
          {error && (
            <p className="text-red-500 text-sm font-medium -mt-2">{error}</p>
          )}
        </form>
      </div>
      <button
        onClick={() => router.push("/welcome")}
        className="mt-2 text-white"
      >
        Go back
      </button>
    </div>
  );
}
