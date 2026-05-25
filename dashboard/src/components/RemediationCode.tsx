"use client";

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface RemediationCodeProps {
  code: string;
  language?: string;
}

export const RemediationCode: React.FC<RemediationCodeProps> = ({ code, language = 'typescript' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="relative mt-2 rounded-lg border border-emerald-500/20 bg-emerald-950/10 overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-emerald-500/10 bg-emerald-950/30 text-emerald-400">
        <span className="font-semibold text-[10px] tracking-wider uppercase">{language}</span>
        <button
          onClick={copyToClipboard}
          className="p-1 rounded hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 transition-colors"
          title="Copy Secure Code"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-emerald-300 bg-emerald-950/5">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
};
