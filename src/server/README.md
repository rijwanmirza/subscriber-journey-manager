
# Email Service Setup Guide for Subscriber Journey Manager

This guide explains how to set up real email functionality for the Subscriber Journey Manager application.

## Quick Setup

To deploy the application with real email capabilities, simply run:

```bash
sudo bash setup.sh
```

The setup script will:
1. Install all necessary dependencies
2. Set up the email service backend
3. Configure Nginx with proper routing
4. Set up SSL certificates
5. Start all services with PM2

## Testing Email Functionality

After running the setup script, test if the email service is working correctly:

```bash
# Check if the service is running
curl https://your-domain.com/api/health-check

# Send a test email
curl -X POST https://your-domain.com/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com","subject":"Test Email","html":"<p>This is a test email</p>"}'
```

## Manual Verification Steps

If you need to manually verify the setup:

1. Check if the email service is running:
   ```bash
   pm2 status email-service
   ```

2. Check the application logs:
   ```bash
   pm2 logs email-service
   ```

3. Test the SMTP connection directly:
   ```bash
   # Install telnet if needed
   apt install -y telnet
   # Test connection to SMTP server
   telnet smtp.hostinger.com 465
   ```

4. Check Nginx configuration:
   ```bash
   nginx -t
   ```

## Troubleshooting

If emails are not being sent:

1. Verify SMTP credentials in `/var/www/email-service/.env`
2. Make sure port 3001 is not blocked by the firewall
3. Check that Nginx is properly routing API requests to the email service
4. Verify that the email service is running with `pm2 status`
5. Check the logs with `pm2 logs email-service`

## API Endpoints

The email service provides these endpoints:

- `GET /api/health-check` - Check if the email service is running
- `POST /api/send-email` - Send a generic email
- `POST /api/send-otp` - Send an OTP email for verification

## SMTP Configuration

The default SMTP configuration uses:
- Host: smtp.hostinger.com
- Port: 465
- User: alerts@yoyoprime.com

To use different SMTP settings, run the configuration script:
```bash
cd /var/www/email-service
./configure-smtp.sh
```

## Updating the Service

If you need to update the email service:

1. Stop the service:
   ```bash
   pm2 stop email-service
   ```

2. Edit the files in `/var/www/email-service/`

3. Restart the service:
   ```bash
   pm2 restart email-service
   ```

## Security Considerations

- The email service uses HTTPS with Let's Encrypt SSL certificates
- All API endpoints are protected by Nginx
- Consider adding API keys for production use if needed
