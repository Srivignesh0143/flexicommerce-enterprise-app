import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Signup.css';

const BRANDING_API = (import.meta.env.VITE_API_URL || '/api') + '/branding';

const DEFAULT_BRANDING = {
    signupPageTitle: 'Create Account',
    signupPageSubtitle: 'Join Flexi Commerce and start shopping',
    signupNameLabel: 'Full Name',
    signupEmailLabel: 'Email Address',
    signupPasswordLabel: 'Password',
    signupConfirmPasswordLabel: 'Confirm Password',
    signupTermsLabel: 'I agree to the Terms of Service and Privacy Policy',
    signupSubmitBtn: 'Create Account',
    signupSubmitBtnLoading: 'Creating Account...',
    signupSignInPrompt: 'Already have an account?',
    signupSignInLink: 'Sign In',
};

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [focused, setFocused] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setIsLoading(true);
        try {
            await signup(formData.name, formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.');
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
                     <div className="auth-card-header">
                         <Link to="/" className="auth-card-logo">
                             <span className="logo-flexi">{branding.appNamePart1 || 'Flexi'}</span>
                             <span className="logo-commerce">{branding.appNamePart2 || 'Commerce'}</span>
                         </Link>
                         <div className="auth-icon-circle">
                             <UserPlus size={28} />
                         </div>
                         <h1>{branding.signupPageTitle}</h1>
                         <p>{branding.signupPageSubtitle}</p>
                     </div>

                     {error && (
                         <div className="auth-error">
                             <AlertCircle size={16} /> {error}
                         </div>
                     )}

                     <form className="auth-card-form" onSubmit={handleSubmit}>
                         <div className={`floating-group ${focused === 'name' || formData.name ? 'focused' : ''}`}>
                             <div className="floating-input-wrap">
                                 <User size={18} className="field-icon" />
                                 <input
                                     type="text"
                                     id="signup-name"
                                     name="name"
                                     value={formData.name}
                                     onChange={handleChange}
                                     onFocus={() => setFocused('name')}
                                     onBlur={() => setFocused('')}
                                     placeholder=" "
                                     required
                                 />
                                 <label htmlFor="signup-name">{branding.signupNameLabel}</label>
                             </div>
                         </div>

                         <div className={`floating-group ${focused === 'email' || formData.email ? 'focused' : ''}`}>
                             <div className="floating-input-wrap">
                                 <Mail size={18} className="field-icon" />
                                 <input
                                     type="email"
                                     id="signup-email"
                                     name="email"
                                     value={formData.email}
                                     onChange={handleChange}
                                     onFocus={() => setFocused('email')}
                                     onBlur={() => setFocused('')}
                                     placeholder=" "
                                     required
                                 />
                                 <label htmlFor="signup-email">{branding.signupEmailLabel}</label>
                             </div>
                         </div>

                         <div className={`floating-group ${focused === 'password' || formData.password ? 'focused' : ''}`}>
                             <div className="floating-input-wrap">
                                 <Lock size={18} className="field-icon" />
                                 <input
                                     type={showPassword ? 'text' : 'password'}
                                     id="signup-password"
                                     name="password"
                                     value={formData.password}
                                     onChange={handleChange}
                                     onFocus={() => setFocused('password')}
                                     onBlur={() => setFocused('')}
                                     placeholder=" "
                                     required
                                 />
                                 <label htmlFor="signup-password">{branding.signupPasswordLabel}</label>
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

                         <div className={`floating-group ${focused === 'confirmPassword' || formData.confirmPassword ? 'focused' : ''}`}>
                             <div className="floating-input-wrap">
                                 <Lock size={18} className="field-icon" />
                                 <input
                                     type={showConfirmPassword ? 'text' : 'password'}
                                     id="signup-confirm"
                                     name="confirmPassword"
                                     value={formData.confirmPassword}
                                     onChange={handleChange}
                                     onFocus={() => setFocused('confirmPassword')}
                                     onBlur={() => setFocused('')}
                                     placeholder=" "
                                     required
                                 />
                                 <label htmlFor="signup-confirm">{branding.signupConfirmPasswordLabel}</label>
                                 <button
                                     type="button"
                                     className="toggle-password"
                                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                     aria-label="Toggle password visibility"
                                 >
                                     {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                 </button>
                             </div>
                         </div>

                         <div className="form-check">
                             <input type="checkbox" id="terms" required />
                             <label htmlFor="terms">{branding.signupTermsLabel}</label>
                         </div>

                         <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={isLoading}>
                             {isLoading ? branding.signupSubmitBtnLoading : branding.signupSubmitBtn} {!isLoading && <ArrowRight size={18} />}
                         </button>
                     </form>

                     <p className="auth-card-switch">
                         {branding.signupSignInPrompt} <Link to="/login">{branding.signupSignInLink}</Link>
                     </p>
                 </div>
            </div>
        </main>
    );
};

export default Signup;
