import { NextRequest, NextResponse } from "next/server";
import { reviewCode } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Missing required field: code" },
        { status: 400 }
      );
    }

    if (code.trim().length < 10) {
      return NextResponse.json(
        { error: "Code is too short. Please provide meaningful code to review." },
        { status: 400 }
      );
    }

    if (code.length > 50000) {
      return NextResponse.json(
        { error: "Code exceeds maximum length of 50,000 characters." },
        { status: 400 }
      );
    }

    const result = await reviewCode(code, language || "");

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Review API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during code review" },
      { status: 500 }
    );
  }
}
