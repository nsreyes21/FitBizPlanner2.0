import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { AnnualPlan } from "@/components/annual/AnnualPlan";

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

interface EventCalendarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateSelect?: (date: Date) => void;
  onDateDoubleClick?: (date: Date) => void;
}

const eventTypeColors = {
  apparel: 'bg-apparel text-apparel-foreground',
  community: 'bg-community text-community-foreground', 
  holiday: 'bg-holiday text-holiday-foreground',
  business: 'bg-business text-business-foreground'
};

const eventTypeLabels = {
  apparel: 'Apparel',
  community: 'Community',
  holiday: 'Holiday',
  business: 'Business'
};

const eventTypeIcons = {
  apparel: '👕',
  community: '🎉',
  holiday: '🎃',
  business: '📊'
};

export function EventCalendar({ events, onEventClick, onDateSelect, onDateDoubleClick }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [lastTap, setLastTap] = useState<{ date: Date; timestamp: number } | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'quarterly'>('calendar');
  const isMobile = useIsMobile();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i)
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day)
    });
  }
  
  // Next month days
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month + 1, day)
    });
  }
  
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getQuarter = (date: Date) => {
    const month = date.getMonth();
    return Math.floor(month / 3) + 1;
  };

  const groupEventsByQuarter = () => {
    const currentYear = new Date().getFullYear();
    const quarters: { [key: number]: CalendarEvent[] } = {};
    
    events
      .filter(event => event.date.getFullYear() === currentYear)
      .forEach(event => {
        const quarter = getQuarter(event.date);
        if (!quarters[quarter]) quarters[quarter] = [];
        quarters[quarter].push(event);
      });
    
    return quarters;
  };

  const quarterNames = {
    1: 'Q1 - Jan-Mar',
    2: 'Q2 - Apr-Jun', 
    3: 'Q3 - Jul-Sep',
    4: 'Q4 - Oct-Dec'
  };
  
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const handleDateClick = useCallback((date: Date) => {
    const now = Date.now();
    const isDoubleTap = lastTap && 
      lastTap.date.toDateString() === date.toDateString() && 
      now - lastTap.timestamp < 300;

    if (isDoubleTap) {
      onDateDoubleClick?.(date);
      setLastTap(null);
    } else {
      setSelectedDate(date);
      onDateSelect?.(date);
      setLastTap({ date, timestamp: now });
    }
  }, [lastTap, onDateSelect, onDateDoubleClick]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedDate) return;

    let newDate = new Date(selectedDate);
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'Enter':
        e.preventDefault();
        onDateDoubleClick?.(selectedDate);
        return;
      default:
        return;
    }
    
    setSelectedDate(newDate);
    onDateSelect?.(newDate);
    
    // Update current month if navigated outside
    if (newDate.getMonth() !== currentDate.getMonth()) {
      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  }, [selectedDate, currentDate, onDateSelect, onDateDoubleClick]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Header sticks; nav buttons don't cause layout shift */}
      <div className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 border-b">
        <div className="text-xl font-semibold">
          {viewMode === 'calendar' ? `${monthNames[month]} ${year}` : `${year} Annual Plan`}
        </div>
        <div className="flex gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1 mr-2">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="px-2 py-1"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'quarterly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('quarterly')}
              className="px-2 py-1"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Navigation - only show in calendar mode */}
          {viewMode === 'calendar' && (
            <>
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* The calendar grid is the only scroller inside EventCalendar */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4">
        {viewMode === 'calendar' ? (
          <>
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b bg-muted/30 mb-4">
              {weekDays.map(day => (
                <div 
                  key={day} 
                  className="p-2 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((calendarDay, index) => {
                const dayEvents = getEventsForDate(calendarDay.date);
                const isToday = calendarDay.date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate?.toDateString() === calendarDay.date.toDateString();
                
                return (
                  <div
                    key={index}
                    className={`
                      relative border-r border-b last-in-row:border-r-0 last-row:border-b-0
                      min-h-[50px] h-[50px] sm:h-[60px] lg:h-[70px]
                      p-1 sm:p-2 cursor-pointer transition-all duration-150
                      hover:bg-accent/50 active:bg-accent/70
                      ${calendarDay.isCurrentMonth ? 'bg-background' : 'bg-muted/20'}
                      ${isToday ? 'bg-primary/5 border-primary/30' : ''}
                      ${isSelected ? 'bg-primary/10 ring-2 ring-primary/30 ring-inset' : ''}
                    `}
                    onClick={() => handleDateClick(calendarDay.date)}
                  >
                    {/* Day Number */}
                    <div className={`
                      absolute top-1.5 right-1.5 sm:top-3 sm:right-3
                      text-sm sm:text-base font-medium
                      ${calendarDay.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                      ${isToday ? 'text-primary font-bold' : ''}
                    `}>
                      {calendarDay.day}
                    </div>
                    
                    {/* Event Pills - Compact on mobile */}
                    <div className="mt-6 sm:mt-8 space-y-0.5 sm:space-y-1">
                      {dayEvents.slice(0, 3).map((event, eventIndex) => (
                        <div
                          key={event.id}
                          className={`
                            h-1.5 sm:h-4 rounded-full cursor-pointer transition-opacity hover:opacity-80 min-h-[6px]
                            ${eventTypeColors[event.type].replace('text-', 'bg-').split(' ')[0]}
                            sm:hidden
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          title={`${eventTypeIcons[event.type]} ${event.title}`}
                        />
                      ))}
                      
                      {/* Desktop event pills with text */}
                      <div className="hidden sm:block space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <Badge
                            key={event.id}
                            variant="secondary"
                            className={`
                              text-xs cursor-pointer block truncate w-full min-h-[20px] flex items-center gap-1
                              ${eventTypeColors[event.type]}
                              hover:opacity-80 transition-opacity
                            `}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                          >
                            <span className="text-xs leading-none">{eventTypeIcons[event.type]}</span>
                            <span className="truncate">{event.title}</span>
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Overflow indicator */}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] sm:text-xs text-muted-foreground font-medium sm:hidden">
                          +{dayEvents.length - 3}
                        </div>
                      )}
                      {dayEvents.length > 2 && (
                        <div className="hidden sm:block text-xs text-muted-foreground font-medium">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Annual Plan View */
          <AnnualPlan events={events} onEventClick={onEventClick} />
        )}
        
            {/* Legend */}
            <div className="mt-6 p-4 border-t bg-muted/20">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-medium text-muted-foreground">Event Types:</div>
                {Object.entries(eventTypeColors).map(([type, colorClass]) => (
                  <div key={type} className="flex items-center gap-1">
                    <span className="text-sm">{eventTypeIcons[type as keyof typeof eventTypeIcons]}</span>
                    <div className={`w-2 h-2 rounded-full ${colorClass.split(' ')[0]}`} />
                    <span className="text-xs">{eventTypeLabels[type as keyof typeof eventTypeLabels]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}