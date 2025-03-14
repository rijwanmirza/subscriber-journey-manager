
/**
 * Email Service Template for Subscriber Journey Manager
 * 
 * IMPORTANT: This is just a template showing how to implement real email sending.
 * To use this, you need to set up a Node.js server and run this code on the server side.
 * 
 * HOW TO USE:
 * 1. Create a new Node.js project on your server
 * 2. Install required packages: npm install express nodemailer cors
 * 3. Copy this file to your server project
 * 4. Configure your SMTP settings below
 * 5. Start the server with: node emailService.js
 * 6. Update your frontend to call these API endpoints instead of simulating emails
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure SMTP using environment variables or defaults
const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true' || true,
  auth: {
    user: process.env.SMTP_USER || 'alerts@yoyoprime.com',
    pass: process.env.SMTP_PASS || 'indusrabbit1@#$A'
  }
};

// Create transporter
const transporter = nodemailer.createTransport(smtpConfig);

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send mail');
  }
});

// Generic email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, cc, bcc } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: to, subject, or html' 
      });
    }
    
    const mailOptions = {
      from: `"Subscriber Journey" <${smtpConfig.auth.user}>`,
      to,
      subject,
      html,
      ...(cc && { cc }),
      ...(bcc && { bcc })
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    res.status(200).json({
      success: true,
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('Failed to send email:', error);
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// OTP-specific email endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;
    
    if (!email || !otp || !purpose) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: email, otp, or purpose' 
      });
    }
    
    const subject = purpose === 'coupon' 
      ? 'Your Coupon Code Request' 
      : 'Confirm Unsubscription';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .otp-container { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .otp-code { font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 0; }
          .header { background-color: #4f46e5; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 5px 5px; }
          .footer { margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin: 0; color: white;">${subject}</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>${purpose === 'coupon' ? 'You have requested a coupon code.' : 'We received a request to unsubscribe from our newsletter.'}</p>
          <div class="otp-container">
            <p style="font-size: 14px; margin-bottom: 10px;">Your verification code is:</p>
            <p class="otp-code">${otp}</p>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>Best regards,<br>The Team</p>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"Subscriber Journey" <${smtpConfig.auth.user}>`,
      to: email,
      subject,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('OTP email sent successfully:', info.messageId);
    
    res.status(200).json({
      success: true,
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Email service running on port ${PORT}`);
  console.log(`SMTP configured for: ${smtpConfig.host}:${smtpConfig.port}`);
});

/**
 * ENVIRONMENT VARIABLES:
 * 
 * Create a .env file in the same directory as this script with these variables:
 * 
 * SMTP_HOST=smtp.hostinger.com
 * SMTP_PORT=465
 * SMTP_SECURE=true
 * SMTP_USER=alerts@yoyoprime.com
 * SMTP_PASS=yourpassword
 * PORT=3001
 * 
 * Then install dotenv and add this at the top of the file:
 * require('dotenv').config();
 */
