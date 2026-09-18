import { Link } from 'react-router-dom';
import { FileCheck, Shield, FileText, Search, Clock, FolderOpen } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container header-container">
          <div className="logo">
            <FileCheck size={28} className="logo-icon" />
            <span className="logo-text">EasyTender</span>
          </div>
          <nav className="header-nav">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#security">Security</a>
          </nav>
          <div className="header-actions">
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Prepare your tender documents faster.</h1>
            <p className="hero-subtitle">
              Store, edit, reuse, preview and download your frequently used tender documents — all in one secure workspace.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-lg">Get Started</Link>
              <Link to="/login" className="btn btn-secondary btn-lg">Login</Link>
            </div>
          </div>
          <div className="hero-visual">
            {/* Minimal document-management visual representation */}
            <div className="mock-document-stack">
              <div className="mock-doc doc-back"></div>
              <div className="mock-doc doc-middle"></div>
              <div className="mock-doc doc-front">
                <div className="doc-header">
                  <div className="doc-line w-half"></div>
                </div>
                <div className="doc-body">
                  <div className="doc-line"></div>
                  <div className="doc-line"></div>
                  <div className="doc-line w-third"></div>
                  <div className="doc-highlight">
                    <span className="highlight-text">Find & Replace Active</span>
                  </div>
                  <div className="doc-line mt-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <h2 className="section-title text-center">How it works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3 className="step-title">Upload</h3>
              <p className="step-desc">Keep frequently used documents in one place.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3 className="step-title">Edit</h3>
              <p className="step-desc">Quickly find and replace repetitive information.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h3 className="step-title">Download</h3>
              <p className="step-desc">Preview and download the final document.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FolderOpen className="feature-icon" size={32} />
              <h3>Secure Document Storage</h3>
              <p>Keep your documents organized in a private workspace.</p>
            </div>
            <div className="feature-card">
              <Search className="feature-icon" size={32} />
              <h3>Fast Find & Replace</h3>
              <p>Quickly update repetitive text.</p>
            </div>
            <div className="feature-card">
              <FileText className="feature-icon" size={32} />
              <h3>PDF Preview</h3>
              <p>Review documents before downloading.</p>
            </div>
            <div className="feature-card">
              <Clock className="feature-icon" size={32} />
              <h3>Version History</h3>
              <p>Keep previous document versions.</p>
            </div>
            <div className="feature-card">
              <FileCheck className="feature-icon" size={32} />
              <h3>Organized Library</h3>
              <p>Find documents quickly using search and categories.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="security-section">
        <div className="container security-container">
          <Shield className="security-icon" size={64} />
          <h2>Your documents are private.</h2>
          <p>
            We prioritize your data privacy. Documents are stored securely and only accessible by you. We use standard encryption protocols to ensure your business documents remain confidential.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <div className="logo">
              <FileCheck size={24} className="logo-icon" />
              <span className="logo-text">EasyTender</span>
            </div>
            <p className="footer-tagline">Your tender document workspace.</p>
          </div>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="container">
          <div className="footer-disclaimer">
            <p>Disclaimer: EasyTender is an independent document preparation tool and is not affiliated with any government eProcurement portal.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
