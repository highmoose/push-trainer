import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, invite_link } = await request.json();

    if (!email || !invite_link) {
      return NextResponse.json(
        { error: "Email and invite link are required" },
        { status: 400 }
      );
    }

    // Get the API base URL from environment
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

    // Forward the request to the Laravel API
    const response = await fetch(`${apiBaseUrl}/clients/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.headers
          .get("authorization")
          ?.replace("Bearer ", "")}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: data.message || "Failed to send invitation" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error sending invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
