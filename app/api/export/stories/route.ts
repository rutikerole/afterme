import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { exportStoriesToPDF } from "@/lib/pdf-export";

// GET - Export stories as PDF
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get optional query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const publishedOnly = searchParams.get("published") === "true";

    // Get all stories
    const stories = await prisma.story.findMany({
      where: {
        userId: user.id,
        ...(category ? { category } : {}),
        ...(publishedOnly ? { isPublished: true } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    if (stories.length === 0) {
      return NextResponse.json(
        { error: "No stories found to export" },
        { status: 404 }
      );
    }

    // Transform data for PDF
    const storyData = stories.map((story) => ({
      title: story.title,
      content: story.content,
      category: story.category || undefined,
      createdAt: story.createdAt.toISOString(),
      excerpt: story.excerpt || undefined,
    }));

    // Generate PDF
    const pdf = exportStoriesToPDF(storyData, {
      title: "My Life Stories",
      userName: user.name,
    });

    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="afterme-stories-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error exporting stories:", error);
    return NextResponse.json(
      { error: "Failed to export stories" },
      { status: 500 }
    );
  }
}
