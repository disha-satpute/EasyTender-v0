import { Link, useNavigate } from 'react-router-dom';
import { FileCheck } from 'lucide-react';
import '../layouts/AuthLayout.css';

const SignUp = () => {
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    // Mock signup, just navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="auth-layout">
      <header className="auth-header">
        <Link to="/" className="logo">
          <FileCheck size={32} className="logo-icon" />
          <span className="logo-text">EasyTender</span>
        </Link>
      </header>
      <main className="auth-content">
        <div className="auth-card">
          <h1 className="auth-title">Create your EasyTender account</h1>
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullname">Full Name</label>
              <input type="text" id="fullname" className="form-input" placeholder="Enter your full name" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input type="email" id="email" className="form-input" placeholder="Enter your email address" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="mobile">Mobile Number</label>
              <input type="tel" id="mobile" className="form-input" placeholder="Enter your mobile number" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input type="password" id="password" className="form-input" placeholder="Create a password" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" className="form-input" placeholder="Confirm your password" required />
            </div>

            <div className="auth-actions">
              <button type="submit" className="btn btn-primary">Create Account</button>
            </div>
          </form>

          <div className="auth-links">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
