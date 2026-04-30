"use client";

import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CustomerAuthProvider } from "./contexts/CustomerAuthContext";
import { DashboardAuthProvider } from "./contexts/DashboardAuthContext";
import { CheckoutProvider } from "./contexts/CheckoutContext";

export default function LegacyAppShell() {
  return (
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
  );
}
