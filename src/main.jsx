import React from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer'
import App from './App.jsx'
import './index.css'

// Midnight's indexer dependencies use Node's global Buffer API. Expose the
// browser-compatible implementation before any wallet operation is loaded.
if (!globalThis.Buffer) globalThis.Buffer = Buffer

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
