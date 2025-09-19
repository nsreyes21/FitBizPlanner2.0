import { format, addDays } from 'date-fns';
import { Calendar, Tag, MapPin, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EventFormData } from '../AddEventDialog';
import { eventStore } from '@/stores/EventStore';
import { Event, Milestone } from '@/types/Event';
import { useToast } from '@/hooks/use-toast';
import { usePreviewMigration } from '@/hooks/usePreviewMigration';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface ReviewStepProps {
  formData: EventFormData;
  businessType?: string;
  city?: string;
  onSave: () => void;
  onShowSignupModal?: () => void;
}

const typeLabels = {
  apparel: 'Apparel Launch',
  community: 'Community Event',
  holiday: 'Holiday Promotion',
  marketing: 'Marketing Campaign',
  custom: 'Custom Event'
};

export function ReviewStep({ formData, businessType, city, onSave, onShowSignupModal }: ReviewStepProps) {
  const { toast } = useToast();
  const { isAuthenticated } = usePreviewMigration();

  const handleSave = () => {
    if (!formData.date || !formData.name.trim() || formData.type === '') {
      return;
    }

    // Check authentication before saving
    if (!isAuthenticated) {
      toast({
        description: "Create a free account to save and edit your plan",
      });
      onShowSignupModal?.();
      return;
    }

    const eventId = `event-${Date.now()}`;
    
    // Create event
    const event: Event = {
      id: eventId,
      name: formData.name.trim(),
      type: formData.type as Event['type'],
      date: formData.date,
      businessType,
      city,
      tags: formData.tags
    };

    // Create milestones
    const milestones: Milestone[] = formData.milestones.map((milestone, index) => ({
      id: `milestone-${Date.now()}-${index}`,
      eventId,
      name: milestone.name,
      offsetDays: milestone.offsetDays,
      absoluteDate: addDays(formData.date!, milestone.offsetDays),
      owner: milestone.owner,
      status: 'open' as const,
      notes: milestone.notes
    }));

    // Save to store (for authenticated users, this should eventually save to Supabase)
    eventStore.addEvent(event);
    eventStore.addMilestones(milestones);

    toast({
      title: "Event created",
      description: `${event.name} has been added to your calendar with ${milestones.length} milestones.`,
    });

    onSave();
  };

  if (!formData.date || !formData.name.trim()) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please complete the previous steps to review your event.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Your Event</h3>
        <p className="text-muted-foreground">
          Review all details before saving. Your event will appear on the calendar with all milestones.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{formData.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Event Date:</strong> {format(formData.date, 'PPP')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Type:</strong> {typeLabels[formData.type as keyof typeof typeLabels]}
              </span>
            </div>
            
            {city && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Location:</strong> {city}
                </span>
              </div>
            )}
            
            {businessType && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Business:</strong> {businessType}
                </span>
              </div>
            )}
          </div>

          {formData.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline & Milestones ({formData.milestones.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Milestone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.milestones
                .sort((a, b) => a.offsetDays - b.offsetDays)
                .map((milestone, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{milestone.name}</TableCell>
                  <TableCell>
                    {format(addDays(formData.date!, milestone.offsetDays), 'MMM d, yyyy')}
                    {milestone.offsetDays !== 0 && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({milestone.offsetDays > 0 ? '+' : ''}{milestone.offsetDays}d)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{milestone.owner}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {milestone.notes}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={handleSave} size="lg" className="px-8">
          Save Event & Milestones
        </Button>
      </div>
    </div>
  );
}