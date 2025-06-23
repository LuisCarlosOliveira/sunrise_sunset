// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

/**
 * Main entry point for the Sunrise Sunset application
 * This file bootstraps the React application and mounts it to the DOM
 */

// Create the root React element and render our application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)