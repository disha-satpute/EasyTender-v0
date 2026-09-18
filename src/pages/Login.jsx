import { Link, useNavigate } from 'react-router-dom';
import { FileCheck } from 'lucide-react';
import '../layouts/AuthLayout.css';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login, just navigate to dashboard
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
          <h1 className="auth-title">Welcome back</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input type="email" id="email" className="form-input" placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input type="password" id="password" className="form-input" placeholder="Enter your password" required />
            </div>
            
            <div className="password-options">
              <label className="remember-me">
                <input type="checkbox" className="checkbox" />
                Remember me
              </label>
              <Link to="#">Forgot password?</Link>
            </div>

            <div className="auth-actions">
              <button type="submit" className="btn btn-primary">Login</button>
            </div>
          </form>

          <div className="auth-links">
            Don't have an account? <Link to="/signup">Create one</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
