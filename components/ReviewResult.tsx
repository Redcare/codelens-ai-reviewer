"use client";

import { useState } from "react";
import { OverallScore, ScoreCard } from "./ScoreCard";
import type { ReviewResult as ReviewResultType } from "@/lib/llm";

interface ReviewResultProps {
  result: ReviewResultType;
}

function SeverityBadge({ severity }: { severity: string }) {
  const classes = `badge-${severity} px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide`;
  return <span className={classes}>{severity}</span>;
}

export function ReviewResult({ result }: ReviewResultProps) {
  const [showImproved, setShowImproved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.improved_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const criticalCount = result.issues.filter((i) => i.severity === "critical").length;
  const warningCount = result.issues.filter((i) => i.severity === "warning").length;
  const infoCount = result.issues.filter((i) => i.severity === "info").length;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Summary card */}
      <div className="bg-dark-900 rounded-xl border border-gray-800 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <OverallScore score={result.overall_score} />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
              <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
                {result.language_detected}
              </span>
              <div className="flex gap-2">
                {criticalCount > 0 && (
                  <span className="text-xs text-red-400">{criticalCount} critical</span>
                )}
                {warningCount > 0 && (
                  <span className="text-xs text-yellow-400">{warningCount} warnings</span>
                )}
                {infoCount > 0 && (
                  <span className="text-xs text-blue-400">{infoCount} info</span>
                )}
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
          </div>
        </div>
      </div>

      {/* Quality breakdown */}
      <div className="bg-dark-900 rounded-xl border border-gray-800 p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Quality Breakdown</h3>
        <div className="grid grid-cols-5 gap-2">
          <ScoreCard label="Readability" score={result.quality.readability} />
          <ScoreCard label="Maintainability" score={result.quality.maintainability} />
          <ScoreCard label="Security" score={result.quality.security} />
          <ScoreCard label="Performance" score={result.quality.performance} />
          <ScoreCard label="Best Practices" score={result.quality.best_practices} />
        </div>
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <div className="bg-dark-900 rounded-xl border border-gray-800 p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">
            Issues Found ({result.issues.length})
          </h3>
          <div className="space-y-3">
            {result.issues.map((issue, index) => (
              <div
                key={index}
                className="border border-gray-800 rounded-lg p-3 sm:p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge severity={issue.severity} />
                    <span className="text-sm font-medium text-gray-200">
                      {issue.title}
                    </span>
                    {issue.line > 0 && (
                      <span className="text-xs text-gray-500 font-mono">
                        Line {issue.line}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-2">{issue.description}</p>
                {issue.fix && (
                  <div className="bg-dark-950/50 rounded-md p-2.5 border border-gray-800/50">
                    <p className="text-xs text-green-400/80 font-medium mb-1">💡 Fix:</p>
                    <p className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{issue.fix}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="bg-dark-900 rounded-xl border border-gray-800 p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Suggestions</h3>
          <ul className="space-y-2">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-blue-400 mt-0.5">▸</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improved code */}
      {result.improved_code && (
        <div className="bg-dark-900 rounded-xl border border-gray-800 overflow-hidden">
          <button
            onClick={() => setShowImproved(!showImproved)}
            className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-800/30 transition-colors"
          >
            <h3 className="text-sm font-semibold text-gray-300">Improved Code</h3>
            <div className="flex items-center gap-2">
              {showImproved && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className="text-xs text-gray-400 hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-gray-800"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              )}
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${showImproved ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          {showImproved && (
            <div className="border-t border-gray-800 p-4 sm:p-6 animate-fade-in">
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto bg-dark-950/50 rounded-lg p-4 border border-gray-800/50">
                <code>{result.improved_code}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
