// main.tsx
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = "878546422282-e76o734cnqu31sj79iivkt6qhnf6l7s0.apps.googleusercontent.com"
createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={CLIENT_ID}> 
    <App />
  </GoogleOAuthProvider>
);
