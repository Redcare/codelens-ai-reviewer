// LLM Provider Abstraction Layer
// Supports: MiMo, OpenRouter, Demo (no API key needed)

export interface ReviewResult {
  overall_score: number;
  language_detected: string;
  summary: string;
  issues: {
    severity: "critical" | "warning" | "info";
    line: number;
    title: string;
    description: string;
    fix: string;
  }[];
  suggestions: string[];
  quality: {
    readability: number;
    maintainability: number;
    security: number;
    performance: number;
    best_practices: number;
  };
  improved_code: string;
}

const SYSTEM_PROMPT = `You are a senior code reviewer with 15+ years of experience. When given code, analyze it thoroughly and respond ONLY with a valid JSON object (no markdown, no code fences) matching this exact schema:

{
  "overall_score": <1-10 integer>,
  "language_detected": "<detected language>",
  "summary": "<brief overall assessment in 1-2 sentences>",
  "issues": [
    {
      "severity": "<critical|warning|info>",
      "line": <approximate line number>,
      "title": "<short issue title>",
      "description": "<detailed description of the problem>",
      "fix": "<specific code or explanation to fix it>"
    }
  ],
  "suggestions": ["<actionable improvement suggestion>", ...],
  "quality": {
    "readability": <1-10>,
    "maintainability": <1-10>,
    "security": <1-10>,
    "performance": <1-10>,
    "best_practices": <1-10>
  },
  "improved_code": "<complete improved version of the code>"
}

Guidelines:
- Find real bugs, security vulnerabilities, performance issues
- Rate severity: critical (breaks things), warning (should fix), info (nice to have)
- Be specific with line numbers
- Provide concrete fixes, not vague advice
- The improved_code should be a complete, working version
- Score 1-3: poor, 4-5: below average, 6-7: good, 8-9: great, 10: exemplary
- Always respond with valid JSON only, no extra text`;

function getProviderConfig() {
  const provider = process.env.LLM_PROVIDER || "demo";
  const apiKey = process.env.LLM_API_KEY || "";
  const baseUrl = process.env.LLM_BASE_URL || "https://api.xiaomimimo.com/v1";
  const model = process.env.LLM_MODEL || "mimo-v2.5";

  if (!apiKey || provider === "demo") {
    return { provider: "demo", apiKey: "", baseUrl: "", model: "" };
  }

  const resolvedBase =
    provider === "openrouter"
      ? "https://openrouter.ai/api/v1"
      : baseUrl;

  return { provider, apiKey, baseUrl: resolvedBase, model };
}

function getMockResult(code: string, language: string): ReviewResult {
  const lines = code.split("\n");
  const lineCount = lines.length;
  const detected = language || "unknown";

  const hasLoops = /for|while|loop/i.test(code);
  const hasAuth = /password|token|secret|api.?key/i.test(code);
  const hasSQL = /SELECT|INSERT|UPDATE|DELETE|query/i.test(code);
  const hasLooseEq = /[^=!]==[^=]/.test(code);
  const hasVar = /\bvar\s/.test(code);
  const hasAny = /\bany\b/.test(code);
  const hasTodo = /TODO|FIXME|HACK/i.test(code);
  const noTypes = language === "javascript" && !/:/.test(code);
  const hasEval = /eval\(/.test(code);
  const hasConsole = /console\.(log|warn|error)/.test(code);
  const hasCatchEmpty = /catch\s*\(\w*\)\s*\{\s*\}/.test(code);
  const noErrorHandling = !/try|catch|throw|except/i.test(code) && lineCount > 5;

  const issues: ReviewResult["issues"] = [];
  let score = 7;

  if (hasAuth) {
    issues.push({
      severity: "critical",
      line: code.split("\n").findIndex(l => /password|token|secret|api.?key/i.test(l)) + 1 || 1,
      title: "Hardcoded credentials detected",
      description: "Sensitive values like API keys, passwords, or tokens should never be hardcoded. They can be leaked via version control or logs.",
      fix: "Use environment variables: process.env.API_KEY or a secrets manager like AWS Secrets Manager, HashiCorp Vault, etc.",
    });
    score -= 2;
  }

  if (hasEval) {
    issues.push({
      severity: "critical",
      line: code.split("\n").findIndex(l => /eval\(/.test(l)) + 1 || 1,
      title: "Code injection vulnerability (eval)",
      description: "eval() executes arbitrary code and is a major security risk. An attacker could inject malicious code.",
      fix: "Replace eval() with safer alternatives: JSON.parse() for data, Function constructor with sanitized input, or a dedicated parser library.",
    });
    score -= 2;
  }

  if (hasCatchEmpty) {
    issues.push({
      severity: "warning",
      line: code.split("\n").findIndex(l => /catch\s*\(/.test(l)) + 1 || 1,
      title: "Empty catch block silently swallows errors",
      description: "Empty catch blocks hide errors, making debugging extremely difficult and potentially masking security issues.",
      fix: "At minimum log the error: catch (err) { console.error(err); }. Better: handle or re-throw with context.",
    });
    score -= 1;
  }

  if (hasVar) {
    issues.push({
      severity: "warning",
      line: code.split("\n").findIndex(l => /\bvar\s/.test(l)) + 1 || 1,
      title: "Use of 'var' instead of 'let'/'const'",
      description: "'var' has function-level scoping which leads to unexpected behavior. Modern JS uses block-scoped 'let' and 'const'.",
      fix: "Replace 'var' with 'const' for values that don't change, or 'let' for mutable variables.",
    });
    score -= 0.5;
  }

  if (hasAny && detected === "typescript") {
    issues.push({
      severity: "warning",
      line: code.split("\n").findIndex(l => /\bany\b/.test(l)) + 1 || 1,
      title: "Usage of 'any' type defeats TypeScript safety",
      description: "Using 'any' bypasses the type system entirely. This hides potential runtime errors that TypeScript is designed to catch.",
      fix: "Use specific types: 'unknown' if truly unknown, or create proper interfaces/types for the data shape.",
    });
    score -= 0.5;
  }

  if (hasConsole) {
    issues.push({
      severity: "info",
      line: code.split("\n").findIndex(l => /console\./.test(l)) + 1 || 1,
      title: "Console logging left in code",
      description: "Console.log statements should be removed before production. Consider a proper logging framework.",
      fix: "Use a logging library like Winston or Pino with log levels, or remove console statements.",
    });
  }

  if (noErrorHandling && lineCount > 10) {
    issues.push({
      severity: "warning",
      line: 1,
      title: "No error handling detected",
      description: "Functions without error handling can crash unexpectedly. Unhandled errors lead to poor user experience.",
      fix: "Add try-catch blocks around risky operations (I/O, parsing, API calls). Implement proper error boundaries.",
    });
    score -= 1;
  }

  if (hasSQL) {
    issues.push({
      severity: "warning",
      line: code.split("\n").findIndex(l => /SELECT|INSERT|query/i.test(l)) + 1 || 1,
      title: "Potential SQL injection risk",
      description: "String concatenation in SQL queries can lead to SQL injection attacks.",
      fix: "Use parameterized queries or an ORM (Prisma, SQLAlchemy, etc.) instead of string interpolation.",
    });
    score -= 1;
  }

  // Always add at least one info suggestion
  if (issues.length === 0) {
    issues.push({
      severity: "info",
      line: 1,
      title: "Consider adding documentation",
      description: "Adding JSDoc/docstrings comments improves code understanding and maintainability for team collaboration.",
      fix: "Add function documentation with parameters, return values, and usage examples.",
    });
  }

  score = Math.max(3, Math.min(10, Math.round(score)));

  const suggestions: string[] = [];
  if (lineCount > 50) suggestions.push("Consider breaking this into smaller, single-responsibility functions");
  if (!/test|spec|describe|it\(|expect/i.test(code)) suggestions.push("Add unit tests to ensure code correctness and prevent regressions");
  suggestions.push("Add comprehensive error handling with meaningful error messages");
  suggestions.push("Consider adding TypeScript types if using JavaScript for better developer experience");
  if (hasLoops) suggestions.push("Profile loop performance for large datasets — consider using built-in array methods or optimized algorithms");

  return {
    overall_score: score,
    language_detected: detected,
    summary: `Code review complete. Found ${issues.length} issue${issues.length !== 1 ? "s" : ""} — ${issues.filter(i => i.severity === "critical").length} critical, ${issues.filter(i => i.severity === "warning").length} warnings, ${issues.filter(i => i.severity === "info").length} info. Overall code structure ${score >= 7 ? "is solid with room for improvement" : "needs significant improvements"}.`,
    issues,
    suggestions,
    quality: {
      readability: Math.min(10, score + (lineCount < 100 ? 1 : 0)),
      maintainability: Math.max(4, score - 1),
      security: Math.max(3, score - (hasAuth || hasEval ? 3 : 0)),
      performance: Math.min(10, score + 1),
      best_practices: score,
    },
    improved_code: `// Improved version with fixes applied\n${code}`,
  };
}

export async function reviewCode(
  code: string,
  language: string
): Promise<ReviewResult> {
  const { provider, apiKey, baseUrl, model } = getProviderConfig();

  if (provider === "demo") {
    // Simulate network delay for realistic UX
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
    return getMockResult(code, language);
  }

  const url = `${baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  // OpenRouter requires additional headers
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    headers["X-Title"] = "CodeLens AI Reviewer";
  }

  const userMessage = language
    ? `Review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
    : `Review this code and detect its language:\n\n\`\`\`\n${code}\n\`\`\``;

  const body = {
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`LLM API error (${response.status}):`, errorText);
    throw new Error(
      `API request failed with status ${response.status}: ${errorText.slice(0, 200)}`
    );
  }

  const data = await response.json();
  const content: string =
    data.choices?.[0]?.message?.content || "";

  if (!content) {
    throw new Error("Empty response from LLM provider");
  }

  // Parse JSON — handle possible markdown code fences in response
  let parsed: ReviewResult;
  try {
    const cleaned = content
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse LLM response as JSON:", content.slice(0, 500));
    throw new Error(
      "LLM returned invalid JSON. Please try again."
    );
  }

  // Validate shape
  if (
    typeof parsed.overall_score !== "number" ||
    !Array.isArray(parsed.issues) ||
    !parsed.quality
  ) {
    throw new Error("LLM response missing required fields");
  }

  return parsed;
}
