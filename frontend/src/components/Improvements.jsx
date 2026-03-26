import { useState } from 'react'
import './Improvements.css'

function Improvements({ improvements = {} }) {
  const { skills_to_add = [], projects_to_add = [], keywords_to_add = [], resume_tips = [] } = improvements

  const [copied, setCopied] = useState(null)

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const sections = [
    {
      key: 'skills',
      title: 'Skills to Add',
      items: skills_to_add,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      color: 'var(--accent-primary)',
      bg: 'var(--accent-glow)',
    },
    {
      key: 'projects',
      title: 'Project Ideas',
      items: projects_to_add,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
      color: 'var(--success)',
      bg: 'var(--success-bg)',
    },
    {
      key: 'keywords',
      title: 'ATS Keywords',
      items: keywords_to_add,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      ),
      color: 'var(--info)',
      bg: 'var(--info-bg)',
    },
    {
      key: 'tips',
      title: 'Resume Tips',
      items: resume_tips,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
      color: 'var(--warning)',
      bg: 'var(--warning-bg)',
    },
  ]

  return (
    <div className="improvements">
      {sections.map((section) => {
        if (!section.items.length) return null
        return (
          <div key={section.key} className="improvement-section">
            <div className="improvement-header">
              <div className="improvement-icon" style={{ color: section.color, background: section.bg }}>
                {section.icon}
              </div>
              <h4>{section.title}</h4>
              <span className="improvement-count">{section.items.length}</span>
            </div>
            <ul className="improvement-list">
              {section.items.map((item, i) => {
                const id = `${section.key}-${i}`
                return (
                  <li key={i} className="improvement-item glass-card" style={{ animationDelay: `${i * 80}ms` }}>
                    <span className="improvement-text">{item}</span>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(item, id)}
                      title="Copy"
                    >
                      {copied === id ? (
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
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export default Improvements
