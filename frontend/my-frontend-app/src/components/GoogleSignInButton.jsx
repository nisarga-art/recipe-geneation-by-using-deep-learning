import React, { useEffect, useRef, useState } from "react";

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{display:'block'}}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function GoogleSignInButton({ onSuccess, onError, label = 'Continue with Google' }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const tokenClientRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    const initClient = () => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid profile email',
          callback: (resp) => handleTokenResponse(resp),
        });
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = () => {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'openid profile email',
            callback: (resp) => handleTokenResponse(resp),
          });
        }
      };
      document.head.appendChild(s);
    };

    initClient();
  }, [clientId]);

  const handleTokenResponse = async (resp) => {
    if (!resp) return;
    if (resp.error) {
      setLoading(false);
      onError && onError(resp);
      return;
    }
    const token = resp.access_token;
    if (!token) {
      setLoading(false);
      onError && onError(new Error('No access token received'));
      return;
    }

    try {
      const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error('Failed to fetch profile');
      const profile = await r.json();
      setLoading(false);
      onSuccess && onSuccess(profile);
    } catch (err) {
      setLoading(false);
      onError && onError(err);
    }
  };

  const handleClick = () => {
    if (!clientId) {
      onError && onError(new Error('Google Client ID not configured (VITE_GOOGLE_CLIENT_ID)'));
      return;
    }
    if (!tokenClientRef.current) {
      onError && onError(new Error('Google client not ready'));
      return;
    }
    setLoading(true);
    try {
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
    } catch (e) {
      setLoading(false);
      onError && onError(e);
    }
  };

  return (
    <button
      type="button"
      className="login-social google google-btn"
      onClick={handleClick}
      disabled={loading}
    >
      <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
        <GoogleLogo />
        <span style={{fontWeight:700}}>{loading ? 'Signing in...' : label}</span>
      </span>
    </button>
  );
}
