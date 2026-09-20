import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Maximize, RotateCw } from 'lucide-react';

const PDFViewer = ({ activeTab, activeDocument, findText }) => {
  if (!activeDocument) return <div className={`workspace-panel workspace-center-panel ${activeTab === 'preview' ? 'mobile-active' : ''}`}>Loading...</div>;

  return (
    <div className={`workspace-panel workspace-center-panel ${activeTab === 'preview' ? 'mobile-active' : ''}`}>
      <div className="center-toolbar">
        <div className="toolbar-doc-name">
          <strong>{activeDocument.name}.pdf</strong>
        </div>
        <div className="toolbar-controls">
          <button className="toolbar-btn"><ZoomOut size={16} /></button>
          <span className="zoom-level">100%</span>
          <button className="toolbar-btn"><ZoomIn size={16} /></button>
          <div className="divider"></div>
          <button className="toolbar-btn"><ChevronLeft size={16} /></button>
          <span className="page-info">1 / 3</span>
          <button className="toolbar-btn"><ChevronRight size={16} /></button>
          <div className="divider"></div>
          <button className="toolbar-btn"><RotateCw size={16} /></button>
          <button className="toolbar-btn"><Maximize size={16} /></button>
          <button className="toolbar-btn" onClick={() => alert('PDF Downloaded')}><Download size={16} /></button>
        </div>
      </div>
      
      <div className="pdf-canvas-container" style={{ overflow: 'hidden' }}>
        {activeDocument.versions ? (
          <iframe 
            src={`http://localhost:3001/uploads/${activeDocument.versions[0].fileKey}`}
            width="100%" 
            height="100%" 
            style={{ border: 'none', backgroundColor: '#e2e8f0' }}
            title="PDF Preview"
          />
        ) : (
          <div className="pdf-mock-page">
            <div className="pdf-content">
              <h1 className="pdf-title">{activeDocument.name.toUpperCase()}</h1>
              
              <p className="pdf-paragraph">
                I, <span className={`pdf-highlight ${findText ? 'active-match' : ''}`}>{findText || 'ABC Construction'}</span>, hereby declare that the information provided 
                by <span className={`pdf-highlight ${findText ? '' : ''}`}>{findText || 'ABC Construction'}</span> in this document is true and correct to the best of my knowledge.
              </p>

              <p className="pdf-paragraph">
                This is to certify that <span className={`pdf-highlight ${findText ? '' : ''}`}>{findText || 'ABC Construction'}</span> has not been blacklisted by any Government department.
              </p>

              <p className="pdf-paragraph mt-8">
                For <span className={`pdf-highlight ${findText ? '' : ''}`}>{findText || 'ABC Construction'}</span>
              </p>
              
              <p className="pdf-paragraph mt-8">
                Authorized Signatory<br/><br/>
                Date: _________________<br/>
                Place: Pune
              </p>

              <div className="pdf-footer">
                Page 1 of 3
              </div>
            </div>
          </div>
        )}

        {/* Mock Thumbnails */}
        <div className="pdf-thumbnails">
          <div className="pdf-thumb active">
            1
          </div>
          <div className="pdf-thumb">
            2
          </div>
          <div className="pdf-thumb">
            3
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
