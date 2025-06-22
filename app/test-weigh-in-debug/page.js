"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  setAuthUserId,
  acceptWeighInRequest,
  declineWeighInRequest,
  completeWeighInRequest,
} from "@/redux/slices/messagingSlice";

export default function TestWeighInDebug() {
  const dispatch = useDispatch();
  const messagesByUser = useSelector((state) => state.messaging.messagesByUser);
  const authUserId = useSelector((state) => state.messaging.authUserId);

  const [testAuthUserId] = useState("123"); // Trainer ID
  const [testClientId] = useState("456"); // Client ID
  const [lastRequestId, setLastRequestId] = useState(null);

  // Set auth user ID
  const handleSetAuthUserId = () => {
    dispatch(setAuthUserId(testAuthUserId));
  };
  // Test accept/decline/complete functionality
  const testAcceptRequest = () => {
    const requestId = lastRequestId || 123;
    console.log(`🧪 Testing accept request: ${requestId}`);
    dispatch(acceptWeighInRequest({ requestId }));
  };

  const testDeclineRequest = () => {
    const requestId = lastRequestId || 123;
    console.log(`🧪 Testing decline request: ${requestId}`);
    dispatch(declineWeighInRequest({ requestId }));
  };

  const testCompleteRequest = () => {
    const requestId = lastRequestId || 123;
    console.log(`🧪 Testing complete request: ${requestId}`);
    dispatch(completeWeighInRequest({ requestId }));
  };
  // Add test weigh-in request
  const addTestWeighInRequest = () => {
    console.log("🧪 Creating test weigh-in request...");

    const requestId = Date.now();
    setLastRequestId(requestId);

    const testMessage = {
      id: `test_weigh_in_${requestId}`,
      sender_id: testAuthUserId,
      receiver_id: testClientId,
      message: "Test Weigh-in Request",
      message_type: "weigh_in_request",
      weigh_in_request_id: requestId,
      weigh_in_request: {
        id: requestId,
        title: "Weekly Check-in",
        description: "Please submit your weekly measurements",
        requested_metrics: ["weight", "body_fat_percentage"],
        requested_photos: ["front", "side"],
        due_date: new Date().toISOString().split("T")[0],
        priority: "medium",
        status: "pending",
        client_id: testClientId,
      },
      created_at: new Date().toISOString(),
      pending: false,
    };

    setLastRequestId(testMessage.weigh_in_request_id);

    console.log("🧪 Dispatching test message:", testMessage);
    dispatch(addMessage(testMessage));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Weigh-in Request Debug</h1>

      <div className="mb-4">
        <p>
          <strong>Auth User ID:</strong> {authUserId || "Not set"}
        </p>
        <p>
          <strong>Last Request ID:</strong> {lastRequestId || "None"}
        </p>
        <button
          onClick={handleSetAuthUserId}
          className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
        >
          Set Auth User ID ({testAuthUserId})
        </button>
      </div>

      <div className="mb-4">
        <button
          onClick={addTestWeighInRequest}
          className="px-4 py-2 bg-green-600 text-white rounded mr-2"
        >
          🧪 Add Test Weigh-in Request
        </button>
        <button
          onClick={testAcceptRequest}
          className="px-4 py-2 bg-blue-600 text-white rounded mr-2"
        >
          ✓ Test Accept Request
        </button>
        <button
          onClick={testDeclineRequest}
          className="px-4 py-2 bg-red-600 text-white rounded mr-2"
        >
          ✗ Test Decline Request
        </button>
        <button
          onClick={testCompleteRequest}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          ✅ Test Complete Request
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Redux State:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(messagesByUser, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">
          Messages for Client {testClientId}:
        </h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
          {JSON.stringify(messagesByUser[testClientId] || [], null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">
          Messages for Trainer {testAuthUserId}:
        </h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
          {JSON.stringify(messagesByUser[testAuthUserId] || [], null, 2)}
        </pre>
      </div>
    </div>
  );
}
