import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = '878546422282-e76o734cnqu31sj79iivkt6qhnf6l7s0.apps.googleusercontent.com';

interface GoogleOAuthWrapperProps {
  children: React.ReactNode;
}

export const GoogleOAuthWrapper: React.FC<GoogleOAuthWrapperProps> = ({ children }) => {
  return (
    <GoogleOAuthProvider 
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={() => {
        console.error('Google OAuth script failed to load');
      }}
    >
      {children}
    </GoogleOAuthProvider>
  );
};

export default GoogleOAuthWrapper;