import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AdminPanel from './AdminPanel'
import QuotationView from './QuotationView'
import './index.css'
import { Toaster } from 'react-hot-toast' // 🟢 Import Toaster

const path = window.location.pathname;

if (path.startsWith('/admin')) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Toaster position="top-center" /> {/* 🟢 Add this */}
      <AdminPanel />
    </React.StrictMode>,
  )
} else if (path.startsWith('/quotation')) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Toaster position="top-center" /> {/* 🟢 Add this */}
      <QuotationView />
    </React.StrictMode>,
  )
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Toaster position="top-center" /> {/* 🟢 Add this */}
      <App />
    </React.StrictMode>,
  )
}