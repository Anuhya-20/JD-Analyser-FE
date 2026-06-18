import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Globe, Zap, User } from 'lucide-react';

function OrbArt() {
  return (
    <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="140" cy="140" r="130" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
      <circle cx="140" cy="140" r="100" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <circle cx="140" cy="140" r="70"  stroke="rgba(255,255,255,0.11)" strokeWidth="1.5"/>
      <circle cx="140" cy="140" r="40"  stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"
        fill="rgba(255,255,255,0.025)"/>
      <path d="M 100 140 A 40 40 0 0 0 180 140"
        stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="140" cy="140" r="12" fill="rgba(255,255,255,0.08)"/>
      <circle cx="140" cy="140" r="5"  fill="rgba(255,255,255,0.45)"/>
      <circle cx="140" cy="70"  r="5.5" fill="rgba(255,255,255,0.55)"/>
      <circle cx="207" cy="118" r="3.5" fill="rgba(255,255,255,0.22)"/>
      <circle cx="181" cy="197" r="3.5" fill="rgba(255,255,255,0.18)"/>
      <circle cx="99"  cy="197" r="3.5" fill="rgba(255,255,255,0.16)"/>
      <circle cx="73"  cy="118" r="3.5" fill="rgba(255,255,255,0.2)"/>
      <circle cx="140" cy="40"  r="3" fill="rgba(255,255,255,0.11)"/>
      <circle cx="240" cy="140" r="3" fill="rgba(255,255,255,0.11)"/>
      <circle cx="140" cy="240" r="3" fill="rgba(255,255,255,0.09)"/>
      <circle cx="40"  cy="140" r="3" fill="rgba(255,255,255,0.09)"/>
      <line x1="140" y1="140" x2="140" y2="70"
        stroke="rgba(255,255,255,0.07)" strokeWidth="0.9"/>
      <line x1="140" y1="140" x2="207" y2="118"
        stroke="rgba(255,255,255,0.05)" strokeWidth="0.9"/>
      <circle cx="188" cy="58"  r="1.8" fill="rgba(255,255,255,0.13)"/>
      <circle cx="248" cy="120" r="1.5" fill="rgba(255,255,255,0.09)"/>
      <circle cx="55"  cy="172" r="1.5" fill="rgba(255,255,255,0.09)"/>
      <circle cx="200" cy="236" r="1.8" fill="rgba(255,255,255,0.10)"/>
      <circle cx="68"  cy="88"  r="1.8" fill="rgba(255,255,255,0.11)"/>
    </svg>
  );
}

export function Signup() {
  const navigate = useNavigate();
  const [fullName,       setFullName]       = useState('');
  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,       setShowPass]       = useState(false);
  const [showConfirm,    setShowConfirm]    = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [confirmError,   setConfirmError]   = useState(false);
  const [apiError,       setApiError]       = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setConfirmError(true);
      return;
    }
    setConfirmError(false);
    setApiError('');
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, password, confirm_password: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.detail?.[0]?.msg || data?.detail || 'Registration failed. Please try again.';
        setApiError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        return;
      }
      localStorage.setItem('talentiq_auth', 'true');
      localStorage.setItem('talentiq_user', JSON.stringify({ full_name: fullName, email }));
      navigate('/dashboard');
    } catch {
      setApiError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#2563EB';
    e.target.style.boxShadow   = '0 0 0 3px rgba(37,99,235,0.13)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#E2E8F0';
    e.target.style.boxShadow   = 'none';
  };

  return (
    <div className="h-screen overflow-hidden flex antialiased" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ════════════════════════════════════════════
          LEFT — blue hero panel
      ════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(155deg, #1E3A8A 0%, #1E40AF 55%, #1A365D 100%)' }}
      >
        {/* Dot-grid texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}/>

        {/* Centre glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(255,255,255,0.05) 0%, transparent 70%)',
        }}/>

        {/* Logo */}
        <div className="relative z-10">
          <img
            src="https://storage.googleapis.com/bilvantis-website-buc/bilvantisLogo.svg"
            alt="Bilvantis"
            style={{ height: 60, filter: 'brightness(0) invert(1)' }}
          />
        </div>

        {/* Hero */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            style={{ width: '100%', maxWidth: 270, marginBottom: 40 }}
          >
            <OrbArt/>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ textAlign: 'center' }}
          >
            <p style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.15em',
              textTransform: 'uppercase', marginBottom: 14,
              color: 'rgba(255,255,255,0.45)',
            }}>
              AI-Powered Recruitment
            </p>
            <h2 style={{
              fontSize: 33, fontWeight: 800, lineHeight: 1.14,
              letterSpacing: '-0.03em', marginBottom: 14,
              color: 'white',
            }}>
              Find the right hire.<br/>Not just any hire.
            </h2>
            <p style={{
              fontSize: 14, lineHeight: 1.65, maxWidth: 295,
              color: 'rgba(255,255,255,0.42)',
            }}>
              Intelligent candidate screening that surfaces real talent &mdash; in seconds, not weeks.
            </p>
          </motion.div>
        </div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="relative z-10 flex items-center justify-center gap-7"
          style={{ borderTop: '1px solid rgba(255,255,255,0.09)', paddingTop: 20 }}
        >
          {[
            { icon: ShieldCheck, label: 'AI-Powered Screening' },
            { icon: Globe,       label: 'Global Talent Reach' },
            { icon: Zap,         label: '10x Faster Hiring'   },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon size={12} style={{ color: 'rgba(255,255,255,0.32)' }}/>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.32)' }}>
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════
          RIGHT — white form panel
      ════════════════════════════════════════════ */}
      <div
        className="flex-1 lg:w-1/2 flex items-center justify-center p-6 sm:p-8"
        style={{ backgroundColor: '#F8FAFC' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48 }}
          style={{ width: '100%', maxWidth: 360 }}
        >

          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <img
              src="https://storage.googleapis.com/bilvantis-website-buc/bilvantisLogo.svg"
              alt="Bilvantis"
              style={{ height: 32 }}
            />
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{
              fontSize: 26, fontWeight: 800, letterSpacing: '-0.035em',
              color: '#0F172A', marginBottom: 6,
            }}>
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>
              Start hiring smarter today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp}>

            {/* Full Name */}
            <div style={{ marginBottom: 13 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                color: '#374151', marginBottom: 8,
              }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{
                  position: 'absolute', left: 13, top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF', pointerEvents: 'none',
                }}/>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="Jane Smith"
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 14px 11px 38px',
                    borderRadius: 12, fontSize: 14,
                    border: '1.5px solid #E2E8F0',
                    background: 'white', color: '#0F172A',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                />
              </div>
            </div>


            {/* Email */}
            <div style={{ marginBottom: 13 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                color: '#374151', marginBottom: 8,
              }}>
                Work Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{
                  position: 'absolute', left: 13, top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF', pointerEvents: 'none',
                }}/>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="Email"
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 14px 11px 38px',
                    borderRadius: 12, fontSize: 14,
                    border: '1.5px solid #E2E8F0',
                    background: 'white', color: '#0F172A',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 13 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                color: '#374151', marginBottom: 8,
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{
                  position: 'absolute', left: 13, top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF', pointerEvents: 'none',
                }}/>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="Create a password"
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 40px 11px 38px',
                    borderRadius: 12, fontSize: 14,
                    border: '1.5px solid #E2E8F0',
                    background: 'white', color: '#0F172A',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 13, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', padding: 2,
                    display: 'flex', color: '#9CA3AF',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4B5563')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                >
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                color: '#374151', marginBottom: 8,
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{
                  position: 'absolute', left: 13, top: '50%',
                  transform: 'translateY(-50%)',
                  color: confirmError ? '#EF4444' : '#9CA3AF', pointerEvents: 'none',
                }}/>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setConfirmError(false); }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="Re-enter your password"
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 40px 11px 38px',
                    borderRadius: 12, fontSize: 14,
                    border: `1.5px solid ${confirmError ? '#EF4444' : '#E2E8F0'}`,
                    background: 'white', color: '#0F172A',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  style={{
                    position: 'absolute', right: 13, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', padding: 2,
                    display: 'flex', color: '#9CA3AF',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4B5563')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                >
                  {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {confirmError && (
                <p style={{ marginTop: 6, fontSize: 12, color: '#EF4444' }}>
                  Passwords do not match.
                </p>
              )}
            </div>

            {/* API error */}
            {apiError && (
              <div style={{
                marginBottom: 14, padding: '10px 14px', borderRadius: 10,
                background: '#FEF2F2', border: '1px solid #FECACA',
                fontSize: 13, color: '#DC2626',
              }}>
                {apiError}
              </div>
            )}

            {/* Create Account */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '12.5px 0', borderRadius: 12,
                fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.01em',
                color: 'white', border: 'none',
                cursor: loading ? 'default' : 'pointer',
                background: 'linear-gradient(to bottom right, #0A6CCB, #1D8AD8, #5CC8F5)',
                boxShadow: '0 4px 16px rgba(10,108,203,0.35)',
                transition: 'background 0.18s, box-shadow 0.18s',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.background  = 'linear-gradient(to bottom right, #085aaa, #176db0, #3aaee0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow   = '0 6px 22px rgba(10,108,203,0.45)';
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.background  = 'linear-gradient(to bottom right, #0A6CCB, #1D8AD8, #5CC8F5)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow   = '0 4px 16px rgba(10,108,203,0.35)';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    animation: 'tiq-spin 0.7s linear infinite',
                  }}/>
                  Creating account...
                </>
              ) : (
                <>Create Account <ArrowRight size={15}/></>
              )}
            </button>

            {/* Sign in link */}
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: '#64748B' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  fontWeight: 600, color: '#2563EB',
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1D4ED8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#2563EB')}
              >
                Sign in
              </button>
            </p>
          </form>
        </motion.div>
      </div>

      <style>{`@keyframes tiq-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
