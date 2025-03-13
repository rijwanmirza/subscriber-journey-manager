
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Copy, Mail, AlertCircle } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  onVerify: () => void;
  onCancel: () => void;
  purpose: 'coupon' | 'unsubscribe';
  testOtp?: string; // For testing purposes
}

const OtpVerification = ({ email, onVerify, onCancel, purpose, testOtp }: OtpVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayTestOtp, setDisplayTestOtp] = useState('');

  // For testing purposes - in a real app, this would be removed
  useEffect(() => {
    if (testOtp) {
      setDisplayTestOtp(testOtp);
      console.log(`Test OTP for ${email}: ${testOtp}`);
    }
  }, [testOtp, email]);

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
      if ((testOtp && otp === testOtp) || (!testOtp && /^\d{6}$/.test(otp))) {
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Verify OTP</CardTitle>
        <CardDescription className="text-center">
          <Mail className="w-4 h-4 inline-block mr-1" />
          We've sent a verification code to {email}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
              <div className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                <div>Test OTP: <span className="font-mono">{displayTestOtp}</span></div>
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
            
            <div className="flex items-center p-2 bg-amber-50 text-amber-800 rounded-md text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              <div>
                <p className="font-medium">In development mode:</p>
                <p>Emails are simulated. Check the console (F12) to see the email details.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-center text-muted-foreground">
            Didn't receive a code? Check your spam folder or console logs.
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
  );
};

export default OtpVerification;
