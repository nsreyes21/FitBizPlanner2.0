import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, X, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOUR_DISMISSED_KEY = 'onboarding-tour-dismissed';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    id: 'add-event',
    title: 'Add Individual Events',
    description: 'Click here to add single events like competitions or special promotions.',
    targetSelector: '[data-tour="add-event"]',
    position: 'bottom'
  },
  {
    id: 'build-plan',
    title: 'Build Your Annual Plan',
    description: 'Get AI-powered event recommendations for your entire year.',
    targetSelector: '[data-tour="build-plan"]',
    position: 'bottom'
  }
];

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem(TOUR_DISMISSED_KEY);
    if (!dismissed) {
      // Small delay to ensure DOM is ready
      setTimeout(() => setIsActive(true), 1000);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const step = tourSteps[currentStep];
    if (!step) return;

    const element = document.querySelector(step.targetSelector) as HTMLElement;
    if (!element) return;

    setTargetElement(element);

    // Calculate tooltip position
    const rect = element.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + scrollY + 12;
        left = rect.left + scrollX + (rect.width / 2);
        break;
      case 'top':
        top = rect.top + scrollY - 12;
        left = rect.left + scrollX + (rect.width / 2);
        break;
      case 'right':
        top = rect.top + scrollY + (rect.height / 2);
        left = rect.right + scrollX + 12;
        break;
      case 'left':
        top = rect.top + scrollY + (rect.height / 2);
        left = rect.left + scrollX - 12;
        break;
    }

    setTooltipPosition({ top, left });

    // Highlight the element
    element.style.position = 'relative';
    element.style.zIndex = '1001';
    element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
    element.style.borderRadius = '8px';

    return () => {
      element.style.position = '';
      element.style.zIndex = '';
      element.style.boxShadow = '';
      element.style.borderRadius = '';
    };
  }, [isActive, currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(TOUR_DISMISSED_KEY, 'true');
    setIsActive(false);
    
    // Clean up highlighting
    if (targetElement) {
      targetElement.style.position = '';
      targetElement.style.zIndex = '';
      targetElement.style.boxShadow = '';
      targetElement.style.borderRadius = '';
    }
  };

  if (!isActive || !targetElement) return null;

  const currentTourStep = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/30 z-1000"
        style={{ zIndex: 1000 }}
      />
      
      {/* Tooltip */}
      <div
        className="fixed z-1002 transform"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: currentTourStep.position === 'top' 
            ? 'translate(-50%, -100%)' 
            : currentTourStep.position === 'bottom'
            ? 'translate(-50%, 0%)'
            : currentTourStep.position === 'left'
            ? 'translate(-100%, -50%)'
            : 'translate(0%, -50%)',
          zIndex: 1002
        }}
      >
        <Card className="w-80 border-primary/20 bg-white shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/20 rounded-full">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">
                  Step {currentStep + 1} of {tourSteps.length}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-auto p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <h4 className="font-medium mb-2">{currentTourStep.title}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {currentTourStep.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      index === currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
              
              <Button
                onClick={handleNext}
                size="sm"
                className="gap-1"
              >
                {isLastStep ? 'Got it!' : 'Next'}
                {!isLastStep && <ArrowRight className="h-3 w-3" />}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Arrow pointer */}
        <div
          className={cn(
            "absolute w-3 h-3 bg-white border transform rotate-45",
            currentTourStep.position === 'bottom' && "-top-1.5 left-1/2 -translate-x-1/2 border-r border-b border-primary/20",
            currentTourStep.position === 'top' && "-bottom-1.5 left-1/2 -translate-x-1/2 border-l border-t border-primary/20",
            currentTourStep.position === 'right' && "-left-1.5 top-1/2 -translate-y-1/2 border-t border-r border-primary/20",
            currentTourStep.position === 'left' && "-right-1.5 top-1/2 -translate-y-1/2 border-l border-b border-primary/20"
          )}
        />
      </div>
    </>
  );
}