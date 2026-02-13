export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">How SketchySkills Works</h1>
      <p className="text-slate-400 text-lg mb-8">
        Transparent security analysis for ClawHub agent skills
      </p>

      <div className="space-y-8">
        {/* Overview */}
        <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Overview</h2>
          <p className="text-slate-300 leading-relaxed">
            SketchySkills is an automated security scanner that analyzes every skill published to{' '}
            <a href="https://clawhub.com" className="text-cyan-400 hover:underline">ClawHub.com</a>.
            We use Claude Opus 4.6 to perform deep code analysis, looking for malicious patterns,
            data exfiltration, credential harvesting, and other security risks.
          </p>
        </section>

        {/* Analysis Pipeline */}
        <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Analysis Pipeline</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-cyan-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">1. Skill Fetch</h3>
              <p className="text-slate-300">
                We download skills using the official ClawHub CLI in an isolated directory
                with strict size limits (10MB/skill, 500MB total cap). Network access is
                disabled during fetch.
              </p>
            </div>

            <div className="border-l-4 border-cyan-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">2. Static Analysis</h3>
              <p className="text-slate-300">
                All code is analyzed without execution. We never run skills - only read their
                source code, package.json, and documentation files.
              </p>
            </div>

            <div className="border-l-4 border-cyan-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">3. AI Security Review</h3>
              <p className="text-slate-300">
                Claude Opus 4.6 analyzes each file for security concerns, including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                <li>Data exfiltration patterns</li>
                <li>Credential/token harvesting</li>
                <li>Prompt injection vulnerabilities</li>
                <li>Undocumented network activity</li>
                <li>Privilege escalation attempts</li>
                <li>Code obfuscation or disguised behavior</li>
              </ul>
            </div>

            <div className="border-l-4 border-cyan-500 pl-4">
              <h3 className="font-semibold text-lg mb-2">4. Scoring & Classification</h3>
              <p className="text-slate-300">
                Each finding is weighted by severity and aggregated into a final sketchy score (0-100).
                Skills are classified as:
              </p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm font-semibold">HIGH</span>
                  <span className="text-slate-400">≥70 - Confirmed malicious behavior</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-sm font-semibold">MEDIUM</span>
                  <span className="text-slate-400">40-69 - Significant concerns</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm font-semibold">LOW</span>
                  <span className="text-slate-400">20-39 - Minor issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm font-semibold">CLEAN</span>
                  <span className="text-slate-400">&lt;20 - No significant concerns</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Measures */}
        <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Security Measures</h2>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong>No Code Execution:</strong> Skills are never run, only analyzed statically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong>Isolated Environment:</strong> Downloads occur in isolated directory with <code className="text-cyan-400 bg-slate-900 px-1 rounded">ignore-scripts=true</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong>Size Limits:</strong> 10MB per skill, 500MB total cap, 30s timeout</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong>Read-Only Analysis:</strong> Scanner has no write access to ClawHub or production systems</span>
            </li>
          </ul>
        </section>

        {/* Limitations */}
        <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Limitations</h2>
          <p className="text-slate-300 mb-4">
            SketchySkills is a powerful tool, but not infallible:
          </p>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">⚠</span>
              <span><strong>False Positives:</strong> Some legitimate skills may be flagged for security-relevant patterns (e.g., credential managers)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">⚠</span>
              <span><strong>Obfuscation:</strong> Heavily obfuscated code may hide malicious behavior from static analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">⚠</span>
              <span><strong>Dynamic Behavior:</strong> Runtime-only exploits that only trigger under specific conditions may be missed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">⚠</span>
              <span><strong>Zero-Day Patterns:</strong> Novel attack patterns not in training data may not be detected</span>
            </li>
          </ul>
          <p className="text-slate-400 mt-4 italic">
            Always review high-risk skills manually before installation. This scanner is a starting point, not a guarantee.
          </p>
        </section>

        {/* False Positives */}
        <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Reporting False Positives</h2>
          <p className="text-slate-300 mb-4">
            If your skill was flagged incorrectly, we want to know:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>Open an issue on our <a href="https://github.com/sketchyskills/sketchyskills" className="text-cyan-400 hover:underline">GitHub repo</a></li>
            <li>Include the skill name, your explanation, and supporting evidence</li>
            <li>We'll review and potentially add to our allowlist</li>
          </ol>
          <p className="text-slate-400 mt-4">
            Known-good authors and verified skills will be maintained in a public allowlist.
          </p>
        </section>

        {/* Open Source */}
        <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Open Source & Transparency</h2>
          <p className="text-slate-300 mb-4">
            SketchySkills is fully open source. View our:
          </p>
          <ul className="space-y-2">
            <li>
              <a href="https://github.com/sketchyskills/sketchyskills" className="text-cyan-400 hover:underline">
                📦 Source Code
              </a>
            </li>
            <li>
              <a href="https://github.com/sketchyskills/sketchyskills/blob/main/scanner/prompts/skill-analysis-prompt.md" className="text-cyan-400 hover:underline">
                📝 Analysis Prompt
              </a>
            </li>
            <li>
              <a href="https://github.com/sketchyskills/sketchyskills/blob/main/docs/METHODOLOGY.md" className="text-cyan-400 hover:underline">
                🔬 Detailed Methodology
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
