import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

interface Finding {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  evidence: string;
  file?: string;
  weight: number;
}

interface Skill {
  slug: string;
  sketchyScore: number;
  severity: string;
  recommendation: string;
  summary: string;
  findingsCount: number;
  findings: Finding[];
  meta: {
    fileCount: number;
    sizeBytes: number;
    inputTokens: number;
    outputTokens: number;
    costUSD: number;
  };
}

interface DashboardData {
  summary: {
    totalSkills: number;
    analyzedCount: number;
    failedCount: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    cleanCount: number;
    averageScore: number;
    totalCostUSD: number;
    lastScan: string;
  };
  skills: Skill[];
}

function getSeverityColor(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-700';
    case 'high':
      return 'bg-orange-500/20 text-orange-400 border-orange-700';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-700';
    case 'low':
      return 'bg-blue-500/20 text-blue-400 border-blue-700';
    default:
      return 'bg-green-500/20 text-green-400 border-green-700';
  }
}

function getCategoryEmoji(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes('exfiltration')) return '🚨';
  if (lower.includes('credential')) return '🔑';
  if (lower.includes('injection')) return '💉';
  if (lower.includes('privilege')) return '👑';
  if (lower.includes('network')) return '🌐';
  if (lower.includes('obfuscation')) return '🎭';
  return '⚠️';
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Load dashboard data
  const dataPath = path.join(process.cwd(), 'public', 'data', 'results.json');
  const data: DashboardData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  // Find the skill
  const skill = data.skills.find(s => s.slug === slug);
  
  if (!skill) {
    notFound();
  }

  const findings = skill.findings;
  const findingsBySeverity = {
    critical: findings.filter(f => f.severity === 'critical'),
    high: findings.filter(f => f.severity === 'high'),
    medium: findings.filter(f => f.severity === 'medium'),
    low: findings.filter(f => f.severity === 'low'),
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="text-cyan-400 hover:underline mb-4 inline-block">
          ← Back to dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{skill.slug}</h1>
            <div className="flex items-center gap-3 text-slate-400">
              <span>{skill.meta.fileCount} files analyzed</span>
              <span>•</span>
              <span>${skill.meta.costUSD.toFixed(4)} cost</span>
              <span>•</span>
              <a
                href={`https://clawhub.com/skills/${skill.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                View on ClawHub →
              </a>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold mb-1">{skill.sketchyScore}</div>
            <div className={`inline-block px-3 py-1 rounded border uppercase text-sm font-semibold ${getSeverityColor(skill.severity)}`}>
              {skill.severity}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3 text-cyan-400">Summary</h2>
        <p className="text-slate-300 leading-relaxed mb-4">{skill.summary}</p>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Recommendation:</span>
          <span className={`px-3 py-1 rounded font-semibold uppercase ${
            skill.recommendation === 'block' ? 'bg-red-500/30 text-red-400' :
            skill.recommendation === 'warn' ? 'bg-orange-500/30 text-orange-400' :
            skill.recommendation === 'review' ? 'bg-yellow-500/30 text-yellow-400' :
            'bg-green-500/30 text-green-400'
          }`}>
            {skill.recommendation}
          </span>
        </div>
      </section>

      {/* Findings Breakdown */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Findings</h2>
        
        {findings.length === 0 ? (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-green-400 font-semibold mb-1">No Security Concerns</div>
            <div className="text-slate-400">This skill appears to be safe based on our analysis</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* CRITICAL Severity */}
            {findingsBySeverity.critical.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-2">
                  Critical Severity ({findingsBySeverity.critical.length})
                </h3>
                <div className="space-y-3">
                  {findingsBySeverity.critical.map((finding, idx) => (
                    <div key={idx} className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getCategoryEmoji(finding.category)}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-red-400">{finding.category}</h4>
                            <span className="text-sm text-slate-500">Weight: {finding.weight}</span>
                          </div>
                          <p className="text-slate-300 mb-2">{finding.description}</p>
                          {finding.file && (
                            <div className="text-sm text-slate-500 mb-2">
                              📄 {finding.file}
                            </div>
                          )}
                          <div className="bg-slate-900/50 rounded p-3 border border-red-900">
                            <div className="text-sm text-slate-400 font-mono whitespace-pre-wrap">
                              {finding.evidence}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HIGH Severity */}
            {findingsBySeverity.high.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">
                  High Severity ({findingsBySeverity.high.length})
                </h3>
                <div className="space-y-3">
                  {findingsBySeverity.high.map((finding, idx) => (
                    <div key={idx} className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getCategoryEmoji(finding.category)}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-orange-400">{finding.category}</h4>
                            <span className="text-sm text-slate-500">Weight: {finding.weight}</span>
                          </div>
                          <p className="text-slate-300 mb-2">{finding.description}</p>
                          {finding.file && (
                            <div className="text-sm text-slate-500 mb-2">
                              📄 {finding.file}
                            </div>
                          )}
                          <div className="bg-slate-900/50 rounded p-3 border border-orange-900">
                            <div className="text-sm text-slate-400 font-mono whitespace-pre-wrap">
                              {finding.evidence}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MEDIUM Severity */}
            {findingsBySeverity.medium.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  Medium Severity ({findingsBySeverity.medium.length})
                </h3>
                <div className="space-y-3">
                  {findingsBySeverity.medium.map((finding, idx) => (
                    <div key={idx} className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getCategoryEmoji(finding.category)}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-yellow-400">{finding.category}</h4>
                            <span className="text-sm text-slate-500">Weight: {finding.weight}</span>
                          </div>
                          <p className="text-slate-300 mb-2">{finding.description}</p>
                          {finding.file && (
                            <div className="text-sm text-slate-500 mb-2">
                              📄 {finding.file}
                            </div>
                          )}
                          <div className="bg-slate-900/50 rounded p-3 border border-yellow-900">
                            <div className="text-sm text-slate-400 font-mono whitespace-pre-wrap">
                              {finding.evidence}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LOW Severity */}
            {findingsBySeverity.low.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                  Low Severity ({findingsBySeverity.low.length})
                </h3>
                <div className="space-y-3">
                  {findingsBySeverity.low.map((finding, idx) => (
                    <div key={idx} className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getCategoryEmoji(finding.category)}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-blue-400">{finding.category}</h4>
                            <span className="text-sm text-slate-500">Weight: {finding.weight}</span>
                          </div>
                          <p className="text-slate-300 mb-2">{finding.description}</p>
                          {finding.file && (
                            <div className="text-sm text-slate-500 mb-2">
                              📄 {finding.file}
                            </div>
                          )}
                          <div className="bg-slate-900/50 rounded p-3 border border-blue-900">
                            <div className="text-sm text-slate-400 font-mono whitespace-pre-wrap">
                              {finding.evidence}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Disclaimer */}
      <section className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-sm text-slate-400">
        <p>
          <strong className="text-slate-300">Disclaimer:</strong> This analysis is automated and may contain false positives.
          Always review skills manually before installation. See our{' '}
          <Link href="/methodology" className="text-cyan-400 hover:underline">methodology</Link> for details.
        </p>
      </section>
    </div>
  );
}
