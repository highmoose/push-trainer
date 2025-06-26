"use client";

import { useSelector, useDispatch } from "react-redux";
import { verifyAuth, logout } from "@/redux/slices/authSlice";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";

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
        <Card className="bg-zinc-800 border border-zinc-700">
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Auth State</h2>
          </CardHeader>
          <CardBody>
            <pre className="text-sm bg-zinc-700 p-3 rounded overflow-auto text-white">
              {JSON.stringify(auth, null, 2)}
            </pre>
          </CardBody>
        </Card>

        <Card className="bg-zinc-800 border border-zinc-700">
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">LocalStorage</h2>
          </CardHeader>
          <CardBody>
            <div className="text-sm space-y-2 text-white">
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
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 flex gap-4">
        <Button
          onPress={handleVerifyAuth}
          color="primary"
          variant="solid"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Verify Auth
        </Button>
        <Button
          onPress={handleLogout}
          color="danger"
          variant="solid"
          className="bg-red-600 hover:bg-red-700"
        >
          Logout
        </Button>
        <Button
          onPress={clearLocalStorage}
          color="warning"
          variant="solid"
          className="bg-yellow-600 hover:bg-yellow-700 text-black"
        >
          Clear LocalStorage
        </Button>
      </div>
    </div>
  );
}
