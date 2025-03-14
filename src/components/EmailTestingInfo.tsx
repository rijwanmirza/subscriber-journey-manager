
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Copy, ExternalLink, Server } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EmailTestingInfo = () => {
  const [copied, setCopied] = useState(false);
  
  const setupScript = `#!/bin/bash
# One-command setup script for email server on Ubuntu 22.04
# For domain: alerts.indiansmartpanel.com IP: 198.38.89.184

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y nginx certbot python3-certbot-nginx curl

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Create app directory
mkdir -p /var/www/alerts.indiansmartpanel.com
cd /var/www/alerts.indiansmartpanel.com

# Create package.json
cat > package.json << 'EOL'
{
  "name": "email-server",
  "version": "1.0.0",
  "description": "Email server for alerts",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "nodemailer": "^6.9.3",
    "dotenv": "^16.3.1"
  }
}
EOL

# Install dependencies
npm install

# Create server.js
cat > server.js << 'EOL'
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());
app.use(express.static('public'));

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// API endpoint to send OTP
app.post('/api/send-otp', async (req, res) => {
  const { email, subject, body } = req.body;
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: subject || 'Your OTP Code',
      html: body || \`<p>Your OTP code is: <b>\${Math.floor(100000 + Math.random() * 900000)}</b></p>\`
    });
    
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'Email server running' });
});

// Create .env file
require('fs').writeFileSync('.env', \`
SMTP_HOST=\${process.env.SMTP_HOST || 'smtp.hostinger.com'}
SMTP_PORT=\${process.env.SMTP_PORT || 465}
SMTP_SECURE=\${process.env.SMTP_SECURE || 'true'}
SMTP_USER=\${process.env.SMTP_USER || 'alerts@yoyoprime.com'}
SMTP_PASS=\${process.env.SMTP_PASS || 'indusrabbit1@#$A'}
PORT=3000
\`);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
EOL

# Create public directory with sample index.html
mkdir -p public
cat > public/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Server Running</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .success { color: green; }
  </style>
</head>
<body>
  <h1>Email Server Status: <span class="success">Running</span></h1>
  <p>The email server for alerts.indiansmartpanel.com is up and running.</p>
  <p>To test sending an email, use the API endpoint: <code>/api/send-otp</code></p>
</body>
</html>
EOL

# Set up Nginx
cat > /etc/nginx/sites-available/alerts.indiansmartpanel.com << 'EOL'
server {
    listen 80;
    server_name alerts.indiansmartpanel.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Enable the site
ln -sf /etc/nginx/sites-available/alerts.indiansmartpanel.com /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Install PM2 for process management
npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save

# Set up SSL with Let's Encrypt
certbot --nginx -d alerts.indiansmartpanel.com --non-interactive --agree-tos --email admin@indiansmartpanel.com

echo "Setup completed successfully!"
echo "Your email server is now running at https://alerts.indiansmartpanel.com"
echo "IMPORTANT: Update your SMTP settings in the .env file at /var/www/alerts.indiansmartpanel.com/.env"
`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(setupScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto mb-8">
      <CardHeader className="bg-amber-50 border-b border-amber-100">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-600 mt-1 flex-shrink-0" />
          <div>
            <CardTitle className="text-amber-800">Email Testing Information</CardTitle>
            <CardDescription className="text-amber-700 mt-1">
              Why you're not receiving actual emails and how to fix it
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Browser Security Limitation</AlertTitle>
          <AlertDescription className="mt-2">
            <strong>Direct SMTP email sending is not possible from browser-based applications.</strong> This is a security 
            restriction of all web browsers, not an issue with the application code.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="solution">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="solution">Quick Solution</TabsTrigger>
            <TabsTrigger value="explanation">Explanation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="solution" className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">One-Command Server Setup</h3>
              <p className="mb-2">Run this command on your Ubuntu 22.04 VPS (IP: 198.38.89.184) to set up everything automatically:</p>
              
              <div className="relative">
                <div className="bg-black text-white p-3 rounded-md overflow-auto max-h-[300px] text-sm">
                  <pre>{setupScript}</pre>
                </div>
                <Button 
                  size="sm" 
                  className="absolute top-2 right-2" 
                  variant="outline"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                <h4 className="font-medium text-blue-800">After installation:</h4>
                <ol className="list-decimal ml-5 mt-2 text-blue-800">
                  <li>Update SMTP settings in the .env file on your server</li>
                  <li>Restart the server using: <code>pm2 restart server</code></li>
                  <li>Your email API will be available at: <code>https://alerts.indiansmartpanel.com/api/send-otp</code></li>
                </ol>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="explanation" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Why can't emails be sent directly?</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Browsers block direct SMTP connections for security reasons</li>
                <li>SMTP credentials would be exposed in client-side code</li>
                <li>Email servers typically reject connections from browser clients</li>
                <li>This is a fundamental limitation of browser security, not a bug</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">What options do you have?</h3>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <Card className="border-green-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Server className="h-4 w-4 mr-2 text-green-600" />
                      Create a Backend Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>Set up a simple backend service with Node.js/Express and Nodemailer to handle real email sending.</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => window.open('https://nodemailer.com/about/', '_blank')}>
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      Learn More
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                        <path d="M22 12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-9" />
                        <path d="M5 12V6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6" />
                        <rect x="5" y="12" width="14" height="4" />
                      </svg>
                      Use Email Testing Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>Services like Mailtrap provide virtual inboxes for testing without sending actual emails.</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => window.open('https://mailtrap.io/', '_blank')}>
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      Try Mailtrap
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Run the script above on your server to enable real email sending.
        </div>
        <Button variant="outline" size="sm" onClick={() => window.open('https://github.com/nodemailer/nodemailer', '_blank')}>
          <ExternalLink className="h-3.5 w-3.5 mr-2" />
          Nodemailer Docs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailTestingInfo;
