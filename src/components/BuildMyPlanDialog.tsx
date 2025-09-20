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

  const Stepper = ({ current, steps }: { current: number; steps: string[] }) => (
    <div className="flex items-center gap-2 text-xs">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`w-6 h-1 rounded-full transition-colors ${
            index + 1 <= current ? 'bg-primary' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-[840px] md:max-w-[920px] p-0 overflow-hidden">
        <div className="flex flex-col h-[min(80vh,720px)] min-h-[520px] overflow-x-hidden">
          {/* Header */}
          <div className="px-6 pt-5 pb-3 border-b">
            <h2 className="text-lg font-semibold">Build My Plan</h2>
            <p className="text-sm text-muted-foreground">Smart 12-month plan</p>
          </div>

          {/* Body - Only scrollable area */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
            {currentStep === 1 && (
              <ProfileStep 
                formData={formData}
                onUpdateFormData={updateFormData}
              />
            )}
            {currentStep === 2 && (
              <RecommendationsStep 
                formData={formData}
                onUpdateFormData={updateFormData}
              />
            )}
            {currentStep === 3 && (
              <ReviewStep 
                formData={formData}
                onUpdateFormData={updateFormData}
              />
            )}
            {currentStep === 4 && (
              <SaveStep 
                formData={formData}
                onSave={handleClose}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 pt-3 border-t flex items-center justify-between">
            <Stepper current={currentStep} steps={['Info', 'Summary', 'Preview', 'Save']} />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                size="sm"
                onClick={currentStep === 4 ? handleClose : nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2"
              >
                {currentStep === 4 ? 'Finish' : 'Next'}
                {currentStep < 4 && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}