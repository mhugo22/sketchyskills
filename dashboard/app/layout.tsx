import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SketchySkills - ClawHub Security Scanner",
  description: "Automated malware detection for OpenClaw skills. Trust, but verify. We verify.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`} style={{ background: '#0f1419', color: '#e6edf3' }}>
        {/* Skip to main content for keyboard users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Navigation */}
        <nav 
          className="border-b sticky top-0 z-50 backdrop-blur-sm"
          style={{ 
            borderColor: '#30363d',
            background: 'rgba(15, 20, 25, 0.95)'
          }}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo & Brand */}
              <Link 
                href="/" 
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                <span 
                  className="text-3xl flex-shrink-0" 
                  role="img" 
                  aria-label="detective"
                >
                  🕵️
                </span>
                <div className="flex flex-col gap-0.5">
                  <h1 
                    className="text-xl font-bold tracking-tight"
                    style={{ color: '#58a6ff' }}
                  >
                    SketchySkills
                  </h1>
                  <p 
                    className="text-xs"
                    style={{ color: '#768390' }}
                  >
                    Trust, but verify. We verify.
                  </p>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="flex items-center gap-6">
                <Link 
                  href="/"
                  className="text-sm font-medium hover:underline transition-colors px-3 py-2"
                  style={{ color: '#adbac7', minHeight: 'auto', minWidth: 'auto', letterSpacing: '0.025em' }}
                >
                  Home
                </Link>
                <span style={{ color: '#30363d' }}>•</span>
                <Link 
                  href="/methodology"
                  className="text-sm font-medium hover:underline transition-colors px-3 py-2"
                  style={{ color: '#adbac7', minHeight: 'auto', minWidth: 'auto', letterSpacing: '0.025em' }}
                >
                  Methodology
                </Link>
                <span style={{ color: '#30363d' }}>•</span>
                <Link 
                  href="/about"
                  className="text-sm font-medium hover:underline transition-colors px-3 py-2"
                  style={{ color: '#adbac7', minHeight: 'auto', minWidth: 'auto', letterSpacing: '0.025em' }}
                >
                  About
                </Link>
                <span style={{ color: '#30363d' }}>•</span>
                <a 
                  href="https://github.com/sketchyskills/sketchyskills"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-nav-button text-sm font-medium transition-all px-4 py-2 rounded-md border"
                  style={{ 
                    color: '#58a6ff',
                    borderColor: '#30363d',
                    minHeight: 'auto', 
                    minWidth: 'auto',
                    letterSpacing: '0.025em'
                  }}
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main id="main-content" role="main">
          {children}
        </main>

        {/* Footer */}
        <footer 
          className="border-t mt-20 py-8"
          style={{ 
            borderColor: '#30363d',
            background: '#1a2332'
          }}
          role="contentinfo"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Standard Footer Info */}
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm mb-6" style={{ color: '#768390' }}>
              <div>
                <p>SketchySkills v1.0.0 | Powered by Claude Opus 4.6</p>
                <p className="mt-1">
                  Built with 🧀 by the{' '}
                  <a 
                    href="https://openclaw.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#58a6ff' }}
                  >
                    OpenClaw
                  </a>
                  {' '}community
                </p>
              </div>
              <div className="flex space-x-6">
                <a 
                  href="https://clawhub.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#58a6ff', minHeight: 'auto', minWidth: 'auto' }}
                >
                  ClawHub
                </a>
                <a 
                  href="https://github.com/sketchyskills/sketchyskills"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#58a6ff', minHeight: 'auto', minWidth: 'auto' }}
                >
                  Source Code
                </a>
                <a 
                  href="https://discord.com/invite/clawd"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#58a6ff', minHeight: 'auto', minWidth: 'auto' }}
                >
                  Discord
                </a>
              </div>
            </div>

            {/* Warranty Disclaimer - Professional Footnote */}
            <div 
              className="pt-6 border-t text-xs leading-relaxed"
              style={{ 
                borderColor: '#30363d',
                color: '#768390'
              }}
            >
              <p className="mb-2">
                <strong style={{ color: '#adbac7' }}>Disclaimer:</strong> This tool is provided "as is" without warranty of any kind, express or implied. 
                SketchySkills is an automated analysis tool that may produce false positives or fail to detect malicious code. 
                We make no guarantees about accuracy, completeness, or fitness for any particular purpose.
              </p>
              <p>
                Always review skills manually before installation. The developers and contributors are not liable 
                for any damages resulting from the use of this tool or the installation of analyzed skills. 
                By using this service, you acknowledge and accept these limitations.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
