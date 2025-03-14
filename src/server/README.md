
# Email Service Setup Guide for Subscriber Journey Manager

This guide explains how to set up real email functionality for the Subscriber Journey Manager application.

## Why Email Simulation Mode?

The frontend application currently runs in "simulation mode" for emails because:

1. Browsers cannot send emails directly due to security restrictions
2. SMTP credentials should not be exposed in frontend code
3. A backend server is required to handle email sending securely

## Setting Up the Email Service

### Prerequisites
- A VPS with Ubuntu 22.04 (as per your setup script)
- Node.js installed (already done by setup.sh)
- Access to SMTP credentials (already in your .env file)

### Step 1: Create a Node.js Backend

1. SSH into your VPS
2. Create a new directory for the email service:
   ```bash
   mkdir -p /var/www/email-service
   cd /var/www/email-service
   ```

3. Initialize a new Node.js project:
   ```bash
   npm init -y
   ```

4. Install required packages:
   ```bash
   npm install express nodemailer cors dotenv
   ```

5. Copy the `emailService.js` file from this directory to your server

### Step 2: Configure Environment Variables

1. Create a `.env` file in the email service directory:
   ```bash
   nano .env
   ```

2. Add the following content (using the same credentials from your main app):
   ```
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=alerts@yoyoprime.com
   SMTP_PASS=indusrabbit1@#$A
   PORT=3001
   ```

### Step 3: Set Up PM2 for the Email Service

1. Start the email service with PM2:
   ```bash
   pm2 start emailService.js --name "email-service"
   pm2 save
   ```

### Step 4: Configure Nginx

1. Update your Nginx configuration to add a proxy for the email API:
   ```bash
   nano /etc/nginx/sites-available/subscriber-journey
   ```

2. Add the following location block inside your server block:
   ```
   location /api/ {
       proxy_pass http://localhost:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```

3. Test and reload Nginx:
   ```bash
   nginx -t
   systemctl reload nginx
   ```

### Step 5: Update Frontend Code

You'll need to modify the frontend code to call the real email API endpoints instead of using simulation mode. The OtpVerification component needs to be updated to make HTTP requests to your new email service.

## Testing the Email Service

To test if your email service is working correctly:

1. Send a test request using curl:
   ```bash
   curl -X POST https://alerts.indiansmartpanel.com/api/send-email \
     -H "Content-Type: application/json" \
     -d '{"to":"your-email@example.com","subject":"Test Email","html":"<p>This is a test email</p>"}'
   ```

2. Check if you receive the test email

## Troubleshooting

If you encounter issues:

1. Check the PM2 logs:
   ```bash
   pm2 logs email-service
   ```

2. Verify SMTP connection:
   ```bash
   telnet smtp.hostinger.com 465
   ```

3. Make sure your SMTP credentials are correct
4. Check that the firewall allows outgoing connections on port 465
5. Ensure your email provider allows sending from your server's IP

For further assistance, contact the developer.
