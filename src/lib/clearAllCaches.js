/**
 * Global cache clearing utility for logout/session cleanup
 * Clears all application caches when user logs out
 */

const clearAllCaches = () => {
  console.log("🧹 Clearing all application caches...");

  // Clear global cache maps directly
  try {
    // Clear clients cache
    if (typeof window !== "undefined" && window.clearClientsCache) {
      window.clearClientsCache();
      console.log("✅ Clients cache cleared");
    }

    // Clear diet plans cache
    if (typeof window !== "undefined" && window.clearDietPlansCache) {
      window.clearDietPlansCache();
      console.log("✅ Diet plans cache cleared");
    }

    // Clear sessions cache
    if (typeof window !== "undefined" && window.clearSessionsCache) {
      window.clearSessionsCache();
      console.log("✅ Sessions cache cleared");
    }

    // Clear tasks cache
    if (typeof window !== "undefined" && window.clearTasksCache) {
      window.clearTasksCache();
      console.log("✅ Tasks cache cleared");
    }

    // Clear client nutrition plans cache
    if (typeof window !== "undefined" && window.clearClientNutritionCache) {
      window.clearClientNutritionCache();
      console.log("✅ Client nutrition cache cleared");
    }
  } catch (err) {
    console.warn("⚠️ Could not clear some caches:", err);
  }

  // Clear sessionStorage items
  try {
    sessionStorage.removeItem("data_preloaded");
    sessionStorage.removeItem("selectedClientId"); // From persistent client selection
    console.log("✅ SessionStorage cleared");
  } catch (err) {
    console.warn("⚠️ Could not clear sessionStorage:", err);
  }

  // Clear localStorage items (auth-related items are handled by Redux)
  try {
    // Clear any other app-specific localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("client_") ||
          key.startsWith("diet_") ||
          key.startsWith("session_") ||
          key.startsWith("task_"))
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    if (keysToRemove.length > 0) {
      console.log(`✅ Removed ${keysToRemove.length} localStorage items`);
    }
  } catch (err) {
    console.warn("⚠️ Could not clear localStorage:", err);
  }

  console.log("🎉 All caches cleared successfully!");
};

export default clearAllCaches;
