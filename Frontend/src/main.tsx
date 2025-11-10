import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

createRoot(document.getElementById("root")!).render(
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
        <AuthProvider>
            <App />
        </AuthProvider>
    </GoogleReCaptchaProvider>
);