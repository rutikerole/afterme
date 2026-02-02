import { NextResponse } from "next/server";
import { register } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const result = await register(email, password, name);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, fieldErrors: result.fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    console.error("Registration API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Registration failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
