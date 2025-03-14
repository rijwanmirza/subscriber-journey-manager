
#!/bin/bash
# Setup script for Email Marketing System on Ubuntu 22.04

echo "Setting up Email Marketing System..."

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl git

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Create app directory
mkdir -p /var/www/email-marketing
cd /var/www/email-marketing

# Clone the repository 
echo "Cloning the repository..."
git clone https://github.com/yourusername/email-marketing-system.git .

# If you don't have a repository, you can uncomment the following to create a basic package.json
# cat > package.json << 'EOF'
# {
#   "name": "email-marketing-system",
#   "version": "1.0.0",
#   "description": "Email Marketing System",
#   "main": "index.js",
#   "scripts": {
#     "dev": "vite",
#     "build": "vite build",
#     "serve": "vite preview"
#   },
#   "dependencies": {
#     "react": "^18.3.1",
#     "react-dom": "^18.3.1",
#     "react-router-dom": "^6.26.2",
#     "@tanstack/react-query": "^5.56.2"
#   }
# }
# EOF

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
cat > /etc/nginx/sites-available/email-marketing << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        root /var/www/email-marketing/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/email-marketing /etc/nginx/sites-enabled/
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
cd /var/www/email-marketing
pm2 start npm --name "email-marketing" -- run serve
pm2 startup
pm2 save

echo "Setup completed successfully!"
echo "Your Email Marketing System is now running at https://yourdomain.com"
echo ""
echo "IMPORTANT: Before using this script, make sure to:"
echo "1. Replace 'yourusername' with your actual GitHub username"
echo "2. Replace 'yourdomain.com' with your actual domain name"
echo "3. Replace 'your-email@example.com' with your actual email"
echo ""
echo "To run this script, use:"
echo "bash setup.sh"
