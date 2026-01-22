import { auth } from "@/lib/auth-server";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better Auth API route handler for Next.js App Router
 * Handles all auth endpoints: /api/auth/*
 */
export const { GET, POST } = toNextJsHandler(auth);
