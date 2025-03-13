
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const { resetPassword, verifyResetCode } = useAuth();

  // For demo purposes - show console instructions when code is sent
  useEffect(() => {
    if (isCodeSent) {
      console.log('========== PASSWORD RESET INFO ==========');
      console.log(`Email: ${email}`);
      console.log('Check the console logs above for the reset code');
      console.log('=======================================');
    }
  }, [isCodeSent, email]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setIsCodeSent(true);
    } catch (error) {
      // Toast is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    
    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      await verifyResetCode(email, resetCode, newPassword);
      setIsComplete(true);
    } catch (error) {
      // Toast is handled in the auth context
    } finally {
      setIsResetting(false);
    }
  };

  const openConsole = () => {
    console.log('%c========== EMAIL DELIVERY INFORMATION ==========', 'font-size: 14px; font-weight: bold; color: #0066cc');
    console.log(`%cTo: ${email}`, 'color: #333; font-weight: bold');
    console.log(`%cSubject: Reset Your Password`, 'color: #333; font-weight: bold');
    console.log('%cCheck above logs for the actual reset code', 'color: #ff5722; font-weight: bold');
    console.log('%c===============================================', 'font-size: 14px; font-weight: bold; color: #0066cc');
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Password Reset Complete</h1>
            <p className="mt-4 text-gray-600">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="mt-2 text-gray-600">
            {isCodeSent
              ? 'Enter the reset code sent to your email'
              : 'We will send you a reset code to your email'}
          </p>
        </div>
        
        <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Development Mode</AlertTitle>
          <AlertDescription>
            No real emails are being sent. Your reset code will be available in the browser console.
            Press F12 to view it or{' '}
            <Button 
              type="button" 
              variant="link" 
              size="sm" 
              onClick={openConsole}
              className="p-0 h-auto font-medium underline text-blue-700"
            >
              click here
            </Button>
          </AlertDescription>
        </Alert>
        
        {!isCodeSent ? (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </Button>
            
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reset-code">Reset Code</Label>
              <Input
                id="reset-code"
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="123456"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isResetting}
            >
              {isResetting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
