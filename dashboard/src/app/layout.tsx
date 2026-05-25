import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import {
  ShieldAlert,
  LayoutDashboard,
  Radio,
  Settings,
  History,
  GitPullRequest,
} from "lucide-react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZeroTrust PR — Autonomous AI Security Code Reviewer",
  description: "Find exposed secrets, SQLi, XSS, and OWASP Top 10 vulnerabilities in GitHub Pull Requests.",
};

const recentAudits = [
  { repo: "expressjs/express", pr: 5021, secure: false },
  { repo: "angular/angular", pr: 48123, secure: false },
  { repo: "facebook/react", pr: 28901, secure: true },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-slate-950 text-slate-200 antialiased flex">
        {/* Navigation Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 border-r border-slate-800 bg-slate-950 z-30">
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-800">
            <div className="p-1.5 rounded-md bg-blue-600/10 border border-blue-500/20 text-blue-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-100">
                ZeroTrust PR
              </span>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium bg-slate-900/60 text-slate-100 border border-slate-800"
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              Dashboard
            </Link>
            <Link
              href="/realtime"
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border border-transparent hover:border-slate-800 transition-all"
            >
              <Radio className="w-4 h-4 text-slate-500" />
              Realtime Scans
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 border border-transparent hover:border-slate-800 transition-all"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              Settings
            </Link>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-1.5 px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                <History className="w-3 h-3" />
                Recent Audits
              </div>
              {recentAudits.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-md text-xs hover:bg-slate-900/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GitPullRequest className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    <span className="truncate text-slate-400 group-hover:text-slate-200 transition-colors font-mono">
                      {a.repo}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      a.secure
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {a.secure ? "OK" : "RISK"}
                  </span>
                </div>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
          <main className="flex-1 p-6 lg:p-8 bg-slate-950">{children}</main>
        </div>
      </body>
    </html>
  );
}
