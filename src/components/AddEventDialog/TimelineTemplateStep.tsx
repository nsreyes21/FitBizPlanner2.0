import { useEffect, useState } from 'react';
import { format, addDays } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Timeline } from '@/components/ui/timeline';
import { EventFormData } from '../AddEventDialog';
import { eventTemplates } from '@/components/EventTemplates';

interface TimelineTemplateStepProps {
  formData: EventFormData;
  onUpdateFormData: (updates: Partial<EventFormData>) => void;
}

export function TimelineTemplateStep({ formData, onUpdateFormData }: TimelineTemplateStepProps) {
  const [milestones, setMilestones] = useState(formData.milestones);

  useEffect(() => {
    if (formData.type && formData.type !== 'custom' && milestones.length === 0) {
      const template = eventTemplates.find(t => t.type === formData.type);
      if (template) {
        const converted = template.milestones.map(milestone => ({
          name: milestone.name,
          offsetDays: milestone.offsetDays,
          owner: milestone.defaultOwner,
          notes: milestone.notes
        }));
        setMilestones(converted);
      }
    }
  }, [formData.type]);

  useEffect(() => {
    onUpdateFormData({ milestones });
  }, [milestones, onUpdateFormData]);

  const addCustomMilestone = () => {
    setMilestones([
      ...milestones,
      { name: 'New Milestone', offsetDays: 0, owner: '', notes: 'Add description for this milestone' }
    ]);
  };

  const updateMilestone = (index: number, field: string, value: string | number) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const getComputedDate = (offsetDays: number) => {
    if (!formData.date) return 'Select event date first';
    return format(addDays(formData.date, offsetDays), 'MMM d, yyyy');
  };

  // Prepare timeline items with computed dates
  const timelineItems = milestones
    .sort((a, b) => a.offsetDays - b.offsetDays) // Sort by offset days
    .map(milestone => ({
      ...milestone,
      computedDate: getComputedDate(milestone.offsetDays)
    }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Timeline & Milestones</h3>
        <p className="text-muted-foreground">
          {formData.type === 'custom' 
            ? 'Create your own custom milestones and timeline.'
            : 'Review and customize the milestone timeline for your event. Dates are automatically calculated from your event date.'
          }
        </p>
      </div>

      {!formData.date && (
        <div className="bg-muted/50 border border-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Please set an event date in the previous step to see computed milestone dates.
          </p>
        </div>
      )}

      <div className="bg-card border rounded-lg p-6">
        <Timeline
          items={timelineItems}
          onUpdateItem={updateMilestone}
          onRemoveItem={removeMilestone}
          editable={true}
        />
      </div>

      <Button
        onClick={addCustomMilestone}
        variant="outline"
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Milestone
      </Button>

      {formData.date && (
        <div className="bg-muted/50 border border-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Negative offset days are before the event date, positive are after. 
            Editing the event date will automatically recalculate all milestone dates.
          </p>
        </div>
      )}
    </div>
  );
}