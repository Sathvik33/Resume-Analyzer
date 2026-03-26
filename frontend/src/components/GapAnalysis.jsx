import './GapAnalysis.css'

function GapAnalysis({ gaps = [], resumeAnalysis = {} }) {
  const typeIcons = {
    missing_skill: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    weak_experience: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    mismatch: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
  }

  const impactColors = {
    high: { bg: 'var(--danger-bg)', border: 'var(--danger)', text: 'var(--danger)' },
    medium: { bg: 'var(--warning-bg)', border: 'var(--warning)', text: 'var(--warning)' },
    low: { bg: 'var(--info-bg)', border: 'var(--info)', text: 'var(--info)' },
  }

  const { present_skills = [], missing_skills = [], partial_matches = [] } = resumeAnalysis

  return (
    <div className="gap-analysis">
      {/* Skills Overview */}
      <div className="skills-overview">
        {present_skills.length > 0 && (
          <div className="skills-group">
            <h4 className="skills-group-title">
              <span className="skills-dot" style={{ background: 'var(--success)' }}></span>
              Present Skills ({present_skills.length})
            </h4>
            <div className="skills-pills">
              {present_skills.map((skill, i) => (
                <span key={i} className="skill-pill present">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {missing_skills.length > 0 && (
          <div className="skills-group">
            <h4 className="skills-group-title">
              <span className="skills-dot" style={{ background: 'var(--danger)' }}></span>
              Missing Skills ({missing_skills.length})
            </h4>
            <div className="skills-pills">
              {missing_skills.map((skill, i) => (
                <span key={i} className="skill-pill missing">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {partial_matches.length > 0 && (
          <div className="skills-group">
            <h4 className="skills-group-title">
              <span className="skills-dot" style={{ background: 'var(--warning)' }}></span>
              Partial Matches ({partial_matches.length})
            </h4>
            <div className="skills-pills">
              {partial_matches.map((skill, i) => (
                <span key={i} className="skill-pill partial">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gap Cards */}
      {gaps.length > 0 && (
        <div className="gap-cards">
          <h4 className="section-label">Detailed Gaps</h4>
          {gaps.map((gap, i) => {
            const impact = impactColors[gap.impact] || impactColors.medium
            const icon = typeIcons[gap.type] || typeIcons.missing_skill
            return (
              <div
                key={i}
                className="gap-card glass-card"
                style={{
                  borderLeftColor: impact.border,
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div className="gap-card-header">
                  <div className="gap-type-icon" style={{ color: impact.text, background: impact.bg }}>
                    {icon}
                  </div>
                  <div className="gap-meta">
                    <span className="gap-type">{(gap.type || '').replace(/_/g, ' ')}</span>
                    <span className="gap-impact-badge" style={{ backgroundColor: impact.bg, color: impact.text }}>
                      {gap.impact}
                    </span>
                  </div>
                </div>
                <p className="gap-description">{gap.description}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GapAnalysis
