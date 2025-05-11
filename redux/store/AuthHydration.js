"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@redux/slices/authSlice";

export default function AuthHydration() {
  const dispatch = useDispatch();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      dispatch(setUser(JSON.parse(stored)));
    } else {
      dispatch(clearUser()); // so we know hydration is done
    }
  }, [dispatch]);

  return null;
}
