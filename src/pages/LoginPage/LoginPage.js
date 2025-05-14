import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// If your logo is in clientapp/src/img/logo.png, you should import it like this:
// import logoImage from '../../img/logo.png'; 
// And then use <img src={logoImage} ... />
// If it's in clientapp/public/img/logo.png, the path in img tag should be "/img/logo.png"

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenAndNavigate = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('https://regulation.omnidoc.ma:5000/token/token', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.data.valid) {
            if (onLoginSuccess) {
              onLoginSuccess(token);
            }
            navigate('/main');
          }
        } catch (error) {
          console.error("Token check error on LoginPage mount:", error);
          localStorage.removeItem('token');
        }
      }
    };
    checkTokenAndNavigate();
  }, [navigate, onLoginSuccess]);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("https://regulation.omnidoc.ma:5000/auth/login", {
        email,
        mot_de_passe: password,
      });

      if (response.data.token) {
        const tokenParts = response.data.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const userRole = payload['rôle'] || payload['rÃ´le'] || payload['role'];

          if (userRole === 'admin' || userRole === 'assurance') {
            if (onLoginSuccess) {
              onLoginSuccess(response.data.token);
            }
            navigate("/main");
          } else {
            toast.error("Accès refusé : rôle invalide.");
          }
        } else {
          toast.error("Erreur de connexion : format du token invalide.");
        }
      } else {
        toast.error("Erreur de connexion : pas de token dans la réponse.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error('Erreur de connexion : email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="login-page">
      <ToastContainer position="top-right" autoClose={4000} />
      <div className="login-container">
        <div className="login-logo">
          {/* Ensure logo path is correct. 
              If logo.png is in clientapp/public/img/logo.png, use src="/img/logo.png" 
              If logo.png is in clientapp/src/img/logo.png, import it and use src={logoImageFromImport}
          */}
          <img src="../../img/logo.png" alt="Logo" className="logo-image" />
        </div>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage; 