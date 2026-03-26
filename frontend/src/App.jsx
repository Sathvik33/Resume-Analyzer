import { useState } from 'react'
import InputForm from './components/InputForm'
import ResultsDashboard from './components/ResultsDashboard'
import Loader from './components/Loader'
import './App.css'

const API_BASE = 'http://localhost:8000'

function App() {
  const [state, setState] = useState('input') // input | loading | results | error
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const handleAnalyze = async (jdText, resumeText) => {
    setState('loading')
    setError('')

    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_text: jdText, resume_text: resumeText }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'Analysis failed')
      }

      const data = await response.json()
      setResults(data)
      setState('results')
    } catch (err) {
      setError(err.message || 'Something went wrong. Is the backend running?')
      setState('error')
    }
  }

  const handleUploadPDF = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE}/api/upload-resume`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || 'PDF upload failed')
      }

      const data = await response.json()
      return data.text
    } catch (err) {
      throw new Error(err.message || 'Failed to process PDF')
    }
  }

  const handleReset = () => {
    setState('input')
    setResults(null)
    setError('')
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <span className="logo-text">ResumeAI</span>
          </div>
          {state === 'results' && (
            <button className="btn-secondary" onClick={handleReset}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              New Analysis
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {state === 'input' && (
          <InputForm onAnalyze={handleAnalyze} onUploadPDF={handleUploadPDF} />
        )}

        {state === 'loading' && <Loader />}

        {state === 'results' && results && (
          <ResultsDashboard results={results} />
        )}

        {state === 'error' && (
          <div className="error-container slide-up">
            <div className="error-card glass-card">
              <div className="error-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2>Analysis Failed</h2>
              <p className="error-message">{error}</p>
              <button className="btn-primary" onClick={handleReset}>
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Powered by <strong>Qwen 2.5</strong> via Ollama + LangChain</p>
      </footer>
    </div>
  )
}

export default App
