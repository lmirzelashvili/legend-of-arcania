import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './services/error-logger'; // Auto-captures all browser errors
import { SolanaProvider } from './providers/SolanaProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SolanaProvider>
      <App />
    </SolanaProvider>
  </React.StrictMode>
);
