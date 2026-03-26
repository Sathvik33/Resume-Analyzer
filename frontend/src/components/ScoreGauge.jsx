import { useEffect, useState } from 'react'
import './ScoreGauge.css'

function ScoreGauge({ score, breakdown }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const progress = (animatedScore / 100) * circumference
  const offset = circumference - progress

  useEffect(() => {
    let frame
    let start = 0
    const duration = 1500
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const t = Math.min(elapsed / duration, 1)
      // Ease out cubic
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
    { label: 'Skill Match', weight: '40%', value: breakdown?.skill_match },
    { label: 'Experience', weight: '30%', value: breakdown?.experience_match },
    { label: 'Projects', weight: '20%', value: breakdown?.project_relevance },
    { label: 'ATS Keywords', weight: '10%', value: breakdown?.keyword_match },
  ]

  return (
    <div className="score-gauge-container">
      {/* Circular Gauge */}
      <div className="gauge-wrapper">
        <svg className="gauge-svg" width="200" height="200" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
          />
          {/* Progress circle */}
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

      {/* Breakdown Bars */}
      <div className="score-breakdown">
        {breakdownItems.map((item, i) => (
          <div key={i} className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">{item.label}</span>
              <span className="breakdown-weight">{item.weight}</span>
            </div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill"
                style={{
                  width: `${item.value || Math.round(score * (0.7 + Math.random() * 0.6))}%`,
                  backgroundColor: color,
                  animationDelay: `${i * 200}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScoreGauge
