import { GoogleGenerativeAI } from "@google/generative-ai";

function buildFallbackPost(prompt: string) {
  const topic = (prompt || "your next big idea").trim();
  const lower = topic.toLowerCase();

  if (lower.includes("friend") || lower.includes("community")) {
    return `Small steps create strong bonds. ${topic} is a reminder that real connections grow when we show up with heart, curiosity, and a little courage. 🌱✨`;
  }

  if (lower.includes("business") || lower.includes("brand") || lower.includes("marketing")) {
    return `Build with purpose, share with consistency, and let your message do the talking. ${topic} is proof that smart ideas grow when they are backed by clarity and trust. 🚀`;
  }

  return `Here’s a fresh, ready-to-share post: ${topic}. Keep it simple, stay authentic, and let your energy do the rest. ✨`;
}

async function parseBody(request: Request) {
  try {
    const text = await request.text();

    if (!text) {
      return {};
    }

    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const prompt =
      typeof body?.prompt === "string" && body.prompt.trim()
        ? body.prompt.trim()
        : "Create a short social media post about making new friends online.";

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json({
        success: true,
        post: buildFallbackPost(prompt),
        mode: "fallback",
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return Response.json({
        success: true,
        post: text,
        mode: "gemini",
      });
    } catch (error) {
      return Response.json({
        success: true,
        post: buildFallbackPost(prompt),
        mode: "fallback",
        note: error instanceof Error ? error.message : String(error),
      });
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
