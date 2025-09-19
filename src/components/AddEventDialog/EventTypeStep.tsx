import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shirt, Users, Gift, Target, Settings } from 'lucide-react';

interface EventTypeStepProps {
  selectedType: string;
  onSelectType: (type: 'apparel' | 'community' | 'holiday' | 'marketing' | 'custom') => void;
}

const eventTypes = [
  {
    type: 'apparel' as const,
    name: 'Apparel Launch',
    description: 'Launch new merchandise with pre-orders, fulfillment, and delivery coordination',
    leadTimeWeeks: 4,
    icon: Shirt,
    color: 'bg-apparel text-apparel-foreground'
  },
  {
    type: 'community' as const,
    name: 'Community BBQ or Party',
    description: 'Host member events, social gatherings, and community building activities',
    leadTimeWeeks: 4,
    icon: Users,
    color: 'bg-community text-community-foreground'
  },
  {
    type: 'holiday' as const,
    name: 'Holiday Promo',
    description: 'Special promotions, seasonal offers, and holiday-themed campaigns',
    leadTimeWeeks: 3,
    icon: Gift,
    color: 'bg-holiday text-holiday-foreground'
  },
  {
    type: 'marketing' as const,
    name: 'Challenge or Program',
    description: 'Fitness challenges, training programs, and member engagement campaigns',
    leadTimeWeeks: 6,
    icon: Target,
    color: 'bg-marketing text-marketing-foreground'
  },
  {
    type: 'custom' as const,
    name: 'Custom',
    description: 'Create your own event type with custom milestones and timeline',
    leadTimeWeeks: 0,
    icon: Settings,
    color: 'bg-secondary text-secondary-foreground'
  }
];

export function EventTypeStep({ selectedType, onSelectType }: EventTypeStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Choose the type of event you want to create. Each type comes with pre-built milestones and timelines.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {eventTypes.map((eventType) => {
          const Icon = eventType.icon;
          const isSelected = selectedType === eventType.type;
          
          return (
            <Card
              key={eventType.type}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => onSelectType(eventType.type)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${eventType.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{eventType.name}</h3>
                      {eventType.leadTimeWeeks > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {eventType.leadTimeWeeks} weeks
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {eventType.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}