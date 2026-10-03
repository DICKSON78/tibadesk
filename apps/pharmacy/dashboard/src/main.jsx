import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/Toast'
import { BASE_PATH } from './utils/mount'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* The basename has to be told where the router actually lives, or every
        in-app link resolves back to the domain root and drops the user out of
        the application the moment they click anything. */}
    <BrowserRouter basename={BASE_PATH}>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
