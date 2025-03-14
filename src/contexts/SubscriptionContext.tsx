
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

// Define subscription interfaces
export interface Subscriber {
  id: string;
  email: string;
  name: string;
  userId: string;
  listId: string;
  verificationCode?: string;
  isVerified: boolean;
  otpCode?: string;
  createdAt: string;
}

export interface SubscriptionList {
  id: string;
  name: string;
  description: string;
  subscribers: string[]; // Array of subscriber IDs
}

export interface Campaign {
  id: string;
  name: string;
  listIds: string[]; // Array of list IDs
  subject: string;
  content: string;
  cc?: string[];
  bcc?: string[];
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  isActive: boolean;
}

// Define subscription context interface
interface SubscriptionContextType {
  // Subscription methods
  subscribeUser: (userId: string, email: string, name: string) => Promise<string>;
  unsubscribeUser: (userId: string) => Promise<string>;
  verifySubscription: (userId: string, code: string) => Promise<void>;
  verifyUnsubscription: (userId: string, otp: string) => Promise<void>;
  
  // Coupon methods
  requestCoupon: (userId: string, email: string) => Promise<string>;
  verifyCouponRequest: (userId: string, otp: string) => Promise<string>;
  
  // Admin methods
  getLists: () => SubscriptionList[];
  createList: (name: string, description: string) => Promise<void>;
  addSubscriberToList: (email: string, name: string, listId: string) => Promise<void>;
  removeSubscriberFromList: (subscriberId: string, listId: string) => Promise<void>;
  
  // Campaign methods
  getCampaigns: () => Campaign[];
  createCampaign: (name: string, listIds: string[], subject: string, content: string) => Promise<void>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  sendCampaign: (campaignId: string, options: {cc?: string[], bcc?: string[]}) => Promise<void>;
  
  // SMTP Settings
  updateSmtpSettings: (settings: SmtpSettings) => Promise<void>;
  getSmtpSettings: () => SmtpSettings;
}

export interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'ssl' | 'tls' | 'none';
}

// Create context
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Storage keys
const LISTS_STORAGE_KEY = 'subscription_lists';
const SUBSCRIBERS_STORAGE_KEY = 'subscribers';
const CAMPAIGNS_STORAGE_KEY = 'campaigns';
const COUPON_STORAGE_KEY = 'coupons';
const SMTP_SETTINGS_KEY = 'smtp_settings';

// Provider component
export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to track if real email service is available
  const [realEmailAvailable, setRealEmailAvailable] = useState(false);
  
  // Initialize storage
  const initializeStorage = () => {
    if (!localStorage.getItem(LISTS_STORAGE_KEY)) {
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(SUBSCRIBERS_STORAGE_KEY)) {
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(CAMPAIGNS_STORAGE_KEY)) {
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(COUPON_STORAGE_KEY)) {
      const defaultCoupon = {
        id: '1',
        code: 'WELCOME10',
        description: 'Welcome discount 10%',
        isActive: true
      };
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify([defaultCoupon]));
    }
    
    if (!localStorage.getItem(SMTP_SETTINGS_KEY)) {
      const defaultSettings = {
        host: 'smtp.hostinger.com',
        port: 465,
        username: 'alerts@yoyoprime.com',
        password: 'indusrabbit1@#$A',
        encryption: 'ssl'
      };
      localStorage.setItem(SMTP_SETTINGS_KEY, JSON.stringify(defaultSettings));
    }
  };

  useEffect(() => {
    initializeStorage();
    checkEmailService();
  }, []);

  // Check if the real email service is available
  const checkEmailService = async () => {
    try {
      const response = await fetch('/api/health-check');
      if (response.ok) {
        setRealEmailAvailable(true);
        console.log('Email service is available in production mode');
      } else {
        setRealEmailAvailable(false);
        console.log('Email service not available, falling back to simulation mode');
      }
    } catch (error) {
      setRealEmailAvailable(false);
      console.log('Email service not available, falling back to simulation mode');
    }
  };

  // Generate a verification code
  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send an email - either real or simulated
  const sendEmail = async (to: string, subject: string, body: string, options?: { cc?: string[], bcc?: string[] }) => {
    // Try to send real email if service is available
    if (realEmailAvailable) {
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to,
            subject,
            html: body,
            ...(options?.cc && { cc: options.cc }),
            ...(options?.bcc && { bcc: options.bcc })
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          toast({
            title: "Email Sent",
            description: `To: ${to}, Subject: ${subject}`,
          });
          return true;
        } else {
          console.error('Email sending failed:', result.message);
          toast({
            title: "Email Failed",
            description: result.message || "Failed to send email",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        console.error('Email API error:', error);
        // Fall back to simulation if real email fails
        return simulateEmail(to, subject, body, options);
      }
    } else {
      // Use simulation mode
      return simulateEmail(to, subject, body, options);
    }
  };
  
  // Simulate email sending with detailed logging
  const simulateEmail = async (to: string, subject: string, body: string, options?: { cc?: string[], bcc?: string[] }) => {
    const smtpSettings = JSON.parse(localStorage.getItem(SMTP_SETTINGS_KEY) || '{}');
    
    // Log detailed SMTP information
    console.log('=============== EMAIL DETAILS (SIMULATION) ===============');
    console.log(`SMTP Server: ${smtpSettings.host}:${smtpSettings.port}`);
    console.log(`Encryption: ${smtpSettings.encryption}`);
    console.log(`From: ${smtpSettings.username}`);
    console.log(`To: ${to}`);
    if (options?.cc && options.cc.length > 0) {
      console.log(`CC: ${options.cc.join(', ')}`);
    }
    if (options?.bcc && options.bcc.length > 0) {
      console.log(`BCC: ${options.bcc.join(', ')}`);
    }
    console.log(`Subject: ${subject}`);
    console.log('Body:');
    console.log(body);
    console.log('=============================================');
    
    // To help with debugging, show a detailed toast message
    toast({
      title: "Email Sent (Simulated)",
      description: `To: ${to}, Subject: ${subject}`,
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  };

  // Subscription methods
  const subscribeUser = async (userId: string, email: string, name: string) => {
    try {
      const subscribers = JSON.parse(localStorage.getItem(SUBSCRIBERS_STORAGE_KEY) || '[]');
      
      // Check if user is already subscribed
      const existingSubscriber = subscribers.find((s: Subscriber) => s.userId === userId);
      if (existingSubscriber && existingSubscriber.isVerified) {
        throw new Error('You are already subscribed');
      }
      
      // Get the default list (create one if none exists)
      let lists = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '[]');
      if (lists.length === 0) {
        const defaultList = {
          id: '1',
          name: 'Default List',
          description: 'Default subscription list',
          subscribers: []
        };
        lists = [defaultList];
        localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
      }
      
      const defaultListId = lists[0].id;
      
      // Generate verification code
      const verificationCode = generateCode();
      
      // Create or update subscriber
      if (existingSubscriber) {
        // Update existing subscriber
        const updatedSubscribers = subscribers.map((s: Subscriber) => 
          s.userId === userId 
            ? { ...s, verificationCode, isVerified: false } 
            : s
        );
        localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(updatedSubscribers));
      } else {
        // Create new subscriber
        const newSubscriber: Subscriber = {
          id: Date.now().toString(),
          email,
          name,
          userId,
          listId: defaultListId,
          verificationCode,
          isVerified: false,
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify([...subscribers, newSubscriber]));
      }
      
      // Send verification email
      const emailBody = `
Hello ${name},
      
Thank you for subscribing to our newsletter!

To verify your subscription, please use the following verification code:

${verificationCode}

If you did not request this subscription, please ignore this email.

Best regards,
The Team
      `;
      
      await sendEmail(
        email,
        "Verify Your Subscription",
        emailBody
      );
      
      console.log(`Verification code for ${email}: ${verificationCode}`);
      
      toast({
        title: "Success",
        description: "Please check your email to verify subscription",
      });
      
      return verificationCode; // Return for testing
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const verifySubscription = async (userId: string, code: string) => {
    try {
      const subscribers = JSON.parse(localStorage.getItem(SUBSCRIBERS_STORAGE_KEY) || '[]');
      const lists = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '[]');
      
      // Find subscriber
      const subscriberIndex = subscribers.findIndex(
        (s: Subscriber) => s.userId === userId && s.verificationCode === code
      );
      
      if (subscriberIndex === -1) {
        throw new Error('Invalid verification code');
      }
      
      // Update subscriber
      subscribers[subscriberIndex].isVerified = true;
      subscribers[subscriberIndex].verificationCode = undefined;
      
      // Add to list
      const listId = subscribers[subscriberIndex].listId;
      const listIndex = lists.findIndex((l: SubscriptionList) => l.id === listId);
      
      if (listIndex !== -1) {
        if (!lists[listIndex].subscribers.includes(subscribers[subscriberIndex].id)) {
          lists[listIndex].subscribers.push(subscribers[subscriberIndex].id);
        }
      }
      
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subscribers));
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
      
      // Send welcome email
      const emailBody = `
Hello ${subscribers[subscriberIndex].name},
      
Thank you for verifying your subscription!

You are now subscribed to our newsletter and will receive updates from us.

Best regards,
The Team
      `;
      
      await sendEmail(
        subscribers[subscriberIndex].email,
        "Welcome to Our Newsletter!",
        emailBody
      );
      
      toast({
        title: "Success",
        description: "Subscription verified successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const unsubscribeUser = async (userId: string) => {
    try {
      const subscribers = JSON.parse(localStorage.getItem(SUBSCRIBERS_STORAGE_KEY) || '[]');
      
      // Find subscriber
      const subscriber = subscribers.find((s: Subscriber) => s.userId === userId && s.isVerified);
      
      if (!subscriber) {
        throw new Error('You are not subscribed');
      }
      
      // Generate OTP
      const otpCode = generateCode();
      
      // Update subscriber
      const updatedSubscribers = subscribers.map((s: Subscriber) => 
        s.userId === userId ? { ...s, otpCode } : s
      );
      
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(updatedSubscribers));
      
      // Send unsubscribe verification email
      const emailBody = `
Hello ${subscriber.name},
      
We received a request to unsubscribe from our newsletter.

To confirm this request, please use the following verification code:

${otpCode}

If you did not request to unsubscribe, please ignore this email.

Best regards,
The Team
      `;
      
      await sendEmail(
        subscriber.email,
        "Confirm Unsubscription",
        emailBody
      );
      
      console.log(`Unsubscribe OTP for ${subscriber.email}: ${otpCode}`);
      
      toast({
        title: "Verification Needed",
        description: "Please check your email for OTP to confirm unsubscription",
      });
      
      return otpCode; // Return for testing
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const verifyUnsubscription = async (userId: string, otp: string) => {
    try {
      const subscribers = JSON.parse(localStorage.getItem(SUBSCRIBERS_STORAGE_KEY) || '[]');
      const lists = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '[]');
      
      // Find subscriber
      const subscriberIndex = subscribers.findIndex(
        (s: Subscriber) => s.userId === userId && s.otpCode === otp
      );
      
      if (subscriberIndex === -1) {
        throw new Error('Invalid OTP');
      }
      
      const subscriber = subscribers[subscriberIndex];
      
      // Send farewell email before removing
      const emailBody = `
Hello ${subscriber.name},
      
We're sorry to see you go. You have been successfully unsubscribed from our newsletter.

If you change your mind, you can always subscribe again.

Best regards,
The Team
      `;
      
      await sendEmail(
        subscriber.email,
        "You've Been Unsubscribed",
        emailBody
      );
      
      // Remove from list
      const updatedLists = lists.map((list: SubscriptionList) => ({
        ...list,
        subscribers: list.subscribers.filter(id => id !== subscriber.id)
      }));
      
      // Remove subscriber
      const updatedSubscribers = subscribers.filter((_: any, index: number) => index !== subscriberIndex);
      
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(updatedSubscribers));
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(updatedLists));
      
      toast({
        title: "Success",
        description: "You have been unsubscribed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Coupon methods
  const requestCoupon = async (userId: string, email: string) => {
    try {
      // Generate OTP
      const otpCode = generateCode();
      
      // Store OTP in localStorage (temporary, keyed by userId)
      localStorage.setItem(`coupon_otp_${userId}`, otpCode);
      
      // Send coupon verification email
      const emailBody = `
Hello,
      
You have requested a coupon code.

To verify your request, please use the following code:

${otpCode}

This code will expire in 24 hours.

Best regards,
The Team
      `;
      
      await sendEmail(
        email,
        "Your Coupon Code Request",
        emailBody
      );
      
      console.log(`Coupon OTP for ${email}: ${otpCode}`);
      
      toast({
        title: "Success",
        description: "Please check your email for OTP to get your coupon",
      });
      
      return otpCode; // Return for testing
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const verifyCouponRequest = async (userId: string, otp: string) => {
    try {
      const storedOtp = localStorage.getItem(`coupon_otp_${userId}`);
      
      if (!storedOtp || storedOtp !== otp) {
        throw new Error('Invalid OTP');
      }
      
      // Get active coupon code
      const coupons = JSON.parse(localStorage.getItem(COUPON_STORAGE_KEY) || '[]');
      const activeCoupon = coupons.find((c: Coupon) => c.isActive);
      
      if (!activeCoupon) {
        throw new Error('No active coupon available');
      }
      
      // Get user email from subscribers or use a default
      const subscribers = JSON.parse(localStorage.getItem(SUBSCRIBERS_STORAGE_KEY) || '[]');
      const subscriber = subscribers.find((s: Subscriber) => s.userId === userId);
      const email = subscriber ? subscriber.email : localStorage.getItem(`temp_email_${userId}`) || 'user@example.com';
      
      // Send coupon email
      const emailBody = `
Hello,
      
Thank you for verifying your coupon request.

Here's your coupon code: ${activeCoupon.code}

Description: ${activeCoupon.description}

Best regards,
The Team
      `;
      
      await sendEmail(
        email,
        "Your Coupon Code",
        emailBody
      );
      
      // Clear OTP
      localStorage.removeItem(`coupon_otp_${userId}`);
      localStorage.removeItem(`temp_email_${userId}`);
      
      toast({
        title: "Success",
        description: "Coupon code sent to your email",
      });
      
      return activeCoupon.code;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Admin methods
  const getLists = () => {
    return JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '[]');
  };

  const createList = async (name: string, description: string) => {
    try {
      const lists = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '[]');
      
      const newList: SubscriptionList = {
        id: Date.now().toString(),
        name,
        description,
        subscribers: []
      };
      
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify([...lists, newList]));
      
      toast({
        title: "Success",
        description: "List created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const addSubscriberToList = async (email: string, name: string, listId: string) => {
    try {
      const subscribers = JSON.parse(localStorage.getItem(SUBSCRIBERS_STORAGE_KEY) || '[]');
      const lists = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '[]');
      
      // Check if list exists
      const list = lists.find((l: SubscriptionList) => l.id === listId);
      if (!list) {
        throw new Error('List not found');
      }
      
      // Check if subscriber already exists
      const existingSubscriber = subscribers.find((s: Subscriber) => s.email === email);
      
      let subscriberId;
      
      if (existingSubscriber) {
        // Update existing subscriber
        subscriberId = existingSubscriber.id;
      } else {
        // Create new subscriber
        const newSubscriber: Subscriber = {
          id: Date.now().toString(),
          email,
          name,
          userId: `admin_added_${Date.now()}`,
          listId,
          isVerified: true, // Admin-added subscribers are auto-verified
          createdAt: new Date().toISOString()
        };
        
        subscribers.push(newSubscriber);
        subscriberId = newSubscriber.id;
      }
      
      // Add to list if not already there
      if (!list.subscribers.includes(subscriberId)) {
        list.subscribers.push(subscriberId);
      }
      
      // Update storage
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subscribers));
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists.map(
        (l: SubscriptionList) => l.id === listId ? list : l
      )));
      
      toast({
        title: "Success",
        description: "Subscriber added to list",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeSubscriberFromList = async (subscriberId: string, listId: string) => {
    try {
      const lists = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '[]');
      
      // Find list
      const listIndex = lists.findIndex((l: SubscriptionList) => l.id === listId);
      if (listIndex === -1) {
        throw new Error('List not found');
      }
      
      // Remove subscriber from list
      lists[listIndex].subscribers = lists[listIndex].subscribers.filter(
        (id: string) => id !== subscriberId
      );
      
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
      
      toast({
        title: "Success",
        description: "Subscriber removed from list",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Campaign methods
  const getCampaigns = () => {
    return JSON.parse(localStorage.getItem(CAMPAIGNS_STORAGE_KEY) || '[]');
  };

  const createCampaign = async (name: string, listIds: string[], subject: string, content: string) => {
    try {
      const campaigns = JSON.parse(localStorage.getItem(CAMPAIGNS_STORAGE_KEY) || '[]');
      
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        name,
        listIds,
        subject,
        content,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify([...campaigns, newCampaign]));
      
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const campaigns = JSON.parse(localStorage.getItem(CAMPAIGNS_STORAGE_KEY) || '[]');
      
      const updatedCampaigns = campaigns.map((c: Campaign) => 
        c.id === id ? { ...c, ...updates } : c
      );
      
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(updatedCampaigns));
      
      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      const campaigns = JSON.parse(localStorage.getItem(CAMPAIGNS_STORAGE_KEY) || '[]');
      
      const updatedCampaigns = campaigns.filter((c: Campaign) => c.id !== id);
      
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(updatedCampaigns));
      
      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendCampaign = async (campaignId: string, options: {cc?: string[], bcc?: string[]}) => {
    try {
      const campaigns = JSON.parse(localStorage.getItem(CAMPAIGNS_STORAGE_KEY) || '[]');
      const campaign = campaigns.find((c: Campaign) => c.id === campaignId);
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      
      // Get all subscribers from the campaign's lists
      const lists = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY) || '[]');
      const subscribers = JSON.parse(localStorage.getItem(SUBSCRIBERS_STORAGE_KEY) || '[]');
      
      const targetLists = lists.filter((l: SubscriptionList) => 
        campaign.listIds.includes(l.id)
      );
      
      const subscriberIds = targetLists.flatMap((l: SubscriptionList) => l.subscribers);
      const targetSubscribers = subscribers.filter((s: Subscriber) => 
        subscriberIds.includes(s.id) && s.isVerified
      );
      
      // Send campaign to each subscriber
      console.log(`Sending campaign ${campaign.name} to ${targetSubscribers.length} subscribers`);
      
      for (const subscriber of targetSubscribers) {
        await sendEmail(
          subscriber.email,
          campaign.subject,
          campaign.content,
          { cc: options.cc, bcc: options.bcc }
        );
        
        // Add a small delay between emails to not overwhelm
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Update campaign with CC and BCC
      const updatedCampaigns = campaigns.map((c: Campaign) => 
        c.id === campaignId ? { ...c, cc: options.cc, bcc: options.bcc } : c
      );
      
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(updatedCampaigns));
      
      toast({
        title: "Success",
        description: `Campaign sent to ${targetSubscribers.length} subscribers`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // SMTP settings
  const updateSmtpSettings = async (settings: SmtpSettings) => {
    try {
      localStorage.setItem(SMTP_SETTINGS_KEY, JSON.stringify(settings));
      
      // Send a test email
      const testEmailBody = `
This is a test email to verify your SMTP settings.

Server: ${settings.host}
Port: ${settings.port}
Encryption: ${settings.encryption}
Username: ${settings.username}

If you're seeing this email, your SMTP settings are correctly configured!
      `;
      
      await sendEmail(
        settings.username,
        "SMTP Settings Test",
        testEmailBody
      );
      
      toast({
        title: "Success",
        description: "SMTP settings updated successfully and test email sent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getSmtpSettings = () => {
    return JSON.parse(localStorage.getItem(SMTP_SETTINGS_KEY) || '{}');
  };

  const value = {
    subscribeUser,
    unsubscribeUser,
    verifySubscription,
    verifyUnsubscription,
    requestCoupon,
    verifyCouponRequest,
    getLists,
    createList,
    addSubscriberToList,
    removeSubscriberFromList,
    getCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    updateSmtpSettings,
    getSmtpSettings
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom hook to use subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
