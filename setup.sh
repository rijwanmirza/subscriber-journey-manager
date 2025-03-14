
#!/bin/bash
# Setup script for Subscriber Journey Manager on Ubuntu 22.04

echo "Setting up Subscriber Journey Manager..."

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl git

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Create app directory
mkdir -p /var/www/subscriber-journey
cd /var/www/subscriber-journey

# Clone the repository using GitHub token
echo "Cloning the repository..."
# GitHub token is already set
GITHUB_TOKEN="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"
git clone https://${GITHUB_TOKEN}@github.com/rijwanmirza/subscriber-journey-manager.git .

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Install PM2 for process management
echo "Setting up process management..."
npm install -g pm2

# Set up Nginx
echo "Setting up Nginx..."
apt install -y nginx

# Create and configure email service
echo "Setting up email service..."
mkdir -p /var/www/email-service
cd /var/www/email-service

# Create emailService.js
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
app.use(cors());
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
    message: 'Email service is running'
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

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Email service running on port ${PORT}`);
  console.log(`SMTP configured for: ${smtpConfig.host}:${smtpConfig.port}`);
});
EOF

# Install email service dependencies
npm init -y
npm install express nodemailer cors dotenv

# Create environment file for email service
cat > .env << 'EOF'
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=alerts@yoyoprime.com
SMTP_PASS=indusrabbit1@#$A
PORT=3001
EOF

# Start email service with PM2
pm2 stop email-service || echo "No existing service found"
pm2 delete email-service || echo "No existing service to delete"
pm2 start emailService.js --name "email-service"
pm2 save

# Create Nginx configuration with proxy for email API
cat > /etc/nginx/sites-available/subscriber-journey << 'EOF'
server {
    listen 80;
    server_name alerts.indiansmartpanel.com www.alerts.indiansmartpanel.com;
    
    location / {
        root /var/www/subscriber-journey/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/subscriber-journey /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Set up environment variables for frontend
cd /var/www/subscriber-journey
cat > .env << 'EOF'
VITE_SMTP_HOST=smtp.hostinger.com
VITE_SMTP_PORT=465
VITE_SMTP_SECURE=true
VITE_SMTP_USER=alerts@yoyoprime.com
VITE_SMTP_PASS=indusrabbit1@#$A
EOF

# Set up SSL with Let's Encrypt if not already set up
if [ ! -f /etc/letsencrypt/live/alerts.indiansmartpanel.com/fullchain.pem ]; then
  echo "Setting up SSL..."
  apt install -y certbot python3-certbot-nginx
  certbot --nginx -d alerts.indiansmartpanel.com -d www.alerts.indiansmartpanel.com --non-interactive --agree-tos --email rijwamirza@gmail.com
else
  echo "SSL certificates already exist, skipping SSL setup"
fi

# Restart the application with PM2
cd /var/www/subscriber-journey
npm run build
pm2 restart subscriber-journey || pm2 start npm --name "subscriber-journey" -- run serve
pm2 startup
pm2 save

# Test email endpoint
echo "Testing email service..."
curl -X GET http://localhost:3001/api/health-check
echo ""
echo "If the above test returned a JSON response, the email service is running correctly."

echo "Setup completed successfully!"
echo "Your Subscriber Journey Manager is now running at https://alerts.indiansmartpanel.com"
echo ""
echo "IMPORTANT: The script has been configured with:"
echo "1. Domain: alerts.indiansmartpanel.com"
echo "2. Email: rijwamirza@gmail.com"
echo "3. Email service running at https://alerts.indiansmartpanel.com/api/"
echo ""
echo "To test email functionality, you can use:"
echo "curl -X POST https://alerts.indiansmartpanel.com/api/send-email -H \"Content-Type: application/json\" -d '{\"to\":\"your@email.com\",\"subject\":\"Test Email\",\"html\":\"<p>This is a test</p>\"}'"
echo ""
echo "To run this script, use:"
echo "sudo bash setup.sh"
