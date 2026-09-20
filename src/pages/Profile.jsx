import { useState } from 'react';
import { mockUser } from '../data/mockData';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(mockUser);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Mock save
    setIsEditing(false);
    alert('Profile saved successfully.');
  };

  return (
    <div className="profile-page page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal details and tax information.</p>
        </div>
        {isEditing ? (
          <div className="header-actions">
            <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
          </div>
        ) : (
          <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>Edit Profile</button>
        )}
      </header>

      <div className="profile-content card">
        <div className="profile-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="fullName"
              className="form-input" 
              value={user.fullName} 
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              value={user.email} 
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input 
              type="tel" 
              name="mobile"
              className="form-input" 
              value={user.mobile} 
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label className="form-label">PAN</label>
            <input 
              type="text" 
              name="pan"
              className="form-input text-uppercase" 
              value={user.pan} 
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label className="form-label">GSTIN</label>
            <input 
              type="text" 
              name="gstin"
              className="form-input text-uppercase" 
              value={user.gstin} 
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Address</label>
            <textarea 
              name="address"
              className="form-input textarea" 
              value={user.address} 
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
