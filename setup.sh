
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

# Create Nginx configuration
cat > /etc/nginx/sites-available/subscriber-journey << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        root /var/www/subscriber-journey/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/subscriber-journey /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Set up environment variables for SMTP
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
certbot --nginx -d yourdomain.com -d www.yourdomain.com --non-interactive --agree-tos --email your-email@example.com

# Start the application with PM2
cd /var/www/subscriber-journey
pm2 start npm --name "subscriber-journey" -- run serve
pm2 startup
pm2 save

echo "Setup completed successfully!"
echo "Your Subscriber Journey Manager is now running at https://yourdomain.com"
echo ""
echo "IMPORTANT: Before using this script, make sure to:"
echo "1. Replace 'yourdomain.com' with your actual domain name"
echo "2. Replace 'your-email@example.com' with your actual email"
echo ""
echo "To run this script, use:"
echo "sudo bash setup.sh"
