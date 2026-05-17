"use client";

interface JobCardHeaderProps {
  company: string;
  logo: string;
  matchScore: number;
  posted: string;
  location?: string;
}

function getInitials(company: string): string {
  const words = company.split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return company.substring(0, 2).toUpperCase();
}

export function JobCardHeader({ company, logo, matchScore, posted }: JobCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      {/* Company Logo */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border)",
          }}
        >
          <span
            className="text-sm font-bold"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
          >
            {logo ? logo : getInitials(company)}
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
            {company}
          </h3>
          <span className="text-xs" style={{ color: "var(--text-dim)" }}>
            {posted}
          </span>
        </div>
      </div>

      {/* Match score - simple gray pill */}
      <div
        className="flex-shrink-0 px-2.5 py-1 rounded-md"
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border)",
        }}
      >
        <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
          {matchScore}%
        </span>
      </div>
    </div>
  );
}

export default JobCardHeader;