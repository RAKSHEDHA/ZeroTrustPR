"use client";

import React, { useState, use } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  FileCode, 
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  GitPullRequest,
  CheckCircle2,
  Terminal,
  Bookmark
} from 'lucide-react';
import { mockReports } from '../../../data/mockAudits';
import { SeverityBadge } from '../../../components/SeverityBadge';
import { RemediationCode } from '../../../components/RemediationCode';

interface AuditPageProps {
  params: Promise<{ id: string }>;
}

export default function AuditPage({ params }: AuditPageProps) {
  const { id } = use(params);
  const report = mockReports.find(r => r.id === id) || mockReports[0];
  
  const [activeLine, setActiveLine] = useState<{ file: string; line: number } | null>(null);

  // Simple diff parser
  const renderDiffLine = (line: string, index: number) => {
    let style = "text-gray-400";
    let prefix = " ";
    
    if (line.startsWith("+") && !line.startsWith("+++")) {
      style = "bg-emerald-950/20 text-emerald-300 border-l-2 border-emerald-500 font-medium";
      prefix = "+";
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      style = "bg-red-950/20 text-red-300 border-l-2 border-red-500 font-medium";
      prefix = "-";
    } else if (line.startsWith("@@")) {
      style = "bg-blue-950/20 text-blue-400 font-bold border-l-2 border-blue-500/50 py-1";
      prefix = " ";
    } else if (line.startsWith("diff") || line.startsWith("index") || line.startsWith("---") || line.startsWith("+++")) {
      style = "bg-gray-900/30 text-gray-500 font-semibold border-b border-gray-900 py-1 text-[11px]";
      prefix = " ";
    }

    // Check if this line matches any vulnerability line
    const isVulnerable = report.vulnerabilities.some(v => {
      // Find out if the current file header is active (would require advanced parser)
      // For simple mockup, we match by line number if any vulnerability has it
      return v.line_number === index - 15; // Offset logic for mock display
    });

    const isHighlighted = activeLine && (index === activeLine.line);

    return (
      <div 
        key={index} 
        className={`flex font-mono text-[11px] sm:text-xs leading-5 hover:bg-gray-900/40 select-text ${style} ${
          isHighlighted ? "bg-blue-500/10 border-l-2 border-blue-500 font-semibold text-blue-200" : ""
        }`}
      >
        <span className="w-10 text-right pr-3 select-none text-gray-600 font-mono text-[10px]">
          {index + 1}
        </span>
        <span className="w-6 select-none text-center text-gray-600 mr-2">
          {prefix}
        </span>
        <span className="flex-1 whitespace-pre-wrap">{line}</span>
      </div>
    );
  };

  const handleVulnerabilityClick = (file: string, lineNumber: number) => {
    // For demo, we just highlight line by offsetting mock index or matching directly
    // Let's set the highlighted line index to a deterministic number
    const mockDiffLineIndex = lineNumber + 12; // Visual sync mock offset
    setActiveLine({ file, line: mockDiffLineIndex });
    
    // Scroll left pane to the line
    const element = document.getElementById(`diff-line-${mockDiffLineIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Top control bar */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard"
            className="p-2 rounded-lg bg-gray-900 border border-gray-850 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <GitPullRequest className="w-3.5 h-3.5 text-blue-400" />
              <span>{report.repo}</span>
              <span className="text-gray-700">/</span>
              <span>PR #{report.pullNumber}</span>
            </div>
            <h1 className="text-lg font-bold text-gray-100 mt-0.5">
              Split-Pane Code Review
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border ${
            report.is_secure 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}>
            {report.is_secure ? "SECURE POSTURE" : "INSECURE POSTURE"}
          </span>
          
          <a
            href={report.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-xs font-semibold text-gray-300 hover:text-white border border-gray-850 transition-all"
          >
            Open in GitHub <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Split Pane View */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden h-full">
        
        {/* Left Pane: Code Diff */}
        <div className="flex-1 flex flex-col bg-gray-950 border border-gray-850 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border-b border-gray-850 text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              <span>Code diff content</span>
            </div>
            <span>Lines: {report.diff.split('\n').length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 select-text">
            <div className="rounded-lg border border-gray-900 overflow-hidden bg-gray-900/10 py-2">
              {report.diff.split('\n').map((line, idx) => (
                <div id={`diff-line-${idx}`} key={idx}>
                  {renderDiffLine(line, idx)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: AI Vulnerability Feed */}
        <div className="w-full md:w-[400px] xl:w-[480px] flex-shrink-0 flex flex-col bg-gray-950 border border-gray-850 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border-b border-gray-850 text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Security review findings</span>
            </div>
            <span className="font-bold text-gray-300">{report.vulnerabilities.length} Alerts</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {report.vulnerabilities.length > 0 ? (
              report.vulnerabilities.map((vuln, index) => {
                const isHighlighted = activeLine && (activeLine.line === vuln.line_number + 12);
                
                return (
                  <div 
                    key={index}
                    onClick={() => handleVulnerabilityClick(vuln.file, vuln.line_number)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 text-left ${
                      isHighlighted 
                        ? "bg-blue-950/10 border-blue-500/40 ring-1 ring-blue-500/20" 
                        : vuln.threat_level === 'Critical' || vuln.threat_level === 'High'
                          ? "bg-red-950/5 border-red-500/10 hover:border-red-500/30"
                          : "bg-yellow-950/5 border-yellow-500/10 hover:border-yellow-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <SeverityBadge level={vuln.threat_level} />
                        <span className="text-xs font-semibold text-gray-300">{vuln.vulnerability_type}</span>
                      </div>
                      <Bookmark className={`w-3.5 h-3.5 ${isHighlighted ? 'text-blue-400' : 'text-gray-600'}`} />
                    </div>

                    <div className="text-xs font-mono text-gray-500 mt-2 flex items-center gap-1.5">
                      <span>{vuln.file}</span>
                      <span>:</span>
                      <span>{vuln.line_number}</span>
                    </div>

                    <p className="text-xs text-gray-300 mt-2.5 leading-relaxed">
                      {vuln.description}
                    </p>

                    <div className="mt-3.5 pt-3 border-t border-gray-900">
                      <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider block mb-1">
                        Remediation Snippet
                      </span>
                      <RemediationCode code={vuln.remediation_code} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/80 mb-3" />
                <h4 className="font-bold text-gray-200">No vulnerabilities detected</h4>
                <p className="text-gray-500 text-xs mt-1">This pull request is safe to be integrated.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
