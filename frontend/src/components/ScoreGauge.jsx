import { useEffect, useState } from 'react'
import './ScoreGauge.css'

function ScoreGauge({ score, scoreBreakdown, semanticSimilarity }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const progress = (animatedScore / 100) * circumference
  const offset = circumference - progress

  useEffect(() => {
    let frame
    const duration = 1500
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setAnimatedScore(Math.round(eased * score))

      if (t < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])

  const getScoreColor = (s) => {
    if (s >= 75) return 'var(--success)'
    if (s >= 50) return 'var(--warning)'
    return 'var(--danger)'
  }

  const getScoreLabel = (s) => {
    if (s >= 85) return 'Excellent Match'
    if (s >= 70) return 'Strong Match'
    if (s >= 50) return 'Moderate Match'
    if (s >= 30) return 'Weak Match'
    return 'Poor Match'
  }

  const color = getScoreColor(score)

  const breakdownItems = [
    {
      label: 'LLM Analysis Score',
      value: scoreBreakdown?.llm_score || 0,
      color: getScoreColor(scoreBreakdown?.llm_score || 0),
    },
    {
      label: 'Semantic Similarity',
      value: scoreBreakdown?.semantic_score || 0,
      color: getScoreColor(scoreBreakdown?.semantic_score || 0),
    },
    {
      label: 'Skill Match (Embeddings)',
      value: semanticSimilarity?.skill_match || 0,
      color: getScoreColor(semanticSimilarity?.skill_match || 0),
    },
    {
      label: 'Overall Similarity',
      value: semanticSimilarity?.overall || 0,
      color: getScoreColor(semanticSimilarity?.overall || 0),
    },
  ]

  return (
    <div className="score-gauge-container">
      {/* Circular Gauge */}
      <div className="gauge-wrapper">
        <svg className="gauge-svg" width="200" height="200" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
            className="gauge-progress"
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="gauge-center">
          <span className="gauge-score" style={{ color }}>{animatedScore}</span>
          <span className="gauge-label">/ 100</span>
        </div>
      </div>

      <p className="score-verdict" style={{ color }}>{getScoreLabel(score)}</p>

      {/* Blended Score Info */}
      {scoreBreakdown && (
        <p className="score-blend-info">
          60% LLM Analysis + 40% Semantic Similarity
        </p>
      )}

      {/* Breakdown Bars */}
      <div className="score-breakdown">
        {breakdownItems.map((item, i) => (
          <div key={i} className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">{item.label}</span>
              <span className="breakdown-value" style={{ color: item.color }}>{Math.round(item.value)}%</span>
            </div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill"
                style={{
                  width: `${item.value}%`,
                  backgroundColor: item.color,
                  animationDelay: `${i * 200}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Semantic Stats */}
      {semanticSimilarity && (
        <div className="semantic-stats">
          <div className="stat-item">
            <span className="stat-value" style={{ color: 'var(--success)' }}>
              {semanticSimilarity.matched_skills_count || 0}
            </span>
            <span className="stat-label">Skills Matched</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: 'var(--danger)' }}>
              {semanticSimilarity.missing_skills_count || 0}
            </span>
            <span className="stat-label">Skills Missing</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScoreGauge
