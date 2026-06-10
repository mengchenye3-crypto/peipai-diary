import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
/* 不引入默认 index.css，样式由 App.css 统一管理 */
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
