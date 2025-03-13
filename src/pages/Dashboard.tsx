
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import OtpVerification from '@/components/OtpVerification';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const subscription = useSubscription();
  const navigate = useNavigate();
  
  const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<'coupon' | 'unsubscribe'>('coupon');
  const [testOtp, setTestOtp] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isUserSubscribed = () => {
    if (!user || !user.email) return false;
    
    const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
    return subscribers.some((s: any) => s.userId === user.id && s.isVerified);
  };

  const handleSubscribe = async () => {
    try {
      if (user?.email && user?.id) {
        const code = await subscription.subscribeUser(user.id, user.email, user.name);
        if (code) { // Added check for code existence
          setTestOtp(code);
        }
        toast({
          title: "Verification Required",
          description: "A verification code has been sent to your email. Please check console for test code.",
        });
      }
    } catch (error) {
      console.error("Subscription error:", error);
    }
  };

  const handleUnsubscribe = async () => {
    setOtpPurpose('unsubscribe');
    setShowUnsubscribeDialog(false);
    
    try {
      if (user?.id) {
        const code = await subscription.unsubscribeUser(user.id);
        if (code) { // Added check for code existence
          setTestOtp(code);
        }
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
    }
    
    setShowOtpVerification(true);
  };

  const handleCouponRequest = async () => {
    setOtpPurpose('coupon');
    setShowCouponDialog(false);
    
    try {
      if (user?.id && user?.email) {
        const code = await subscription.requestCoupon(user.id, user.email);
        if (code) { // Added check for code existence
          setTestOtp(code);
        }
      }
    } catch (error) {
      console.error("Coupon request error:", error);
    }
    
    setShowOtpVerification(true);
  };

  const handleOtpSuccess = () => {
    setShowOtpVerification(false);
    
    if (otpPurpose === 'unsubscribe') {
      if (user?.id) {
        subscription.unsubscribeUser(user.id);
      }
    } else {
      if (user?.id && user?.email) {
        subscription.requestCoupon(user.id, user.email);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            {user?.role === 'admin' && (
              <Button variant="outline" onClick={() => navigate('/admin')}>
                Admin Panel
              </Button>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Subscription Status</h2>
          
          {isUserSubscribed() ? (
            <div className="space-y-4">
              <div className="flex items-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>You are currently subscribed to our promotions</span>
              </div>
              
              <Button variant="outline" onClick={() => setShowUnsubscribeDialog(true)}>
                Unsubscribe
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Subscribe to receive special offers and promotions
              </p>
              
              <Button onClick={handleSubscribe}>
                Subscribe Now
              </Button>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Special Offers</h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Get exclusive coupon codes sent to your email
            </p>
            
            <Button 
              variant="outline"
              onClick={() => setShowCouponDialog(true)}
            >
              Get Coupon Code
            </Button>
          </div>
        </div>
      </main>

      <div className="mt-8 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="text-sm font-medium text-blue-800">Testing Information</h3>
        <p className="mt-1 text-sm text-blue-700">
          SMTP emails are simulated in this demo. When you request a verification code, 
          it will appear in the console logs and in the verification dialog for testing.
        </p>
      </div>

      <Dialog open={showUnsubscribeDialog} onOpenChange={setShowUnsubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Unsubscribe</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Are you sure you want to unsubscribe from our promotional emails?</p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowUnsubscribeDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnsubscribe}>
              Unsubscribe
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Get Coupon Code</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>We'll send a verification code to your email ({user?.email}).</p>
            <p className="text-sm text-gray-500 mt-2">
              After verification, your coupon code will be sent to your email.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCouponDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCouponRequest}>
              Send Verification Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showOtpVerification} onOpenChange={setShowOtpVerification}>
        <DialogContent className="sm:max-w-md">
          <OtpVerification
            email={user?.email || ''}
            onVerify={handleOtpSuccess}
            onCancel={() => setShowOtpVerification(false)}
            purpose={otpPurpose}
            testOtp={testOtp}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
