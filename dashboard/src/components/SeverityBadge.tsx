import React from 'react';

interface SeverityBadgeProps {
  level: 'Low' | 'Medium' | 'High' | 'Critical';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ level }) => {
  const styles = {
    Critical: "bg-red-500/10 text-red-400 border-red-500/30",
    High: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    Low: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold border ${styles[level]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {level}
    </span>
  );
};
