import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { CustomerAuthProvider } from './contexts/CustomerAuthContext';
import { DashboardAuthProvider } from './contexts/DashboardAuthContext';
import { CheckoutProvider } from './contexts/CheckoutContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CustomerAuthProvider>
          <DashboardAuthProvider>
            <CheckoutProvider>
              <App />
            </CheckoutProvider>
          </DashboardAuthProvider>
        </CustomerAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
