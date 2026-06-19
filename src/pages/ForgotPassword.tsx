import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, ShieldCheck, Globe, Zap, Eye, EyeOff, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api';

const OTP_LENGTH = 6;

const emailSchema = z.object({
  email: z.email('Enter a valid email address'),
});

const resetSchema = z.object({
  password: z.string().refine(
    val => val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val) && /[!@#$%^&*()\-_=+[\]{};:'",.<>?/\\|`~]/.test(val),
    'Password must be at least 8 characters, a capital letter, and include a special character.'
  ),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
});

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

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
      <line x1="140" y1="140" x2="140" y2="70" stroke="rgba(255,255,255,0.07)" strokeWidth="0.9"/>
      <line x1="140" y1="140" x2="207" y2="118" stroke="rgba(255,255,255,0.05)" strokeWidth="0.9"/>
      <circle cx="188" cy="58"  r="1.8" fill="rgba(255,255,255,0.13)"/>
      <circle cx="248" cy="120" r="1.5" fill="rgba(255,255,255,0.09)"/>
      <circle cx="55"  cy="172" r="1.5" fill="rgba(255,255,255,0.09)"/>
      <circle cx="200" cy="236" r="1.8" fill="rgba(255,255,255,0.10)"/>
      <circle cx="68"  cy="88"  r="1.8" fill="rgba(255,255,255,0.11)"/>
    </svg>
  );
}

const BTN_BASE: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: 8, padding: '12.5px 0', borderRadius: 12,
  fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.01em',
  color: 'white', border: 'none', cursor: 'pointer',
  background: 'linear-gradient(to bottom right, #0A6CCB, #1D8AD8, #5CC8F5)',
  boxShadow: '0 4px 16px rgba(10,108,203,0.35)',
  transition: 'background 0.18s, box-shadow 0.18s',
};
const BTN_HOVER = 'linear-gradient(to bottom right, #085aaa, #176db0, #3aaee0)';
const BTN_NORM  = 'linear-gradient(to bottom right, #0A6CCB, #1D8AD8, #5CC8F5)';
const BTN_DIM   = 'linear-gradient(to bottom right, #7ab8e8, #94cce8, #b8e3f5)';

function Spinner() {
  return <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'fp-spin 0.7s linear infinite' }}/>;
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <p style={{ marginBottom: 16, fontSize: 13, color: '#EF4444', background: '#FEF2F2', padding: '10px 14px', borderRadius: 10, border: '1px solid #FECACA' }}>
      {msg}
    </p>
  );
}

export function ForgotPassword() {
  const navigate = useNavigate();

  const [step,          setStep]         = useState<'email' | 'otp' | 'reset' | 'done'>('email');
  const [email,         setEmail]        = useState('');
  const [otp,           setOtp]          = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError,      setOtpError]     = useState(false);
  const [loading,       setLoading]      = useState(false);
  const [apiError,      setApiError]     = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPw,        setShowPw]       = useState(false);
  const [showConfirm,   setShowConfirm]  = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    mode: 'onTouched',
  });
  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    mode: 'onTouched',
  });

  const emailField = emailForm.register('email');
  const emailErrors = emailForm.formState.errors;
  const resetErrors = resetForm.formState.errors;

  const parseError = (err: unknown) => {
    const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
    try { return JSON.parse(msg).detail ?? msg; } catch { return msg; }
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#2563EB';
    e.target.style.boxShadow   = '0 0 0 3px rgba(37,99,235,0.13)';
  };
  const onBlurField = (hasError: boolean) => (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = hasError ? '#EF4444' : '#E2E8F0';
    e.target.style.boxShadow   = 'none';
  };

  /* ── Step 1: send forgot-password request ── */
  const handleSendOtp = async (data: EmailForm) => {
    setApiError('');
    setLoading(true);
    try {
      await api.post('/api/v1/auth/forgot-password', { email: data.email });
      setEmail(data.email);
      setStep('otp');
      startResendCooldown();
    } catch (err) {
      setApiError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: verify OTP ── */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return;
    setApiError('');
    setLoading(true);
    try {
      await api.post('/api/v1/auth/verify-otp', { email, otp: code });
      setOtpError(false);
      setStep('reset');
    } catch (err) {
      setOtpError(true);
      setApiError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 3: reset password ── */
  const handleResetPassword = async (data: ResetForm) => {
    setApiError('');
    setLoading(true);
    try {
      await api.post('/api/v1/auth/reset-password', {
        email,
        new_password: data.password,
        confirm_password: data.confirm,
      });
      setStep('done');
    } catch (err) {
      setApiError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend cooldown ── */
  const startResendCooldown = () => {
    setResendCooldown(30);
    const id = setInterval(() => {
      setResendCooldown(prev => { if (prev <= 1) { clearInterval(id); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError(false);
    setApiError('');
    setLoading(true);
    try {
      await api.post('/api/v1/auth/forgot-password', { email });
      startResendCooldown();
    } catch (err) {
      setApiError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP input helpers ── */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp]; next[index] = value.slice(-1); setOtp(next);
    setOtpError(false); setApiError('');
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    text.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px 11px 38px',
    borderRadius: 12, fontSize: 14,
    border: `1.5px solid ${hasError ? '#EF4444' : '#E2E8F0'}`,
    background: 'white', color: '#0F172A',
    outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
  });

  return (
    <div className="h-screen overflow-hidden flex antialiased" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ════ LEFT — hero panel ════ */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(155deg, #1E3A8A 0%, #1E40AF 55%, #1A365D 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}/>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(255,255,255,0.05) 0%, transparent 70%)',
        }}/>

        <div className="relative z-10">
          <img src="https://storage.googleapis.com/bilvantis-website-buc/bilvantisLogo.svg" alt="Bilvantis"
            style={{ height: 60, filter: 'brightness(0) invert(1)' }}/>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, ease: 'easeOut' }} style={{ width: '100%', maxWidth: 270, marginBottom: 40 }}>
            <OrbArt />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14, color: 'rgba(255,255,255,0.45)' }}>
              AI-Powered Recruitment
            </p>
            <h2 style={{ fontSize: 33, fontWeight: 800, lineHeight: 1.14, letterSpacing: '-0.03em', marginBottom: 14, color: 'white' }}>
              Find the right hire.<br/>Not just any hire.
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.65, maxWidth: 295, color: 'rgba(255,255,255,0.42)' }}>
              Intelligent candidate screening that surfaces real talent &mdash; in seconds, not weeks.
            </p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }}
          className="relative z-10 flex items-center justify-center gap-7"
          style={{ borderTop: '1px solid rgba(255,255,255,0.09)', paddingTop: 20 }}>
          {[
            { icon: ShieldCheck, label: 'AI-Powered Screening' },
            { icon: Globe,       label: 'Global Talent Reach'  },
            { icon: Zap,         label: '10x Faster Hiring'    },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon size={12} style={{ color: 'rgba(255,255,255,0.32)' }}/>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.32)' }}>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ════ RIGHT — form panel ════ */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: '#F8FAFC' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48 }} style={{ width: '100%', maxWidth: 380 }}>

          <div className="lg:hidden mb-10">
            <img src="https://storage.googleapis.com/bilvantis-website-buc/bilvantisLogo.svg" alt="Bilvantis" style={{ height: 32 }}/>
          </div>

          <AnimatePresence mode="wait">

            {/* ── Step 1: Email ── */}
            {step === 'email' && (
              <motion.div key="email"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

                <div style={{ marginBottom: 32 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.035em', color: '#0F172A', marginBottom: 6 }}>
                    Forgot password?
                  </h1>
                  <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
                    Enter your email and we'll send you a one-time code.
                  </p>
                </div>

                <form onSubmit={emailForm.handleSubmit(handleSendOtp)}>
                  <div style={{ marginBottom: 22 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#374151', marginBottom: 8 }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: emailErrors.email ? '#EF4444' : '#9CA3AF', pointerEvents: 'none' }}/>
                      <input {...emailField} type="email" placeholder="Email"
                        onFocus={onFocus}
                        onBlur={e => { emailField.onBlur(e); onBlurField(!!emailErrors.email)(e); }}
                        style={inputStyle(!!emailErrors.email)}/>
                    </div>
                    {emailErrors.email && <p style={{ marginTop: 6, fontSize: 12, color: '#EF4444' }}>{emailErrors.email.message}</p>}
                  </div>

                  {apiError && <ErrorBanner msg={apiError} />}

                  <button type="submit" disabled={loading}
                    style={{ ...BTN_BASE, cursor: loading ? 'default' : 'pointer' }}
                    onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.background = BTN_HOVER; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 22px rgba(10,108,203,0.45)'; } }}
                    onMouseLeave={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.background = BTN_NORM; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(10,108,203,0.35)'; } }}>
                    {loading ? <><Spinner /> Sending...</> : <>Send OTP <ArrowRight size={15}/></>}
                  </button>
                </form>

                <button onClick={() => navigate('/login')}
                  style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#2563EB')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>
                  <ArrowLeft size={14}/> Back to Sign In
                </button>
              </motion.div>
            )}

            {/* ── Step 2: OTP ── */}
            {step === 'otp' && (
              <motion.div key="otp"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

                <div style={{ marginBottom: 28 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.035em', color: '#0F172A', marginBottom: 6 }}>
                    Enter OTP
                  </h1>
                  <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
                    We sent a 6-digit code to<br/>
                    <strong style={{ color: '#0F172A' }}>{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8, justifyContent: 'space-between' }} onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input key={i}
                        ref={el => { inputRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.13)'; }}
                        onBlur={e => { e.target.style.borderColor = otpError ? '#EF4444' : '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                        style={{
                          width: 46, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 700,
                          borderRadius: 12, outline: 'none',
                          border: `1.5px solid ${otpError ? '#EF4444' : '#E2E8F0'}`,
                          background: 'white', color: '#0F172A',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      />
                    ))}
                  </div>

                  {otpError && <p style={{ fontSize: 12, color: '#EF4444', marginBottom: 4 }}>Invalid OTP. Please try again.</p>}
                  {apiError && !otpError && <ErrorBanner msg={apiError} />}

                  <div style={{ textAlign: 'right', marginBottom: 22, marginTop: 8 }}>
                    <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || loading}
                      style={{ fontSize: 13, fontWeight: 500, color: resendCooldown > 0 ? '#94A3B8' : '#2563EB', background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'default' : 'pointer', padding: 0, transition: 'color 0.15s' }}>
                      {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>

                  {(() => {
                    const filled = otp.join('').length === OTP_LENGTH;
                    return (
                      <button type="submit" disabled={loading || !filled}
                        style={{ ...BTN_BASE, cursor: (loading || !filled) ? 'default' : 'pointer', background: filled ? BTN_NORM : BTN_DIM }}
                        onMouseEnter={e => { if (!loading && filled) (e.currentTarget as HTMLButtonElement).style.background = BTN_HOVER; }}
                        onMouseLeave={e => { if (filled) (e.currentTarget as HTMLButtonElement).style.background = BTN_NORM; }}>
                        {loading ? <><Spinner /> Verifying...</> : <>Verify OTP <ArrowRight size={15}/></>}
                      </button>
                    );
                  })()}
                </form>

                <button
                  onClick={() => { setStep('email'); setOtp(Array(OTP_LENGTH).fill('')); setOtpError(false); setApiError(''); }}
                  style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#2563EB')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>
                  <ArrowLeft size={14}/> Change email
                </button>
              </motion.div>
            )}

            {/* ── Step 3: Reset Password ── */}
            {step === 'reset' && (
              <motion.div key="reset"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

                <div style={{ marginBottom: 32 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.035em', color: '#0F172A', marginBottom: 6 }}>
                    Reset password
                  </h1>
                  <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
                    Create a new password for your account.
                  </p>
                </div>

                <form onSubmit={resetForm.handleSubmit(handleResetPassword)}>
                  {/* New password */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#374151', marginBottom: 8 }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: resetErrors.password ? '#EF4444' : '#9CA3AF', pointerEvents: 'none' }}/>
                      <input
                        {...resetForm.register('password')}
                        type={showPw ? 'text' : 'password'}
                        placeholder="New password"
                        onFocus={onFocus}
                        onBlur={onBlurField(!!resetErrors.password)}
                        style={{ ...inputStyle(!!resetErrors.password), paddingRight: 42 }}
                      />
                      <button type="button" tabIndex={-1} onClick={() => setShowPw(p => !p)}
                        style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF' }}>
                        {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                    {resetErrors.password && <p style={{ marginTop: 6, fontSize: 12, color: '#EF4444' }}>{resetErrors.password.message}</p>}
                  </div>

                  {/* Confirm password */}
                  <div style={{ marginBottom: 22 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#374151', marginBottom: 8 }}>
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: resetErrors.confirm ? '#EF4444' : '#9CA3AF', pointerEvents: 'none' }}/>
                      <input
                        {...resetForm.register('confirm')}
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Confirm password"
                        onFocus={onFocus}
                        onBlur={onBlurField(!!resetErrors.confirm)}
                        style={{ ...inputStyle(!!resetErrors.confirm), paddingRight: 42 }}
                      />
                      <button type="button" tabIndex={-1} onClick={() => setShowConfirm(p => !p)}
                        style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF' }}>
                        {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                    {resetErrors.confirm && <p style={{ marginTop: 6, fontSize: 12, color: '#EF4444' }}>{resetErrors.confirm.message}</p>}
                  </div>

                  {/* Password rules hint */}
                  <div style={{ marginBottom: 22, padding: '10px 14px', borderRadius: 10, background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                    <p style={{ fontSize: 12, color: '#0369A1', lineHeight: 1.7, margin: 0 }}>
                      Password must be at least 8 characters,  a capital letter, and include a special character.
                    </p>
                  </div>

                  {apiError && <ErrorBanner msg={apiError} />}

                  <button type="submit" disabled={loading}
                    style={{ ...BTN_BASE, cursor: loading ? 'default' : 'pointer' }}
                    onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.background = BTN_HOVER; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 22px rgba(10,108,203,0.45)'; } }}
                    onMouseLeave={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.background = BTN_NORM; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(10,108,203,0.35)'; } }}>
                    {loading ? <><Spinner /> Resetting...</> : <>Reset Password <ArrowRight size={15}/></>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Step 4: Done ── */}
            {step === 'done' && (
              <motion.div key="done"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                style={{ textAlign: 'center', paddingTop: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle size={30} style={{ color: '#10B981' }}/>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 10, letterSpacing: '-0.03em' }}>
                  Password reset!
                </h2>
                <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.65, marginBottom: 28 }}>
                  Your password has been updated successfully.<br/>You can now sign in with your new password.
                </p>
                <button onClick={() => navigate('/login')}
                  style={{ ...BTN_BASE, justifyContent: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.background = BTN_HOVER)}
                  onMouseLeave={e => (e.currentTarget.style.background = BTN_NORM)}>
                  Back to Sign In
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>

      <style>{`@keyframes fp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
