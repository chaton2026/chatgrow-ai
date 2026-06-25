"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("Create a short social media post about making new friends online.");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to generate a post right now.");
      }

      setResult(data.post || "No post returned.");
      if (data.mode === "free-fallback") {
        setError("Using the free built-in generator because paid API quota is unavailable.");
      } else {
        setError("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-10 text-white">
      <section className="mx-auto flex max-w-3xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/6 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200">ChatGrow AI</p>
          <h1 className="text-4xl font-bold md:text-5xl">Generate polished social posts in seconds.</h1>
          <p className="max-w-2xl text-slate-300">
            Describe the tone or topic you want, then let the AI craft a ready-to-share caption.
          </p>
        </div>

        <label className="space-y-2 text-sm text-slate-200">
          <span>Prompt</span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none ring-0 transition focus:border-cyan-400"
          />
        </label>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex w-fit items-center rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Post"}
        </button>

        {error ? (
          <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-100">{error}</p>
        ) : null}

        {result ? (
          <article className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-5 text-slate-100 shadow-inner shadow-emerald-400/5">
            <h2 className="text-lg font-semibold text-emerald-100">Generated Post</h2>
            <p className="mt-3 whitespace-pre-wrap text-slate-100">{result}</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}