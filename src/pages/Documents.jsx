import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Upload, X, FileText, MoreVertical } from 'lucide-react';
import { mockDocuments, mockCategories } from '../data/mockData';
import './Documents.css';

const Documents = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Check URL params for upload modal
  useEffect(() => {
    if (searchParams.get('upload') === 'true') {
      setIsUploadModalOpen(true);
      // clean up URL
      searchParams.delete('upload');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const filteredDocs = mockDocuments.filter(doc => {
    const matchesCategory = activeCategory === 'All' || doc.category === activeCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="documents-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">My Documents</h1>
          <p className="page-subtitle">All your saved tender-related documents in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)}>
          <Upload size={16} /> Upload Document
        </button>
      </header>

      <div className="controls-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="categories-filter">
          {mockCategories.map(cat => (
            <button
              key={cat}
              className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredDocs.length > 0 ? (
        <div className="table-container card">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Category</th>
                <th>Last Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div className="doc-name-cell">
                      <FileText size={18} className="doc-icon" />
                      <span className="doc-name">{doc.name}</span>
                    </div>
                  </td>
                  <td><span className="badge">{doc.category}</span></td>
                  <td><span className="text-muted">{doc.lastUpdated}</span></td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/editor?doc=${doc.id}`)}>Open</button>
                      <button className="btn-icon">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state card">
          <FileText size={48} className="empty-icon" />
          <h3>Your document library is empty.</h3>
          <p>Upload your first document to get started.</p>
          <button className="btn btn-primary" onClick={() => setIsUploadModalOpen(true)}>
            Upload Document
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>Upload Document</h2>
              <button className="close-btn" onClick={() => setIsUploadModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Document Name</label>
                <input type="text" className="form-input" placeholder="e.g., PAN Card" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input">
                  {mockCategories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">File</label>
                <div className="drop-zone">
                  <Upload size={32} className="drop-icon" />
                  <p><strong>Drag & drop your PDF here</strong></p>
                  <p className="text-muted">or</p>
                  <button className="btn btn-secondary">Browse files</button>
                  <p className="drop-support">Support: PDF</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                alert('Document uploaded successfully.');
                setIsUploadModalOpen(false);
              }}>Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
