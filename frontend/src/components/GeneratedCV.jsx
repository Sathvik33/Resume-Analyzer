import { useState } from 'react'
import './GeneratedCV.css'

function GeneratedCV({ cvMarkdown, onGenerate, isGenerating }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cvMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadAsFile = () => {
    const blob = new Blob([cvMarkdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'optimized_resume.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Simple markdown to HTML renderer
  const renderMarkdown = (md) => {
    if (!md) return ''
    let html = md
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr/>')
      // Bullet points
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Wrap consecutive <li> in <ul>
      .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
      // Line breaks
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
    return html
  }

  if (!cvMarkdown && !isGenerating) {
    return (
      <div className="cv-empty">
        <div className="cv-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
        <h3>Generate Your Optimized CV</h3>
        <p className="cv-empty-desc">
          Based on the analysis, AI will rewrite your resume with stronger bullet points,
          updated skills from the JD, and ATS-optimized formatting.
        </p>
        <button className="btn-primary generate-btn" onClick={onGenerate}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Generate Optimized CV
        </button>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="cv-generating">
        <div className="cv-gen-animation">
          <div className="gen-ring"></div>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h3>Generating Your Optimized CV...</h3>
        <p>AI is rewriting your resume with stronger impact — this may take a minute</p>
        <div className="gen-progress">
          <div className="gen-progress-fill"></div>
        </div>
      </div>
    )
  }

  const downloadAsPDF = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/download-cv-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_markdown: cvMarkdown }),
      })

      if (!response.ok) {
        throw new Error('PDF generation failed')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'optimized_resume.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('PDF download failed: ' + err.message)
    }
  }

  return (
    <div className="cv-generated">
      {/* Actions Bar */}
      <div className="cv-actions">
        <button className="btn-primary download-pdf-btn" onClick={downloadAsPDF}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Download PDF
        </button>
        <button className="btn-secondary" onClick={copyToClipboard}>
          {copied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy Markdown
            </>
          )}
        </button>
        <button className="btn-secondary" onClick={downloadAsFile}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download .md
        </button>
        <button className="btn-secondary" onClick={onGenerate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Regenerate
        </button>
      </div>

      {/* Rendered CV */}
      <div className="cv-preview glass-card">
        <div
          className="cv-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(cvMarkdown) }}
        />
      </div>

      {/* Raw Markdown Toggle */}
      <details className="cv-raw-toggle">
        <summary>View Raw Markdown</summary>
        <pre className="cv-raw">{cvMarkdown}</pre>
      </details>
    </div>
  )
}

export default GeneratedCV
