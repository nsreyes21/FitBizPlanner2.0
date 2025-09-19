import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, Clock } from 'lucide-react';
import { PlanFormData } from '../BuildMyPlanDialog';
import { useToast } from '@/hooks/use-toast';
import { usePreviewMigration } from '@/hooks/usePreviewMigration';
import confetti from 'canvas-confetti';

interface SaveStepProps {
  formData: PlanFormData;
  onSave: () => void;
}

export function SaveStep({ formData, onSave }: SaveStepProps) {
  const { toast } = useToast();
  const { isAuthenticated, migratePreviewData, guardedUpsertPlan } = usePreviewMigration();

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign up to save your plan.",
        variant: "destructive",
      });
      return;
    }

    const success = await migratePreviewData(formData);
    if (success) {
      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onSave();
    }
  };

  const selectedEvents = formData.selectedEvents.filter(e => e.selected);
  const totalMilestones = selectedEvents.length * 3; // Average milestones per event

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-semibold">Ready to Save Your Annual Plan</h3>
            <p className="text-muted-foreground">
              Your personalized event calendar for {formData.businessType} in {formData.city}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{selectedEvents.length}</div>
            <div className="text-sm text-muted-foreground">Events Planned</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalMilestones}</div>
            <div className="text-sm text-muted-foreground">Task Milestones</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-center">
            <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Months Covered</div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <Button onClick={handleSave} size="lg" className="min-w-[200px]">
          Save Annual Plan
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          This will create your events and milestones in the calendar
        </p>
      </div>
    </div>
  );
}