import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeLens — AI Code Reviewer",
  description:
    "Get instant, intelligent code reviews powered by AI. Supports Python, JavaScript, TypeScript, Java, Go, Rust, C++, HTML/CSS, and SQL.",
  keywords: ["code review", "AI", "MiMo", "code quality", "static analysis"],
  authors: [{ name: "CodeLens" }],
  openGraph: {
    title: "CodeLens — AI Code Reviewer",
    description: "Instant AI-powered code reviews with actionable feedback.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
