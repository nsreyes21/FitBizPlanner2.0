import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const BANNER_DISMISSED_KEY = 'onboarding-banner-dismissed';

interface OnboardingBannerProps {
  className?: string;
}

export function OnboardingBanner({ className }: OnboardingBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    setIsVisible(!dismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Card className={cn("rounded-md border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10", className)}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Welcome to Your Gym's Event Planner!</h3>
              <p className="text-muted-foreground">
                This is your free Q1 preview. Create a free account to unlock your gym's full annual plan.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}