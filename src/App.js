import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage/LoginPage';
import MainPage from './pages/MainPage/MainPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // To prevent premature rendering/redirects

  // Check token on initial load and set up listener for storage changes (e.g., logout)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you might want to validate this token with the backend here
      // For now, simply having a token means authenticated
      setIsAuthenticated(true);
    }
    setIsLoading(false); // Finished initial auth check

    const handleStorageChange = (event) => {
      // Listen for when the token is removed (logout) or added by another tab
      if (event.key === 'token') {
        setIsAuthenticated(!!localStorage.getItem('token'));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to be called by LoginPage on successful login
  const handleLoginSuccess = useCallback((token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    // Navigation will be handled by LoginPage after this state update
  }, []);

  const handleLogout = useCallback(() => { // Added a logout handler for completeness, MainPage can use this
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    // Navigation to /login will happen due to route protection
  }, []);


  if (isLoading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/main" /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/main"
          element={isAuthenticated ? <MainPage onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/main" : "/login"} />} /> 
      </Routes>
    </Router>
  );
}

export default App;
