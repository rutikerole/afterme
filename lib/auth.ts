import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  createUser,
  findUserByEmail,
  updateLastLogin,
  emailExists,
} from "./db/users";
import {
  createSession,
  findValidSession,
  deleteSession,
  deleteAllUserSessions,
} from "./db/sessions";
import {
  createAuditLog,
  AuditAction,
  logActivity,
  ActivityType,
} from "./db/activity";

// =============================================================================
// AUTH CONFIGURATION
// =============================================================================

const AUTH_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "afterme_session";
const AUTH_COOKIE_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || "604800"); // 7 days
const BCRYPT_SALT_ROUNDS = 12;

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// =============================================================================
// TYPES
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  phone?: string | null;
  createdAt: Date;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Get request metadata for audit logging
 */
function getRequestMetadata(request?: Request): { ipAddress?: string; userAgent?: string } {
  if (!request) return {};

  return {
    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
  };
}

// =============================================================================
// SERVER-SIDE AUTH FUNCTIONS
// =============================================================================

/**
 * Get the current authenticated user from cookies
 * Use this in Server Components and API routes
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    // Validate session in database
    const session = await findValidSession(sessionCookie.value);

    if (!session) {
      // Invalid or expired session, clear the cookie
      cookieStore.delete(AUTH_COOKIE_NAME);
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      avatar: session.user.avatar,
      phone: session.user.phone,
      createdAt: session.user.createdAt,
    };
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 * Lightweight check for middleware and guards
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

// =============================================================================
// AUTH ACTIONS (Server Actions)
// =============================================================================

/**
 * Register a new user
 */
export async function register(
  email: string,
  password: string,
  name: string,
  request?: Request
): Promise<AuthResult> {
  // Validate input with Zod
  const validationResult = registerSchema.safeParse({ email, password, name });

  if (!validationResult.success) {
    const fieldErrors: Record<string, string[]> = {};
    validationResult.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    });

    return {
      success: false,
      error: "Validation failed",
      fieldErrors,
    };
  }

  // Sanitize inputs
  const sanitizedEmail = email.toLowerCase().trim();
  const sanitizedName = name.trim();

  try {
    // Check if user exists
    const exists = await emailExists(sanitizedEmail);
    if (exists) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Hash password securely with bcrypt
    const passwordHash = await hashPassword(password);

    // Create user in database
    const dbUser = await createUser({
      email: sanitizedEmail,
      passwordHash,
      name: sanitizedName,
    });

    // Create user object for response
    const safeUser: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar: dbUser.avatar,
      createdAt: dbUser.createdAt,
    };

    // Create session
    const metadata = getRequestMetadata(request);
    const session = await createSession({
      userId: dbUser.id,
      ...metadata,
      expiresInDays: 7,
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE,
      path: "/",
    });

    // Log activity
    await logActivity({
      userId: dbUser.id,
      type: ActivityType.PROFILE_UPDATED,
      description: "Account created",
    });

    return {
      success: true,
      user: safeUser,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Failed to create account. Please try again." };
  }
}

/**
 * Log in an existing user
 */
export async function login(
  email: string,
  password: string,
  request?: Request
): Promise<AuthResult> {
  // Validate input with Zod
  const validationResult = loginSchema.safeParse({ email, password });

  if (!validationResult.success) {
    const fieldErrors: Record<string, string[]> = {};
    validationResult.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    });

    return {
      success: false,
      error: "Validation failed",
      fieldErrors,
    };
  }

  // Sanitize email
  const sanitizedEmail = email.toLowerCase().trim();
  const metadata = getRequestMetadata(request);

  try {
    // Find user
    const user = await findUserByEmail(sanitizedEmail);

    if (!user) {
      // Log failed attempt (without userId since user doesn't exist)
      await createAuditLog({
        action: AuditAction.LOGIN_FAILED,
        ...metadata,
        status: "failure",
        details: { reason: "User not found", email: sanitizedEmail },
      });

      // Use constant-time response to prevent user enumeration
      return { success: false, error: "Invalid email or password" };
    }

    // Verify password using bcrypt (constant-time comparison)
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      // Log failed attempt
      await createAuditLog({
        userId: user.id,
        action: AuditAction.LOGIN_FAILED,
        ...metadata,
        status: "failure",
        details: { reason: "Invalid password" },
      });

      return { success: false, error: "Invalid email or password" };
    }

    // Check if user is active
    if (!user.isActive) {
      return { success: false, error: "Your account has been deactivated" };
    }

    // Create session
    const session = await createSession({
      userId: user.id,
      ...metadata,
      expiresInDays: 7,
    });

    // Update last login timestamp
    await updateLastLogin(user.id);

    // Create user object without password hash
    const safeUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE,
      path: "/",
    });

    // Log successful login
    await createAuditLog({
      userId: user.id,
      action: AuditAction.LOGIN,
      ...metadata,
      status: "success",
    });

    return {
      success: true,
      user: safeUser,
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Login failed. Please try again." };
  }
}

/**
 * Log out the current user
 */
export async function logout(request?: Request): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (sessionCookie?.value) {
    try {
      // Get session to log the logout
      const session = await findValidSession(sessionCookie.value);

      if (session) {
        const metadata = getRequestMetadata(request);

        // Log the logout
        await createAuditLog({
          userId: session.userId,
          action: AuditAction.LOGOUT,
          ...metadata,
          status: "success",
        });
      }

      // Delete session from database
      await deleteSession(sessionCookie.value);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Always delete the cookie
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Log out from all devices
 */
export async function logoutAll(request?: Request): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (sessionCookie?.value) {
    try {
      const session = await findValidSession(sessionCookie.value);

      if (session) {
        const metadata = getRequestMetadata(request);

        // Delete all sessions for this user
        await deleteAllUserSessions(session.userId);

        // Log the action
        await createAuditLog({
          userId: session.userId,
          action: AuditAction.LOGOUT,
          ...metadata,
          status: "success",
          details: { allDevices: true },
        });
      }
    } catch (error) {
      console.error("Logout all error:", error);
    }
  }

  // Always delete the cookie
  cookieStore.delete(AUTH_COOKIE_NAME);
}
