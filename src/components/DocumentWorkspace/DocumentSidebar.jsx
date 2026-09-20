import { Search, Plus, FileText, MoreVertical } from 'lucide-react';
import { mockDocuments } from '../../data/mockData';

import { useRef } from 'react';

const DocumentSidebar = ({ documents, activeTab, activeDocument, onSelectDocument, onUpload, isUploading }) => {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
      e.target.value = null; // reset
    }
  };

  return (
    <div className={`workspace-panel workspace-left-panel ${activeTab === 'documents' ? 'mobile-active' : ''}`}>
      <div className="panel-header">
        <h2>My Documents</h2>
      </div>
      
      <div className="panel-content">
        <div className="search-wrapper mb-4">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search documents..." className="search-input input-sm" />
        </div>

        <div className="document-list">
          {documents && documents.map(doc => (
            <div 
              key={doc.id}
              className={`doc-list-item ${activeDocument && doc.id === activeDocument.id ? 'active' : ''}`}
              onClick={() => onSelectDocument(doc)}
              style={{ cursor: 'pointer' }}
            >
              <FileText size={18} className="item-icon" />
              <div className="item-details">
                <span className="item-name">{doc.name}</span>
                <span className="item-meta">{doc.category || 'Uploaded Document'}</span>
              </div>
              <button 
                className="item-actions" 
                onClick={(e) => { e.stopPropagation(); }}
                aria-label="More actions"
              >
                <MoreVertical size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-footer">
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <button 
          className="btn btn-secondary w-full" 
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <Plus size={16} /> {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </div>
  );
};

export default DocumentSidebar;
