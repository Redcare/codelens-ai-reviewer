"use client";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const lineCount = value.split("\n").length;

  return (
    <div className="bg-dark-900 rounded-xl border border-gray-800 overflow-hidden h-full flex flex-col">
      {/* Editor header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-dark-900/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-gray-500 ml-2 font-mono">
            {language || "plain"} &middot; {lineCount} lines
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange("")}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-800"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 min-h-0">
        {/* Line numbers */}
        <div className="py-3 pl-3 pr-2 text-right select-none border-r border-gray-800/50 bg-dark-950/50 overflow-hidden">
          <div className="text-xs text-gray-600 font-mono leading-[1.6]">
            {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="code-editor flex-1 w-full bg-transparent text-gray-200 p-3 outline-none border-none"
          placeholder="Paste your code here..."
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;
              const newValue = value.substring(0, start) + "  " + value.substring(end);
              onChange(newValue);
              // Restore cursor position
              requestAnimationFrame(() => {
                e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
              });
            }
          }}
        />
      </div>
    </div>
  );
}
