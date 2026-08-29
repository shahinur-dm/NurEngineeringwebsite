import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User, ActivityLog, type IUser, type UserRole } from "@/lib/models";

const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  "nur_engineering_secret_admin_token_key_2026_x89!";
const COOKIE_NAME = "nes_admin_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// Simple deterministic secure payload encoding & signature
function base64url(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fromBase64url(str: string): string {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64").toString();
}

import crypto from "crypto";

export function signSessionToken(payload: {
  userId: string;
  email: string;
  role: UserRole;
}): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  const body = base64url(JSON.stringify({ ...payload, exp }));
  const data = `${header}.${body}`;
  const signature = base64url(
    crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64")
  );
  return `${data}.${signature}`;
}

export function verifySessionToken(
  token: string
): { userId: string; email: string; role: UserRole } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const data = `${header}.${body}`;
    const expected = base64url(
      crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64")
    );
    if (signature !== expected) return null;

    const parsed = JSON.parse(fromBase64url(body));
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return {
      userId: parsed.userId,
      email: parsed.email,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export async function getCurrentAdminUser(): Promise<IUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload?.userId) return null;

    await connectDB();
    const user = await User.findById(payload.userId).lean<IUser | null>();
    if (!user || !user.active) return null;

    return user;
  } catch {
    return null;
  }
}

export async function logActivity({
  action,
  entity,
  entityId,
  details,
  user,
}: {
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  user?: { _id: string; name: string; email: string; role: string };
}) {
  try {
    await connectDB();
    await ActivityLog.create({
      action,
      entity,
      entityId,
      details,
      user: user
        ? {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        : undefined,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
