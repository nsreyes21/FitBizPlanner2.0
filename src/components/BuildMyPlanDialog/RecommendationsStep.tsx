import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { PlanFormData, RecommendedEvent } from '../BuildMyPlanDialog';
import { format } from 'date-fns';
import { generateQuarterlyPlan } from './QuarterlyPlanner';

interface RecommendationsStepProps {
  formData: PlanFormData;
  onUpdateFormData: (updates: Partial<PlanFormData>) => void;
}

export function RecommendationsStep({ formData, onUpdateFormData }: RecommendationsStepProps) {
  
  useEffect(() => {
    if (formData.businessType && formData.city && 
        (formData.focusApparel || formData.focusCommunity || formData.focusHolidays || formData.focusBusiness)) {
      const recommendations = generateQuarterlyPlan(formData);
      onUpdateFormData({ selectedEvents: recommendations });
    }
  }, [formData.businessType, formData.city, formData.focusApparel, formData.focusCommunity, formData.focusHolidays, formData.focusBusiness, onUpdateFormData]);

  const toggleEventSelection = (eventId: string) => {
    const updatedEvents = formData.selectedEvents.map(event =>
      event.id === eventId ? { ...event, selected: !event.selected } : event
    );
    onUpdateFormData({ selectedEvents: updatedEvents });
  };

  const getQuarter = (date: Date) => {
    const month = date.getMonth();
    return Math.floor(month / 3) + 1;
  };

  const groupEventsByQuarter = () => {
    const quarters: { [key: number]: RecommendedEvent[] } = {};
    formData.selectedEvents.forEach(event => {
      const quarter = getQuarter(event.suggestedDate);
      if (!quarters[quarter]) quarters[quarter] = [];
      quarters[quarter].push(event);
    });
    return quarters;
  };

  if (!formData.businessType || !formData.city) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
        <p className="text-muted-foreground">Complete your profile to see 12-month event recommendations</p>
      </div>
    );
  }

  if (!formData.focusApparel && !formData.focusCommunity && !formData.focusHolidays && !formData.focusBusiness) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium mb-2">Select your focus areas</h3>
        <p className="text-muted-foreground">Choose at least one focus area to generate your annual plan</p>
      </div>
    );
  }

  const quarterlyEvents = groupEventsByQuarter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
      {/* Main Content Column */}
      <div className="min-w-0 space-y-4">
        <div className="text-sm text-muted-foreground mb-3">
          Based on your {formData.businessType} in {formData.city}, here's your 12-month plan:
        </div>
        
        {[1, 2, 3, 4].map(quarter => {
          const events = quarterlyEvents[quarter] || [];
          const quarterNames = ['Q1 - Jan, Feb, Mar', 'Q2 - Apr, May, Jun', 'Q3 - Jul, Aug, Sep', 'Q4 - Oct, Nov, Dec'];
          
          return (
            <Card key={quarter}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{quarterNames[quarter - 1]}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-5">
                {events.length === 0 ? (
                  <p className="text-muted-foreground text-center py-3">No events for this quarter</p>
                ) : (
                  <div className="space-y-3">
                    {events.map(event => (
                      <div key={event.id} className={`border rounded-lg p-3 transition-all ${event.selected ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={event.selected}
                            onCheckedChange={() => toggleEventSelection(event.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-sm">{event.name}</h4>
                              <Badge variant="secondary" className="text-xs">{event.type}</Badge>
                              <Badge variant="outline" className="text-xs">{format(event.suggestedDate, 'MMM dd')}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                            <div className="text-xs text-muted-foreground">
                              Template: {event.template}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {formData.selectedEvents.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            Generating your personalized recommendations...
          </div>
        )}
      </div>

      {/* Summary Column - Desktop Only */}
      <div className="min-w-0 hidden md:block">
        <Card>
          <CardContent className="p-4 md:p-5">
            <h3 className="text-sm font-medium mb-3">Plan Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selected Events:</span>
                <span className="font-medium">{formData.selectedEvents.filter(e => e.selected).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business Type:</span>
                <span className="font-medium">{formData.businessType || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{formData.city || 'Not selected'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}