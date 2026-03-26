import { useState } from 'react'
import ScoreGauge from './ScoreGauge'
import GapAnalysis from './GapAnalysis'
import Improvements from './Improvements'
import OptimizedBullets from './OptimizedBullets'
import './ResultsDashboard.css'

function ResultsDashboard({ results }) {
  const [activeTab, setActiveTab] = useState('score')

  const tabs = [
    { key: 'score', label: 'Score', icon: '📊' },
    { key: 'gaps', label: 'Gap Analysis', icon: '🔍' },
    { key: 'improve', label: 'Improvements', icon: '🚀' },
    { key: 'bullets', label: 'Optimized Resume', icon: '✨' },
  ]

  return (
    <div className="results-dashboard slide-up">
      {/* Summary Card */}
      <div className="summary-card glass-card">
        <div className="summary-score-badge" data-score={results.match_score >= 70 ? 'good' : results.match_score >= 40 ? 'ok' : 'low'}>
          {results.match_score}
        </div>
        <div className="summary-content">
          <h2>Analysis Complete</h2>
          <p className="summary-text">{results.summary}</p>
        </div>
      </div>

      {/* JD Analysis Card */}
      <div className="jd-info glass-card">
        <h3 className="jd-info-title">Job Requirements</h3>
        <div className="jd-info-grid">
          <div className="jd-info-item">
            <span className="jd-info-label">Experience Level</span>
            <span className="jd-info-value">{results.jd_analysis?.experience_level || 'Not specified'}</span>
          </div>
          <div className="jd-info-item">
            <span className="jd-info-label">Required Skills</span>
            <span className="jd-info-value">{results.jd_analysis?.required_skills?.length || 0} identified</span>
          </div>
          <div className="jd-info-item">
            <span className="jd-info-label">Tools & Tech</span>
            <span className="jd-info-value">{results.jd_analysis?.tools_technologies?.length || 0} found</span>
          </div>
          <div className="jd-info-item">
            <span className="jd-info-label">Responsibilities</span>
            <span className="jd-info-value">{results.jd_analysis?.responsibilities?.length || 0} listed</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="tab-content glass-card">
          {activeTab === 'score' && (
            <ScoreGauge score={results.match_score} />
          )}

          {activeTab === 'gaps' && (
            <div className="tab-panel">
              <GapAnalysis
                gaps={results.gap_analysis}
                resumeAnalysis={results.resume_analysis}
              />
            </div>
          )}

          {activeTab === 'improve' && (
            <div className="tab-panel">
              <Improvements improvements={results.improvements} />
            </div>
          )}

          {activeTab === 'bullets' && (
            <div className="tab-panel">
              <OptimizedBullets
                bullets={results.optimized_bullets}
                templateSuggestions={results.template_suggestions}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultsDashboard
