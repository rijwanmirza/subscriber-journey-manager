
# How to Update Your Email Service

If you already have the email service installed on your server, follow these instructions to update the code without reconfiguring SSL certificates or other settings.

## Option 1: Using the Update Script

1. First, connect to your server via SSH:
   ```bash
   ssh user@your-server-address
   ```

2. Navigate to your email service directory:
   ```bash
   cd /var/www/email-service
   ```

3. Back up your existing configuration:
   ```bash
   cp .env .env.backup
   ```

4. Create the update script:
   ```bash
   curl -s https://raw.githubusercontent.com/yoyoprime/email-service-setup/main/update.sh -o update.sh
   chmod +x update.sh
   ```

5. Run the update script:
   ```bash
   sudo ./update.sh
   ```

6. Restart the service:
   ```bash
   pm2 restart email-service
   ```

## Option 2: Manual Update

If you prefer to update manually, follow these steps:

1. Connect to your server via SSH
2. Back up your current setup:
   ```bash
   cd /var/www/email-service
   cp .env .env.backup
   ```

3. Remove the existing code files (keeping your .env):
   ```bash
   find . -type f -not -name '.env' -not -name '.env.backup' -delete
   ```

4. Download the new emailService.js file:
   ```bash
   curl -s https://raw.githubusercontent.com/yoyoprime/email-service-setup/main/emailService.js -o emailService.js
   ```

5. Create/update package.json:
   ```bash
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
   ```

6. Install dependencies and restart:
   ```bash
   npm install
   pm2 restart email-service || pm2 start emailService.js --name "email-service"
   pm2 save
   ```

## Verification

After updating, verify the service is working:

```bash
# Check service status
curl http://localhost:3001/api/health-check

# For remote access
curl https://your-domain.com/api/health-check
```

If you see issues, check logs:
```bash
pm2 logs email-service
```
