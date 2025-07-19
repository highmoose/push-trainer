"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useDataPreloader } from "@/hooks/useDataPreloader";
import DataLoadingScreen from "@/components/common/DataLoadingScreen";

/**
 * Wrapper component that handles data preloading after successful authentication
 * Shows loading screen while preloading essential data for optimal performance
 */
const DataPreloadWrapper = ({ children }) => {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const [hasPreloaded, setHasPreloaded] = useState(false);
  const [shouldPreload, setShouldPreload] = useState(false);

  const {
    isPreloading,
    preloadingProgress,
    preloadingStatus,
    preloadError,
    preloadAllData,
  } = useDataPreloader();

  // Check if we should preload data (user just logged in)
  useEffect(() => {
    if (!user) {
      setHasPreloaded(false);
      setShouldPreload(false);
      return;
    }

    // Check if this is a fresh login (no cached data flag)
    const hasPreloadedData = sessionStorage.getItem("data_preloaded");

    if (!hasPreloadedData && !hasPreloaded) {
      setShouldPreload(true);
    } else {
      setHasPreloaded(true);
    }
  }, [user, hasPreloaded]);

  // Start preloading when needed
  useEffect(() => {
    if (shouldPreload && user && !isPreloading) {
      const startPreloading = async () => {
        try {
          await preloadAllData();
          // Mark as preloaded for this session
          sessionStorage.setItem("data_preloaded", "true");
          setHasPreloaded(true);
          setShouldPreload(false);
        } catch (error) {
          console.error("Failed to preload data:", error);
          // Continue anyway after a delay
          setTimeout(() => {
            setHasPreloaded(true);
            setShouldPreload(false);
          }, 2000);
        }
      };

      startPreloading();
    }
  }, [shouldPreload, user, isPreloading, preloadAllData]);

  // Clear preload flag on sign out
  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem("data_preloaded");
    }
  }, [user]);

  // Show loading screen if we need to preload or are currently preloading
  if (user && (shouldPreload || isPreloading || !hasPreloaded)) {
    return (
      <DataLoadingScreen
        progress={preloadingProgress}
        status={preloadingStatus}
        error={preloadError}
      />
    );
  }

  // Show children (dashboard) once preloading is complete
  return children;
};

export default DataPreloadWrapper;
