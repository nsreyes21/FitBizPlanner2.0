import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Plus, Target } from 'lucide-react';
import { getSession, signOutAll, onAuthChange } from '@/integrations/supabase/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthHeaderProps {
  onBuildPlan?: () => void;
  onAddEvent?: () => void;
}

export function AuthHeader({ onBuildPlan, onAddEvent }: AuthHeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    getSession().then((session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthChange((event, session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutAll();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="border-b bg-gradient-hero">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">FitBiz Calendar</h1>
            <p className="text-white/90 mt-1">Smart event planning for fitness businesses</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              Beta
            </Badge>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              {onBuildPlan && (
                <Button 
                  variant="secondary"
                  size="sm"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={onBuildPlan}
                  data-tour="build-plan"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Build My Plan
                </Button>
              )}
              {onAddEvent && (
                <Button 
                  size="sm"
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={onAddEvent}
                  data-tour="add-event"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              )}
            </div>

            {/* Auth Section */}
            {!isLoading && (
              <div className="ml-4">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/20">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                          <AvatarFallback className="bg-white/20 text-white">
                            {getUserInitials(user.email)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem className="flex-col items-start">
                        <div className="font-medium">{user.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.user_metadata?.full_name || 'User'}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/account" className="w-full">
                          <User className="mr-2 h-4 w-4" />
                          <span>Account</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    asChild
                    variant="secondary"
                    size="sm"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    <Link to={`/auth/signin?redirect=${encodeURIComponent(window.location.pathname)}`}>
                      Sign in
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}