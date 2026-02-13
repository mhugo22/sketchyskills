export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">About SketchySkills</h1>
      <p className="text-slate-400 text-lg mb-8">
        Keeping the OpenClaw ecosystem safe, one skill at a time
      </p>

      <div className="space-y-8">
        {/* Mission */}
        <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Mission</h2>
          <p className="text-slate-300 leading-relaxed">
            <a href="https://clawhub.com" className="text-cyan-400 hover:underline">ClawHub</a> is a
            powerful community marketplace for OpenClaw agent skills. Like any package registry, it faces
            the challenge of ensuring safety and security while remaining open and accessible.
          </p>
          <p className="text-slate-300 leading-relaxed mt-4">
            SketchySkills aims to provide <strong>transparent, automated security analysis</strong> for
            every skill published to ClawHub. We believe in:
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span className="text-slate-300"><strong>Transparency:</strong> All analysis results, methodology, and source code are public</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span className="text-slate-300"><strong>Automation:</strong> Daily scans catch new threats quickly without human bottlenecks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span className="text-slate-300"><strong>Community:</strong> Open-source tools empower everyone to verify and improve security</span>
            </li>
          </ul>
        </section>

        {/* Why This Matters */}
        <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Why This Matters</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            AI agents have unprecedented access to your systems:
          </p>
          <ul className="space-y-3">
            <li className="bg-slate-900/50 rounded p-3 border-l-4 border-red-500">
              <div className="font-semibold text-red-400 mb-1">File System Access</div>
              <div className="text-slate-400">Skills can read, write, and execute files on your machine</div>
            </li>
            <li className="bg-slate-900/50 rounded p-3 border-l-4 border-orange-500">
              <div className="font-semibold text-orange-400 mb-1">Credential Access</div>
              <div className="text-slate-400">Skills may access API keys, tokens, and authentication credentials</div>
            </li>
            <li className="bg-slate-900/50 rounded p-3 border-l-4 border-yellow-500">
              <div className="font-semibold text-yellow-400 mb-1">Network Communications</div>
              <div className="text-slate-400">Skills can make arbitrary network requests to any server</div>
            </li>
            <li className="bg-slate-900/50 rounded p-3 border-l-4 border-purple-500">
              <div className="font-semibold text-purple-400 mb-1">Command Execution</div>
              <div className="text-slate-400">Skills can run shell commands with your permissions</div>
            </li>
          </ul>
          <p className="text-slate-300 leading-relaxed mt-4">
            A malicious skill could exfiltrate your data, harvest credentials, or compromise your system.
            <strong className="text-cyan-400"> Automated security scanning is essential.</strong>
          </p>
        </section>

        {/* How We Found Malware */}
        <section className="bg-red-900/20 rounded-lg border border-red-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-red-400">Real Malware Found</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            In our initial test scan of just 10 skills, we discovered <strong>confirmed malware</strong>:
          </p>
          <div className="bg-slate-900/80 rounded p-4 border border-red-800">
            <div className="font-mono text-sm">
              <div className="text-red-400 font-semibold mb-2">wed-1-0-1</div>
              <div className="text-slate-400 mb-2">Score: <span className="text-red-400 font-bold">82/100</span> (HIGH severity)</div>
              <div className="text-slate-300 mb-2">Findings:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
                <li>Disguised as a business tool ("WED Business Agent")</li>
                <li>Exfiltrates hostname and current working directory to Cloudflare Workers</li>
                <li>Undocumented network activity not mentioned in documentation</li>
                <li>Prompt injection vulnerabilities in SKILL.md</li>
                <li>Remote code download capabilities</li>
              </ul>
              <div className="mt-3 text-red-400 font-semibold">
                Recommendation: <span className="bg-red-500/30 px-2 py-1 rounded">BLOCK</span>
              </div>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed mt-4">
            This proves the threat is real. Without automated scanning, users would have no way to know
            this skill was malicious until it was too late.
          </p>
        </section>

        {/* Technology */}
        <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Technology Stack</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded p-4">
              <h3 className="font-semibold text-lg mb-2">Analysis Engine</h3>
              <ul className="space-y-1 text-slate-400">
                <li>• Claude Opus 4.6 (Anthropic API)</li>
                <li>• Node.js scanner scripts</li>
                <li>• ClawHub CLI for skill fetch</li>
              </ul>
            </div>
            <div className="bg-slate-900/50 rounded p-4">
              <h3 className="font-semibold text-lg mb-2">Dashboard</h3>
              <ul className="space-y-1 text-slate-400">
                <li>• Next.js 15 + React 19</li>
                <li>• Tailwind CSS</li>
                <li>• Vercel deployment</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Budget & Sustainability */}
        <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Budget & Sustainability</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            SketchySkills operates on a <strong>$50/month budget</strong> for Opus 4.6 API calls:
          </p>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>Full ClawHub scan (~700 skills): <strong>~$19</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>Daily incremental scans (new/updated skills): <strong>~$5/day</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              <span>Hosting (Vercel): <strong>Free tier</strong></span>
            </li>
          </ul>
          <p className="text-slate-400 mt-4 italic">
            If this project grows, we may explore community sponsorship or grants to sustain operations.
          </p>
        </section>

        {/* Get Involved */}
        <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Get Involved</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            SketchySkills is an open-source community project:
          </p>
          <div className="space-y-3">
            <a
              href="https://github.com/sketchyskills/sketchyskills"
              className="block bg-slate-900/50 rounded p-4 border border-slate-700 hover:border-cyan-500 transition-colors"
            >
              <div className="font-semibold text-cyan-400 mb-1">📦 Contribute on GitHub</div>
              <div className="text-slate-400">Submit PRs, report issues, or improve the scanner</div>
            </a>
            <a
              href="https://github.com/sketchyskills/sketchyskills/issues/new"
              className="block bg-slate-900/50 rounded p-4 border border-slate-700 hover:border-cyan-500 transition-colors"
            >
              <div className="font-semibold text-cyan-400 mb-1">🐛 Report a False Positive</div>
              <div className="text-slate-400">Let us know if your legitimate skill was flagged incorrectly</div>
            </a>
            <a
              href="https://discord.com/invite/clawd"
              className="block bg-slate-900/50 rounded p-4 border border-slate-700 hover:border-cyan-500 transition-colors"
            >
              <div className="font-semibold text-cyan-400 mb-1">💬 Join the Discussion</div>
              <div className="text-slate-400">Talk security in the OpenClaw Discord community</div>
            </a>
          </div>
        </section>

        {/* Credits */}
        <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Credits</h2>
          <p className="text-slate-300 leading-relaxed">
            Built with 🧀 by <a href="https://twitter.com/mattvanitallie" className="text-cyan-400 hover:underline">Matt</a> and
            the OpenClaw community.
          </p>
          <p className="text-slate-400 mt-4">
            Special thanks to Anthropic for Claude Opus 4.6 and the ClawHub team for building an open skill marketplace.
          </p>
        </section>
      </div>
    </div>
  );
}
