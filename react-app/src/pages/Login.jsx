import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const BRANDING_API = (import.meta.env.VITE_API_URL || '/api') + '/branding';

const DEFAULT_BRANDING = {
    loginPageTitle: 'Welcome Back',
    loginPageSubtitle: 'Sign in to your account to continue',
    loginEmailLabel: 'Email Address',
    loginPasswordLabel: 'Password',
    loginRememberMeLabel: 'Remember me',
    loginForgotPasswordLabel: 'Forgot Password?',
    loginSignInBtn: 'Sign In',
    loginSignInBtnLoading: 'Signing In...',
    loginCreateAccountPrompt: "Don't have an account?",
    loginCreateAccountLink: 'Create Account',
};

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [focused, setFocused] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Forgot Password Flow States
    const [forgotStep, setForgotStep] = useState(null); // null, 'email', 'otp', 'password'
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [branding, setBranding] = useState(DEFAULT_BRANDING);
    const [loadingBranding, setLoadingBranding] = useState(true);

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const res = await fetch(BRANDING_API);
                if (res.ok) {
                    const data = await res.json();
                    setBranding({ ...DEFAULT_BRANDING, ...data });
                }
            } catch (err) {
                console.error('Failed to fetch branding data:', err);
            } finally {
                setLoadingBranding(false);
            }
        };
        fetchBranding();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const user = await login(formData.email, formData.password);
            const redirectPath = location.state?.from;
            if (redirectPath) {
                navigate(redirectPath, { replace: true });
            } else if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'delivery') {
                navigate('/delivery');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
            e.preventDefault();
            setError('');
            setSuccessMessage('');
            setIsLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: forgotEmail }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
                setSuccessMessage(data.message || 'OTP sent successfully.');
                setForgotStep('otp');
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        const handleVerifyOtp = async (e) => {
            e.preventDefault();
            setError('');
            setSuccessMessage('');
            setIsLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/verify-reset-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: forgotEmail, otp: resetOtp }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Verification failed.');
                setSuccessMessage(data.message || 'OTP verified.');
                setForgotStep('password');
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        const handleResetPassword = async (e) => {
            e.preventDefault();
            setError('');
            setSuccessMessage('');
            if (newPassword !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
            setIsLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: forgotEmail, otp: resetOtp, newPassword }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Password update failed.');
                setSuccessMessage(data.message || 'Password updated successfully.');
                setTimeout(() => {
                    setForgotStep(null);
                    setForgotEmail('');
                    setResetOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setSuccessMessage('');
                }, 3000);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <main className="auth-page-simple">
                <div className="auth-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
                <div className="auth-card-container fade-in-card">
                    <div className="auth-card">
                        {forgotStep === null ? (
                            <>
                                <div className="auth-card-header">
                                    <Link to="/" className="auth-card-logo">
                                        <span className="logo-flexi">{branding.appNamePart1 || 'Flexi'}</span>
                                        <span className="logo-commerce">{branding.appNamePart2 || 'Commerce'}</span>
                                    </Link>
                                    <div className="auth-icon-circle">
                                        <LogIn size={28} />
                                    </div>
                                    <h1>{branding.loginPageTitle}</h1>
                                    <p>{branding.loginPageSubtitle}</p>
                                </div>

                                {error && (
                                    <div className="auth-error">
                                        <AlertCircle size={16} /> {error}
                                    </div>
                                )}

                                <form className="auth-card-form" onSubmit={handleSubmit}>
                                    <div className={`floating-group ${focused === 'email' || formData.email ? 'focused' : ''}`}>
                                        <div className="floating-input-wrap">
                                            <Mail size={18} className="field-icon" />
                                            <input
                                                type="email"
                                                id="login-email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                onFocus={() => setFocused('email')}
                                                onBlur={() => setFocused('')}
                                                placeholder=" "
                                                required
                                            />
                                            <label htmlFor="login-email">{branding.loginEmailLabel}</label>
                                        </div>
                                    </div>

                                    <div className={`floating-group ${focused === 'password' || formData.password ? 'focused' : ''}`}>
                                        <div className="floating-input-wrap">
                                            <Lock size={18} className="field-icon" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="login-password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                onFocus={() => setFocused('password')}
                                                onBlur={() => setFocused('')}
                                                placeholder=" "
                                                required
                                            />
                                            <label htmlFor="login-password">{branding.loginPasswordLabel}</label>
                                            <button
                                                type="button"
                                                className="toggle-password"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label="Toggle password visibility"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="auth-card-row">
                                        <div className="form-check">
                                            <input type="checkbox" id="remember" />
                                            <label htmlFor="remember">{branding.loginRememberMeLabel}</label>
                                        </div>
                                        <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); setError(''); setSuccessMessage(''); setForgotStep('email'); }}>{branding.loginForgotPasswordLabel}</a>
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={isLoading}>
                                        {isLoading ? branding.loginSignInBtnLoading : branding.loginSignInBtn} {!isLoading && <ArrowRight size={18} />}
                                    </button>
                                </form>

                                <p className="auth-card-switch">
                                    {branding.loginCreateAccountPrompt} <Link to="/signup">{branding.loginCreateAccountLink}</Link>
                                </p>
                            </>
                        ) : forgotStep === 'email' ? (
                            <>
                                <div className="auth-card-header">
                                    <Link to="/" className="auth-card-logo">
                                        <span className="logo-flexi">{branding.appNamePart1 || 'Flexi'}</span>
                                        <span className="logo-commerce">{branding.appNamePart2 || 'Commerce'}</span>
                                    </Link>
                                    <div className="auth-icon-circle">
                                        <Mail size={28} />
                                    </div>
                                    <h1>Forgot Password?</h1>
                                    <p>Enter your registered email address to receive a verification OTP.</p>
                                </div>

                                {error && <div className="auth-error"><AlertCircle size={16} /> {error}</div>}
                                {successMessage && <div className="auth-success" style={{ color: '#15803d', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.813rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><CheckCircle size={16} /> {successMessage}</div>}

                                <form className="auth-card-form" onSubmit={handleSendOtp}>
                                    <div className={`floating-group ${focused === 'forgotEmail' || forgotEmail ? 'focused' : ''}`}>
                                        <div className="floating-input-wrap">
                                            <Mail size={18} className="field-icon" />
                                            <input
                                                type="email"
                                                id="forgot-email"
                                                value={forgotEmail}
                                                onChange={(e) => { setForgotEmail(e.target.value); setError(''); }}
                                                onFocus={() => setFocused('forgotEmail')}
                                                onBlur={() => setFocused('')}
                                                placeholder=" "
                                                required
                                            />
                                            <label htmlFor="forgot-email">{branding.loginEmailLabel}</label>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={isLoading}>
                                        {isLoading ? 'Sending OTP...' : 'Send OTP'} {!isLoading && <ArrowRight size={18} />}
                                    </button>
                                </form>

                                <p className="auth-card-switch">
                                    <a href="#" onClick={(e) => { e.preventDefault(); setForgotStep(null); setError(''); setSuccessMessage(''); }}>Back to Sign In</a>
                                </p>
                            </>
                        ) : forgotStep === 'otp' ? (
                            <>
                                <div className="auth-card-header">
                                    <Link to="/" className="auth-card-logo">
                                        <span className="logo-flexi">{branding.appNamePart1 || 'Flexi'}</span>
                                        <span className="logo-commerce">{branding.appNamePart2 || 'Commerce'}</span>
                                    </Link>
                                    <div className="auth-icon-circle">
                                        <Lock size={28} />
                                    </div>
                                    <h1>Verify OTP</h1>
                                    <p>Enter the 6-digit code sent to <strong>{forgotEmail}</strong>.</p>
                                </div>

                                {error && <div className="auth-error"><AlertCircle size={16} /> {error}</div>}
                                {successMessage && <div className="auth-success" style={{ color: '#15803d', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.813rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><CheckCircle size={16} /> {successMessage}</div>}

                                <form className="auth-card-form" onSubmit={handleVerifyOtp}>
                                    <div className={`floating-group ${focused === 'resetOtp' || resetOtp ? 'focused' : ''}`}>
                                        <div className="floating-input-wrap">
                                            <Lock size={18} className="field-icon" />
                                            <input
                                                type="text"
                                                id="reset-otp"
                                                value={resetOtp}
                                                onChange={(e) => { setResetOtp(e.target.value); setError(''); }}
                                                onFocus={() => setFocused('resetOtp')}
                                                onBlur={() => setFocused('')}
                                                placeholder=" "
                                                required
                                            />
                                            <label htmlFor="reset-otp">Verification Code</label>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={isLoading}>
                                        {isLoading ? 'Verifying...' : 'Verify OTP'} {!isLoading && <ArrowRight size={18} />}
                                    </button>
                                </form>

                                <p className="auth-card-switch">
                                    <a href="#" onClick={(e) => { e.preventDefault(); setForgotStep(null); setError(''); setSuccessMessage(''); }}>Back to Sign In</a>
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="auth-card-header">
                                    <Link to="/" className="auth-card-logo">
                                        <span className="logo-flexi">{branding.appNamePart1 || 'Flexi'}</span>
                                        <span className="logo-commerce">{branding.appNamePart2 || 'Commerce'}</span>
                                    </Link>
                                    <div className="auth-icon-circle">
                                        <Lock size={28} />
                                    </div>
                                    <h1>New Password</h1>
                                    <p>Set a new secure password for your account.</p>
                                </div>

                                {error && <div className="auth-error"><AlertCircle size={16} /> {error}</div>}
                                {successMessage && <div className="auth-success" style={{ color: '#15803d', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.813rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><CheckCircle size={16} /> {successMessage}</div>}

                                <form className="auth-card-form" onSubmit={handleResetPassword}>
                                    <div className={`floating-group ${focused === 'newPassword' || newPassword ? 'focused' : ''}`}>
                                        <div className="floating-input-wrap">
                                            <Lock size={18} className="field-icon" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="new-password"
                                                value={newPassword}
                                                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                                onFocus={() => setFocused('newPassword')}
                                                onBlur={() => setFocused('')}
                                                placeholder=" "
                                                required
                                            />
                                            <label htmlFor="new-password">New Password</label>
                                        </div>
                                    </div>

                                    <div className={`floating-group ${focused === 'confirmPassword' || confirmPassword ? 'focused' : ''}`}>
                                        <div className="floating-input-wrap">
                                            <Lock size={18} className="field-icon" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="confirm-password"
                                                value={confirmPassword}
                                                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                                onFocus={() => setFocused('confirmPassword')}
                                                onBlur={() => setFocused('')}
                                                placeholder=" "
                                                required
                                            />
                                            <label htmlFor="confirm-password">Confirm Password</label>
                                            <button
                                                type="button"
                                                className="toggle-password"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label="Toggle password visibility"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={isLoading}>
                                        {isLoading ? 'Updating Password...' : 'Update Password'} {!isLoading && <ArrowRight size={18} />}
                                    </button>
                                </form>

                                <p className="auth-card-switch">
                                    <a href="#" onClick={(e) => { e.preventDefault(); setForgotStep(null); setError(''); setSuccessMessage(''); }}>Back to Sign In</a>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </main>
        );
    };

export default Login;
