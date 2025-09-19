import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, X } from 'lucide-react';
import { signUpEmail, signInEmail } from '@/integrations/supabase/auth';
import { EventRec } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePreviewMigration } from '@/hooks/usePreviewMigration';

interface SignupGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignupSuccess?: () => void;
  previewPlan?: EventRec[];
}

export function SignupGateModal({ open, onOpenChange, onSignupSuccess, previewPlan }: SignupGateModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  const { toast } = useToast();
  const { migratePreviewData } = usePreviewMigration();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await signUpEmail(
        email, 
        password, 
        `${window.location.origin}/auth/callback?redirect=/build/plan`
      );

      if (error) throw error;

      if (data?.user) {
        toast({
          title: "Account created successfully!",
          description: "Check your email to verify your account.",
        });
        
        onOpenChange(false);
        onSignupSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await signInEmail(email, password);

      if (error) throw error;

      if (data?.user) {
        // Check if there's a pending plan to migrate
        const migrated = await migratePreviewData({ 
          businessType: 'Fitness Center', // This will be overridden by stored form data
          city: 'New York' // This will be overridden by stored form data
        });

        if (migrated) {
          toast({
            title: "Welcome back!",
            description: "Your annual plan has been saved.",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You're now signed in.",
          });
        }
        
        onOpenChange(false);
        onSignupSuccess?.();

        // Navigate to build plan or redirect URL
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || '/build/plan';
        window.location.href = redirect;
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Unlock Your Annual Plan</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground">
            Create your free account to unlock Q2 to Q4 and save your plan
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      autoComplete="current-password"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      autoComplete="new-password"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create My Free Account'}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center">
                By continuing you agree to our Terms and Privacy
              </p>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Not now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}