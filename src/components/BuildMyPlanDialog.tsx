import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProfileStep } from './BuildMyPlanDialog/ProfileStep';
import { RecommendationsStep } from './BuildMyPlanDialog/RecommendationsStep';
import { ReviewStep } from './BuildMyPlanDialog/ReviewStep';
import { SaveStep } from './BuildMyPlanDialog/SaveStep';
import { Event, Milestone } from '@/types/Event';
import { getSession, getUserProfile } from '@/integrations/supabase/auth';

interface BuildMyPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface PlanFormData {
  businessType: string;
  city: string;
  focusApparel: boolean;
  focusCommunity: boolean;
  focusHolidays: boolean;
  focusBusiness: boolean;
  selectedEvents: RecommendedEvent[];
}

export interface RecommendedEvent {
  id: string;
  name: string;
  type: 'apparel' | 'community' | 'holiday' | 'business';
  description: string;
  suggestedDate: Date;
  template: string;
  selected: boolean;
}

const initialFormData: PlanFormData = {
  businessType: '',
  city: '',
  focusApparel: false,
  focusCommunity: false,
  focusHolidays: false,
  focusBusiness: false,
  selectedEvents: []
};

export function BuildMyPlanDialog({ open, onOpenChange }: BuildMyPlanDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Load profile defaults when dialog opens
  useEffect(() => {
    if (open) {
      loadProfileDefaults();
    }
  }, [open]);

  const loadProfileDefaults = async () => {
    try {
      setIsLoadingProfile(true);
      const session = await getSession();
      
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        
        if (profile) {
          setFormData(prev => ({
            ...prev,
            businessType: profile.business_type || '',
            city: profile.city || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error loading profile defaults:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const updateFormData = (updates: Partial<PlanFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.businessType !== '' && formData.city.trim() !== '';
      case 2: return formData.selectedEvents.some(e => e.selected);
      case 3: return formData.selectedEvents.some(e => e.selected);
      default: return true;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Profile';
      case 2: return 'Recommendations';
      case 3: return 'Review';
      case 4: return 'Save Plan';
      default: return 'Build My Plan';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {getStepTitle()}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-8 h-1 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="relative min-h-0">
          <div 
            className="flex transition-transform duration-300 ease-in-out max-h-[60vh] overflow-y-auto"
            style={{ transform: `translateX(-${(currentStep - 1) * 100}%)` }}
          >
            <div className="w-full flex-shrink-0">
              <ProfileStep 
                formData={formData}
                onUpdateFormData={updateFormData}
              />
            </div>
            <div className="w-full flex-shrink-0">
              <RecommendationsStep 
                formData={formData}
                onUpdateFormData={updateFormData}
              />
            </div>
            <div className="w-full flex-shrink-0">
              <ReviewStep 
                formData={formData}
                onUpdateFormData={updateFormData}
              />
            </div>
            <div className="w-full flex-shrink-0">
              <SaveStep 
                formData={formData}
                onSave={handleClose}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStep} of 4
          </div>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleClose}
              disabled={!canProceed()}
            >
              Complete Setup
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}