// utils/cookieOptions.js
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  domain: ".vercel.app",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
  