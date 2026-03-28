import { betterAuth } from "better-auth";
import { dash } from "@better-auth/infra";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "./prisma.ts";

// Initialize Better Auth with Prisma adapter
export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  trustedOrigins: (process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  secret: process.env.BETTER_AUTH_API_KEY,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAgeUntilAndLeaning: 60 * 60 * 24, // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
    deferSessionRefresh: true, // refresh session in background after response is sent
  },
  plugins: [dash()],
});

export type Session = typeof auth.$Infer.Session;
