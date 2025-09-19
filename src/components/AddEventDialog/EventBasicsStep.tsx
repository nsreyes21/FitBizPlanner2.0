import { useState } from 'react';
import { Calendar, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { EventFormData } from '../AddEventDialog';

interface EventBasicsStepProps {
  formData: EventFormData;
  onUpdateFormData: (updates: Partial<EventFormData>) => void;
}

const typeToCategory = {
  apparel: 'Apparel Launch',
  community: 'Community Event',
  holiday: 'Holiday Promotion',
  marketing: 'Marketing Campaign',
  custom: 'Custom Event'
};

export function EventBasicsStep({ formData, onUpdateFormData }: EventBasicsStepProps) {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      onUpdateFormData({
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onUpdateFormData({
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-6">
      {formData.type === 'apparel' && (
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            <strong>Apparel Launch Tip:</strong> Your event date should be when you want the apparel to arrive/launch. 
            We'll automatically schedule pre-orders, fulfillment, and delivery milestones working backward from this date.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="eventName">Event Name *</Label>
          <Input
            id="eventName"
            value={formData.name}
            onChange={(e) => onUpdateFormData({ name: e.target.value })}
            placeholder="Enter event name..."
            className="mt-1"
          />
        </div>

        <div>
          <Label>Event Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-1",
                  !formData.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(formData.date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={formData.date}
                onSelect={(date) => onUpdateFormData({ date })}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="category">Event Category</Label>
          <Input
            id="category"
            value={formData.category || (formData.type ? typeToCategory[formData.type as keyof typeof typeToCategory] : '')}
            onChange={(e) => onUpdateFormData({ category: e.target.value })}
            placeholder="Enter category..."
            className="mt-1"
          />
        </div>

        <div>
          <Label>Tags</Label>
          <div className="mt-1 space-y-2">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button onClick={addTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-2 py-1">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2 hover:bg-transparent"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}