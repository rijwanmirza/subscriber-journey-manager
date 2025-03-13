
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { 
    subscribeUser, 
    unsubscribeUser, 
    verifyUnsubscription,
    requestCoupon,
    verifyCouponRequest 
  } = useSubscription();
  const navigate = useNavigate();

  // Subscription Dialog
  const [isSubscribeDialogOpen, setIsSubscribeDialogOpen] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  // Unsubscribe Dialog
  const [isUnsubscribeDialogOpen, setIsUnsubscribeDialogOpen] = useState(false);
  const [unsubscribeOtp, setUnsubscribeOtp] = useState('');
  const [unsubscribing, setUnsubscribing] = useState(false);

  // Coupon Dialog
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [couponOtp, setCouponOtp] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isRequestingCoupon, setIsRequestingCoupon] = useState(false);
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
  const [couponStep, setCouponStep] = useState<'request' | 'verify' | 'show'>('request');

  // Handle subscribe
  const handleSubscribe = async () => {
    if (!user) return;
    
    setSubscribing(true);
    try {
      await subscribeUser(user.id, user.email, user.name);
      setIsSubscribeDialogOpen(false);
      toast({
        title: "Success",
        description: "Please check your email to verify your subscription.",
      });
    } catch (error) {
      // Error handled in context
    } finally {
      setSubscribing(false);
    }
  };

  // Handle unsubscribe
  const handleUnsubscribe = async () => {
    if (!user) return;
    
    setUnsubscribing(true);
    try {
      await unsubscribeUser(user.id);
      setIsUnsubscribeDialogOpen(true);
    } catch (error) {
      // Error handled in context
    } finally {
      setUnsubscribing(false);
    }
  };

  // Verify unsubscribe OTP
  const handleVerifyUnsubscribe = async () => {
    if (!user) return;
    
    setUnsubscribing(true);
    try {
      await verifyUnsubscription(user.id, unsubscribeOtp);
      setIsUnsubscribeDialogOpen(false);
    } catch (error) {
      // Error handled in context
    } finally {
      setUnsubscribing(false);
    }
  };

  // Handle coupon request
  const handleRequestCoupon = async () => {
    if (!user) return;
    
    setIsRequestingCoupon(true);
    try {
      await requestCoupon(user.id, user.email);
      setCouponStep('verify');
    } catch (error) {
      // Error handled in context
    } finally {
      setIsRequestingCoupon(false);
    }
  };

  // Verify coupon OTP
  const handleVerifyCoupon = async () => {
    if (!user) return;
    
    setIsVerifyingCoupon(true);
    try {
      const code = await verifyCouponRequest(user.id, couponOtp);
      setCouponCode(code);
      setCouponStep('show');
    } catch (error) {
      // Error handled in context
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  // Admin navigation
  const goToAdmin = () => {
    navigate('/admin');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.name}</span>
            {user.role === 'admin' && (
              <Button variant="outline" onClick={goToAdmin}>
                Admin Panel
              </Button>
            )}
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Subscriptions</h2>
          
          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-md">
              <h3 className="text-xl font-medium mb-4">Newsletter Subscription</h3>
              <p className="text-gray-600 mb-4">
                Subscribe to our newsletter to receive the latest updates, promotions, and news directly to your inbox.
              </p>
              
              <div className="flex space-x-4">
                <Button 
                  onClick={() => setIsSubscribeDialogOpen(true)}
                  disabled={user.isSubscribed}
                >
                  {user.isSubscribed ? 'Already Subscribed' : 'Subscribe Now'}
                </Button>
                
                {user.isSubscribed && (
                  <Button 
                    variant="outline" 
                    onClick={handleUnsubscribe}
                    disabled={unsubscribing}
                  >
                    {unsubscribing ? 'Processing...' : 'Unsubscribe'}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-md">
              <h3 className="text-xl font-medium mb-4">Get Coupon Code</h3>
              <p className="text-gray-600 mb-4">
                Get a promotional coupon code sent directly to your email.
              </p>
              
              <Button onClick={() => {
                setIsCouponDialogOpen(true);
                setCouponStep('request');
                setCouponOtp('');
                setCouponCode('');
              }}>
                Get Coupon Code
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Subscribe Dialog */}
      <Dialog open={isSubscribeDialogOpen} onOpenChange={setIsSubscribeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to Newsletter</DialogTitle>
            <DialogDescription>
              You'll receive a verification link in your email to confirm your subscription.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-500">
              By subscribing, you agree to receive marketing emails from us. You can unsubscribe at any time.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubscribeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubscribe} disabled={subscribing}>
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsubscribe Dialog */}
      <Dialog open={isUnsubscribeDialogOpen} onOpenChange={setIsUnsubscribeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Unsubscription</DialogTitle>
            <DialogDescription>
              Please enter the OTP sent to your email to confirm unsubscription.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unsubscribe-otp">Enter OTP</Label>
              <Input
                id="unsubscribe-otp"
                value={unsubscribeOtp}
                onChange={(e) => setUnsubscribeOtp(e.target.value)}
                placeholder="123456"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnsubscribeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerifyUnsubscribe} disabled={unsubscribing || !unsubscribeOtp}>
              {unsubscribing ? 'Verifying...' : 'Confirm Unsubscribe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coupon Dialog */}
      <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Get Coupon Code</DialogTitle>
            <DialogDescription>
              {couponStep === 'request' && "Request a coupon code to be sent to your email"}
              {couponStep === 'verify' && "Enter the OTP sent to your email to get your coupon"}
              {couponStep === 'show' && "Your coupon code is ready to use"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {couponStep === 'request' && (
              <p className="text-sm text-gray-500">
                Click the button below to receive an OTP in your email. Once verified, you'll get your coupon code.
              </p>
            )}
            
            {couponStep === 'verify' && (
              <div className="space-y-2">
                <Label htmlFor="coupon-otp">Enter OTP</Label>
                <Input
                  id="coupon-otp"
                  value={couponOtp}
                  onChange={(e) => setCouponOtp(e.target.value)}
                  placeholder="123456"
                />
              </div>
            )}
            
            {couponStep === 'show' && (
              <div className="text-center">
                <div className="bg-gray-50 p-4 rounded-md border border-dashed border-gray-300">
                  <p className="text-sm text-gray-500 mb-2">Your Coupon Code:</p>
                  <p className="text-2xl font-bold text-primary">{couponCode}</p>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  This coupon code has been sent to your email as well. 
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {couponStep === 'request' && (
              <>
                <Button variant="outline" onClick={() => setIsCouponDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRequestCoupon} disabled={isRequestingCoupon}>
                  {isRequestingCoupon ? 'Sending...' : 'Send OTP'}
                </Button>
              </>
            )}
            
            {couponStep === 'verify' && (
              <>
                <Button variant="outline" onClick={() => setIsCouponDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleVerifyCoupon} disabled={isVerifyingCoupon || !couponOtp}>
                  {isVerifyingCoupon ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </>
            )}
            
            {couponStep === 'show' && (
              <Button onClick={() => setIsCouponDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
