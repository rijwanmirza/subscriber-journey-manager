
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

# Create email service directory
echo "Setting up email service..."
mkdir -p /var/www/email-service
cd /var/www/email-service

# Install email service dependencies
npm init -y
npm install express nodemailer cors dotenv

# Copy email service file from the main project
cp /var/www/subscriber-journey/src/server/emailService.js /var/www/email-service/

# Create environment file for email service
cat > /var/www/email-service/.env << 'EOF'
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=alerts@yoyoprime.com
SMTP_PASS=indusrabbit1@#$A
PORT=3001
EOF

# Start email service with PM2
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
        proxy_pass http://localhost:3001;
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
nginx -t && systemctl restart nginx

# Set up environment variables for frontend
cd /var/www/subscriber-journey
cat > .env << 'EOF'
VITE_SMTP_HOST=smtp.hostinger.com
VITE_SMTP_PORT=465
VITE_SMTP_SECURE=true
VITE_SMTP_USER=alerts@yoyoprime.com
VITE_SMTP_PASS=indusrabbit1@#$A
EOF

# Set up SSL with Let's Encrypt
echo "Setting up SSL..."
apt install -y certbot python3-certbot-nginx
certbot --nginx -d alerts.indiansmartpanel.com -d www.alerts.indiansmartpanel.com --non-interactive --agree-tos --email rijwamirza@gmail.com

# Start the application with PM2
cd /var/www/subscriber-journey
pm2 start npm --name "subscriber-journey" -- run serve
pm2 startup
pm2 save

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
