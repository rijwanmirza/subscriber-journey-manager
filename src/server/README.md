
# Email Service Setup Guide for Subscriber Journey Manager

This guide explains how to set up real email functionality for the Subscriber Journey Manager application.

## Overview

The application now supports two modes for email functionality:

1. **Production Mode**: Real emails sent via a Node.js backend on your VPS
2. **Simulation Mode**: Browser-based email simulation for development/testing

The application will automatically detect which mode to use based on the availability of the email service.

## Production Mode Setup

### What's Included

The `setup.sh` script now automatically:

1. Sets up the Node.js email service on your VPS
2. Configures Nginx to proxy API requests to the email service
3. Starts the email service with PM2 for persistence
4. Creates the necessary environment files

### Manual Setup (If Needed)

If you need to manually set up the email service:

1. Create a directory for the email service:
   ```bash
   mkdir -p /var/www/email-service
   cd /var/www/email-service
   ```

2. Install dependencies:
   ```bash
   npm init -y
   npm install express nodemailer cors dotenv
   ```

3. Copy the emailService.js file:
   ```bash
   cp /path/to/subscriber-journey/src/server/emailService.js /var/www/email-service/
   ```

4. Create a .env file with your SMTP settings:
   ```bash
   cat > .env << EOF
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=alerts@yoyoprime.com
   SMTP_PASS=indusrabbit1@#$A
   PORT=3001
   EOF
   ```

5. Start the service with PM2:
   ```bash
   pm2 start emailService.js --name "email-service"
   pm2 save
   ```

6. Update Nginx configuration to add API proxy:
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

7. Reload Nginx:
   ```bash
   nginx -t && systemctl reload nginx
   ```

## Testing Email Functionality

You can test if your email service is working correctly:

1. Using curl:
   ```bash
   curl -X POST https://your-domain.com/api/send-email \
     -H "Content-Type: application/json" \
     -d '{"to":"your-email@example.com","subject":"Test Email","html":"<p>This is a test email</p>"}'
   ```

2. Check the email service logs:
   ```bash
   pm2 logs email-service
   ```

## Troubleshooting

If you encounter issues:

1. Check if the email service is running:
   ```bash
   pm2 status email-service
   ```

2. Check the logs:
   ```bash
   pm2 logs email-service
   ```

3. Test the SMTP connection:
   ```bash
   telnet smtp.hostinger.com 465
   ```

4. Make sure your Nginx configuration is properly routing API requests:
   ```bash
   curl -v https://your-domain.com/api/health-check
   ```

5. Check for firewall issues:
   ```bash
   ufw status
   ```

## API Endpoints

The email service provides these endpoints:

- `GET /api/health-check` - Check if the email service is running
- `POST /api/send-email` - Send a generic email
- `POST /api/send-otp` - Send an OTP email for verification

For more information, see the comments in the `emailService.js` file.
