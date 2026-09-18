import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Editor from './pages/Editor';
import Profile from './pages/Profile';
import AppLayout from './layouts/AppLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* Authenticated Routes wrapped in AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      
      {/* Editor has its own special 3-panel layout, so it is outside AppLayout */}
      <Route path="/editor" element={<Editor />} />
    </Routes>
  );
}

export default App;
