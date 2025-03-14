
#!/bin/bash
# Email Service Update Script for Subscriber Journey Manager
# This script updates existing email service code without changing configuration

echo "==================================================================="
echo "  Updating Email Service for Subscriber Journey Manager"
echo "==================================================================="

# Create email service files
echo "Creating email service files..."
cat > emailService.js << 'EOF'
/**
 * Email Service for Subscriber Journey Manager
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

// Load environment variables
dotenv.config();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Configure SMTP using environment variables
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

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send mail');
  }
});

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Email service is running',
    version: '1.0.2',
    smtp: {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.auth.user
    }
  });
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

// Add a simple status page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Service Status</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #4f46e5; }
        .card { border: 1px solid #e5e7eb; border-radius: 5px; padding: 20px; margin: 20px 0; }
        .success { color: #10b981; }
        .code { font-family: monospace; background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        .endpoints { list-style-type: none; padding: 0; }
        .endpoints li { margin-bottom: 10px; }
        .label { display: inline-block; background-color: #e5e7eb; border-radius: 3px; padding: 2px 6px; margin-right: 5px; }
      </style>
    </head>
    <body>
      <h1>Email Service Status</h1>
      <div class="card">
        <h2 class="success">✓ Service is running</h2>
        <p>The email service is active and ready to send emails.</p>
        <p><strong>SMTP Configuration:</strong></p>
        <pre class="code">
Host: ${smtpConfig.host}
Port: ${smtpConfig.port}
Secure: ${smtpConfig.secure}
User: ${smtpConfig.auth.user}
        </pre>
      </div>
      
      <div class="card">
        <h2>Available Endpoints</h2>
        <ul class="endpoints">
          <li><span class="label">GET</span> <code>/api/health-check</code> - Check service status</li>
          <li><span class="label">POST</span> <code>/api/send-email</code> - Send generic email</li>
          <li><span class="label">POST</span> <code>/api/send-otp</code> - Send OTP verification email</li>
        </ul>
      </div>
      
      <div class="card">
        <h2>Testing</h2>
        <p>To test the email service, you can use curl:</p>
        <pre class="code">
curl -X POST https://your-domain.com/api/send-email \\
  -H "Content-Type: application/json" \\
  -d '{"to":"your-email@example.com","subject":"Test Email","html":"<p>This is a test email</p>"}'
        </pre>
      </div>
    </body>
    </html>
  `);
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Email service running on port ${PORT}`);
  console.log(`SMTP configured for: ${smtpConfig.host}:${smtpConfig.port}`);
});
EOF

# Create package.json for email service
cat > package.json << 'EOF'
{
  "name": "email-service",
  "version": "1.0.0",
  "description": "Email service for Subscriber Journey Manager",
  "main": "emailService.js",
  "scripts": {
    "start": "node emailService.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "nodemailer": "^6.9.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
EOF

# Create a configuration prompt if it doesn't exist
if [ ! -f configure-smtp.sh ]; then
  echo "Creating configuration script..."
  cat > configure-smtp.sh << 'EOF'
#!/bin/bash
# Script to update SMTP configuration

echo "==================================================================="
echo "  SMTP Configuration for Email Service"
echo "==================================================================="

# Get current values from .env file
current_host=$(grep SMTP_HOST .env | cut -d= -f2)
current_port=$(grep SMTP_PORT .env | cut -d= -f2)
current_secure=$(grep SMTP_SECURE .env | cut -d= -f2)
current_user=$(grep SMTP_USER .env | cut -d= -f2)
current_pass=$(grep SMTP_PASS .env | cut -d= -f2- || echo "")

# Prompt for new values
read -p "SMTP Host [$current_host]: " host
host=${host:-$current_host}

read -p "SMTP Port [$current_port]: " port
port=${port:-$current_port}

read -p "SMTP Secure (true/false) [$current_secure]: " secure
secure=${secure:-$current_secure}

read -p "SMTP Username [$current_user]: " user
user=${user:-$current_user}

read -p "SMTP Password: " -s pass
echo ""
pass=${pass:-$current_pass}

# Write new values to .env file
cat > .env << EOL
# SMTP Configuration
SMTP_HOST=$host
SMTP_PORT=$port
SMTP_SECURE=$secure
SMTP_USER=$user
SMTP_PASS=$pass

# Server Configuration
PORT=3001
EOL

echo "SMTP configuration updated. Restarting email service..."
pm2 restart email-service || echo "Service not running, will be started by setup script"

echo "==================================================================="
echo "  SMTP Configuration Complete"
echo "==================================================================="
EOF
  chmod +x configure-smtp.sh
fi

# Create a test script
echo "Creating test script..."
cat > test-email-service.sh << 'EOF'
#!/bin/bash
# Script to test the email service

echo "==================================================================="
echo "  Testing Email Service"
echo "==================================================================="

# Check if service is running
echo "Checking if service is running..."
curl -s http://localhost:3001/api/health-check || { echo "Service not running"; exit 1; }

# Prompt for test email
read -p "Enter email to send test to: " email

# Send test email
echo "Sending test email to $email..."
curl -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d "{\"to\":\"$email\",\"subject\":\"Test Email from $(hostname)\",\"html\":\"<p>This is a test email from your email service.</p><p>If you're seeing this, your email service is working correctly!</p>\"}"

echo ""
echo "==================================================================="
echo "  Test Complete - Check your inbox"
echo "==================================================================="
EOF

chmod +x test-email-service.sh

# Install email service dependencies
echo "Installing email service dependencies..."
npm install

echo "==================================================================="
echo "  Email Service Update Complete"
echo "==================================================================="
echo ""
echo "The email service code has been updated."
echo "Your existing configuration and SSL settings have been preserved."
echo ""
echo "To restart the service, run:"
echo "pm2 restart email-service"
echo ""
echo "To test the service, run:"
echo "./test-email-service.sh"
echo ""
echo "==================================================================="
