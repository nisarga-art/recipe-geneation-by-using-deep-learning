import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileDropdown.css";

function ProfileDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const email = localStorage.getItem("user_email") || "user@example.com";
  const name = email.split("@")[0];

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const signOut = () => {
    localStorage.removeItem("user_email");
    navigate("/login");
  };

  return (
    <div className="pd-wrap" ref={wrapRef}>
      <div className={`pd-avatar${open ? " open" : ""}`} onClick={() => setOpen(o => !o)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>

      {open && (
        <div className="pd-dropdown">
          <div className="pd-info">
            <span className="pd-name">{name}</span>
            <span className="pd-email">{email}</span>
          </div>
          <div className="pd-divider" />
          <button className="pd-signout" onClick={signOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;
