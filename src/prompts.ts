import { runPrompt } from "./ai";
import { z } from "zod";
import { formatFileDiff, File, FileDiff, generateFileCodeDiff } from "./diff";
import { ReviewCommentThread } from "./comments";
import config from "./config";

type PullRequestSummaryPrompt = {
  prTitle: string;
  prDescription: string;
  commitMessages: string[];
  files: File[];
};

export type PullRequestSummary = {
  title: string;
  description: string;
  files: {
    filename: string;
    summary: string;
    title: string;
  }[];
  type: string[];
};

export async function runSummaryPrompt(
  pr: PullRequestSummaryPrompt
): Promise<PullRequestSummary> {
  let systemPrompt = `You are a helpful assistant that summarizes Git Pull Requests (PRs).`;

  systemPrompt += `Your task is to provide a full description for the PR content - title, type, description and affected file summaries.\n`;

  systemPrompt += `
- Keep in mind that the 'Original title', 'Original description' and 'Commit messages' sections may be partial, simplistic, non-informative or out of date. Hence, compare them to the PR diff code, and use them only as a reference.
- The generated title and description should prioritize the most significant changes.
- When quoting variables or names from the code, use backticks (\`).
- Return a summary for each single affected file or if there is nothing to summarize simply use the status of the change (ie. "New file").
- Start the overview with a verb at past tense like "Started", "Commented", "Generated" etc...

IMPORTANT: Do not make assumptions about the code outside the diff. Do not assume variable could be optional if you don't see the type declaration. Do not suggest null checks unless you are sure this could lead to a runtime error.
\n`;

  let userPrompt = `
Summarize the following PR:

<Original PR Title>${pr.prTitle}</Original PR Title>
<Original PR Description>
${pr.prDescription}
</Original PR Description>
<Commit Messages>
${pr.commitMessages.join("\n")}
</Commit Messages>

<Affected Files>
${pr.files.map((file) => `- ${file.status}: ${file.filename}`).join("\n")}
</Affected Files>

<File Diffs>
${pr.files.map((file) => formatFileDiff(file)).join("\n\n")}
</File Diffs>

Make sure each affected file is summarized and it's part of the returned JSON.
`;

  const fileSchema = z.object({
    filename: z.string().describe("The full file path of the relevant file"),
    summary: z
      .string()
      .describe(
        "Concise summary of the file changes in markdown format (max 70 words)"
      ),
    title: z
      .string()
      .describe(
        "An informative title for the changes in this file, describing its main theme (5-10 words)."
      ),
  });

  const schema = z.object({
    title: z
      .string()
      .describe(
        "Informative title of the PR, describing its main theme (10 words max)"
      ),
    description: z
      .string()
      .describe("Informative description of the PR, describing its main theme"),
    files: z
      .array(fileSchema)
      .describe(
        "List of files affected in the PR and summaries of their changes"
      ),
    type: z
      .array(z.string())
      .describe("One or more types that describe this PR's main theme. Example: BUG, TESTS, ENHANCEMENT, DOCUMENTATION, SECURITY, OTHER"),
  });

  return (await runPrompt({
    prompt: userPrompt,
    systemPrompt,
    schema,
  })) as PullRequestSummary;
}

export type AIComment = {
  file: string;
  start_line: number;
  end_line: number;
  highlighted_code: string;
  header: string;
  content: string;
  label: string;
  critical: boolean;
};

export const securityReviewSchema = z.object({
  is_secure: z.boolean().describe("False if any Medium, High, or Critical threats are found."),
  threat_summary: z.string().describe("A one-sentence summary of the security posture of this PR."),
  vulnerabilities: z.array(
    z.object({
      file: z.string(),
      line_number: z.number(),
      threat_level: z.enum(['Low', 'Medium', 'High', 'Critical']),
      vulnerability_type: z.string().describe("e.g., 'SQL Injection', 'Exposed Secret', 'XSS'"),
      description: z.string().describe("How an attacker could exploit this."),
      remediation_code: z.string().describe("The exact code snippet to fix the vulnerability.")
    })
  ).describe("List of identified security threats. Return an empty array if none found.")
});

export type PullRequestReview = z.infer<typeof securityReviewSchema>;

type PullRequestReviewPrompt = {
  prTitle: string;
  prDescription: string;
  prSummary: string;
  files: FileDiff[];
};

export async function runReviewPrompt(
  pr: PullRequestReviewPrompt
): Promise<PullRequestReview> {


  let systemPrompt = `You are an elite Application Security Engineer and Zero Trust Architect. 
Your sole objective is to audit this Pull Request code diff for security vulnerabilities. 
You must actively hunt for:
- Hardcoded API keys, secrets, or credentials
- SQL Injection (SQLi) or Cross-Site Scripting (XSS) risks
- Missing authentication or broken access control
- Insecure direct object references (IDOR)
- OWASP Top 10 vulnerabilities

Ignore code style, performance, or minor typos. If the code is secure, explicitly state that no threats were found. If you find a vulnerability, explain the attack vector and provide the secure remediation code.`;


  let userPrompt = `
<PR title>
${pr.prTitle}
</PR title>

<PR Description>
${pr.prDescription}
</PR Description>

<PR Summary>
${pr.prSummary}
</PR Summary>

<PR File Diffs>
${pr.files.map((file) => generateFileCodeDiff(file)).join("\n\n")}
</PR File Diffs>
`;

  return (await runPrompt({
    prompt: userPrompt,
    systemPrompt,
    schema: securityReviewSchema,
  })) as PullRequestReview;
}

type ReviewCommentPrompt = {
  commentThread: ReviewCommentThread;
  commentFileDiff: FileDiff;
};

export type ReviewCommentResponse = {
  response_comment: string;
  action_requested: boolean;
};

export async function runReviewCommentPrompt({
  commentThread,
  commentFileDiff,
}: ReviewCommentPrompt): Promise<ReviewCommentResponse> {
  let systemPrompt = `You are a helpful senior software engineer that reviews comments on Git Pull Requests (PRs). Your task is to provide a response to a comment on a PR review. The comment might be part of a longer comment thread, so make sure to respond to the specific comment and not the whole thread.

The comment thread is specific to a line or multiple lines of code in a specific file. Keep that in mind when writing your response, but do not assume the code is complete or correct. Also, the comment might request you to suggest some changes or improvements outside the code snippet, so judge accordingly.

In your response, return the exact text of your comment, in markdown, starting by mentioning the @user who made the comment. Your response will be used as a comment on the PR, so make sure it's easy to understand and actionable.

Comments from @presubmit are yours.

IMPORTANT: Do not respond with generic comments like "Thanks for the PR!" or "LGTM" or "Let me know if you need any help". If the input comment is not actionable, return an empty string. Do not offer to help unless asked.
`;

  const startLine =
    commentThread.comments[0].start_line || commentThread.comments[0].line;
  const endLine = commentThread.comments[0].line;


  let userPrompt = `
Below you'll see the full comment thread, but you should focus specifically on the last comment.
<Comment Thread>
${commentThread.comments
      .map(
        (comment) =>
          `<author>@${comment.user.login}</author>\n<comment>${comment.body}</comment>`
      )
      .join("\n")}
</Comment Thread>

<Comment Scope>
  <Lines>${startLine} - ${endLine}</Lines>
  <Hunk>
    ${commentThread.comments[0].diff_hunk}
  </Hunk>
</Comment Scope>

<Comment File Diff>
${generateFileCodeDiff(commentFileDiff)}
</Comment File Diff>
`;

  const schema = z.object({
    response_comment: z
      .string()
      .describe(
        "Your response to the comment in markdown format, starting by mentioning the user"
      ),
    action_requested: z
      .boolean()
      .describe(
        "True if the input comment required an action from you. False otherwise."
      ),
  });

  return (await runPrompt({
    prompt: userPrompt,
    systemPrompt,
    schema,
  })) as ReviewCommentResponse;
}
