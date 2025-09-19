import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get URL search params for redirect
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect') || '/';
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Authentication failed",
            description: error.message || "Please try again.",
            variant: "destructive",
          });
          navigate(redirectTo);
          return;
        }

        if (data.session) {
          toast({
            title: "Successfully signed in!",
            description: "Welcome! You now have full access to your annual plan.",
          });
        }
        
        // Redirect to specified page or home
        navigate(redirectTo);
      } catch (error: any) {
        console.error('Unexpected auth error:', error);
        toast({
          title: "Authentication failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Completing sign in...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}