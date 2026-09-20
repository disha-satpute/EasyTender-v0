import { useState, useEffect } from 'react';
import DocumentSidebar from './DocumentSidebar';
import PDFViewer from './PDFViewer';
import DocumentEditor from './DocumentEditor';
import { mockDocuments } from '../../data/mockData';
import './DocumentWorkspace.css';

const DocumentWorkspace = () => {
  const [activeDocument, setActiveDocument] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState(mockDocuments); // Will replace with real data soon
  
  // Mobile responsive tabs
  const [activeTab, setActiveTab] = useState('preview'); // 'documents', 'preview', 'edit'

  useEffect(() => {
    // Fetch real documents on load
    fetch('http://localhost:3001/api/documents')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          // Combine real docs with mock docs (for now, until we fully migrate)
          setDocuments([...data, ...mockDocuments]);
          setActiveDocument(data[0]); // Select the most recent real doc
        } else {
          setActiveDocument(mockDocuments[2]);
        }
      })
      .catch(err => console.error("Failed to fetch documents:", err));
  }, []);

  // Editor State
  const [findText, setFindText] = useState('ABC Construction');
  const [replaceText, setReplaceText] = useState('');
  const [currentMatch, setCurrentMatch] = useState(1);
  const totalMatches = 3;

  const handleSave = () => {
    alert('Changes saved successfully.');
  };

  const handleSelectDocument = (doc) => {
    setActiveDocument(doc);
    if(window.innerWidth <= 992) setActiveTab('preview');
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const newDoc = await response.json();
      
      // Prepend the new real document to our list
      setDocuments(prev => [newDoc, ...prev]);
      setActiveDocument(newDoc);
      
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Is the backend running?');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="document-workspace">
      {/* Mobile Tabs */}
      <div className="workspace-mobile-tabs w-full">
        <button 
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
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

      <DocumentSidebar 
        documents={documents}
        activeTab={activeTab} 
        activeDocument={activeDocument} 
        onSelectDocument={handleSelectDocument}
        onUpload={handleUpload}
        isUploading={isUploading}
      />

      <PDFViewer 
        activeTab={activeTab} 
        activeDocument={activeDocument} 
        findText={findText} 
      />

      <DocumentEditor 
        activeTab={activeTab} 
        findText={findText} 
        setFindText={setFindText}
        replaceText={replaceText}
        setReplaceText={setReplaceText}
        currentMatch={currentMatch}
        setCurrentMatch={setCurrentMatch}
        totalMatches={totalMatches}
        onSave={handleSave}
      />
    </div>
  );
};

export default DocumentWorkspace;
