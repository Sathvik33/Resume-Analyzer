import './Loader.css'

function Loader() {
  const steps = [
    'Reading Job Description...',
    'Analyzing Resume Content...',
    'Matching Skills & Keywords...',
    'Evaluating Experience Fit...',
    'Generating Gap Analysis...',
    'Crafting Improvement Suggestions...',
    'Building Optimized Bullets...',
  ]

  return (
    <div className="loader-container fade-in">
      <div className="loader-card glass-card">
        {/* Brain Animation */}
        <div className="loader-visual">
          <div className="brain-pulse">
            <div className="brain-ring ring-1"></div>
            <div className="brain-ring ring-2"></div>
            <div className="brain-ring ring-3"></div>
            <div className="brain-core">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.5 2.1-1.2 2.8A5.97 5.97 0 0 1 18 14c0 3.3-2.7 6-6 6s-6-2.7-6-6c0-2.2 1.2-4.1 3-5.2A4.007 4.007 0 0 1 8 6a4 4 0 0 1 4-4z" />
                <path d="M12 10v8" />
                <path d="M9 13h6" />
              </svg>
            </div>
          </div>
        </div>

        <h2 className="loader-title">Analyzing Your Resume</h2>
        <p className="loader-subtitle">This may take a minute — AI is deeply processing your content</p>

        {/* Step Indicators */}
        <div className="loader-steps">
          {steps.map((step, i) => (
            <div
              key={i}
              className="loader-step"
              style={{ animationDelay: `${i * 2}s` }}
            >
              <div className="step-indicator">
                <div className="step-dot"></div>
              </div>
              <span>{step}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="loader-progress">
          <div className="loader-progress-fill"></div>
        </div>
      </div>
    </div>
  )
}

export default Loader
