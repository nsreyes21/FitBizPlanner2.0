import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { EventTypeStep } from './AddEventDialog/EventTypeStep';
import { EventBasicsStep } from './AddEventDialog/EventBasicsStep';
import { TimelineTemplateStep } from './AddEventDialog/TimelineTemplateStep';
import { ReviewStep } from './AddEventDialog/ReviewStep';
import { Event, Milestone } from '@/types/Event';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessType?: string;
  city?: string;
  onShowSignupModal?: () => void;
}

export interface EventFormData {
  type: 'apparel' | 'community' | 'holiday' | 'marketing' | 'custom' | '';
  name: string;
  date: Date | undefined;
  category: string;
  tags: string[];
  milestones: {
    name: string;
    offsetDays: number;
    owner: string;
    notes: string;
  }[];
}

const initialFormData: EventFormData = {
  type: '',
  name: '',
  date: undefined,
  category: '',
  tags: [],
  milestones: []
};

export function AddEventDialog({ open, onOpenChange, businessType, city, onShowSignupModal }: AddEventDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);

  const updateFormData = (updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.type !== '';
      case 2: return formData.name.trim() !== '' && formData.date !== undefined;
      case 3: return formData.milestones.length > 0;
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
      case 1: return 'Choose Event Type';
      case 2: return 'Event Details';
      case 3: return 'Timeline & Milestones';
      case 4: return 'Review & Save';
      default: return 'Add Event';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

        <div className="py-6">
          {currentStep === 1 && (
            <EventTypeStep 
              selectedType={formData.type} 
              onSelectType={(type) => updateFormData({ type })} 
            />
          )}
          {currentStep === 2 && (
            <EventBasicsStep 
              formData={formData}
              onUpdateFormData={updateFormData}
            />
          )}
          {currentStep === 3 && (
            <TimelineTemplateStep 
              formData={formData}
              onUpdateFormData={updateFormData}
            />
          )}
          {currentStep === 4 && (
            <ReviewStep 
              formData={formData}
              businessType={businessType}
              city={city}
              onSave={handleClose}
              onShowSignupModal={onShowSignupModal}
            />
          )}
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
              Save Event
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}