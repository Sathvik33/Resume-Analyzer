import './NegativePoints.css'

function NegativePoints({ negativePoints = [], irrelevantSections = [] }) {
  const severityConfig = {
    critical: {
      color: 'var(--danger)',
      bg: 'var(--danger-bg)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    moderate: {
      color: 'var(--warning)',
      bg: 'var(--warning-bg)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    minor: {
      color: 'var(--info)',
      bg: 'var(--info-bg)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
  }

  // Count by severity
  const counts = { critical: 0, moderate: 0, minor: 0 }
  negativePoints.forEach(p => {
    const sev = p.severity?.toLowerCase() || 'moderate'
    if (counts[sev] !== undefined) counts[sev]++
  })

  return (
    <div className="negative-points">
      {/* Severity Summary */}
      <div className="severity-summary">
        {Object.entries(counts).map(([sev, count]) => {
          if (count === 0) return null
          const config = severityConfig[sev]
          return (
            <div key={sev} className="severity-badge" style={{ background: config.bg, color: config.color }}>
              {config.icon}
              <span className="severity-count">{count}</span>
              <span className="severity-label">{sev}</span>
            </div>
          )
        })}
      </div>

      {/* Negative Points List */}
      {negativePoints.length > 0 && (
        <div className="np-list">
          {negativePoints.map((point, i) => {
            const sev = point.severity?.toLowerCase() || 'moderate'
            const config = severityConfig[sev] || severityConfig.moderate
            return (
              <div
                key={i}
                className="np-card glass-card"
                style={{ borderLeftColor: config.color, animationDelay: `${i * 100}ms` }}
              >
                <div className="np-card-header">
                  <div className="np-icon" style={{ color: config.color, background: config.bg }}>
                    {config.icon}
                  </div>
                  <div className="np-meta">
                    <span className="np-severity-tag" style={{ background: config.bg, color: config.color }}>
                      {sev}
                    </span>
                    {point.section && (
                      <span className="np-section-tag">{point.section}</span>
                    )}
                  </div>
                </div>

                <p className="np-issue">{point.issue}</p>

                {point.recommendation && (
                  <div className="np-recommendation">
                    <div className="np-rec-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span>How to fix:</span>
                    </div>
                    <p className="np-rec-text">{point.recommendation}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Irrelevant Sections */}
      {irrelevantSections.length > 0 && (
        <div className="irrelevant-sections">
          <h4 className="section-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Irrelevant / Weak Sections
          </h4>
          <div className="irrelevant-list">
            {irrelevantSections.map((section, i) => (
              <span key={i} className="irrelevant-tag">{section}</span>
            ))}
          </div>
        </div>
      )}

      {negativePoints.length === 0 && irrelevantSections.length === 0 && (
        <div className="no-issues">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p>No major issues found — your resume looks solid!</p>
        </div>
      )}
    </div>
  )
}

export default NegativePoints
