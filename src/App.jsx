import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Documents from './pages/Documents';
import DocumentWorkspacePage from './pages/DocumentWorkspacePage';
import AppLayout from './layouts/AppLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* Authenticated Routes wrapped in AppLayout */}
      <Route element={<AppLayout />}>
        {/* Dashboard is now the core Document Workspace */}
        <Route path="/dashboard" element={<DocumentWorkspacePage />} />
        
        {/* Documents page is kept as it was in the past */}
        <Route path="/documents" element={<Documents />} />
        
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;
