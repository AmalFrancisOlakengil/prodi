"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Search, Loader2, ShoppingCart } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setResult("");

    try {
      const response = await fetch("https://prodi-jet.vercel.app/_svc/backend/index/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.recommendation) {
        setResult(data.recommendation);
      } else {
        setResult("Error: " + (data.error || "Unknown error occurred"));
      }
    } catch (err) {
      setResult("Failed to connect to the agent backend. Ensure the Python API is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 selection:bg-neutral-800">
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
          <div className="h-16 w-16 bg-neutral-900 rounded-2xl flex items-center justify-center border border-neutral-800 shadow-xl mb-4">
            <ShoppingCart className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Prodi <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Agent</span>
          </h1>
          <p className="text-neutral-400 max-w-lg text-lg">
            Tell me what you're looking for, and I'll search across marketplaces to find the best product for you.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-16">
          <div className="relative flex items-center group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Best noise-canceling headphones under $200"
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl py-4 pl-12 pr-32 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-lg backdrop-blur-sm"
            />
            <button
              type="submit"
              disabled={loading || !query}
              className="absolute right-2 px-6 py-2 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </button>
          </div>
        </form>

        {/* Results Area */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-md">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
            <p className="text-neutral-400 animate-pulse">Agent is searching the web...</p>
          </div>
        )}

        {result && !loading && (
          <div className="p-8 md:p-10 rounded-3xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-md shadow-2xl overflow-hidden">
            <div className="prose prose-invert prose-emerald max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
