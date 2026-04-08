export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "https://issop-platform.onrender.com/api/v1",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || "wss://issop-platform.onrender.com",
  appName: "ISSOP Admin",
  version: "1.0.0",
  tokenKey: "issop_admin_token",
  refreshTokenKey: "issop_admin_refresh",
};
