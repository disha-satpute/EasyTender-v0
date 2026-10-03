import { useState } from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Maximize, RotateCw, Type } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker for react-pdf (Vite compatible)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PDFViewer = ({ activeTab, activeDocument, findText, onRenameDocument, setFindText, onAddText }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [isAddTextMode, setIsAddTextMode] = useState(false);
  const [addTextPopup, setAddTextPopup] = useState(null); // {x, y, page, screenX, screenY}
  const [newTextValue, setNewTextValue] = useState('');

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleTextSelection = () => {
    if (isAddTextMode) return;
    const selection = window.getSelection().toString().trim();
    if (selection && setFindText) {
      setFindText(selection);
    }
  };

  const handlePageClick = (e, pageIndex) => {
    if (!isAddTextMode) return;
    
    // Calculate coordinates relative to the page
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setAddTextPopup({
      x, 
      y, 
      page: pageIndex + 1,
      screenX: e.clientX,
      screenY: e.clientY
    });
    setNewTextValue('');
  };

  const submitAddText = () => {
    if (newTextValue.trim() && addTextPopup) {
      onAddText(addTextPopup.x, addTextPopup.y, addTextPopup.page, newTextValue.trim());
    }
    setAddTextPopup(null);
    setIsAddTextMode(false);
  };

  const cancelAddText = () => {
    setAddTextPopup(null);
  };

  if (!activeDocument) return <div className={`workspace-panel workspace-center-panel ${activeTab === 'preview' ? 'mobile-active' : ''}`}>Loading...</div>;

  const handleNameClick = () => {
    setEditName(activeDocument.name);
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    setIsEditingName(false);
    if (editName.trim() && editName !== activeDocument.name) {
      onRenameDocument(activeDocument.id, editName.trim());
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') setIsEditingName(false);
  };

  return (
    <div className={`workspace-panel workspace-center-panel ${activeTab === 'preview' ? 'mobile-active' : ''}`}>
      <div className="center-toolbar">
        <div className="toolbar-doc-name" style={{ display: 'flex', alignItems: 'center' }}>
          {isEditingName ? (
            <input 
              autoFocus
              className="form-input input-sm"
              style={{ width: '250px' }}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
            />
          ) : (
            <strong 
              style={{ cursor: 'pointer', borderBottom: '1px dashed #cbd5e1', paddingBottom: '2px' }} 
              onClick={handleNameClick}
              title="Click to rename"
            >
              {activeDocument.name}
            </strong>
          )}
        </div>
        <div className="toolbar-controls">
          <button 
            className={`toolbar-btn ${isAddTextMode ? 'active-mode text-primary' : ''}`} 
            onClick={() => setIsAddTextMode(!isAddTextMode)}
            title="Add Text Anywhere"
            style={isAddTextMode ? { backgroundColor: '#e0e7ff', border: '1px solid #4f46e5', borderRadius: '4px' } : {}}
          >
            <Type size={16} />
          </button>
          <div className="divider"></div>
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
          <div className="pdf-react-wrapper" style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#e2e8f0', padding: '20px' }} onMouseUp={handleTextSelection}>
            <Document
              file={`http://localhost:3001/uploads/${activeDocument.versions[0].fileKey}`}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div style={{ padding: '20px' }}>Loading PDF...</div>}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page 
                  key={`page_${index + 1}`} 
                  pageNumber={index + 1} 
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                  className="mb-4 shadow-lg"
                  onClick={(e) => handlePageClick(e, index)}
                  style={{ cursor: isAddTextMode ? 'crosshair' : 'auto' }}
                />
              ))}
            </Document>
            
            {addTextPopup && (
              <div style={{
                position: 'fixed',
                left: addTextPopup.screenX,
                top: addTextPopup.screenY,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                padding: '8px',
                borderRadius: '4px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 1000,
                display: 'flex',
                gap: '8px'
              }}>
                <input 
                  autoFocus
                  type="text" 
                  className="form-input input-sm" 
                  placeholder="Enter text..." 
                  value={newTextValue}
                  onChange={e => setNewTextValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') submitAddText();
                    if (e.key === 'Escape') cancelAddText();
                  }}
                />
                <button className="btn btn-primary btn-sm" onClick={submitAddText}>Add</button>
                <button className="btn btn-secondary btn-sm" onClick={cancelAddText}>Cancel</button>
              </div>
            )}
          </div>
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
