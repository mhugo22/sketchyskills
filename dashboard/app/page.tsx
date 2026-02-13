import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';

interface Finding {
  category: string;
  severity: string;
  description: string;
  evidence: string;
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
  generatedAt: string;
  version: string;
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

async function getData(): Promise<DashboardData> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'results.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

function getSeverityStyles(severity: string): { bg: string; text: string; border: string } {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'high':
      return { bg: '#da3633', text: '#ffffff', border: '#f85149' };
    case 'medium':
      return { bg: '#e09b13', text: '#0f1419', border: '#f2cc60' };
    case 'low':
      return { bg: '#388bfd', text: '#ffffff', border: '#58a6ff' };
    case 'clean':
      return { bg: '#238636', text: '#ffffff', border: '#2ea043' };
    default:
      return { bg: '#768390', text: '#ffffff', border: '#768390' };
  }
}

function getSeverityEmoji(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟡';
    case 'low': return '🔵';
    case 'clean': return '🟢';
    default: return '⚪';
  }
}

export default async function Home() {
  const data = await getData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4" style={{ color: '#e6edf3' }}>
          Automated Security Scanning for{' '}
          <span style={{ color: '#58a6ff' }}>ClawHub Skills</span>
        </h2>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: '#adbac7' }}>
          We analyze every ClawHub skill with Claude Opus 4.6 to detect malware, 
          data exfiltration, and malicious patterns. Updated daily.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div 
          className="rounded-lg p-6 border"
          style={{ background: '#1a2332', borderColor: '#30363d' }}
        >
          <div className="text-3xl font-bold" style={{ color: '#58a6ff' }}>
            {data.summary.totalSkills}
          </div>
          <div className="text-sm mt-1" style={{ color: '#adbac7' }}>
            Skills Scanned
          </div>
        </div>
        <div 
          className="rounded-lg p-6 border"
          style={{ background: '#1a2332', borderColor: '#30363d' }}
        >
          <div className="text-3xl font-bold" style={{ color: '#da3633' }}>
            {data.summary.highCount + data.summary.criticalCount}
          </div>
          <div className="text-sm mt-1" style={{ color: '#adbac7' }}>
            High/Critical
          </div>
        </div>
        <div 
          className="rounded-lg p-6 border"
          style={{ background: '#1a2332', borderColor: '#30363d' }}
        >
          <div className="text-3xl font-bold" style={{ color: '#238636' }}>
            {data.summary.cleanCount}
          </div>
          <div className="text-sm mt-1" style={{ color: '#adbac7' }}>
            Clean Skills
          </div>
        </div>
        <div 
          className="rounded-lg p-6 border"
          style={{ background: '#1a2332', borderColor: '#30363d' }}
        >
          <div className="text-3xl font-bold" style={{ color: '#a371f7' }}>
            ${data.summary.totalCostUSD.toFixed(2)}
          </div>
          <div className="text-sm mt-1" style={{ color: '#adbac7' }}>
            Analysis Cost
          </div>
        </div>
      </div>

      {/* Top Sketchy Skills */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#e6edf3' }}>
          <span className="mr-2" role="img" aria-label="fire">🔥</span>
          Most Sketchy Skills
        </h3>
        <div className="space-y-4">
          {data.skills.slice(0, 5).map((skill, index) => {
            const severityStyles = getSeverityStyles(skill.severity);
            return (
              <div
                key={skill.slug}
                className="rounded-lg p-6 border card-hover"
                style={{ background: '#1a2332', borderColor: '#30363d' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl font-bold" style={{ color: '#768390' }}>
                        #{index + 1}
                      </span>
                      <span className="text-2xl" role="img" aria-label={`severity ${skill.severity}`}>
                        {getSeverityEmoji(skill.severity)}
                      </span>
                      <Link 
                        href={`/skills/${skill.slug}`}
                        className="text-xl font-semibold hover:underline"
                        style={{ color: '#58a6ff', minHeight: 'auto', minWidth: 'auto' }}
                      >
                        {skill.slug}
                      </Link>
                    </div>
                    <div className="flex items-center space-x-3 mb-3 ml-20">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-semibold uppercase border"
                        style={{
                          background: severityStyles.bg,
                          color: severityStyles.text,
                          borderColor: severityStyles.border
                        }}
                      >
                        {skill.severity}
                      </span>
                      <a 
                        href={`https://clawhub.com/skills/${skill.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline"
                        style={{ color: '#58a6ff', minHeight: 'auto', minWidth: 'auto' }}
                      >
                        View on ClawHub →
                      </a>
                      <span className="text-xs" style={{ color: '#768390' }}>
                        {skill.findingsCount} findings • {skill.meta.fileCount} files analyzed
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#adbac7' }}>
                      {skill.summary}
                    </p>
                  </div>
                  <div className="ml-6 text-right">
                    <div className="text-3xl font-bold" style={{ color: '#58a6ff' }}>
                      {skill.sketchyScore}
                    </div>
                    <div className="text-xs" style={{ color: '#768390' }}>
                      / 100
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Skills Table */}
      <div>
        <h3 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#e6edf3' }}>
          <span className="mr-2" role="img" aria-label="chart">📊</span>
          All Skills ({data.summary.analyzedCount})
        </h3>
        <div 
          className="rounded-lg border overflow-hidden"
          style={{ background: '#1a2332', borderColor: '#30363d' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: '#243447' }}>
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold uppercase"
                    style={{ color: '#adbac7' }}
                    scope="col"
                  >
                    Skill
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-semibold uppercase"
                    style={{ color: '#adbac7' }}
                    scope="col"
                  >
                    Score
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-semibold uppercase"
                    style={{ color: '#adbac7' }}
                    scope="col"
                  >
                    Severity
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-semibold uppercase"
                    style={{ color: '#adbac7' }}
                    scope="col"
                  >
                    Findings
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-xs font-semibold uppercase"
                    style={{ color: '#adbac7' }}
                    scope="col"
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody style={{ borderColor: '#30363d' }}>
                {data.skills.map((skill) => {
                  const severityStyles = getSeverityStyles(skill.severity);
                  return (
                    <tr 
                      key={skill.slug}
                      className="border-t"
                      style={{ borderColor: '#30363d' }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <span className="text-lg mt-1" role="img" aria-label={`severity ${skill.severity}`}>
                            {getSeverityEmoji(skill.severity)}
                          </span>
                          <div>
                            <div className="mb-1">
                              <Link 
                                href={`/skills/${skill.slug}`}
                                className="font-medium hover:underline"
                                style={{ color: '#58a6ff', minHeight: 'auto', minWidth: 'auto' }}
                              >
                                {skill.slug}
                              </Link>
                            </div>
                            <div className="text-xs">
                              <a 
                                href={`https://clawhub.com/skills/${skill.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                style={{ color: '#58a6ff', minHeight: 'auto', minWidth: 'auto' }}
                              >
                                View on ClawHub →
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-2xl font-bold" style={{ color: '#58a6ff' }}>
                          {skill.sketchyScore}
                        </span>
                        <span className="text-xs ml-1" style={{ color: '#768390' }}>
                          / 100
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold uppercase border"
                          style={{
                            background: severityStyles.bg,
                            color: severityStyles.text,
                            borderColor: severityStyles.border
                          }}
                        >
                          {skill.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center" style={{ color: '#adbac7' }}>
                        {skill.findingsCount}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/skills/${skill.slug}`}
                          className="text-sm font-medium hover:underline"
                          style={{ color: '#58a6ff', minHeight: 'auto', minWidth: 'auto' }}
                        >
                          View Analysis →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-8 text-center text-sm" style={{ color: '#768390' }}>
        Last scan: {new Date(data.summary.lastScan).toLocaleString()} | 
        Average score: {data.summary.averageScore}/100
      </div>
    </div>
  );
}
