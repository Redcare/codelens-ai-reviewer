# 🔍 CodeLens — AI Code Reviewer

> Get instant, intelligent code reviews powered by AI. Built with Next.js and the MiMo LLM for the Xiaomi MiMo Orbit creator program.

![CodeLens Screenshot](public/screenshot.png)

## ✨ Features

- **AI-Powered Reviews** — Paste code, get structured feedback in seconds
- **Multi-Language** — Python, JavaScript, TypeScript, Java, Go, Rust, C++, HTML/CSS, SQL
- **Structured Feedback** — Overall score, issues with severity, quality breakdown, suggestions
- **Smart Analysis** — Detects bugs, security vulnerabilities, performance issues, style problems
- **Improved Code** — AI provides a fixed version of your code
- **Dark Theme** — Modern UI with responsive design for mobile and desktop
- **Demo Mode** — Works without API keys using intelligent mock reviews
- **Provider Abstraction** — Switch between MiMo, OpenRouter, or demo mode via env vars

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: MiMo v2.5 / OpenRouter (OpenAI-compatible API)
- **Deployment**: Vercel

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Code     │  │ Language │  │ Review Result  │  │
│  │ Editor   │  │ Selector │  │ Display        │  │
│  └────┬─────┘  └────┬─────┘  └───────▲───────┘  │
│       │              │                │          │
└───────┼──────────────┼────────────────┼──────────┘
        │ POST /api/review              │
        ▼              ▼                │
┌───────────────────────────────────────┴──────────┐
│              Next.js API Route                    │
│  ┌─────────────────────────────────────────────┐  │
│  │              lib/llm.ts                      │  │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────┐  │  │
│  │  │  MiMo   │  │OpenRouter│  │    Demo    │  │  │
│  │  │Provider │  │ Provider │  │  Provider  │  │  │
│  │  └────┬────┘  └────┬─────┘  └─────┬──────┘  │  │
│  └───────┼─────────────┼──────────────┼─────────┘  │
└──────────┼─────────────┼──────────────┼───────────┘
           │             │              │
           ▼             ▼              ▼
    ┌────────────┐ ┌───────────┐ ┌───────────┐
    │ MiMo API   │ │ OpenRouter│ │  Mock     │
    │ xiaomi...  │ │ .ai/api   │ │  Data     │
    └────────────┘ └───────────┘ └───────────┘
```

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/codelens-ai-reviewer.git
cd codelens-ai-reviewer
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

- **Demo mode** (no API key): `LLM_PROVIDER=demo`
- **MiMo mode**: Set `LLM_PROVIDER=mimo`, `LLM_API_KEY=your_key`
- **OpenRouter**: Set `LLM_PROVIDER=openrouter`, `LLM_API_KEY=your_key`

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment to Vercel

### Option 1: Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/codelens-ai-reviewer)

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option 3: GitHub Integration

1. Push to GitHub
2. Import in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables in Vercel project settings
4. Deploy!

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_PROVIDER` | Provider: `mimo`, `openrouter`, `demo` | `demo` |
| `LLM_API_KEY` | API key for the provider | (empty) |
| `LLM_BASE_URL` | API base URL (MiMo) | `https://api.xiaomimimo.com/v1` |
| `LLM_MODEL` | Model identifier | `mimo-v2.5` |

## 📁 Project Structure

```
codelens/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main application page
│   ├── globals.css         # Global styles & animations
│   └── api/review/route.ts # Code review API endpoint
├── components/
│   ├── CodeEditor.tsx      # Code textarea with line numbers
│   ├── ReviewResult.tsx    # Review results display
│   ├── LanguageSelector.tsx # Language dropdown
│   └── ScoreCard.tsx       # Circular score visualization
├── lib/
│   └── llm.ts             # LLM provider abstraction
├── .env.example            # Environment template
├── tailwind.config.ts      # Tailwind configuration
└── package.json
```

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for the <strong>Xiaomi MiMo Orbit</strong> creator program
</p>
