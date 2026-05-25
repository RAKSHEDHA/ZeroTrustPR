"use client";

import { useState } from "react";
import { SecurityReport } from "@/types";
import VulnerabilityCard from "@/components/VulnerabilityCard";
import { ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<SecurityReport | null>(null);
  const [error, setError] = useState("");

  const handleAudit = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setReportData(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prUrl: url }),
      });

      if (!response.ok) {
        throw new Error("Audit failed. Check your API keys and GitHub URL.");
      }

      const data = await response.json();
      setReportData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto text-slate-200">
      <h1 className="text-3xl font-bold mb-8">Analysis Console</h1>

      {/* Input Console */}
      <div className="flex gap-4 mb-12 flex-col sm:flex-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste GitHub Pull Request URL (e.g., https://github.com/owner/repo/pull/1)"
          className="flex-1 bg-slate-900 border border-slate-800 rounded-md px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          onClick={handleAudit}
          disabled={loading || !url}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" /> Auditing...
            </>
          ) : (
            "Audit Pull Request"
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-md mb-8">
          {error}
        </div>
      )}

      {/* Report Summary */}
      {reportData && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Security Posture Overview
              </h2>
              <p className="text-slate-400">{reportData.threat_summary}</p>
            </div>
            <div
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold ${
                reportData.is_secure
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}
            >
              {reportData.is_secure ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
              {reportData.is_secure ? "SECURE" : "INSECURE"}
            </div>
          </div>

          {/* Vulnerabilities Feed */}
          {reportData.vulnerabilities.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-300 mb-4">
                Detected Vulnerabilities
              </h3>
              {reportData.vulnerabilities.map((vuln, index) => (
                <VulnerabilityCard key={index} vulnerability={vuln} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-400">
              No vulnerabilities detected in this diff.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
