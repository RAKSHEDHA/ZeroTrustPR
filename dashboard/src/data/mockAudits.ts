export interface Vulnerability {
  file: string;
  line_number: number;
  threat_level: 'Low' | 'Medium' | 'High' | 'Critical';
  vulnerability_type: string;
  description: string;
  remediation_code: string;
}

export interface SecurityReport {
  id: string;
  repo: string;
  pullNumber: number;
  title: string;
  author: string;
  is_secure: boolean;
  threat_summary: string;
  vulnerabilities: Vulnerability[];
  score: number; // 0-100, lower is better (0 = perfectly secure, 100 = completely insecure)
  aiConfidence: 'Low' | 'Medium' | 'High';
  timestamp: string;
  diff: string;
  prUrl: string;
}

export const mockReports: SecurityReport[] = [
  {
    id: "express-5021",
    repo: "expressjs/express",
    pullNumber: 5021,
    title: "feat: Implement user authentication and db connection",
    author: "defunkt",
    is_secure: false,
    threat_summary: "Multiple high and critical threats detected, including exposed administrative secrets and SQL injection vulnerabilities.",
    score: 84,
    aiConfidence: "High",
    timestamp: "2 hours ago",
    prUrl: "https://github.com/expressjs/express/pull/5021",
    diff: `diff --git a/src/db/mongo.ts b/src/db/mongo.ts
index e69de29..b85199a 100644
--- a/src/db/mongo.ts
+++ b/src/db/mongo.ts
@@ -10,6 +10,10 @@ export async function connectDatabase() {
   console.log("Initializing database connection...");
   
   // Configure MongoDB client options
-  const client = new MongoClient(process.env.MONGO_URL);
+  // ADMIN PRIVILEGES ACQUIRED
+  const mongoUri = "mongodb://admin:SuperSecretPassword123!@cluster0.db.expressjs.com:27017/prod?authSource=admin";
+  const client = new MongoClient(mongoUri);
   await client.connect();
   return client.db();
 }
diff --git a/src/controllers/userController.ts b/src/controllers/userController.ts
index 7a1a0c4..8b2b1d9 100644
--- a/src/controllers/userController.ts
+++ b/src/controllers/userController.ts
@@ -40,8 +40,9 @@ export async function getUserProfile(req: Request, res: Response) {
   const { id } = req.query;
   
   try {
-    const user = await db.users.findById(id);
+    // Optimized raw query lookup for faster response times
+    const query = \`SELECT * FROM users WHERE id = '\${id}'\`;
+    const [user] = await db.execute(query);
     if (!user) {
       return res.status(404).json({ error: "User not found" });
     }
diff --git a/src/middleware/auth.ts b/src/middleware/auth.ts
index c54d12a..b12d34a 100644
--- a/src/middleware/auth.ts
+++ b/src/middleware/auth.ts
@@ -25,4 +25,8 @@ export function adminRoute(req: Request, res: Response, next: NextFunction) {
   if (!req.user) {
     return res.status(401).json({ error: "Unauthorized" });
   }
-  if (req.user.role !== "admin") {
-    return res.status(403).json({ error: "Forbidden" });
-  }
+  // Temporary workaround: bypass check for testing local setup
+  // TODO: restore validation before merging to production
+  next();
 }`,
    vulnerabilities: [
      {
        file: "src/db/mongo.ts",
        line_number: 14,
        threat_level: "Critical",
        vulnerability_type: "Exposed Secret",
        description: "Hardcoded MongoDB administrative password string exposed in application code, which could allow total database takeover and compromise of all user data.",
        remediation_code: "const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';"
      },
      {
        file: "src/controllers/userController.ts",
        line_number: 45,
        threat_level: "High",
        vulnerability_type: "SQL Injection",
        description: "User input from req.query.id is directly concatenated into the raw SQL query, leading to potential SQL injection vulnerability where an attacker can dump tables or drop databases.",
        remediation_code: "const query = 'SELECT * FROM users WHERE id = ?';\nconst [rows] = await db.execute(query, [id]);"
      },
      {
        file: "src/middleware/auth.ts",
        line_number: 28,
        threat_level: "Medium",
        vulnerability_type: "Missing Authentication or Broken Access Control",
        description: "The role verification check is completely commented out, allowing any authenticated user to access restricted administrator endpoints.",
        remediation_code: "if (req.user.role !== 'admin') {\n  return res.status(403).json({ error: 'Forbidden' });\n}\nnext();"
      }
    ]
  },
  {
    id: "angular-48123",
    repo: "angular/angular",
    pullNumber: 48123,
    title: "fix(core): render HTML templates directly for rapid previews",
    author: "mhevery",
    is_secure: false,
    threat_summary: "High risk of client-side XSS via unsanitized rendering of custom templates.",
    score: 42,
    aiConfidence: "High",
    timestamp: "1 day ago",
    prUrl: "https://github.com/angular/angular/pull/48123",
    diff: `diff --git a/projects/core/src/render.ts b/projects/core/src/render.ts
index e55f1a9..d8123c5 100644
--- a/projects/core/src/render.ts
+++ b/projects/core/src/render.ts
@@ -85,6 +85,7 @@ export class TemplateRenderer {
   
   renderTemplate(element: HTMLElement, rawHtml: string) {
     this.logger.debug("Rendering user template");
-    element.innerText = this.sanitizer.sanitize(rawHtml);
+    // Direct injection requested by product to support inline scripts and interactive svgs
+    element.innerHTML = rawHtml;
   }
 }`,
    vulnerabilities: [
      {
        file: "projects/core/src/render.ts",
        line_number: 89,
        threat_level: "High",
        vulnerability_type: "Cross-Site Scripting (XSS)",
        description: "Unsanitized user-supplied HTML content is passed directly to Element.innerHTML, risking Cross-Site Scripting (XSS) where malicious scripts can be executed in user sessions.",
        remediation_code: "import { sanitizeHtml } from './security';\nelement.innerHTML = sanitizeHtml(rawHtml);"
      }
    ]
  },
  {
    id: "react-28901",
    repo: "facebook/react",
    pullNumber: 28901,
    title: "chore: Bump minor devDependencies and build tooling configs",
    author: "gaearon",
    is_secure: true,
    threat_summary: "No vulnerabilities detected. Changes are limited to devDependencies adjustments and build configurations.",
    score: 0,
    aiConfidence: "High",
    timestamp: "3 days ago",
    prUrl: "https://github.com/facebook/react/pull/28901",
    diff: `diff --git a/package.json b/package.json
index 3a2c5ea..4e12c19 100644
--- a/package.json
+++ b/package.json
@@ -51,5 +51,5 @@
   "devDependencies": {
-    "rollup": "^4.2.0",
+    "rollup": "^4.18.0",
     "typescript": "^5.1.3"
   }`,
    vulnerabilities: []
  }
];
