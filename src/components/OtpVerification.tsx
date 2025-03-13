
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface OtpVerificationProps {
  email: string;
  onVerify: () => void;
  onCancel: () => void;
  purpose: 'coupon' | 'unsubscribe';
}

const OtpVerification = ({ email, onVerify, onCancel, purpose }: OtpVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP code",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call - in a real app, this would validate against a backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, any 6-digit code is valid
      if (otp.length === 6 && /^\d+$/.test(otp)) {
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
          description: "Please enter a valid 6-digit OTP code",
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

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Verify OTP</h3>
        <p className="text-sm text-gray-500">
          We've sent a one-time password to {email}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="otp">Enter 6-digit OTP</Label>
          <Input
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            maxLength={6}
          />
        </div>
        
        <div className="flex justify-between mt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OtpVerification;
