"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  clearUser,
  verifyAuth,
  updateActivity,
  setSessionExpired,
  logout,
} from "@redux/slices/authSlice";

// Session timeout: 30 minutes of inactivity
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute

export default function AuthHydration() {
  const dispatch = useDispatch();
  const { isAuthenticated, hydrated } = useSelector((state) => state.auth);

  // Update activity timestamp
  const handleActivity = useCallback(() => {
    if (isAuthenticated) {
      dispatch(updateActivity());
    }
  }, [dispatch, isAuthenticated]);

  // Check for session timeout
  const checkSessionTimeout = useCallback(() => {
    const lastActivity = localStorage.getItem("lastActivity");
    if (lastActivity && isAuthenticated) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);

      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        console.log("Session expired due to inactivity");
        dispatch(setSessionExpired());
        dispatch(logout()); // Clean logout
      }
    }
  }, [dispatch, isAuthenticated]);
  // Initialize auth state
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const lastActivity = localStorage.getItem("lastActivity");

    console.log("AuthHydration initializing:", {
      stored: !!stored,
      lastActivity,
    });

    if (stored && lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);

      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        // Session expired
        console.log("Session expired on page load");
        dispatch(setSessionExpired());
        dispatch(clearUser());
      } else {
        // Valid session, set user and verify with server
        try {
          const user = JSON.parse(stored);
          console.log("Setting user from localStorage:", user);
          dispatch(setUser(user));

          // Verify with server in background
          dispatch(verifyAuth()).catch((err) => {
            console.log("Server verification failed:", err);
            // If server verification fails, user will be logged out by verifyAuth.rejected
          });
        } catch (error) {
          console.error("Error parsing stored user:", error);
          dispatch(clearUser());
        }
      }
    } else {
      console.log("No stored user or activity, clearing user");
      dispatch(clearUser()); // Ensure hydration is marked as complete
    }
  }, [dispatch]);

  // Set up activity listeners
  useEffect(() => {
    if (!hydrated) return;

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add activity listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Set up session timeout checker
    const timeoutChecker = setInterval(
      checkSessionTimeout,
      ACTIVITY_CHECK_INTERVAL
    );

    return () => {
      // Cleanup
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(timeoutChecker);
    };
  }, [handleActivity, checkSessionTimeout, hydrated]);
  // Handle page visibility change (when user switches tabs/windows)
  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Page became visible, checking session");
        // Page became visible, check session
        checkSessionTimeout();
        // Optionally verify auth with server, but debounce it
        setTimeout(() => {
          if (isAuthenticated) {
            dispatch(verifyAuth());
          }
        }, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch, isAuthenticated, checkSessionTimeout, hydrated]);

  return null;
}
