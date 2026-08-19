import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MapPin, Mail, Clock, ChevronRight, ArrowUp } from 'lucide-react';
import './Footer.css';

const BRANDING_API = (import.meta.env.VITE_API_URL || '/api') + '/branding';

const DEFAULT_BRANDING = {
    appNamePart1: 'Flexi',
    appNamePart2: 'Commerce',
    footerDesc: 'Your one-stop destination for premium products at unbeatable prices. We deliver quality, style, and value right to your doorstep.',
    footerCopyright: '© 2026 Flexi Commerce. All rights reserved.',
    contactPhoneValue: '+91 6369333565',
    contactAddressValue: 'Tiruchengode',
    contactAddressValue: 'Pudhupuliyampatti,Tiruchengode',
    contactAddressSubtext: 'Erode - 638112',
    contactPersonValue: 'SRIVIGNESH S',
    contactHoursValue: 'Mon - Sat',
    contactHoursSubtext: '9:00 AM - 6:00 PM',
};

const Footer = () => {
    const location = useLocation();
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const [branding, setBranding] = useState(DEFAULT_BRANDING);

    useEffect(() => {
        const fetchBranding = async () => {
            try {
                const res = await fetch(BRANDING_API);
                if (res.ok) {
                    const data = await res.json();
                    setBranding({ ...DEFAULT_BRANDING, ...data });
                }
            } catch (err) {
                console.error('Failed to fetch branding in Footer:', err);
            }
        };
        fetchBranding();
    }, []);

    // Hide footer on admin and delivery pages
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/delivery')) return null;

    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-col footer-about">
                            <Link to="/" className="footer-logo">
                                <span className="logo-flexi">{branding.appNamePart1 || 'Flexi'}</span>
                                <span className="logo-commerce">{branding.appNamePart2 || 'Commerce'}</span>
                            </Link>
                            <p className="footer-description">
                                {branding.footerDesc}
                            </p>
                        </div>

                        <div className="footer-col">
                            <h4 className="footer-heading">Quick Links</h4>
                            <ul className="footer-links">
                                <li><Link to="/"><ChevronRight size={14} /> Home</Link></li>
                                <li><Link to="/products"><ChevronRight size={14} /> Products</Link></li>
                                <li><Link to="/cart"><ChevronRight size={14} /> Cart</Link></li>
                                <li><Link to="/contact"><ChevronRight size={14} /> Contact</Link></li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4 className="footer-heading">My Account</h4>
                            <ul className="footer-links">
                                <li><Link to="/login"><ChevronRight size={14} /> Sign In</Link></li>
                                <li><Link to="/signup"><ChevronRight size={14} /> Sign Up</Link></li>
                                <li><Link to="/cart"><ChevronRight size={14} /> My Cart</Link></li>
                                <li><Link to="/products"><ChevronRight size={14} /> Wishlist</Link></li>
                            </ul>
                        </div>

                        <div className="footer-col">
                            <h4 className="footer-heading">Contact Info</h4>
                            <ul className="footer-contact">
                                <li>
                                    <MapPin size={18} />
                                    <span>{branding.contactAddressValue}, {branding.contactAddressSubtext}</span>
                                </li>
                                <li>
                                    <Phone size={18} />
                                    <span>{branding.contactPhoneValue}</span>
                                </li>
                                <li>
                                    <Mail size={18} />
                                    <span>{branding.contactPersonValue}</span>
                                </li>
                                <li>
                                    <Clock size={18} />
                                    <span>{branding.contactHoursValue}: {branding.contactHoursSubtext}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container footer-bottom-content">
                    <p>{branding.footerCopyright}</p>
                    <div className="footer-bottom-links">
                        <Link to="/">Privacy Policy</Link>
                        <Link to="/">Terms of Service</Link>
                        <Link to="/">Refund Policy</Link>
                    </div>
                </div>
            </div>

            <button className="scroll-to-top" onClick={scrollToTop} aria-label="Scroll to top">
                <ArrowUp size={20} />
            </button>
        </footer>
    );
};

export default Footer;
