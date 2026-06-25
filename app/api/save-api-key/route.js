import { promises as fs } from "fs";
import path from "path";

export async function POST(request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      return Response.json(
        { success: false, error: "API key is required." },
        { status: 400 }
      );
    }

    const envPath = path.join(process.cwd(), ".env.local");
    let existing = "";

    try {
      existing = await fs.readFile(envPath, "utf8");
    } catch {
      existing = "";
    }

    const lines = existing
      .split(/\r?\n/)
      .filter((line) => !line.startsWith("OPENAI_API_KEY="));

    lines.push(`OPENAI_API_KEY=${apiKey.trim()}`);

    await fs.writeFile(envPath, `${lines.join("\n")}\n`, "utf8");
    process.env.OPENAI_API_KEY = apiKey.trim();

    return Response.json({
      success: true,
      message: "API key saved successfully.",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
