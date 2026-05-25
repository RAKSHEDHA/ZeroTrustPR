import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import fs from "fs";
import path from "path";

export const maxDuration = 60;

// Load parent .env configuration if not present in process.env
if (!process.env.GEMINI_API_KEY && !process.env.LLM_API_KEY) {
  try {
    const possiblePaths = [
      path.resolve(process.cwd(), ".env"),
      path.resolve(process.cwd(), "../.env"),
      path.resolve(process.cwd(), "dashboard/.env"),
      path.resolve(__dirname, "../../../../.env"),
    ];
    let foundPath = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }
    if (foundPath) {
      const envContent = fs.readFileSync(foundPath, "utf-8");
      envContent.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
          }
          process.env[key] = value;
        }
      });
    }
  } catch (err) {
    console.error("Failed to load parent .env configuration:", err);
  }
}

// Map root config environment keys
const rawGeminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.LLM_API_KEY;
if (rawGeminiKey) {
  process.env.GEMINI_API_KEY = rawGeminiKey.replace(/['"]/g, "");
}
if (process.env.GITHUB_TOKEN) {
  process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN.replace(/['"]/g, "");
}

const securityReviewSchema = z.object({
  is_secure: z.boolean(),
  threat_summary: z.string(),
  vulnerabilities: z.array(
    z.object({
      file: z.string(),
      line_number: z.number(),
      threat_level: z.enum(["Low", "Medium", "High", "Critical"]),
      vulnerability_type: z.string(),
      description: z.string(),
      remediation_code: z.string(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const { prUrl } = await request.json();

    if (!prUrl || typeof prUrl !== "string") {
      return NextResponse.json(
        { error: "Invalid GitHub PR URL format." },
        { status: 400 }
      );
    }

    const urlParts = prUrl.split("/");
    const owner = urlParts[3];
    const repo = urlParts[4];
    const prNumber = urlParts[6];

    if (!owner || !repo || !prNumber) {
      return NextResponse.json(
        { error: "Invalid GitHub PR URL format." },
        { status: 400 }
      );
    }

    const githubResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
      {
        headers: {
          Accept: "application/vnd.github.v3.diff",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    if (!githubResponse.ok) {
      throw new Error(
        `Failed to fetch diff from GitHub. Status: ${githubResponse.status}`
      );
    }

    const prDiff = await githubResponse.text();

    // ─── Helper: strip lockfiles and configs to fit token quota ───
    const cleanDiff = (rawDiff: string): string => {
      const files = rawDiff.split("diff --git ");
      const cleanFiles = files.filter((file) => {
        if (!file.trim()) return false;
        const headerLine = file.split("\n")[0] || "";
        const ignorePatterns = [
          "package-lock.json",
          "pnpm-lock.yaml",
          "yarn.lock",
          "tsconfig.json",
          "package.json",
          ".gitignore",
          "next.config.js",
          "next.config.ts",
          "tailwind.config.ts",
          "postcss.config.mjs",
          ".next/",
          "dist/",
          "build/",
        ];
        return !ignorePatterns.some((pattern) => headerLine.includes(pattern));
      });

      const joined = cleanFiles.map((f) => "diff --git " + f).join("\n");
      const MAX_LIMIT = 30_000; // Safe token limit for free tier
      if (joined.length > MAX_LIMIT) {
        return joined.slice(0, MAX_LIMIT) + "\n\n[... Diff truncated due to excessive size ...]";
      }
      return joined;
    };

    const targetDiff = cleanDiff(prDiff);

    const { object } = await generateObject({
      model: google(process.env.LLM_MODEL || "gemini-2.5-pro"),
      schema: securityReviewSchema,
      temperature: 0.1,
      prompt: `You are an elite Application Security Engineer. Audit this Pull Request diff for vulnerabilities. Focus heavily on identifying hardcoded API keys, secrets, SQL injection, XSS, and broken access control. If none exist, mark as secure. \n\nHere is the diff:\n\n${targetDiff}`,
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Audit Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run security audit." },
      { status: 500 }
    );
  }
}
