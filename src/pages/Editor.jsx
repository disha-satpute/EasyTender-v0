import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FileCheck, 
  Search, 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Maximize,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { mockDocuments } from '../data/mockData';
import './Editor.css';

const Editor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const docId = searchParams.get('doc') || mockDocuments[0].id;
  const activeDocument = mockDocuments.find(d => d.id === docId) || mockDocuments[0];
  
  // Editor State
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [currentMatch, setCurrentMatch] = useState(1);
  const totalMatches = 4; // Mocked
  
  // Mobile responsive tabs
  const [activeTab, setActiveTab] = useState('preview'); // 'documents', 'preview', 'edit'

  const handleSave = () => {
    alert('Changes saved successfully.');
  };

  const handleDownload = () => {
    alert('PDF downloaded successfully.');
  };

  return (
    <div className="editor-layout">
      {/* Mobile Tabs */}
      <div className="editor-mobile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Library
        </button>
        <button 
          className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          Edit
        </button>
      </div>

      {/* LEFT PANEL - Documents */}
      <div className={`editor-panel left-panel ${activeTab === 'documents' ? 'mobile-active' : ''}`}>
        <div className="panel-header">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <h2>My Documents</h2>
        </div>
        
        <div className="panel-content">
          <div className="search-wrapper mb-4">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search..." className="search-input input-sm" />
          </div>

          <div className="document-list">
            {mockDocuments.map(doc => (
              <button 
                key={doc.id}
                className={`doc-list-item ${doc.id === activeDocument.id ? 'active' : ''}`}
                onClick={() => {
                  navigate(`/editor?doc=${doc.id}`);
                  if(window.innerWidth <= 768) setActiveTab('preview');
                }}
              >
                <FileText size={16} className="item-icon" />
                <span className="item-name">{doc.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel-footer">
          <button className="btn btn-secondary w-full" onClick={() => navigate('/documents?upload=true')}>
            <Plus size={16} /> Upload
          </button>
        </div>
      </div>

      {/* CENTER PANEL - PDF Preview */}
      <div className={`editor-panel center-panel ${activeTab === 'preview' ? 'mobile-active' : ''}`}>
        <div className="center-toolbar">
          <div className="toolbar-doc-name">
            <strong>{activeDocument.name}.pdf</strong>
          </div>
          <div className="toolbar-controls">
            <button className="toolbar-btn"><ZoomOut size={18} /></button>
            <span className="zoom-level">100%</span>
            <button className="toolbar-btn"><ZoomIn size={18} /></button>
            <div className="divider"></div>
            <button className="toolbar-btn"><ChevronLeft size={18} /></button>
            <span className="page-info">1 / 3</span>
            <button className="toolbar-btn"><ChevronRight size={18} /></button>
            <div className="divider"></div>
            <button className="toolbar-btn"><Maximize size={18} /></button>
            <button className="toolbar-btn" onClick={handleDownload}><Download size={18} /></button>
          </div>
        </div>
        
        <div className="pdf-canvas-container">
          <div className="pdf-mock-page">
            <div className="pdf-content">
              {/* Mock PDF content */}
              <h1 className="pdf-title">{activeDocument.name}</h1>
              <div className="pdf-line mt-6 w-full"></div>
              <div className="pdf-line w-full"></div>
              <div className="pdf-line w-3-4"></div>
              
              <div className="pdf-paragraph mt-8">
                <div className="pdf-line w-full"></div>
                <div className="pdf-line w-full"></div>
                <div className="pdf-line w-full">
                  <span className="pdf-highlight-marker">ABC Construction</span>
                </div>
                <div className="pdf-line w-1-2"></div>
              </div>

              <div className="pdf-paragraph mt-8">
                <div className="pdf-line w-full"></div>
                <div className="pdf-line w-full">
                  <span className="pdf-highlight-marker">ABC Construction</span>
                </div>
                <div className="pdf-line w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Find & Replace */}
      <div className={`editor-panel right-panel ${activeTab === 'edit' ? 'mobile-active' : ''}`}>
        <div className="panel-header">
          <h2>Edit Document</h2>
          <p className="panel-desc">Find text in your document and replace it.</p>
        </div>

        <div className="panel-content edit-form">
          {/* Find */}
          <div className="form-group">
            <label className="form-label">Find text</label>
            <div className="search-wrapper">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g., ABC Construction"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
              />
            </div>
            {findText && (
              <div className="match-info">
                <span className="match-count">{totalMatches} matches found</span>
                <div className="match-nav">
                  <span className="match-current">Match {currentMatch} of {totalMatches}</span>
                  <div className="match-nav-btns">
                    <button className="btn-icon-sm" onClick={() => setCurrentMatch(Math.max(1, currentMatch - 1))}><ChevronLeft size={16} /></button>
                    <button className="btn-icon-sm" onClick={() => setCurrentMatch(Math.min(totalMatches, currentMatch + 1))}><ChevronRight size={16} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Replace */}
          <div className="form-group mt-6">
            <label className="form-label">Replace with</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., XYZ Construction"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
            />
          </div>

          <div className="action-buttons mt-4">
            <button className="btn btn-secondary w-full">Replace All</button>
            <button className="btn btn-primary w-full">Replace</button>
          </div>

          <div className="save-actions mt-8">
            <button className="btn btn-primary w-full" onClick={handleSave}>Save Changes</button>
            <button className="btn btn-secondary w-full mt-2" onClick={handleDownload}><Download size={16} /> Download PDF</button>
          </div>

          {/* Version History */}
          <div className="version-history mt-8">
            <h3 className="history-title">Version History</h3>
            <div className="history-list">
              <div className="history-item current">
                <div className="history-info">
                  <span className="history-name">Current Version</span>
                  <span className="history-time">Just now</span>
                </div>
              </div>
              <div className="history-item">
                <div className="history-info">
                  <span className="history-name">v2</span>
                  <span className="history-time">12 Sep 2026</span>
                </div>
                <div className="history-actions">
                  <button className="btn-text">View</button>
                  <button className="btn-text">Restore</button>
                </div>
              </div>
              <div className="history-item">
                <div className="history-info">
                  <span className="history-name">v1</span>
                  <span className="history-time">02 Sep 2026</span>
                </div>
                <div className="history-actions">
                  <button className="btn-text">View</button>
                  <button className="btn-text">Restore</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
