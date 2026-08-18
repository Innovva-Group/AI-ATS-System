import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const area = typeof body?.area === "string" ? body.area.trim() : "";

    if (!name || !email || !area) {
      return NextResponse.json(
        {
          success: false,
          error: "Candidate name, email, and area are required.",
        },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.INTERVIEW_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "INTERVIEW_WEBHOOK_URL is not configured.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        area,
      }),
    });

    if (!response.ok) {
      const details = await response.text();

      return NextResponse.json(
        {
          success: false,
          error: `n8n webhook returned ${response.status}.`,
          details,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Interview webhook error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send interview webhook.",
      },
      { status: 500 }
    );
  }
}
