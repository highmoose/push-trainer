// Debug authentication flow
// This is a temporary file to debug the auth flow

const testAuthFlow = async () => {
  try {
    console.log("=== Testing Auth Flow ===");

    // Check localStorage
    console.log("LocalStorage check:");
    console.log("- user:", localStorage.getItem("user"));
    console.log("- auth_token:", localStorage.getItem("auth_token"));
    console.log("- lastActivity:", localStorage.getItem("lastActivity"));

    // Test API call
    const response = await fetch("http://localhost:8000/api/user", {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    console.log("API Response:", response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("User data:", data);
    } else {
      console.log("API Error:", await response.text());
    }
  } catch (error) {
    console.error("Test error:", error);
  }
};

// Run test (uncomment to use)
// testAuthFlow();

export default testAuthFlow;
