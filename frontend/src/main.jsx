import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'  // ✅ important!
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>        {/* ✅ this makes <Link> and routing work */}
    <StrictMode>
      <App />
    </StrictMode>
  </BrowserRouter>
)