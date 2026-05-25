"use client";

import React, { useState, useEffect } from 'react';
import { Terminal, ShieldAlert, Cpu } from 'lucide-react';

interface AnalysisInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const AnalysisInput: React.FC<AnalysisInputProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Ingesting Pull Request Diffs...",
    "Scanning Code Context & Tree Structures...",
    "Analyzing Secrets, Injection Vector and OWASP Vulnerabilities...",
    "Compiling Audit Report Payload..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 1800);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="w-full bg-gray-900/40 border border-gray-800 rounded-xl p-6 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4 text-gray-400">
        <Terminal className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-mono font-semibold uppercase tracking-wider">Analysis Console</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 flex-col md:flex-row">
        <div className="relative flex-1">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste GitHub Pull Request URL (e.g. https://github.com/org/repo/pull/123)"
            required
            disabled={isLoading}
            className="w-full bg-gray-950/60 border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 md:w-52 min-h-[46px] ${
            isLoading
              ? "bg-blue-500/10 border border-blue-500/30 text-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/20 active:translate-y-[1px]"
          }`}
        >
          {isLoading ? (
            <>
              <Cpu className="w-4 h-4 animate-spin text-blue-400" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4" />
              <span>Audit Pull Request</span>
            </>
          )}
        </button>
      </form>

      {isLoading && (
        <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-blue-950/5 border border-blue-500/10 text-blue-400">
          <div className="flex space-x-1 items-center">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs font-mono font-medium animate-pulse">
            [Agent Status]: {loadingMessages[loadingStep]}
          </span>
        </div>
      )}
    </div>
  );
};
