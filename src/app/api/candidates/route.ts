import { NextResponse } from "next/server";

export const runtime = "nodejs";

const AIRTABLE_TABLE_NAME = "Candidates Data From Dashboard";
const ATTACHMENT_FIELD_NAME = "Attachment";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const cv = formData.get("cv");

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    if (!(cv instanceof File)) {
      return NextResponse.json(
        { success: false, error: "CV is required." },
        { status: 400 }
      );
    }

    const token = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!token || !baseId) {
      return NextResponse.json(
        {
          success: false,
          error: "Airtable configuration is missing.",
        },
        { status: 500 }
      );
    }

    const table = encodeURIComponent(AIRTABLE_TABLE_NAME);

    // 1. Create Airtable record with Name + Email
    const createResponse = await fetch(
      `https://api.airtable.com/v0/${baseId}/${table}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Name: name.trim(),
            Email: email.trim(),
          },
        }),
      }
    );

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      console.error("Airtable record creation failed:", createData);

      return NextResponse.json(
        {
          success: false,
          error:
            createData?.error?.message ||
            "Could not create the Airtable record.",
        },
        { status: 500 }
      );
    }

    const recordId = createData.id;

    // 2. Upload CV to Airtable Attachment field
    const cvBuffer = Buffer.from(await cv.arrayBuffer());
    const cvBase64 = cvBuffer.toString("base64");

    const attachmentField = encodeURIComponent(ATTACHMENT_FIELD_NAME);

    const uploadUrl =
      `https://content.airtable.com/v0/${baseId}/${recordId}/${attachmentField}/uploadAttachment`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentType: cv.type || "application/octet-stream",
        filename: cv.name,
        file: cvBase64,
      }),
    });

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      console.error("Airtable CV upload failed:", uploadData);

      return NextResponse.json(
        {
          success: false,
          error:
            uploadData?.error?.message ||
            "Candidate was created, but CV upload failed.",
          recordId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully.",
      recordId,
    });
  } catch (error) {
    console.error("Candidate API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to submit application. Please try again.",
      },
      { status: 500 }
    );
  }
}
