"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  Activity,
  GitPullRequest,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Zap,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  Pause,
  Play,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────
interface ScanEvent {
  id: string;
  repo: string;
  prNumber: number;
  prTitle: string;
  status: "scanning" | "secure" | "insecure" | "error";
  threats: number;
  timestamp: Date;
  duration?: number;
}

interface ConnectedRepo {
  name: string;
  webhookActive: boolean;
  lastScan: string;
  totalScans: number;
  threatsFound: number;
}

// ─── Mock Data ─────────────────────────────────────────────────
const initialEvents: ScanEvent[] = [
  {
    id: "evt-001",
    repo: "acme-corp/payments-api",
    prNumber: 342,
    prTitle: "Add Stripe webhook handler",
    status: "insecure",
    threats: 3,
    timestamp: new Date(Date.now() - 45000),
    duration: 8200,
  },
  {
    id: "evt-002",
    repo: "acme-corp/frontend-app",
    prNumber: 891,
    prTitle: "Update auth flow with OAuth2",
    status: "secure",
    threats: 0,
    timestamp: new Date(Date.now() - 180000),
    duration: 5400,
  },
  {
    id: "evt-003",
    repo: "acme-corp/data-pipeline",
    prNumber: 56,
    prTitle: "Add database migration scripts",
    status: "insecure",
    threats: 1,
    timestamp: new Date(Date.now() - 320000),
    duration: 12100,
  },
  {
    id: "evt-004",
    repo: "acme-corp/mobile-sdk",
    prNumber: 204,
    prTitle: "Implement biometric auth",
    status: "secure",
    threats: 0,
    timestamp: new Date(Date.now() - 600000),
    duration: 6800,
  },
  {
    id: "evt-005",
    repo: "acme-corp/internal-tools",
    prNumber: 77,
    prTitle: "Add admin panel endpoints",
    status: "error",
    threats: 0,
    timestamp: new Date(Date.now() - 900000),
  },
];

const connectedRepos: ConnectedRepo[] = [
  { name: "acme-corp/payments-api", webhookActive: true, lastScan: "45s ago", totalScans: 128, threatsFound: 14 },
  { name: "acme-corp/frontend-app", webhookActive: true, lastScan: "3m ago", totalScans: 342, threatsFound: 8 },
  { name: "acme-corp/data-pipeline", webhookActive: true, lastScan: "5m ago", totalScans: 56, threatsFound: 22 },
  { name: "acme-corp/mobile-sdk", webhookActive: false, lastScan: "10m ago", totalScans: 89, threatsFound: 3 },
];

// ─── Helpers ───────────────────────────────────────────────────
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

const statusConfig = {
  scanning: { icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", label: "Scanning" },
  secure: { icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Secure" },
  insecure: { icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Threats Found" },
  error: { icon: XCircle, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Error" },
};

// ─── Component ─────────────────────────────────────────────────
export default function RealtimeScansPage() {
  const [events, setEvents] = useState<ScanEvent[]>(initialEvents);
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState<"all" | "secure" | "insecure" | "error">("all");
  const [pulse, setPulse] = useState(false);

  // Simulate incoming scan events
  useEffect(() => {
    if (!isLive) return;

    const fakeRepos = ["acme-corp/payments-api", "acme-corp/frontend-app", "acme-corp/auth-service", "acme-corp/analytics"];
    const fakeTitles = [
      "Fix session token handling",
      "Add rate limiting middleware",
      "Update dependency versions",
      "Refactor user input validation",
      "Add file upload endpoint",
    ];

    const interval = setInterval(() => {
      const isSecure = Math.random() > 0.4;
      const newEvent: ScanEvent = {
        id: `evt-${Date.now()}`,
        repo: fakeRepos[Math.floor(Math.random() * fakeRepos.length)],
        prNumber: Math.floor(Math.random() * 500) + 1,
        prTitle: fakeTitles[Math.floor(Math.random() * fakeTitles.length)],
        status: isSecure ? "secure" : "insecure",
        threats: isSecure ? 0 : Math.floor(Math.random() * 5) + 1,
        timestamp: new Date(),
        duration: Math.floor(Math.random() * 10000) + 3000,
      };

      setEvents((prev) => [newEvent, ...prev].slice(0, 30));
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 8000);

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredEvents = events.filter((e) => filter === "all" || e.status === filter);

  const stats = {
    total: events.length,
    secure: events.filter((e) => e.status === "secure").length,
    insecure: events.filter((e) => e.status === "insecure").length,
    errors: events.filter((e) => e.status === "error").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            Realtime Scans
            {isLive && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <span className={`w-2 h-2 rounded-full bg-emerald-400 ${pulse ? "animate-ping" : "animate-pulse"}`} />
                LIVE
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor GitHub webhook events and scan results in real time.
          </p>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-all ${
            isLive
              ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
              : "bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20"
          }`}
        >
          {isLive ? <><Pause className="w-4 h-4" /> Pause Feed</> : <><Play className="w-4 h-4" /> Resume Feed</>}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Scans", value: stats.total, icon: Activity, color: "text-blue-400" },
          { label: "Secure", value: stats.secure, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Threats Found", value: stats.insecure, icon: AlertTriangle, color: "text-red-400" },
          { label: "Errors", value: stats.errors, icon: XCircle, color: "text-yellow-400" },
        ].map((stat) => (
          <div key={stat.label} className="border border-slate-800 bg-slate-900/40 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
                {stat.label}
              </span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-100 font-mono">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Connected Repos */}
      <div className="border border-slate-800 bg-slate-900/30 rounded-md">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
            Monitored Repositories
          </span>
        </div>
        <div className="divide-y divide-slate-800/60">
          {connectedRepos.map((repo) => (
            <div key={repo.name} className="px-5 py-3 flex items-center justify-between hover:bg-slate-900/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${repo.webhookActive ? "bg-emerald-400" : "bg-slate-600"}`} />
                <span className="text-sm text-slate-300 font-mono">{repo.name}</span>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <span>{repo.totalScans} scans</span>
                <span className="text-red-400/70">{repo.threatsFound} threats</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {repo.lastScan}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Scan Event Feed
          </h2>
          <div className="flex gap-1">
            {(["all", "secure", "insecure", "error"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-[11px] font-mono transition-all border ${
                  filter === f
                    ? "bg-slate-800 border-slate-700 text-slate-200"
                    : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredEvents.map((event, i) => {
            const cfg = statusConfig[event.status];
            const Icon = cfg.icon;
            return (
              <div
                key={event.id}
                className={`border border-slate-800 bg-slate-900/30 rounded-md p-4 flex items-center justify-between transition-all hover:border-slate-700 ${
                  i === 0 && pulse ? "ring-1 ring-blue-500/20" : ""
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`p-2 rounded-md border ${cfg.bg}`}>
                    <Icon className={`w-4 h-4 ${cfg.color} ${event.status === "scanning" ? "animate-spin" : ""}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-200 truncate">
                        {event.prTitle}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
                      <GitPullRequest className="w-3 h-3" />
                      <span>{event.repo}</span>
                      <span className="text-slate-700">#{event.prNumber}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
                  {event.threats > 0 && (
                    <span className="text-red-400 font-mono font-bold">{event.threats} threats</span>
                  )}
                  {event.duration && (
                    <span className="font-mono">{(event.duration / 1000).toFixed(1)}s</span>
                  )}
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {timeAgo(event.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="border border-dashed border-slate-800 rounded-md p-12 text-center">
              <Filter className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No events match the current filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
