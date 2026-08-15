import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AdminPanel from './AdminPanel'
import QuotationView from './QuotationView'
import './index.css'
import { Toaster } from 'react-hot-toast'

const path = window.location.pathname;

// 🟢 1. ADMIN PROTECTION
if (path.startsWith('/admin')) {
  // Check if user is already authenticated in this session
  const isAuth = sessionStorage.getItem('admin_auth');
  
  if (isAuth === 'true') {
    // Already logged in, show the dashboard
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <Toaster position="top-center" />
        <AdminPanel />
      </React.StrictMode>,
    );
  } else {
    // Show a password prompt BEFORE loading the dashboard
    const password = window.prompt('🔒 Enter Admin Password:');
    
    if (password === 'RedDoorz2024') { // 🟢 Set your own password here!
      sessionStorage.setItem('admin_auth', 'true'); // Remember for this browser session
      window.location.reload(); // Reload to pass the check
    } else {
      alert('❌ Incorrect password. Redirecting to home.');
      window.location.href = '/';
    }
  }
} 
// 🟢 2. QUOTATION ROUTE
else if (path.startsWith('/quotation')) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Toaster position="top-center" />
      <QuotationView />
    </React.StrictMode>,
  )
} 
// 🟢 3. PUBLIC LANDING PAGE
else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Toaster position="top-center" />
      <App />
    </React.StrictMode>,
  )
}