
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, Server } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EmailTestingInfo = () => {
  return (
    <Card className="w-full max-w-3xl mx-auto mb-8">
      <CardHeader className="bg-amber-50 border-b border-amber-100">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-600 mt-1 flex-shrink-0" />
          <div>
            <CardTitle className="text-amber-800">Email Testing Information</CardTitle>
            <CardDescription className="text-amber-700 mt-1">
              Why you're not receiving actual emails
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
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t flex justify-between items-center">
        <div className="text-sm text-gray-600">
          For now, you can test using the simulated email preview feature.
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.open('https://docs.lovable.dev/integrations/supabase/', '_blank')}>
          Supabase Integration
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailTestingInfo;
