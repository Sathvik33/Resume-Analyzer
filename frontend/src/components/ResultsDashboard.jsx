import { useState } from 'react'
import ScoreGauge from './ScoreGauge'
import GapAnalysis from './GapAnalysis'
import NegativePoints from './NegativePoints'
import Improvements from './Improvements'
import OptimizedBullets from './OptimizedBullets'
import GeneratedCV from './GeneratedCV'
import './ResultsDashboard.css'

const API_BASE = 'http://localhost:8000'

function ResultsDashboard({ results, jdText, resumeText }) {
  const [activeTab, setActiveTab] = useState('score')
  const [cvMarkdown, setCvMarkdown] = useState('')
  const [isGeneratingCV, setIsGeneratingCV] = useState(false)

  const handleGenerateCV = async () => {
    setIsGeneratingCV(true)
    try {
      const response = await fetch(`${API_BASE}/api/generate-cv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jd_text: jdText,
          resume_text: resumeText,
          analysis_results: results,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'CV generation failed')
      }

      const data = await response.json()
      setCvMarkdown(data.cv_markdown)
    } catch (err) {
      alert('CV generation failed: ' + err.message)
    } finally {
      setIsGeneratingCV(false)
    }
  }

  const tabs = [
    { key: 'score', label: 'Score', icon: '📊' },
    { key: 'gaps', label: 'Gap Analysis', icon: '🔍' },
    { key: 'negatives', label: 'Weaknesses', icon: '⚠️' },
    { key: 'improve', label: 'Improvements', icon: '🚀' },
    { key: 'bullets', label: 'Optimized Bullets', icon: '✨' },
    { key: 'cv', label: 'Generate CV', icon: '📄' },
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
            <ScoreGauge
              score={results.match_score}
              scoreBreakdown={results.score_breakdown}
              semanticSimilarity={results.semantic_similarity}
            />
          )}

          {activeTab === 'gaps' && (
            <div className="tab-panel">
              <GapAnalysis
                gaps={results.gap_analysis}
                resumeAnalysis={results.resume_analysis}
              />
            </div>
          )}

          {activeTab === 'negatives' && (
            <div className="tab-panel">
              <NegativePoints
                negativePoints={results.negative_points}
                irrelevantSections={results.resume_analysis?.irrelevant_sections}
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

          {activeTab === 'cv' && (
            <div className="tab-panel">
              <GeneratedCV
                cvMarkdown={cvMarkdown}
                onGenerate={handleGenerateCV}
                isGenerating={isGeneratingCV}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResultsDashboard
