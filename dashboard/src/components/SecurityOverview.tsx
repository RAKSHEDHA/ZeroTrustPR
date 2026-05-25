import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldCheck as ShieldSafe } from 'lucide-react';
import { Vulnerability } from '../data/mockAudits';

interface SecurityOverviewProps {
  score: number;
  vulnerabilities: Vulnerability[];
  confidence: 'Low' | 'Medium' | 'High';
}

export const SecurityOverview: React.FC<SecurityOverviewProps> = ({ score, vulnerabilities, confidence }) => {
  const counts = vulnerabilities.reduce(
    (acc, curr) => {
      acc[curr.threat_level]++;
      return acc;
    },
    { Critical: 0, High: 0, Medium: 0, Low: 0 }
  );

  const getScoreColor = (s: number) => {
    if (s === 0) return "text-emerald-400";
    if (s < 40) return "text-yellow-400";
    if (s < 70) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreLabel = (s: number) => {
    if (s === 0) return "SecurePosture";
    if (s < 40) return "Moderate Risk";
    if (s < 70) return "High Risk";
    return "Critical Risk";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Overall Threat Score */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Overall Threat Score</span>
        <div className="flex items-baseline gap-2 mt-3">
          <span className={`text-4xl font-mono font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-sm text-gray-500 font-mono">/100</span>
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-xs">
          {score > 0 ? (
            <ShieldAlert className="w-4 h-4 text-red-400" />
          ) : (
            <ShieldSafe className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-gray-400 font-medium">Status: {getScoreLabel(score)}</span>
        </div>
      </div>

      {/* Vulnerability Breakdown */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Vulnerabilities Detected</span>
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between p-2 rounded bg-red-950/10 border border-red-500/10">
            <span className="text-red-400 font-medium">Critical</span>
            <span className="font-mono font-bold text-red-400">{counts.Critical}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-orange-950/10 border border-orange-500/10">
            <span className="text-orange-400 font-medium">High</span>
            <span className="font-mono font-bold text-orange-400">{counts.High}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-yellow-950/10 border border-yellow-500/10">
            <span className="text-yellow-400 font-medium">Medium</span>
            <span className="font-mono font-bold text-yellow-400">{counts.Medium}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-slate-700/10">
            <span className="text-slate-400 font-medium">Low</span>
            <span className="font-mono font-bold text-slate-300">{counts.Low}</span>
          </div>
        </div>
      </div>

      {/* AI Confidence Score */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Audit Confidence</span>
        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-3xl font-bold text-gray-100">
            {confidence}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-xs">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="text-gray-400 font-medium">LLM Review Mode: Highly Strict (T=0.1)</span>
        </div>
      </div>
    </div>
  );
};
