import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { I18nextProvider } from 'react-i18next';
import i18n from './integrations/i18n.ts'; // Import the i18n configuration

createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
);