"use client";

import { useState, useCallback } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { ReviewResult } from "@/components/ReviewResult";
import { LanguageSelector } from "@/components/LanguageSelector";
import type { ReviewResult as ReviewResultType } from "@/lib/llm";

const SAMPLE_CODE: Record<string, string> = {
  python: `import os

def get_user_data(user_id):
    password = "super_secret_123"
    query = f"SELECT * FROM users WHERE id = {user_id}"
    conn = connect_to_db()
    result = conn.execute(query)
    data = result.fetchall()
    print(f"Found {len(data)} users")
    return data

def calculate_fibonacci(n):
    if n <= 0:
        return []
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

class DataProcessor:
    def __init__(self):
        self.data = []
    
    def process(self, items):
        result = []
        for item in items:
            if item != None:
                result.append(item * 2)
        return result`,
  javascript: `const express = require('express');
const app = express();

app.get('/user/:id', async (req, res) => {
  var userId = req.params.id;
  var query = "SELECT * FROM users WHERE id = " + userId;
  
  try {
    const result = await db.query(query);
    console.log("Query executed");
    res.json(result.rows);
  } catch(err) {}
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const token = eval("generateToken('" + username + "')");
  res.json({ token: token });
});

app.listen(3000);`,
  typescript: `import axios from 'axios';

interface User {
  id: any;
  name: string;
  email: string;
}

async function fetchUsers(): Promise<User[]> {
  const response = await axios.get('/api/users');
  return response.data;
}

function processUser(user: User) {
  console.log('Processing:', user.name);
  var processed = true;
  
  if (user.id == null) {
    return;
  }
  
  return {
    ...user,
    processed
  };
}`,
};

export default function HomePage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [result, setResult] = useState<ReviewResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReview = useCallback(async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Review failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [code, language]);

  const loadSample = useCallback(() => {
    const sample = SAMPLE_CODE[language] || SAMPLE_CODE.python;
    setCode(sample);
    setResult(null);
    setError(null);
  }, [language]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CodeLens
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">AI-Powered Code Review</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              {process.env.NEXT_PUBLIC_LLM_PROVIDER === "demo" || !process.env.NEXT_PUBLIC_LLM_PROVIDER ? "Demo Mode" : "Live"}
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <LanguageSelector value={language} onChange={setLanguage} />
          <button
            onClick={loadSample}
            className="text-sm text-gray-400 hover:text-blue-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800/50"
          >
            Load sample code
          </button>
          <div className="flex-1" />
          <button
            onClick={handleReview}
            disabled={loading || !code.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold text-sm transition-all glow-blue flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Review Code
              </>
            )}
          </button>
        </div>

        {/* Editor + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Code editor panel */}
          <div className="animate-fade-in">
            <CodeEditor value={code} onChange={setCode} language={language} />
          </div>

          {/* Results panel */}
          <div className="animate-fade-in">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 animate-slide-up">
                <div className="flex items-center gap-2 text-red-400">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-300/80 text-sm mt-1">{error}</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center h-64 lg:h-full bg-dark-900 rounded-xl border border-gray-800">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-400 mt-4 text-sm">Analyzing your code...</p>
                  <p className="text-gray-600 mt-1 text-xs">This may take a few seconds</p>
                </div>
              </div>
            )}

            {result && !loading && <ReviewResult result={result} />}

            {!result && !loading && !error && (
              <div className="flex items-center justify-center h-64 lg:h-full bg-dark-900 rounded-xl border border-gray-800 border-dashed">
                <div className="text-center px-6">
                  <svg className="w-12 h-12 text-gray-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">Review results will appear here</p>
                  <p className="text-gray-600 text-sm mt-1">Paste your code and click &quot;Review Code&quot;</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        <p>
          Built for the <span className="text-gray-400">Xiaomi MiMo Orbit</span> creator program
        </p>
      </footer>
    </div>
  );
}
