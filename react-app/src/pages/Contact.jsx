import { useState, useEffect } from 'react';
import { Phone, MapPin, Mail, Clock, Send, User } from 'lucide-react';
import './Contact.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BRANDING_API = API_URL + '/branding';

const DEFAULT_BRANDING = {
    contactPageTitle: 'Contact Us',
    contactPageSubtitle: "We'd love to hear from you. Get in touch with us.",
    contactPhoneTitle: 'Phone',
    contactPhoneValue: '+91 9003948329',
    contactPhoneSubtext: 'Mon-Sat, 9AM-8PM',
    contactAddressTitle: 'Address',
    contactAddressValue: 'Kanagapuram, Vellode',
    contactAddressSubtext: 'Erode - 638112',
    contactPersonTitle: 'Contact Person',
    contactPersonValue: 'MohanRaja V',
    contactPersonSubtext: 'Owner & Founder',
    contactHoursTitle: 'Business Hours',
    contactHoursValue: 'Mon - Sat',
    contactHoursSubtext: '9:00 AM - 8:00 PM',
    contactFormTitle: 'Send us a Message',
    contactFormDesc: "Fill out the form below and we'll get back to you as soon as possible.",
    contactFormBtnText: 'Send Message',
    contactMapTitle: 'Find Us',
    contactMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3913.5!2d77.7!3d11.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDIxJzAwLjAiTiA3N8KwNDInMDAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin',
};

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [branding, setBranding] = useState(DEFAULT_BRANDING);
    const [loading, setLoading] = useState(true);

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
                setLoading(false);
            }
        };
        fetchBranding();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                showToast('Your message has been sent successfully!', 'success');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to submit query.', 'error');
            }
        } catch (err) {
            console.error('Failed to submit form:', err);
            showToast('Unable to submit your message. Please try again.', 'error');
        }
    };

    return (
        <main className="contact-page">
            {toast.show && (
                <div className={`contact-toast ${toast.type}`}>
                    <div className="toast-content">
                        <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
                        <p>{toast.message}</p>
                    </div>
                </div>
            )}
            <section className="page-header">
                <div className="container">
                    <h1>{branding.contactPageTitle}</h1>
                    <p>{branding.contactPageSubtitle}</p>
                </div>
            </section>

            <section className="container contact-layout section">
                {/* Contact Info Cards */}
                <div className="contact-info-grid">
                    <div className="contact-info-card">
                        <div className="contact-info-icon">
                            <Phone size={24} />
                        </div>
                        <h3>{branding.contactPhoneTitle}</h3>
                        <p>{branding.contactPhoneValue}</p>
                        <span>{branding.contactPhoneSubtext}</span>
                    </div>
                    <div className="contact-info-card">
                        <div className="contact-info-icon">
                            <MapPin size={24} />
                        </div>
                        <h3>{branding.contactAddressTitle}</h3>
                        <p>{branding.contactAddressValue}</p>
                        <span>{branding.contactAddressSubtext}</span>
                    </div>
                    <div className="contact-info-card">
                        <div className="contact-info-icon">
                            <User size={24} />
                        </div>
                        <h3>{branding.contactPersonTitle}</h3>
                        <p>{branding.contactPersonValue}</p>
                        <span>{branding.contactPersonSubtext}</span>
                    </div>
                    <div className="contact-info-card">
                        <div className="contact-info-icon">
                            <Clock size={24} />
                        </div>
                        <h3>{branding.contactHoursTitle}</h3>
                        <p>{branding.contactHoursValue}</p>
                        <span>{branding.contactHoursSubtext}</span>
                    </div>
                </div>

                {/* Contact Form + Map */}
                <div className="contact-content">
                    <div className="contact-form-wrapper">
                        <h2>{branding.contactFormTitle}</h2>
                        <p>{branding.contactFormDesc}</p>

                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea id="message" name="message" rows="5" value={formData.message} onChange={handleChange} placeholder="Write your message here..." required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg">
                                <Send size={18} /> {branding.contactFormBtnText}
                            </button>
                        </form>
                    </div>

                    <div className="contact-map">
                        <h2>{branding.contactMapTitle}</h2>
                        <div className="map-container">
                            <iframe
                                title="Flexi Commerce Location"
                                src={branding.contactMapEmbedUrl}
                                width="100%"
                                height="350"
                                style={{ border: 0, borderRadius: '12px' }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Contact;
