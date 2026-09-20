import { Search, ChevronLeft, ChevronRight, Download, Save, Trash2, Info } from 'lucide-react';

const DocumentEditor = ({ 
  activeTab, 
  findText, 
  setFindText, 
  replaceText, 
  setReplaceText,
  currentMatch,
  setCurrentMatch,
  totalMatches,
  onSave
}) => {
  return (
    <div className={`workspace-panel workspace-right-panel ${activeTab === 'edit' ? 'mobile-active' : ''}`}>
      <div className="panel-header">
        <h2>Edit Document</h2>
        <p className="panel-desc">Find text in your document and replace it.</p>
      </div>

      <div className="panel-content">
        {/* Find */}
        <div className="form-group mb-4">
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
            <div className="match-info-box">
              <Info size={16} />
              <span>{totalMatches} matches found for "{findText}"</span>
            </div>
          )}
          
          {findText && (
            <div className="match-nav">
              <span className="match-current">Match {currentMatch} of {totalMatches}</span>
              <div className="action-buttons">
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setCurrentMatch(Math.max(1, currentMatch - 1))}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setCurrentMatch(Math.min(totalMatches, currentMatch + 1))}
                >
                  Next <ChevronRight size={16} />
                </button>
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
          <button className="btn btn-primary w-full">Replace</button>
          <button className="btn btn-secondary w-full">Replace All</button>
        </div>

        <div className="save-actions mt-8">
          <button className="btn btn-primary w-full" onClick={onSave}>
            <Save size={16} /> Save Changes
          </button>
          <button className="btn btn-secondary w-full" onClick={() => alert('PDF Downloaded')}>
            <Download size={16} /> Download PDF
          </button>
        </div>

        {/* Version History */}
        <div className="version-history mt-8">
          <h3 className="history-title">Version History</h3>
          <div className="history-list">
            <div className="history-item current">
              <div>
                <span className="history-name">v3</span>
                <span className="history-time ml-2">Just now</span>
              </div>
              <span className="history-badge">Current</span>
            </div>
            <div className="history-item">
              <div>
                <span className="history-name">v2</span>
                <span className="history-time ml-2">12 Sep 2026</span>
              </div>
              <div className="history-actions">
                <button className="btn-text">View</button>
                <button className="btn-text">Restore</button>
              </div>
            </div>
            <div className="history-item">
              <div>
                <span className="history-name">v1</span>
                <span className="history-time ml-2">02 Sep 2026</span>
              </div>
              <div className="history-actions">
                <button className="btn-text">View</button>
                <button className="btn-text">Restore</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="panel-footer">
        <button className="btn btn-danger-outline w-full" onClick={() => alert('Changes reset')}>
          <Trash2 size={16} /> Reset Changes
        </button>
      </div>
    </div>
  );
};

export default DocumentEditor;
