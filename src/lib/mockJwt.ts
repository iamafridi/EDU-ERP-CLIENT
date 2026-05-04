/**
 * Helper to generate a validly-formatted mock session token for demo personas.
 */
export function createDemoSessionToken(role: string, email: string): string {
  if (typeof window === "undefined") {
    return "mock-demo-session-token";
  }
  try {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days in the future
    const payload = btoa(
      JSON.stringify({
        sub: email,
        email,
        role,
        isDemo: true,
        exp,
      })
    );
    return `${header}.${payload}.mock-demo-signature`;
  } catch {
    return `mock-demo-session-${role}`;
  }
}
