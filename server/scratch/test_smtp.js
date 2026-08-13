import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const testSend = async () => {
    console.log(`Testing SMTP Host: ${smtpHost}:${smtpPort}`);
    console.log(`User: ${smtpUser}`);

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        const info = await transporter.sendMail({
            from: `"FlexiCommerce Test" <${smtpUser}>`,
            to: 'mohantwo3@gmail.com',
            subject: 'Test SMTP Email',
            html: '<h3>Hello! This is a test email via Nodemailer SMTP.</h3>',
        });

        console.log('Success! Message ID:', info.messageId);
    } catch (err) {
        console.error('SMTP Error:', err);
    }
};

testSend();
