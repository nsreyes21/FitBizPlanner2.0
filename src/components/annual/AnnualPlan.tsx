import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'apparel' | 'community' | 'holiday' | 'business';
  milestones: Array<{
    id: string;
    title: string;
    date: Date;
    completed: boolean;
  }>;
}

interface AnnualPlanProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

const eventTypeColors = {
  apparel: 'bg-blue-100 text-blue-800',
  community: 'bg-green-100 text-green-800', 
  holiday: 'bg-orange-100 text-orange-800',
  business: 'bg-gray-100 text-gray-800'
};

const eventTypeIcons = {
  apparel: '👕',
  community: '👥',
  holiday: '🎃',
  business: '📊'
};

export function AnnualPlan({ events, onEventClick }: AnnualPlanProps) {
  const getQuarter = (date: Date) => {
    const month = date.getMonth();
    return Math.floor(month / 3) + 1;
  };

  const groupEventsByQuarter = () => {
    const currentYear = new Date().getFullYear();
    const quarters: { [key: number]: CalendarEvent[] } = {};
    
    events
      .filter(event => event.date.getFullYear() === currentYear)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .forEach(event => {
        const quarter = getQuarter(event.date);
        if (!quarters[quarter]) quarters[quarter] = [];
        quarters[quarter].push(event);
      });
    
    return quarters;
  };

  const quarterNames = {
    1: 'Q1 2025 - Jan-Mar',
    2: 'Q2 2025 - Apr-Jun', 
    3: 'Q3 2025 - Jul-Sep',
    4: 'Q4 2025 - Oct-Dec'
  };

  const quarterlyEvents = groupEventsByQuarter();

  return (
    <div className="flex h-full flex-col min-h-0">
      <div className="p-4 sticky top-0 bg-background z-10 border-b">
        <h2 className="text-xl font-semibold">2025 Annual Plan</h2>
      </div>
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {[1, 2, 3, 4].map(quarter => {
              const quarterEvents = quarterlyEvents[quarter] || [];
              
              return (
                <Card key={quarter} className="w-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{quarterNames[quarter as keyof typeof quarterNames]}</span>
                      <Badge variant="secondary" className="text-sm">
                        {quarterEvents.length} event{quarterEvents.length !== 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {quarterEvents.length > 0 ? (
                      <div className="space-y-3">
                        {quarterEvents.map(event => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                            onClick={() => onEventClick?.(event)}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-lg">{eventTypeIcons[event.type]}</span>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{event.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {format(event.date, 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${eventTypeColors[event.type]}`}
                              >
                                {event.type}
                              </Badge>
                              {event.milestones.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {event.milestones.filter(m => m.completed).length}/{event.milestones.length} milestones
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No events scheduled for this quarter</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
