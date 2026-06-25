import OpenAI from "openai";

function buildFreePost(prompt: string) {
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

export async function POST(request: Request) {
	try {
		const { prompt } = await request.json();
		const apiKey = process.env.OPENAI_API_KEY;
		const input = prompt || "Write a short social media post about making new friends online.";

		if (apiKey) {
			try {
				const openai = new OpenAI({ apiKey });
				const response = await openai.responses.create({
					model: "gpt-5-mini",
					input,
				});

				return Response.json({
					success: true,
					post: response.output_text,
					mode: "openai",
				});
			} catch (error) {
				const status = typeof error === "object" && error && "status" in error && typeof (error as { status?: number }).status === "number"
					? (error as { status: number }).status
					: 500;

				if (status === 401 || status === 429) {
					return Response.json({
						success: true,
						post: buildFreePost(input),
						mode: "free-fallback",
					});
				}

				return Response.json(
					{
						success: false,
						error: error instanceof Error ? error.message : String(error),
					},
					{ status }
				);
			}
		}

		return Response.json({
			success: true,
			post: buildFreePost(input),
			mode: "free-fallback",
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
