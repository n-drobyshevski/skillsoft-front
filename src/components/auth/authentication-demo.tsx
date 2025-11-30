// Demo component to showcase the authentication modals
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModals, CompactAuthModals, FullAuthModals } from "@/components/auth/auth-modals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Shield, 
  Smartphone, 
  Monitor, 
  Palette, 
  Zap,
  Eye,
  EyeOff 
} from "lucide-react";

export function AuthenticationDemo() {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Modern Authentication System</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Beautiful, accessible, and responsive authentication modals built with Clerk.js and shadcn/ui. 
          Seamlessly integrated with your design system.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <CardTitle className="text-sm">Enterprise Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Built-in email verification, secure session management, and optional MFA support.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm">Mobile Optimized</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Touch-friendly interfaces with 44px minimum touch targets and responsive design.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-sm">Design System</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Perfectly matches your existing design tokens, colors, and component styles.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Component Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Component Variants
          </CardTitle>
          <CardDescription>
            Different authentication components for various layout needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Desktop Full Version */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Monitor className="h-3 w-3 mr-1" />
                Desktop
              </Badge>
              <h3 className="font-medium text-sm">Full Authentication Modals</h3>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Header Navigation</span>
                <FullAuthModals />
              </div>
            </div>
          </div>

          {/* Mobile Compact Version */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Smartphone className="h-3 w-3 mr-1" />
                Mobile
              </Badge>
              <h3 className="font-medium text-sm">Compact Authentication Modals</h3>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mobile Header</span>
                <CompactAuthModals />
              </div>
            </div>
          </div>

          {/* Custom Sizes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Custom
              </Badge>
              <h3 className="font-medium text-sm">Flexible Sizing Options</h3>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Small Size</span>
                <AuthModals size="sm" showLabels={true} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Default Size</span>
                <AuthModals size="default" showLabels={true} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Large Size</span>
                <AuthModals size="lg" showLabels={true} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Implementation Preview</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-xs"
            >
              {showAll ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {showAll ? "Hide Code" : "Show Code"}
            </Button>
          </div>
        </CardHeader>
        {showAll && (
          <CardContent>
            <div className="space-y-4">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-xs font-mono overflow-x-auto">
                <div className="text-green-600 dark:text-green-400">// Header Integration</div>
                <div className="text-slate-700 dark:text-slate-300">
                  {`<SignedOut>`}<br />
                  {`  <FullAuthModals />     // Desktop with labels`}<br />
                  {`  <CompactAuthModals />  // Mobile compact`}<br />
                  {`</SignedOut>`}<br />
                  <br />
                  {`<SignedIn>`}<br />
                  {`  <UserButton />         // Clerk user menu`}<br />
                  {`</SignedIn>`}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-medium mb-2">Features Included</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>✅ Modal-based authentication</li>
                    <li>✅ Responsive design</li>
                    <li>✅ Dark/Light mode support</li>
                    <li>✅ Keyboard accessibility</li>
                    <li>✅ Screen reader support</li>
                    <li>✅ Touch-friendly mobile UI</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Clerk Integration</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>✅ Social authentication</li>
                    <li>✅ Email verification</li>
                    <li>✅ Password reset</li>
                    <li>✅ User profile management</li>
                    <li>✅ Session handling</li>
                    <li>✅ Security best practices</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Next Steps */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Ready to Go Live!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Your authentication system is production-ready. Follow these steps to activate:
          </p>
          <ol className="text-xs space-y-1 text-muted-foreground">
            <li>1. Get your Clerk API keys from dashboard.clerk.com</li>
            <li>2. Update your .env.local with the actual keys</li>
            <li>3. Test the sign-in/sign-up flows</li>
            <li>4. Customize social providers as needed</li>
            <li>5. Deploy with confidence! 🚀</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}