"use client";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const LANGUAGES = [
  { value: "python", label: "Python", icon: "🐍" },
  { value: "javascript", label: "JavaScript", icon: "🟨" },
  { value: "typescript", label: "TypeScript", icon: "🔷" },
  { value: "java", label: "Java", icon: "☕" },
  { value: "go", label: "Go", icon: "🔵" },
  { value: "rust", label: "Rust", icon: "🦀" },
  { value: "cpp", label: "C++", icon: "⚡" },
  { value: "html", label: "HTML/CSS", icon: "🌐" },
  { value: "sql", label: "SQL", icon: "🗃️" },
];

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-dark-900 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-sm text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer hover:border-gray-600"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.icon} {lang.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
