import { useState, useEffect } from 'react';
import DocumentSidebar from './DocumentSidebar';
import PDFViewer from './PDFViewer';
import DocumentEditor from './DocumentEditor';
import './DocumentWorkspace.css';

const DocumentWorkspace = () => {
  const [activeDocument, setActiveDocument] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState([]); // Real data only
  
  // Mobile responsive tabs
  const [activeTab, setActiveTab] = useState('preview'); // 'documents', 'preview', 'edit'

  useEffect(() => {
    // Fetch real documents on load
    fetch('http://localhost:3001/api/documents')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setDocuments(data);
          setActiveDocument(data[0]); // Select the most recent real doc
        } else {
          setDocuments([]);
          setActiveDocument(null);
        }
      })
      .catch(err => console.error("Failed to fetch documents:", err));
  }, []);

  // Editor State
  const [findText, setFindText] = useState('ABC Construction');
  const [replaceText, setReplaceText] = useState('');
  const [currentMatch, setCurrentMatch] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Search logic (debounced or triggered by button in a real app)
  useEffect(() => {
    if (!activeDocument || !activeDocument.id || !findText) {
      setTotalMatches(0);
      return;
    }
    
    // In a full implementation, we'd debounce this.
    // We'll call the search API here.
    const runSearch = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/documents/${activeDocument.id}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchText: findText })
        });
        if (res.ok) {
          const data = await res.json();
          setTotalMatches(data.total || 0);
          setCurrentMatch(1);
        }
      } catch (err) {
        console.error("Search failed:", err);
      }
    };
    
    // Delay search to simulate typing
    const timeout = setTimeout(runSearch, 500);
    return () => clearTimeout(timeout);
  }, [findText, activeDocument]);

  const handleSave = () => {
    alert('Changes saved successfully.');
  };

  const handleReplace = async (replaceAll = false) => {
    if (!activeDocument || !activeDocument.id || !findText || !replaceText) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:3001/api/documents/${activeDocument.id}/replace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          findText, 
          replaceText, 
          matchIndex: replaceAll ? null : currentMatch 
        })
      });
      
      if (res.ok) {
        const updatedDoc = await res.json();
        setActiveDocument(updatedDoc);
        
        // Update the document in the list
        setDocuments(docs => docs.map(d => d.id === updatedDoc.id ? updatedDoc : d));
        
        alert(`Text successfully replaced!`);
        setFindText('');
        setReplaceText('');
      } else {
        alert("Failed to replace text.");
      }
    } catch (err) {
      console.error(err);
      alert("Error calling replace API.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenameDocument = async (id, newName) => {
    try {
      const res = await fetch(`http://localhost:3001/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (res.ok) {
        const updatedDoc = await res.json();
        setDocuments(docs => docs.map(d => d.id === id ? updatedDoc : d));
        if (activeDocument && activeDocument.id === id) {
          setActiveDocument(updatedDoc);
        }
      }
    } catch (err) {
      console.error('Rename failed:', err);
    }
  };

  const handleAddText = async (x, y, page, text) => {
    if (!activeDocument || !activeDocument.id) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:3001/api/documents/${activeDocument.id}/add-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y, page, text })
      });
      
      if (res.ok) {
        const updatedDoc = await res.json();
        setActiveDocument(updatedDoc);
        setDocuments(docs => docs.map(d => d.id === updatedDoc.id ? updatedDoc : d));
        alert('Text successfully added!');
      } else {
        alert("Failed to add text.");
      }
    } catch (err) {
      console.error(err);
      alert("Error calling add-text API.");
    } finally {
      setIsProcessing(false);
    }
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
        setFindText={setFindText}
        onRenameDocument={handleRenameDocument}
        onAddText={handleAddText}
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
        onReplace={() => handleReplace(false)}
        onReplaceAll={() => handleReplace(true)}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default DocumentWorkspace;
