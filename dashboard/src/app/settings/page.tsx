"use client";

import React, { useState } from "react";
import {
  Settings,
  Shield,
  Key,
  Webhook,
  Bell,
  Check,
  Save,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  // LLM Config State
  const [model, setModel] = useState("gpt-4o");
  const [temperature, setTemperature] = useState(0.1);
  const [apiKey, setApiKey] = useState("••••••••••••••••••••••••••••••••");
  
  // GitHub Integration State
  const [githubToken, setGithubToken] = useState("••••••••••••••••••••••••••••••••");
  const [webhookUrl, setWebhookUrl] = useState("https://zerotrust-pr.acme.com/api/webhook");
  const [webhookSecret, setWebhookSecret] = useState("••••••••••••••••••••••••");

  // Notification Config State
  const [slackEnabled, setSlackEnabled] = useState(true);
  const [slackWebhook, setSlackWebhook] = useState("https://hooks.slack.com/services/T00/B00/X00");
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notifyOnClean, setNotifyOnClean] = useState(false);

  // General state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-500" />
          System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure ZeroTrust PR AI models, credentials, webhooks, and alerts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Security Audit Engine */}
        <div className="border border-slate-800 bg-slate-900/30 rounded-md p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              AI Security Engine Config
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">LLM Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
              >
                <option value="gpt-4o">gpt-4o (Recommended - Precise)</option>
                <option value="gpt-4-turbo">gpt-4-turbo</option>
                <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">
                Auditor Temperature ({temperature})
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                  {temperature === 0.1 ? "0.1 (Strict)" : temperature}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> LLM API Key
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Using local environment variable if empty
              </span>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-blue-500/50 font-mono"
            />
          </div>
        </div>

        {/* Section 2: GitHub & Webhook Integration */}
        <div className="border border-slate-800 bg-slate-900/30 rounded-md p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <svg
              className="w-5 h-5 text-slate-300 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              GitHub Integrations & Webhooks
            </h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              GitHub Personal Access Token (PAT)
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="github_pat_..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-blue-500/50 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Webhook className="w-3.5 h-3.5" /> Webhook Payload URL
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Webhook Secret</label>
              <input
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Notification Alerts */}
        <div className="border border-slate-800 bg-slate-900/30 rounded-md p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Bell className="w-5 h-5 text-yellow-400" />
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Alerts & Notifications
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <label className="text-sm font-semibold text-slate-200 block">Slack Integration</label>
                <span className="text-xs text-slate-500">Post security reviews to channels on completion</span>
              </div>
              <input
                type="checkbox"
                checked={slackEnabled}
                onChange={(e) => setSlackEnabled(e.target.checked)}
                className="w-4 h-4 mt-1 accent-blue-500"
              />
            </div>

            {slackEnabled && (
              <div className="space-y-2 pl-6 border-l border-slate-800 animate-in fade-in duration-300">
                <label className="text-xs font-medium text-slate-400">Slack Webhook URL</label>
                <input
                  type="text"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 font-mono"
                />
              </div>
            )}

            <div className="flex items-start justify-between">
              <div>
                <label className="text-sm font-semibold text-slate-200 block">Email Alerts</label>
                <span className="text-xs text-slate-500">Send summary reports directly to repository owner</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 mt-1 accent-blue-500"
              />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <label className="text-sm font-semibold text-slate-200 block">Notify on Clean PRs</label>
                <span className="text-xs text-slate-500">Post notifications even when no vulnerabilities are found</span>
              </div>
              <input
                type="checkbox"
                checked={notifyOnClean}
                onChange={(e) => setNotifyOnClean(e.target.checked)}
                className="w-4 h-4 mt-1 accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
            <AlertTriangle className="w-4 h-4 text-slate-600" />
            Secrets will be encrypted at rest in Vault.
          </div>
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              saved
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-blue-600 hover:bg-blue-500 text-white active:translate-y-px"
            } disabled:opacity-50`}
          >
            {saving ? (
              <>Saving Configuration...</>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
