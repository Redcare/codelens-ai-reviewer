"use client";

interface ScoreCardProps {
  label: string;
  score: number;
  maxScore?: number;
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-yellow-400";
  if (score >= 4) return "text-orange-400";
  return "text-red-400";
}

function getScoreBgColor(score: number): string {
  if (score >= 8) return "stroke-green-400";
  if (score >= 6) return "stroke-yellow-400";
  if (score >= 4) return "stroke-orange-400";
  return "stroke-red-400";
}

function getStrokeDashoffset(score: number, maxScore: number): number {
  const circumference = 251.2; // 2 * π * 40
  return circumference - (score / maxScore) * circumference;
}

export function ScoreCard({ label, score, maxScore = 10 }: ScoreCardProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-gray-800"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={`score-ring ${getScoreBgColor(score)}`}
            strokeDasharray={circumference}
            strokeDashoffset={getStrokeDashoffset(score, maxScore)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg sm:text-xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-400 text-center">{label}</span>
    </div>
  );
}

export function OverallScore({ score }: { score: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-gray-800"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            className={`score-ring ${getScoreBgColor(score)}`}
            strokeDasharray={circumference}
            strokeDashoffset={getStrokeDashoffset(score, 10)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl sm:text-4xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-xs text-gray-500">/10</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-300 mt-2">Overall Score</span>
    </div>
  );
}
