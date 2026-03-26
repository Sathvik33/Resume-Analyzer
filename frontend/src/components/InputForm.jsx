import { useState, useRef } from 'react'
import './InputForm.css'

function InputForm({ onAnalyze, onUploadPDF }) {
  const [jdText, setJdText] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (jdText.trim() && resumeText.trim()) {
      onAnalyze(jdText, resumeText)
    }
  }

  const handleFileChange = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file')
      return
    }

    setUploading(true)
    setFileName(file.name)

    try {
      const text = await onUploadPDF(file)
      setResumeText(text)
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileChange(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const isValid = jdText.trim().length > 20 && resumeText.trim().length > 20

  return (
    <div className="input-form-container slide-up">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          AI-Powered Analysis
        </div>
        <h1>
          Match Your Resume to
          <br />
          <span className="gradient-text">Any Job Description</span>
        </h1>
        <p className="hero-subtitle">
          Get an instant ATS compatibility score, gap analysis, and personalized optimization suggestions powered by Qwen 2.5
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="input-form">
        <div className="form-grid">
          {/* JD Input */}
          <div className="form-group glass-card">
            <div className="form-group-header">
              <div className="form-icon jd-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div>
                <h3>Job Description</h3>
                <span className="form-hint">Paste the full job posting</span>
              </div>
            </div>
            <textarea
              id="jd-input"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the complete job description here...&#10;&#10;Include responsibilities, requirements, qualifications, and preferred skills."
              rows={12}
              className="text-input"
            />
            <div className="char-count">{jdText.length} characters</div>
          </div>

          {/* Resume Input */}
          <div className="form-group glass-card">
            <div className="form-group-header">
              <div className="form-icon resume-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div>
                <h3>Resume Content</h3>
                <span className="form-hint">Paste text or upload PDF</span>
              </div>
            </div>

            {/* Upload Zone */}
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''} ${fileName ? 'has-file' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files[0])}
                hidden
              />
              {uploading ? (
                <div className="upload-loading">
                  <div className="upload-spinner"></div>
                  <span>Extracting text from PDF...</span>
                </div>
              ) : fileName ? (
                <div className="upload-success">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{fileName}</span>
                </div>
              ) : (
                <div className="upload-prompt">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Drop PDF here or click to upload</span>
                </div>
              )}
            </div>

            <div className="divider-text"><span>or paste text below</span></div>

            <textarea
              id="resume-input"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here...&#10;&#10;Include all sections: summary, experience, education, skills, projects, certifications."
              rows={12}
              className="text-input"
            />
            <div className="char-count">{resumeText.length} characters</div>
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary analyze-btn"
            disabled={!isValid}
            id="analyze-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Analyze Match
          </button>
          {!isValid && (
            <span className="validation-hint">Both fields need at least 20 characters</span>
          )}
        </div>
      </form>
    </div>
  )
}

export default InputForm
