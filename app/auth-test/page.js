"use client";

import { useSelector, useDispatch } from "react-redux";
import { verifyAuth, logout } from "@/redux/slices/authSlice";

export default function AuthTestPage() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const handleVerifyAuth = () => {
    dispatch(verifyAuth());
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="p-8 bg-zinc-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Auth State</h2>
          <pre className="text-sm bg-zinc-700 p-3 rounded overflow-auto">
            {JSON.stringify(auth, null, 2)}
          </pre>
        </div>

        <div className="bg-zinc-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">LocalStorage</h2>
          <div className="text-sm space-y-2">
            <div>
              <strong>user:</strong>{" "}
              {localStorage.getItem("user") ? "EXISTS" : "NONE"}
            </div>
            <div>
              <strong>auth_token:</strong>{" "}
              {localStorage.getItem("auth_token") ? "EXISTS" : "NONE"}
            </div>
            <div>
              <strong>lastActivity:</strong>{" "}
              {localStorage.getItem("lastActivity") || "NONE"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={handleVerifyAuth}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Verify Auth
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
        <button
          onClick={clearLocalStorage}
          className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700"
        >
          Clear LocalStorage
        </button>
      </div>
    </div>
  );
}
