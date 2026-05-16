import { useState } from "react";

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!repoUrl) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("http://localhost:3001/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            Git<span className="text-violet-400">Digest</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Paste any GitHub repo URL and understand it instantly
          </p>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder="https://github.com/facebook/react"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={analyze}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-400 py-12">
            <div className="text-5xl mb-4 animate-spin inline-block">⚙️</div>
            <p>Reading the repo and thinking...</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">

            {/* Repo info */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h2 className="text-xl font-bold text-violet-400 mb-1">{result.name}</h2>
              <div className="flex gap-4 text-sm text-gray-400">
                <span>⭐ {result.stars.toLocaleString()}</span>
                <span>🍴 {result.forks.toLocaleString()}</span>
                <span>💻 {result.language}</span>
                <span className="ml-auto bg-violet-900/50 text-violet-300 px-2 py-0.5 rounded text-xs font-medium">
                  {result.explanation.difficulty}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-2">What it does</h3>
              <p className="text-gray-200 leading-relaxed">{result.explanation.summary}</p>
            </div>

            {/* Tech Stack */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {result.explanation.techStack.map((tech) => (
                  <span key={tech} className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Structure */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-2">How it's structured</h3>
              <p className="text-gray-200 leading-relaxed">{result.explanation.structure}</p>
            </div>

            {/* Contribute */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-2">How to contribute</h3>
              <p className="text-gray-200 leading-relaxed">{result.explanation.howToContribute}</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}