"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { register } from "@/redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/redux/slices/authSlice";
import { Input, Button, Select, SelectItem } from "@heroui/react";

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
      <div className="max-w-lg w-full">
        <div className="flex flex-col gap-2 justify-between items-center w-full">
          <Image
            src="/images/logo/push-logo-white.svg"
            width={200}
            height={200}
            alt="logo"
            className="mb-6"
          />

          <p className="text-2xl font-bold text-white">Create Account</p>
          <p className="text-md text-white">
            Already have an account?{" "}
            <a className="underline" onClick={() => router.push("/sign-in")}>
              Sign in
            </a>
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4 mx-10 my-6 rounded"
        >
          {error && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            <div className="flex gap-3">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                size="sm"
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                size="sm"
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              size="sm"
            />
            <div className="flex gap-3">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                size="sm"
              />
              <Input
                label="Confirm Password"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
                className="mb-4"
                size="sm"
              />
            </div>
            <Select
              label="Role"
              selectedKeys={[role]}
              onSelectionChange={(keys) => setRole(Array.from(keys)[0])}
              className="mb-4"
              size="sm"
            >
              <SelectItem key="client" value="client">
                Client
              </SelectItem>
              <SelectItem key="trainer" value="trainer">
                Personal Trainer
              </SelectItem>
              <SelectItem key="gym_owner" value="gym_owner">
                Gym Owner
              </SelectItem>
            </Select>
            <Button
              type="submit"
              color="primary"
              variant="solid"
              className="w-full bg-white text-black hover:bg-zinc-100 h-12 rounded-lg"
              disabled={
                !firstName ||
                !lastName ||
                !email ||
                !password ||
                !passwordConfirm ||
                password !== passwordConfirm
              }
            >
              Create Account
            </Button>

            <p className="mx-auto text-xs text-center text-zinc-400 max-w-xs mb-2">
              By clicking continue, you agree to our{" "}
              <span className="underline">Terms of Service</span> and{" "}
              <span className="underline">Privacy Policy</span>.
            </p>
            <Button
              color="primary"
              variant="solid"
              className="bg-zinc-800 text-white hover:bg-zinc-700 w-fit mx-auto"
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
