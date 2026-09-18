import { Link, useNavigate } from 'react-router-dom';
import { FileText, Folder, Clock, MoreVertical, Search } from 'lucide-react';
import { mockDocuments } from '../data/mockData';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const recentDocs = mockDocuments.slice(0, 4);

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Manage and prepare your documents from one place.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/documents?upload=true')}>
          + Upload Document
        </button>
      </header>

      {/* Overview Stats */}
      <section className="overview-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue">
            <FileText size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Documents</span>
            <span className="stat-value">12</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-orange">
            <Clock size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Recently Edited</span>
            <span className="stat-value">4</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-light-blue">
            <Folder size={24} className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Categories</span>
            <span className="stat-value">6</span>
          </div>
        </div>
      </section>

      {/* My Documents Preview */}
      <section className="recent-documents">
        <div className="section-header">
          <h2 className="section-title">My Documents</h2>
          <Link to="/documents" className="view-all-link">View all</Link>
        </div>

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
              {recentDocs.map(doc => (
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
      </section>
    </div>
  );
};

export default Dashboard;
