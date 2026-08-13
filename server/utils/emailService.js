import nodemailer from 'nodemailer';
import dns from 'dns';
import dotenv from 'dotenv';
import BrandingSettings from '../models/BrandingSettings.js';

dotenv.config();

// Helper to fetch branding settings
const getBrandingInfo = async () => {
    let mailName = 'FlexiCommerce';
    let primaryColor = '#2563eb';
    let accentColor = '#10b981';
    try {
        const branding = await BrandingSettings.findOne({ docId: 'singleton' });
        if (branding) {
            if (branding.mailName) mailName = branding.mailName;
            if (branding.colorPrimary) primaryColor = branding.colorPrimary;
            if (branding.colorAccent) accentColor = branding.colorAccent;
        }
    } catch (err) {
        console.error('Error fetching branding settings for mail:', err);
    }
    return { mailName, primaryColor, accentColor };
};

export const sendEmail = async ({ to, subject, htmlContent }) => {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // Get branding settings dynamically
    const { mailName } = await getBrandingInfo();

    // Check if SMTP is configured and not default placeholder
    const isSmtpConfigured =
        smtpUser &&
        smtpUser !== 'your-gmail-address@gmail.com' &&
        smtpPass &&
        smtpPass !== 'your-16-character-app-password';

    if (isSmtpConfigured) {
        try {
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
                lookup: (hostname, options, callback) => {
                    dns.lookup(hostname, { family: 4 }, callback);
                }
            });

            const info = await transporter.sendMail({
                from: `"${mailName}" <${smtpUser}>`,
                to: to.email,
                subject: subject,
                html: htmlContent,
            });

            console.log('Email sent successfully via SMTP:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (err) {
            console.error('SMTP sending error:', err);
            return { success: false, error: err.message };
        }
    }

    // Otherwise, check if Brevo is configured
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.ADMIN_EMAIL || 'noreply@flexicommerce.com';

    const isBrevoConfigured = apiKey && apiKey !== 'your-brevo-api-key';

    if (isBrevoConfigured) {
        try {
            const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
            const response = await fetch(BREVO_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey,
                },
                body: JSON.stringify({
                    sender: { name: mailName, email: senderEmail },
                    to: [{ email: to.email, name: to.name }],
                    subject,
                    htmlContent,
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error('Brevo API Error Response:', errData);
                throw new Error(`Failed to send email via Brevo. Status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, messageId: data.messageId };
        } catch (err) {
            console.error('Failed to send email via Brevo:', err);
            return { success: false, error: err.message };
        }
    }

    // Mock mode
    console.warn('--- EMAIL MOCK MODE (NO CONFIGURATION FOUND) ---');
    console.warn(`To: ${to.email} (${to.name})`);
    console.warn(`Subject: ${subject}`);
    console.warn(`Content: ${htmlContent}`);
    console.warn('------------------------------------------------');
    return { success: true, mock: true };
};

export const sendDeliveryOtpEmail = async (toEmail, toName, otp, orderId) => {
    const { mailName, primaryColor } = await getBrandingInfo();
    const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; min-height: 100%;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="background-color: ${primaryColor}; padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">${mailName}</h1>
                </div>
                <div style="padding: 32px 24px;">
                    <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 600; text-align: center;">Delivery Verification Code</h2>
                    <p style="color: #475569; font-size: 15px; line-height: 24px; margin-bottom: 24px; text-align: center;">
                        Hello <strong>${toName}</strong>,<br/>
                        Your delivery agent is at your location for order <strong>#${orderId}</strong>.<br/>
                        Please share the secure One-Time Password (OTP) below to verify and receive your shipment.
                    </p>
                    <div style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                        <span style="font-family: Monaco, Consolas, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: ${primaryColor};">${otp}</span>
                    </div>
                    <p style="color: #64748b; font-size: 13px; line-height: 20px; text-align: center; margin-bottom: 0;">
                        For your security, please do not share this OTP with anyone other than the delivery partner. This OTP is valid for 15 minutes.
                    </p>
                </div>
                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">Thank you for shopping with ${mailName}!</p>
                </div>
            </div>
        </div>
    `;

    return sendEmail({
        to: { email: toEmail, name: toName },
        subject: `Delivery OTP for Order #${orderId} - ${mailName}`,
        htmlContent,
    });
};

export const sendOrderDeliveredEmail = async (toEmail, toName, orderId, totalAmount) => {
    const { mailName, accentColor } = await getBrandingInfo();
    const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; min-height: 100%;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="background-color: ${accentColor}; padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">${mailName}</h1>
                </div>
                <div style="padding: 32px 24px;">
                    <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 600; text-align: center;">Package Delivered Successfully! </h2>
                    <p style="color: #475569; font-size: 15px; line-height: 24px; margin-bottom: 24px; text-align: center;">
                        Dear <strong>${toName}</strong>,<br/>
                        Your order <strong>#${orderId}</strong> has been successfully delivered and completed.
                    </p>
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 15px; font-weight: 600; color: #166534; text-align: center;">Order Status: DELIVERED</p>
                        <p style="margin: 6px 0 0; color: #166534; font-size: 14px; text-align: center;">Total Amount: <strong>Rs. ${Number(totalAmount).toLocaleString()}</strong></p>
                    </div>
                    <p style="color: #475569; font-size: 15px; line-height: 24px; text-align: center; margin-bottom: 0;">
                        We hope you love your new purchase! If you have any feedback or queries, feel free to get in touch.
                    </p>
                </div>
                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">Thank you for shopping with ${mailName}!</p>
                </div>
            </div>
        </div>
    `;

    return sendEmail({
        to: { email: toEmail, name: toName },
        subject: `Order Delivered: #${orderId} - ${mailName}`,
        htmlContent,
    });
};

export const sendOrderOutForDeliveryEmail = async (toEmail, toName, orderId, shippingAddress) => {
    const { mailName, primaryColor } = await getBrandingInfo();
    const addressString = shippingAddress
        ? `${shippingAddress.address || ''}, ${shippingAddress.city || ''}, ${shippingAddress.state || ''} - ${shippingAddress.pincode || ''}`
        : 'your registered address';

    const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; min-height: 100%;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="background-color: ${primaryColor}; padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">${mailName}</h1>
                </div>
                <div style="padding: 32px 24px;">
                    <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 600; text-align: center;">Your Order is Out for Delivery! 🚚</h2>
                    <p style="color: #475569; font-size: 15px; line-height: 24px; margin-bottom: 24px; text-align: center;">
                        Hi <strong>${toName}</strong>,<br/>
                        Great news! Your order <strong>#${orderId}</strong> is out for delivery and will reach you today.
                    </p>
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <h4 style="margin-top: 0; margin-bottom: 8px; color: #334155; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Destination</h4>
                        <p style="margin: 0; color: #475569; font-size: 14px; line-height: 22px;">
                            ${addressString}<br/>
                            ${shippingAddress?.phone ? `<strong>Phone:</strong> ${shippingAddress.phone}` : ''}
                        </p>
                    </div>
                    <p style="color: #64748b; font-size: 13px; line-height: 20px; text-align: center; margin-bottom: 0;">
                        Please verify that someone is available at the address to receive the package and complete verification.
                    </p>
                </div>
                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">Thank you for shopping with ${mailName}!</p>
                </div>
            </div>
        </div>
    `;

    return sendEmail({
        to: { email: toEmail, name: toName },
        subject: `Order Out for Delivery: #${orderId} - ${mailName}`,
        htmlContent,
    });
};

export const sendPasswordResetOtpEmail = async (toEmail, toName, otp) => {
    const { mailName, primaryColor } = await getBrandingInfo();
    const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; min-height: 100%;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="background-color: ${primaryColor}; padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">${mailName}</h1>
                </div>
                <div style="padding: 32px 24px;">
                    <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 600; text-align: center;">Reset Your Password</h2>
                    <p style="color: #475569; font-size: 15px; line-height: 24px; margin-bottom: 24px; text-align: center;">
                        Hello <strong>${toName}</strong>,<br/>
                        We received a request to reset your password. Use the verification OTP below to proceed with setting up a new password.
                    </p>
                    <div style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                        <span style="font-family: Monaco, Consolas, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: ${primaryColor};">${otp}</span>
                    </div>
                    <p style="color: #64748b; font-size: 13px; line-height: 20px; text-align: center; margin-bottom: 0;">
                        This OTP is valid for 15 minutes. If you did not request a password reset, you can safely ignore this email.
                    </p>
                </div>
                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">Thank you for choosing ${mailName}!</p>
                </div>
            </div>
        </div>
    `;

    return sendEmail({
        to: { email: toEmail, name: toName },
        subject: `Password Reset Verification Code - ${mailName}`,
        htmlContent,
    });
};
