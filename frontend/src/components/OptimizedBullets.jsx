import { useState } from 'react'
import './OptimizedBullets.css'

function OptimizedBullets({ bullets = [], templateSuggestions = {} }) {
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)

  const copyBullet = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const copyAll = () => {
    const allText = bullets.map((b, i) => `• ${b}`).join('\n')
    navigator.clipboard.writeText(allText)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  return (
    <div className="optimized-bullets">
      {/* Template Suggestion */}
      {templateSuggestions?.recommended_format && (
        <div className="template-suggestion glass-card">
          <div className="template-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <div>
              <h4>Recommended Format</h4>
              <span className="template-format">{templateSuggestions.recommended_format}</span>
            </div>
          </div>
          {templateSuggestions.reason && (
            <p className="template-reason">{templateSuggestions.reason}</p>
          )}
        </div>
      )}

      {/* Bullets */}
      {bullets.length > 0 && (
        <div className="bullets-section">
          <div className="bullets-header">
            <h4>Optimized Resume Bullets</h4>
            <button className="btn-secondary copy-all-btn" onClick={copyAll}>
              {copiedAll ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy All
                </>
              )}
            </button>
          </div>

          <div className="bullets-list">
            {bullets.map((bullet, i) => (
              <div
                key={i}
                className="bullet-item glass-card"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="bullet-number">{String(i + 1).padStart(2, '0')}</div>
                <p className="bullet-text">{bullet}</p>
                <button
                  className="copy-btn"
                  onClick={() => copyBullet(bullet, i)}
                  title="Copy bullet"
                >
                  {copiedIdx === i ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default OptimizedBullets
