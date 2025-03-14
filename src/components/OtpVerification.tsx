
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Copy, Mail, AlertCircle, Info, Check, RefreshCw, ExternalLink } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import EmailTestingInfo from './EmailTestingInfo';

interface OtpVerificationProps {
  email: string;
  onVerify: () => void;
  onCancel: () => void;
  purpose: 'coupon' | 'unsubscribe';
  testOtp?: string; // For testing purposes
}

// SMTP configuration interface
interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  }
}

const OtpVerification = ({ email, onVerify, onCancel, purpose, testOtp }: OtpVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayTestOtp, setDisplayTestOtp] = useState('');
  const [smtpStatus, setSmtpStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailSent, setEmailSent] = useState(false);
  const [emailPreviewShown, setEmailPreviewShown] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);
  
  // Updated SMTP configuration
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: 'alerts@yoyoprime.com',
      pass: 'indusrabbit1@#$A'
    }
  });

  // For testing purposes - in a real app, this would be removed
  useEffect(() => {
    if (testOtp) {
      setDisplayTestOtp(testOtp);
      console.log(`Test OTP for ${email}: ${testOtp}`);
    } else {
      // Generate a random OTP if none is provided
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDisplayTestOtp(randomOtp);
      console.log(`Generated OTP for ${email}: ${randomOtp}`);
    }
  }, [testOtp, email]);

  // Automatically trigger email sending on component mount
  useEffect(() => {
    simulateSmtpSend();
  }, []);

  // Show simulated email in a new window
  const showEmailPreview = () => {
    if (emailPreviewShown) return;
    
    const emailSubject = purpose === 'coupon' ? 'Your Coupon Code Request' : 'Confirm Unsubscription';
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${emailSubject}</title>
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
          <h2 style="margin: 0; color: white;">${emailSubject}</h2>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>${purpose === 'coupon' ? 'You have requested a coupon code.' : 'We received a request to unsubscribe from our newsletter.'}</p>
          <div class="otp-container">
            <p style="font-size: 14px; margin-bottom: 10px;">Your verification code is:</p>
            <p class="otp-code">${displayTestOtp}</p>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>Best regards,<br>The Team</p>
        </div>
        <div class="footer">
          <p>This is a simulated email for testing purposes.</p>
          <p><strong>IMPORTANT:</strong> This is only a preview. Real emails cannot be sent directly from browsers.</p>
        </div>
      </body>
      </html>
    `;
    
    const newWindow = window.open('', '_blank', 'width=650,height=600');
    if (newWindow) {
      newWindow.document.write(emailContent);
      newWindow.document.close();
      setEmailPreviewShown(true);
      
      // Reset flag after window closes
      newWindow.onbeforeunload = () => {
        setEmailPreviewShown(false);
      };
    } else {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to view the email preview",
        variant: "destructive",
      });
    }
  };

  // Simulate SMTP connection and sending email with detailed logs
  const simulateSmtpSend = async () => {
    if (emailSent) return;
    
    setSmtpStatus('sending');
    
    try {
      // Clear previous logs
      console.clear(); 
      
      // Big warning about browser limitations
      console.log('%c⚠️ IMPORTANT: BROWSER EMAIL LIMITATION ⚠️', 'font-size: 16px; font-weight: bold; color: #e11d48; background: #fff1f2; padding: 5px; border: 2px solid #e11d48; border-radius: 5px;');
      console.log('%cBrowsers cannot send real emails via SMTP due to security restrictions. This is only a simulation.', 'font-size: 14px; font-style: italic; color: #e11d48;');
      console.log('%cTo send real emails, you need a backend server (Node.js, PHP, etc.) with proper email libraries.', 'font-size: 14px; color: #0f172a;');
      console.log('%c--------------------------------------------------', 'color: #666;');
      
      // Simulate connection to SMTP server
      console.log('%c========== SMTP CONNECTION DETAILS (SIMULATED) ==========', 'font-size: 14px; font-weight: bold; color: #0066cc');
      console.log(`%cConnecting to SMTP server: ${smtpConfig.host}:${smtpConfig.port}`, 'color: #333;');
      console.log(`%cUsing secure connection: ${smtpConfig.secure}`, 'color: #333;');
      console.log(`%cAuthenticated as: ${smtpConfig.auth.user}`, 'color: #333;');
      
      // Simulate delay for SMTP connection
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simulate SMTP handshake
      console.log('%cSMTP Handshake (SIMULATED):', 'color: #333; font-weight: bold;');
      console.log('%c220 smtp.example.com ESMTP ready', 'color: #666;');
      console.log('%c> EHLO client.example.com', 'color: #0066cc;');
      console.log('%c250-smtp.example.com', 'color: #666;');
      console.log('%c250-PIPELINING', 'color: #666;');
      console.log('%c250-8BITMIME', 'color: #666;');
      console.log('%c250-STARTTLS', 'color: #666;');
      console.log('%c250-AUTH PLAIN LOGIN', 'color: #666;');
      console.log('%c> STARTTLS', 'color: #0066cc;');
      console.log('%c220 Ready to start TLS', 'color: #666;');
      
      // Simulate TLS negotiation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate authentication
      console.log('%c> AUTH LOGIN', 'color: #0066cc;');
      console.log('%c334 VXNlcm5hbWU6', 'color: #666;');
      console.log('%c> [Base64 encoded username]', 'color: #0066cc;');
      console.log('%c334 UGFzc3dvcmQ6', 'color: #666;');
      console.log('%c> [Base64 encoded password]', 'color: #0066cc;');
      console.log('%c235 Authentication successful', 'color: #666;');
      
      // Simulate sending email
      console.log('%c========== EMAIL TRANSMISSION (SIMULATED) ==========', 'font-size: 14px; font-weight: bold; color: #0066cc');
      console.log(`%c> MAIL FROM:<${smtpConfig.auth.user}>`, 'color: #0066cc;');
      console.log('%c250 OK', 'color: #666;');
      console.log(`%c> RCPT TO:<${email}>`, 'color: #0066cc;');
      console.log('%c250 OK', 'color: #666;');
      console.log('%c> DATA', 'color: #0066cc;');
      console.log('%c354 End data with <CR><LF>.<CR><LF>', 'color: #666;');
      
      // Email content
      const emailSubject = purpose === 'coupon' ? 'Your Coupon Code Request' : 'Confirm Unsubscription';
      console.log('%c> [Email content]', 'color: #0066cc;');
      console.log('%cFrom: "My App" <' + smtpConfig.auth.user + '>', 'color: #0066cc;');
      console.log('%cTo: <' + email + '>', 'color: #0066cc;');
      console.log('%cSubject: ' + emailSubject, 'color: #0066cc;');
      console.log('%cDate: ' + new Date().toString(), 'color: #0066cc;');
      console.log('%cMIME-Version: 1.0', 'color: #0066cc;');
      console.log('%cContent-Type: text/html; charset=utf-8', 'color: #0066cc;');
      console.log('%c', 'color: #0066cc;');
      console.log('%c<!DOCTYPE html>', 'color: #0066cc;');
      console.log('%c<html>', 'color: #0066cc;');
      console.log('%c<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">', 'color: #0066cc;');
      console.log('%c  <h2 style="color: #333;">' + emailSubject + '</h2>', 'color: #0066cc;');
      console.log('%c  <p>Hello,</p>', 'color: #0066cc;');
      console.log('%c  <p>' + (purpose === 'coupon' ? 'You have requested a coupon code.' : 'We received a request to unsubscribe from our newsletter.') + '</p>', 'color: #0066cc;');
      console.log('%c  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">', 'color: #0066cc;');
      console.log('%c    <p style="font-size: 14px; margin-bottom: 10px;">Your verification code is:</p>', 'color: #0066cc;');
      console.log('%c    <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 0;">' + displayTestOtp + '</p>', 'color: #0066cc;');
      console.log('%c  </div>', 'color: #0066cc;');
      console.log('%c  <p>This code will expire in 10 minutes.</p>', 'color: #0066cc;');
      console.log('%c  <p>If you did not request this, please ignore this email.</p>', 'color: #0066cc;');
      console.log('%c  <p>Best regards,<br>The Team</p>', 'color: #0066cc;');
      console.log('%c</body>', 'color: #0066cc;');
      console.log('%c</html>', 'color: #0066cc;');
      console.log('%c.', 'color: #0066cc;');
      
      // Simulate response
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('%c250 OK: message queued (SIMULATED)', 'color: #666;');
      console.log('%c> QUIT', 'color: #0066cc;');
      console.log('%c221 Bye', 'color: #666;');
      console.log('%c=========== EMAIL SIMULATION COMPLETE ==========', 'font-size: 14px; font-weight: bold; color: #0066cc');
      
      // Simulation notice
      console.log('%c👉 REMINDER: This is only a simulation! No real email was sent.', 'font-size: 14px; font-weight: bold; color: #f59e0b; background: #fffbeb; padding: 5px; border: 1px solid #f59e0b; border-radius: 5px;');
      console.log('%c👉 You can test the functionality using the OTP code: ' + displayTestOtp, 'font-size: 14px; font-weight: bold; color: #047857; background: #ecfdf5; padding: 5px; border: 1px solid #047857; border-radius: 5px;');
      console.log('%c👉 Click "View Email" button to see what the email would look like', 'font-size: 14px; font-weight: bold; color: #1d4ed8; background: #eff6ff; padding: 5px; border: 1px solid #1d4ed8; border-radius: 5px;');
      
      // Simulate successful email delivery
      console.log('%c========== EMAIL DELIVERY STATUS (SIMULATED) ==========', 'font-size: 14px; font-weight: bold; color: #0066cc');
      console.log(`%cRecipient: ${email}`, 'color: #333;');
      console.log(`%cStatus: Delivered (SIMULATED)`, 'color: #008800; font-weight: bold;');
      console.log(`%cDelivery time: ${new Date().toString()}`, 'color: #333;');
      console.log(`%cMessage ID: <${Math.random().toString(36).substring(2, 15)}@example.com>`, 'color: #333;');
      
      setSmtpStatus('success');
      setEmailSent(true);
      
      toast({
        title: "Email Simulation Complete",
        description: `Verification code: ${displayTestOtp} (No real email was sent)`,
      });
    } catch (error) {
      console.error('SMTP Simulation Error:', error);
      setSmtpStatus('error');
      
      toast({
        title: "Simulation Failed",
        description: "Failed to simulate email sending",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP code",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call - in a real app, this would validate against a backend
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes - in a real app, this would check against the actual OTP
      // Using testOtp for development testing if available
      if ((testOtp && otp === testOtp) || (!testOtp && otp === displayTestOtp)) {
        toast({
          title: "Success",
          description: purpose === 'coupon' 
            ? "Coupon code has been sent to your email" 
            : "You have been unsubscribed successfully",
        });
        
        onVerify();
      } else {
        toast({
          title: "Invalid OTP",
          description: "The OTP code you entered is incorrect",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTestOtp = () => {
    if (displayTestOtp) {
      navigator.clipboard.writeText(displayTestOtp);
      toast({
        title: "Copied",
        description: "Test OTP copied to clipboard",
      });
    }
  };

  const resendEmail = () => {
    setEmailSent(false);
    setSmtpStatus('idle');
    setEmailPreviewShown(false);
    simulateSmtpSend();
  };

  return (
    <>
      {showInfoCard && <EmailTestingInfo />}
      
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Verify OTP</CardTitle>
          <CardDescription className="text-center">
            <Mail className="w-4 h-4 inline-block mr-1" />
            We've simulated sending a code to {email}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Alert variant="default" className={`${smtpStatus === 'success' ? 'bg-green-50 border-green-200 text-green-800' : smtpStatus === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                <div className="flex items-center">
                  {smtpStatus === 'sending' && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  {smtpStatus === 'success' && <Check className="h-4 w-4 mr-2" />}
                  {smtpStatus === 'error' && <AlertCircle className="h-4 w-4 mr-2" />}
                  {smtpStatus === 'idle' && <Info className="h-4 w-4 mr-2" />}
                  <AlertTitle>
                    {smtpStatus === 'sending' && 'Simulation in Progress...'}
                    {smtpStatus === 'success' && 'Simulation Complete'}
                    {smtpStatus === 'error' && 'Simulation Failed'}
                    {smtpStatus === 'idle' && 'Email Simulation'}
                  </AlertTitle>
                </div>
                <AlertDescription>
                  {smtpStatus === 'sending' && 'Simulating SMTP connection and email sending...'}
                  {smtpStatus === 'success' && 
                    <>
                      <div className="mb-2">
                        <span className="font-medium text-red-600">No real email was sent</span> due to browser limitations. 
                        <Button 
                          type="button" 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 mb-1 underline font-medium"
                          onClick={() => setShowInfoCard(prev => !prev)}
                        >
                          Why?
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={showEmailPreview}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-2" />
                          View Email
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={resendEmail}
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-2" />
                          Resend Simulation
                        </Button>
                      </div>
                    </>
                  }
                  {smtpStatus === 'error' && 
                    <>
                      <div className="mb-2">There was a problem with the email simulation.</div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={resendEmail}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-2" />
                        Retry Simulation
                      </Button>
                    </>
                  }
                  {smtpStatus === 'idle' && 'Preparing to simulate SMTP email sending...'}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-digit code</Label>
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              {displayTestOtp && (
                <div className="flex items-center justify-between p-2 bg-amber-50 text-amber-800 rounded-md">
                  <div className="font-medium">Test OTP: <span className="font-mono">{displayTestOtp}</span></div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={copyTestOtp}
                    className="h-7 w-7 p-0"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center p-2 bg-blue-50 text-blue-800 rounded-md text-sm">
                <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">See simulation details in your browser:</p>
                  <ol className="list-decimal list-inside ml-1 space-y-1 mt-1">
                    <li>Press F12 to open Developer Tools</li>
                    <li>Click on the "Console" tab</li>
                    <li>You'll see detailed simulation logs</li>
                  </ol>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default OtpVerification;
