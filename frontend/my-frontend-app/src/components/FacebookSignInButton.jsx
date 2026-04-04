import React, { useEffect, useRef, useState } from 'react';

const FBLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{display:'block'}}>
    <path fill="#1877F2" d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708V30.938h-6.094V24h6.094v-5.288c0-6.013 3.579-9.338 9.065-9.338 2.625 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.911 1.85-3.911 3.75V24h6.656l-1.064 6.938H27.75v16.77C39.224 45.908 48 35.979 48 24z"/>
  </svg>
);

export default function FacebookSignInButton({ onSuccess, onError, label = 'Continue with Facebook' }) {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID || '';
  const [loading, setLoading] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!appId) return;
    if (window.FB) {
      loadedRef.current = true;
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://connect.facebook.net/en_US/sdk.js';
    s.async = true;
    s.defer = true;
    s.onload = () => {
      if (window.FB) {
        window.FB.init({
          appId: appId,
          cookie: true,
          xfbml: false,
          version: 'v16.0',
        });
        loadedRef.current = true;
      }
    };
    document.head.appendChild(s);
    return () => {
      // no-op cleanup
    };
  }, [appId]);

  const handleResponse = (response) => {
    if (!response) {
      setLoading(false);
      onError && onError(new Error('No response from Facebook'));
      return;
    }
    if (response.status !== 'connected') {
      setLoading(false);
      onError && onError(new Error('Facebook login cancelled or not authorized'));
      return;
    }
    const { accessToken } = response.authResponse || {};
    if (!accessToken) {
      setLoading(false);
      onError && onError(new Error('No access token from Facebook'));
      return;
    }
    // Fetch profile
    window.FB.api('/me', { fields: 'name,email,picture' }, (profile) => {
      setLoading(false);
      if (!profile || profile.error) {
        onError && onError(profile && profile.error ? profile.error : new Error('Failed to fetch Facebook profile'));
        return;
      }
      const result = {
        name: profile.name,
        email: profile.email,
        picture: profile.picture && profile.picture.data && profile.picture.data.url,
        accessToken,
        provider: 'facebook',
      };
      onSuccess && onSuccess(result);
    });
  };

  const handleClick = () => {
    if (!appId) {
      onError && onError(new Error('Facebook App ID not configured (VITE_FACEBOOK_APP_ID)'));
      return;
    }
    if (!loadedRef.current || !window.FB) {
      onError && onError(new Error('Facebook SDK not loaded yet'));
      return;
    }
    setLoading(true);
    try {
      window.FB.login(handleResponse, { scope: 'public_profile,email', return_scopes: true });
    } catch (err) {
      setLoading(false);
      onError && onError(err);
    }
  };

  return (
    <button
      type="button"
      className="login-social facebook"
      onClick={handleClick}
      disabled={loading}
    >
      <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
        <FBLogo />
        <span style={{fontWeight:700}}>{loading ? 'Signing in...' : label}</span>
      </span>
    </button>
  );
}
