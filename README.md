# ZeroTrust PR

<div align="center">
  <img src="public/hero.png" alt="ZeroTrust PR Dashboard Overview" width="100%" />
</div>

**Autonomous Security Auditing Dashboard for GitHub Pull Requests**

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)](https://nextjs.org/) &nbsp;
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-Enabled-black?logo=vercel)](https://sdk.vercel.ai/) &nbsp;
[![Gemini 1.5 Pro](https://img.shields.io/badge/Google-Gemini_1.5_Pro-blue?logo=google)](https://aistudio.google.com/)

## Overview

ZeroTrust PR is an enterprise-grade security auditing tool designed to shift application security left within the CI/CD pipeline. By orchestrating the GitHub REST API and Google's Gemini 1.5 Pro reasoning engine, the system ingests raw Pull Request diffs and enforces strict security policies to identify critical vulnerabilities prior to production merge.

Designed to eliminate the noise typical of standard AI code reviewers, ZeroTrust PR utilizes structured data validation to guarantee deterministic, highly focused security audits. Results are visualized via a scalable Next.js dashboard.

## Core Capabilities

* **Targeted Threat Hunting:** Engineered specifically to detect hardcoded secrets, SQL Injection (SQLi), Cross-Site Scripting (XSS), Broken Access Control, and OWASP Top 10 vulnerabilities.
* **Deterministic AI Outputs:** Leverages the Vercel AI SDK's `generateObject` alongside strict Zod schemas to mitigate LLM hallucination and ensure consistent, structured JSON responses.
* **Actionable Remediation:** Generates precise, secure code snippets to immediately patch identified attack vectors, reducing Mean Time to Remediation (MTTR).
* **Zero-Noise Policy:** Instructed via low-temperature prompting (T=0.1) and strict system instructions to ignore stylistic formatting, typos, and standard refactoring, focusing exclusively on security posture.

## System Architecture

* **Frontend Interface:** Next.js 14 (App Router), React, Tailwind CSS.
* **Backend Services:** Next.js Serverless API Routes (`/api/audit`).
* **AI Orchestration Layer:** Vercel AI SDK (`@ai-sdk/google`, `ai`).
* **Inference Engine:** Google Gemini 1.5 Pro (`gemini-1.5-pro`).
* **Schema Validation:** Zod.
* **External Integrations:** GitHub REST API (`application/vnd.github.v3.diff`).

## Local Development Setup

### 1. Prerequisites
* Node.js 18 or higher.
* A GitHub Personal Access Token (Classic) with `repo` scope to read Pull Request diffs.
* A Google Gemini API Key.

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone [https://github.com/YourUsername/zerotrust-pr.git](https://github.com/YourUsername/zerotrust-pr.git)
cd zerotrust-pr
npm install
3. Environment Configuration
Create a .env.local file in the root directory and securely add your API credentials:

Code snippet
GITHUB_TOKEN="your_github_personal_access_token"
GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_api_key"
4. Initialization
Start the local development server:

Bash
npm run dev
Navigate to http://localhost:3000. Input a valid GitHub Pull Request URL into the Analysis Console to execute a security audit.

Engineering Roadmap (v2.0)
The current MVP establishes the core AI security validation engine. Planned architectural expansions include:

Persistent Storage: PostgreSQL database integration for historical audit logging, threat analytics, and MTTR tracking across repositories.

Line-by-Line Diff Visualization: Implementation of react-diff-viewer to render the raw GitHub diff in a split-pane view, mapping AI vulnerability alerts directly to specific Abstract Syntax Tree (AST) nodes or lines of code.

Automated Pipeline Integration: Transition from manual dashboard execution to an automated CI/CD pipeline listener via GitHub Webhooks.

Multi-Model Redundancy: Fallback routing logic to support secondary inference engines (e.g., Claude 3.5 Sonnet) during primary API rate limits or outages.

License
This project is licensed under the MIT License - see the LICENSE file for details.