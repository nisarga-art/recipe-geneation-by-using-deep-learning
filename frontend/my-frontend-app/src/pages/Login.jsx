import React, { useRef, useState } from "react";
import "../App.css";
import { useNavigate, Link } from "react-router-dom";

const PARTICLES = [
  { emoji: "🍕", top: "8%",  left: "5%",  delay: "0s",   dur: "7s",  size: "2.2rem" },
  { emoji: "🍜", top: "15%", left: "88%", delay: "1.2s", dur: "9s",  size: "1.8rem" },
  { emoji: "🥗", top: "30%", left: "3%",  delay: "2s",   dur: "8s",  size: "2rem"   },
  { emoji: "🍣", top: "55%", left: "92%", delay: "0.5s", dur: "10s", size: "1.9rem" },
  { emoji: "🥘", top: "70%", left: "7%",  delay: "3s",   dur: "7.5s",size: "2.1rem" },
  { emoji: "🍰", top: "82%", left: "85%", delay: "1.8s", dur: "8.5s",size: "2rem"   },
  { emoji: "🍛", top: "90%", left: "40%", delay: "2.5s", dur: "9.5s",size: "1.7rem" },
  { emoji: "🫕", top: "20%", left: "50%", delay: "4s",   dur: "6.5s",size: "1.6rem" },
  { emoji: "🥩", top: "45%", left: "75%", delay: "0.8s", dur: "11s", size: "2rem"   },
  { emoji: "🌮", top: "65%", left: "22%", delay: "3.5s", dur: "8s",  size: "2.2rem" },
  { emoji: "🥐", top: "10%", left: "65%", delay: "1s",   dur: "7s",  size: "1.8rem" },
  { emoji: "🍱", top: "78%", left: "55%", delay: "2.2s", dur: "9s",  size: "2rem"   },
];

const GOOGLE_ACCOUNTS = [
  { name: "Alex Johnson",  email: "alex.johnson@gmail.com",  avatar: "AJ", color: "#4285F4" },
  { name: "Priya Sharma",  email: "priya.sharma@gmail.com",  avatar: "PS", color: "#EA4335" },
  { name: "Sam Williams",  email: "sam.williams@gmail.com",  avatar: "SW", color: "#34A853" },
];

const FACEBOOK_ACCOUNTS = [
  { name: "Jordan Lee",    email: "jordan.lee@facebook.com", avatar: "JL", color: "#1877F2" },
  { name: "Casey Morgan",  email: "casey.morgan@fb.com",     avatar: "CM", color: "#42B72A" },
];

const GoogleLogoSVG = () => (
  <svg width="22" height="22" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const FacebookLogoSVG = () => (
  <svg width="22" height="22" viewBox="0 0 48 48">
    <path fill="#1877F2" d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708V30.938h-6.094V24h6.094v-5.288c0-6.013 3.579-9.338 9.065-9.338 2.625 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.911 1.85-3.911 3.75V24h6.656l-1.064 6.938H27.75v16.77C39.224 45.908 48 35.979 48 24z"/>
    <path fill="#fff" d="M33.342 30.938l1.064-6.938H27.75v-4.5c0-1.9.93-3.75 3.911-3.75h3.026v-5.906s-2.747-.469-5.372-.469c-5.486 0-9.065 3.325-9.065 9.338V24h-6.094v6.938h6.094V47.708a24.21 24.21 0 007.5 0V30.938h5.592z"/>
  </svg>
);

function SocialModal({ provider, accounts, onSelect, onClose, onCreateAccount }) {
  const isGoogle = provider === "google";
  return (
    <div className="social-modal-overlay" onClick={onClose}>
      <div className="social-modal" onClick={(e) => e.stopPropagation()}>
        <div className="social-modal-header">
          {isGoogle ? <GoogleLogoSVG /> : <FacebookLogoSVG />}
          <div>
            <h3>Continue with {isGoogle ? "Google" : "Facebook"}</h3>
            <p>Choose an account to sign in to RecipeDiscover</p>
          </div>
          <button className="social-modal-close" onClick={onClose}>✕</button>
        </div>
        <ul className="social-account-list">
          {accounts.map((acc) => (
            <li key={acc.email} className="social-account-item" onClick={() => onSelect(acc)}>
              <span className="social-account-avatar" style={{ background: acc.color }}>{acc.avatar}</span>
              <div className="social-account-info">
                <span className="social-account-name">{acc.name}</span>
                <span className="social-account-email">{acc.email}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </li>
          ))}
          <li className="social-account-item social-add-account" onClick={onCreateAccount}>
            <span className="social-account-avatar" style={{ background: "#e5e7eb", color: "#6b7280" }}>+</span>
            <div className="social-account-info">
              <span className="social-account-name">Use another account / Create new</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </li>
        </ul>
        <p className="social-modal-footer">
          To continue, {isGoogle ? "Google" : "Facebook"} will share your name, email address, and profile picture with RecipeDiscover.
        </p>
      </div>
    </div>
  );
}

function SignUpModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please enter your full name.");
    if (!form.email.trim()) return setError("Please enter your email.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    // Save account to localStorage
    const accounts = JSON.parse(localStorage.getItem("rd_accounts") || "[]");
    if (accounts.find((a) => a.email === form.email)) return setError("An account with this email already exists.");
    accounts.push({ name: form.name.trim(), email: form.email.trim() });
    localStorage.setItem("rd_accounts", JSON.stringify(accounts));
    localStorage.setItem("user_email", form.email.trim());
    localStorage.setItem("user_name", form.name.trim());
    setDone(true);
    setTimeout(() => onSuccess(), 1200);
  };

  return (
    <div className="social-modal-overlay" onClick={onClose}>
      <div className="social-modal signup-modal" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="signup-success">
            <div className="signup-success-icon">🎉</div>
            <h3>Account Created!</h3>
            <p>Welcome to RecipeDiscover. Taking you in…</p>
          </div>
        ) : (
          <>
            <div className="social-modal-header">
              <div className="signup-modal-logo">🍳</div>
              <div>
                <h3>Create your account</h3>
                <p>Join RecipeDiscover for free</p>
              </div>
              <button className="social-modal-close" onClick={onClose}>✕</button>
            </div>
            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="signup-field">
                <label>Full Name</label>
                <div className="signup-input-wrap">
                  <span>👤</span>
                  <input name="name" type="text" placeholder="you" value={form.name} onChange={handleChange} required />
                </div>
              </div>
              <div className="signup-field">
                <label>Email Address</label>
                <div className="signup-input-wrap">
                  <span></span>
                  <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="signup-field">
                <label>Password</label>
                <div className="signup-input-wrap">
                  <span>🔒</span>
                  <input name="password" type="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} required />
                </div>
              </div>
              <div className="signup-field">
                <label>Confirm Password</label>
                <div className="signup-input-wrap">
                  <span>🔒</span>
                  <input name="confirm" type="password" placeholder="Repeat password" value={form.confirm} onChange={handleChange} required />
                </div>
              </div>
              {error && <p className="signup-error">{error}</p>}
              <button className="signup-submit" type="submit">Create Account</button>
            </form>
            <p className="social-modal-footer">
              Already have an account?{" "}
              <button className="signup-switch-btn" onClick={onClose}>Sign in instead</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [socialModal, setSocialModal] = useState(null); // "google" | "facebook" | null
  const [showSignUp, setShowSignUp] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = emailRef.current ? emailRef.current.value.trim() : "";
    const accounts = JSON.parse(localStorage.getItem("rd_accounts") || "[]");
    const match = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!match) {
      setLoginError("No account found with this email. Please sign up first.");
      return;
    }
    setLoginError("");
    localStorage.setItem("user_email", match.email);
    if (match.name) localStorage.setItem("user_name", match.name);
    navigate("/home");
  };

  const handleSocialSelect = (acc) => {
    localStorage.setItem("user_email", acc.email);
    navigate("/home");
  };

  const openSignUp = () => {
    setSocialModal(null);
    setShowSignUp(true);
  };

  return (
    <div className="login-bg">
      {/* Floating food particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="login-particle"
          style={{ top: p.top, left: p.left, fontSize: p.size, animationDelay: p.delay, animationDuration: p.dur }}
        >{p.emoji}</span>
      ))}

      {/* Social login modal */}
      {socialModal === "google" && (
        <SocialModal
          provider="google"
          accounts={GOOGLE_ACCOUNTS}
          onSelect={handleSocialSelect}
          onClose={() => setSocialModal(null)}
          onCreateAccount={openSignUp}
        />
      )}
      {socialModal === "facebook" && (
        <SocialModal
          provider="facebook"
          accounts={FACEBOOK_ACCOUNTS}
          onSelect={handleSocialSelect}
          onClose={() => setSocialModal(null)}
          onCreateAccount={openSignUp}
        />
      )}

      {/* Sign Up modal */}
      {showSignUp && (
        <SignUpModal
          onClose={() => setShowSignUp(false)}
          onSuccess={() => navigate("/home")}
        />
      )}

      <div className="login-header">
        <div className="login-icon">
          🍳
        </div>

        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">
          Sign in to discover amazing recipes
        </p>
      </div>


      <div className="login-card">

        <form onSubmit={handleSubmit}>

          <label className="login-label">Email Address</label>

          <div className="login-input-wrapper">
            <span className="login-input-icon"></span>

            <input
              ref={emailRef}
              className="login-input"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>


          <label className="login-label">Password</label>

          <div className="login-input-wrapper">
            <span className="login-input-icon">🔒</span>

            <input
              ref={passwordRef}
              className="login-input"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>


          {loginError && (
            <div className="login-error-box">
              <span>⚠️ {loginError}</span>
              <button type="button" className="login-error-signup" onClick={() => { setLoginError(""); setShowSignUp(true); }}>
                Create account
              </button>
            </div>
          )}


          <div className="login-forgot">
            <Link to="#" className="login-forgot-link">
              Forgot password?
            </Link>
          </div>


          <button className="login-btn" type="submit">
            Sign In
          </button>

        </form>


        <div className="login-divider">
          <span>Or continue with</span>
        </div>


        <div className="login-social-row">

          <button className="login-social google" type="button" onClick={() => setSocialModal("google")}>
            <GoogleLogoSVG />
            Google
          </button>

          <button className="login-social facebook" type="button" onClick={() => setSocialModal("facebook")}>
            <FacebookLogoSVG />
            Facebook
          </button>

        </div>

      </div>


      <div className="login-signup">
        Don't have an account?
        <button className="login-signup-link" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={() => setShowSignUp(true)}>
          Sign up
        </button>
      </div>

    </div>
  );
}

export default Login;