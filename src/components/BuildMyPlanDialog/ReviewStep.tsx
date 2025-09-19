import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar, Edit, Trash2, Plus, Lock, Crown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { PlanFormData, RecommendedEvent } from '../BuildMyPlanDialog';
import { SignupGateModal } from '../SignupGateModal';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { usePreviewMigration } from '@/hooks/usePreviewMigration';

interface ReviewStepProps {
  formData: PlanFormData;
  onUpdateFormData: (updates: Partial<PlanFormData>) => void;
}

export function ReviewStep({ formData, onUpdateFormData }: ReviewStepProps) {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showCustomEventForm, setShowCustomEventForm] = useState(false);
  const [customEventName, setCustomEventName] = useState('');
  const [customEventDate, setCustomEventDate] = useState('');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { isAuthenticated, storePreviewEvents, convertToEventRec, saveFormDataForMigration } = usePreviewMigration();
  
  const selectedEvents = formData.selectedEvents.filter(e => e.selected);
  
  // Count custom events added by user (not from templates)
  const customEventsCount = selectedEvents.filter(e => 
    e.id.startsWith('custom-') || 
    !['apparel', 'community', 'holiday', 'business'].includes(e.type)
  ).length;

  // Store preview events and form data for migration
  useEffect(() => {
    const selectedEvents = formData.selectedEvents.filter(e => e.selected);
    if (selectedEvents.length > 0) {
      storePreviewEvents(selectedEvents);
      saveFormDataForMigration(formData);
    }
  }, [formData, storePreviewEvents, saveFormDataForMigration]);

  const updateEventName = (eventId: string, newName: string) => {
    // Check if this event is in a locked quarter (only for non-authenticated users)
    const event = formData.selectedEvents.find(e => e.id === eventId);
    if (!isAuthenticated && event && getQuarter(event.suggestedDate) > 1) {
      setShowSignupModal(true);
      return;
    }
    
    const updatedEvents = formData.selectedEvents.map(event =>
      event.id === eventId ? { ...event, name: newName } : event
    );
    onUpdateFormData({ selectedEvents: updatedEvents });
  };

  const updateEventDate = (eventId: string, newDate: string) => {
    // Check if this event is in a locked quarter (only for non-authenticated users)
    const event = formData.selectedEvents.find(e => e.id === eventId);
    if (!isAuthenticated && event && getQuarter(event.suggestedDate) > 1) {
      setShowSignupModal(true);
      return;
    }
    
    const updatedEvents = formData.selectedEvents.map(event =>
      event.id === eventId ? { ...event, suggestedDate: new Date(newDate) } : event
    );
    onUpdateFormData({ selectedEvents: updatedEvents });
  };

  const removeEvent = (eventId: string) => {
    // Check if this event is in a locked quarter (only for non-authenticated users)
    const event = formData.selectedEvents.find(e => e.id === eventId);
    if (!isAuthenticated && event && getQuarter(event.suggestedDate) > 1) {
      setShowSignupModal(true);
      return;
    }
    
    const updatedEvents = formData.selectedEvents.filter(event => event.id !== eventId);
    onUpdateFormData({ selectedEvents: updatedEvents });
  };

  const getQuarter = (date: Date) => {
    const month = date.getMonth();
    return Math.floor(month / 3) + 1;
  };

  const groupEventsByQuarter = () => {
    const quarters: { [key: number]: typeof selectedEvents } = {};
    selectedEvents.forEach(event => {
      const quarter = getQuarter(event.suggestedDate);
      if (!quarters[quarter]) quarters[quarter] = [];
      quarters[quarter].push(event);
    });
    return quarters;
  };

  const quarterlyEvents = groupEventsByQuarter();

  const addCustomEvent = () => {
    // Check if user already has one custom event and is not authenticated
    if (!isAuthenticated && customEventsCount >= 1) {
      setShowSignupModal(true);
      return;
    }

    if (!customEventName.trim() || !customEventDate) {
      return;
    }

    const eventDate = new Date(customEventDate);
    const quarter = getQuarter(eventDate);
    
    // Only allow adding to Q1 for non-authenticated users
    if (!isAuthenticated && quarter !== 1) {
      toast({
        title: "Q1 Events Only",
        description: "Custom events can only be added to Q1 (Jan-Mar). Create an account to unlock all quarters.",
        variant: "destructive",
      });
      return;
    }

    const newEvent: RecommendedEvent = {
      id: `custom-${Date.now()}`,
      name: customEventName,
      type: 'community', // Default type for custom events
      description: 'Custom event created by user',
      suggestedDate: eventDate,
      template: 'Community Event (BBQ, Social, Throwdown)',
      selected: true
    };

    const updatedEvents = [...formData.selectedEvents, newEvent];
    onUpdateFormData({ selectedEvents: updatedEvents });

    // Reset form
    setCustomEventName('');
    setCustomEventDate('');
    setShowCustomEventForm(false);

    // Show toast for first custom event (only if not authenticated)
    if (!isAuthenticated && customEventsCount === 0) {
      toast({
        title: "Custom event added!",
        description: "Create a free account to unlock more.",
      });
    }
  };

  const handleAddCustomEvent = () => {
    if (!isAuthenticated && customEventsCount >= 1) {
      setShowSignupModal(true);
    } else {
      setShowCustomEventForm(true);
    }
  };

  const handleSignupSuccess = () => {
    setShowSignupModal(false);
    toast({
      title: "Account created!",
      description: "Your preview plan will be saved automatically.",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Annual Plan Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Business:</span> {formData.businessType}
            </div>
            <div>
              <span className="font-medium">Location:</span> {formData.city}
            </div>
            <div>
              <span className="font-medium">Total Events:</span> {selectedEvents.length}
            </div>
            <div>
              <span className="font-medium">Focus Areas:</span>{' '}
              {[
                formData.focusApparel && 'Apparel',
                formData.focusCommunity && 'Community',
                formData.focusHolidays && 'Holidays',
                formData.focusBusiness && 'Business'
              ].filter(Boolean).join(', ')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Free Preview Badge */}
      {!isAuthenticated && (
        <div className="flex justify-center mb-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Crown className="h-3 w-3 mr-1" />
            Free Preview
          </Badge>
        </div>
      )}

      {isMobile ? (
        <Accordion type="single" collapsible className="space-y-2" defaultValue={isAuthenticated ? undefined : "quarter-1"}>
          {[1, 2, 3, 4].map(quarter => {
            const events = quarterlyEvents[quarter] || [];
            const isLocked = !isAuthenticated && quarter > 1;
            
            return (
              <AccordionItem 
                key={quarter} 
                value={`quarter-${quarter}`}
                className={`border rounded-lg ${isLocked ? 'blur-sm' : ''}`}
              >
                <AccordionTrigger 
                  className="px-4 hover:no-underline"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">
                      Q{quarter} - {['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'][quarter - 1]}
                    </span>
                    <div className="flex items-center gap-2">
                      {isLocked && <Lock className="h-4 w-4" />}
                      <Badge variant="outline" className="ml-2">
                        {events.length} events
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {quarter === 1 && isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddCustomEvent}
                      className="mb-4 w-full"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Event
                    </Button>
                  )}

                  {/* Custom event form */}
                  {quarter === 1 && showCustomEventForm && (
                    <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-3">Add Custom Event to Q1</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="custom-name">Event Name</Label>
                          <Input
                            id="custom-name"
                            value={customEventName}
                            onChange={(e) => setCustomEventName(e.target.value)}
                            placeholder="Enter event name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="custom-date">Event Date</Label>
                          <Input
                            id="custom-date"
                            type="date"
                            value={customEventDate}
                            onChange={(e) => setCustomEventDate(e.target.value)}
                            min={`${new Date().getFullYear()}-01-01`}
                            max={`${new Date().getFullYear()}-03-31`}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={addCustomEvent}
                            disabled={!customEventName.trim() || !customEventDate}
                            size="sm"
                          >
                            Add Event
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowCustomEventForm(false);
                              setCustomEventName('');
                              setCustomEventDate('');
                            }}
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isLocked ? (
                    <div 
                      className="cursor-pointer hover:bg-muted/20 transition-colors p-2 rounded"
                      onClick={() => setShowSignupModal(true)}
                    >
                      <div className="space-y-4">
                        {events.slice(0, 2).map((event, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-10 bg-muted rounded border flex-1" />
                                  <Badge variant="secondary">{event.type}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {events.length > 2 && (
                          <div className="text-center py-2 text-muted-foreground text-sm">
                            +{events.length - 2} more events
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    events.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No events planned for this quarter</p>
                    ) : (
                      <div className="space-y-4">
                        {events.map(event => (
                          <div key={event.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={event.name}
                                    onChange={(e) => updateEventName(event.id, e.target.value)}
                                    className="font-medium"
                                  />
                                  <Badge variant="secondary">{event.type}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEvent(event.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`date-${event.id}`} className="text-sm">Date:</Label>
                              <Input
                                id={`date-${event.id}`}
                                type="date"
                                value={format(event.suggestedDate, 'yyyy-MM-dd')}
                                onChange={(e) => updateEventDate(event.id, e.target.value)}
                                className="w-auto"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <div className="space-y-4">
          {/* Q1 - Always visible as free preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Q1 - Jan-Mar
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomEvent}
                    className="ml-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Event
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Custom event form */}
              {showCustomEventForm && (
                <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3">Add Custom Event to Q1</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="custom-name">Event Name</Label>
                      <Input
                        id="custom-name"
                        value={customEventName}
                        onChange={(e) => setCustomEventName(e.target.value)}
                        placeholder="Enter event name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-date">Event Date</Label>
                      <Input
                        id="custom-date"
                        type="date"
                        value={customEventDate}
                        onChange={(e) => setCustomEventDate(e.target.value)}
                        min={`${new Date().getFullYear()}-01-01`}
                        max={`${new Date().getFullYear()}-03-31`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={addCustomEvent}
                        disabled={!customEventName.trim() || !customEventDate}
                        size="sm"
                      >
                        Add Event
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCustomEventForm(false);
                          setCustomEventName('');
                          setCustomEventDate('');
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {(quarterlyEvents[1] || []).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No events planned for this quarter</p>
              ) : (
                <div className="space-y-4">
                  {(quarterlyEvents[1] || []).map(event => (
                    <div key={event.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={event.name}
                              onChange={(e) => updateEventName(event.id, e.target.value)}
                              className="font-medium"
                            />
                            <Badge variant="secondary">{event.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEvent(event.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`date-${event.id}`} className="text-sm">Date:</Label>
                        <Input
                          id={`date-${event.id}`}
                          type="date"
                          value={format(event.suggestedDate, 'yyyy-MM-dd')}
                          onChange={(e) => updateEventDate(event.id, e.target.value)}
                          className="w-auto"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-3 border-t border-dashed border-muted-foreground/30">
                <p className="text-sm text-muted-foreground text-center">
                  Your Q1 plan is free to use — no account required.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Q2-Q4 - Locked sections for unauthenticated users */}
          {[2, 3, 4].map(quarter => {
            const events = quarterlyEvents[quarter] || [];
            
            if (isAuthenticated) {
              // Show full quarters for authenticated users
              return (
                <Card key={quarter}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Q{quarter} - {['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'][quarter - 1]}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddCustomEvent}
                        className="ml-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Event
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Custom event form */}
                    {showCustomEventForm && (
                      <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-3">Add Custom Event</h4>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="custom-name">Event Name</Label>
                            <Input
                              id="custom-name"
                              value={customEventName}
                              onChange={(e) => setCustomEventName(e.target.value)}
                              placeholder="Enter event name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="custom-date">Event Date</Label>
                            <Input
                              id="custom-date"
                              type="date"
                              value={customEventDate}
                              onChange={(e) => setCustomEventDate(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={addCustomEvent}
                              disabled={!customEventName.trim() || !customEventDate}
                              size="sm"
                            >
                              Add Event
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowCustomEventForm(false);
                                setCustomEventName('');
                                setCustomEventDate('');
                              }}
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {events.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No events planned for this quarter</p>
                    ) : (
                      <div className="space-y-4">
                        {events.map(event => (
                          <div key={event.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={event.name}
                                    onChange={(e) => updateEventName(event.id, e.target.value)}
                                    className="font-medium"
                                  />
                                  <Badge variant="secondary">{event.type}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEvent(event.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`date-${event.id}`} className="text-sm">Date:</Label>
                              <Input
                                id={`date-${event.id}`}
                                type="date"
                                value={format(event.suggestedDate, 'yyyy-MM-dd')}
                                onChange={(e) => updateEventDate(event.id, e.target.value)}
                                className="w-auto"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            } else {
              // Show locked quarters for unauthenticated users
              return (
                <Card key={quarter} className="blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>Q{quarter} - {['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'][quarter - 1]}</span>
                        <Lock className="h-4 w-4" />
                      </div>
                      <Badge variant="outline">
                        {events.length} events
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent 
                    className="cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => setShowSignupModal(true)}
                  >
                    <div className="space-y-4">
                      {events.slice(0, 2).map((event, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="h-10 bg-muted rounded border flex-1" />
                                <Badge variant="secondary">{event.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className="text-center py-2 text-muted-foreground text-sm">
                          +{events.length - 2} more events
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            }
          })}
        </div>
      )}

      {/* Unlock Annual Plan Card - Only show for unauthenticated users */}
      {!isAuthenticated && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Unlock Your Annual Plan</h3>
                <p className="text-muted-foreground mb-2">
                  You've unlocked Q1 — 9 more months waiting to be added!
                </p>
                <p className="text-sm text-muted-foreground">
                  Create your free account to access all 12 months of events and milestones.
                </p>
              </div>
              <Button 
                className="w-full"
                size="lg"
                onClick={() => setShowSignupModal(true)}
                data-tour="unlock-cta"
              >
                Save My Gym's Annual Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <SignupGateModal 
        open={showSignupModal}
        onOpenChange={setShowSignupModal}
        onSignupSuccess={handleSignupSuccess}
        previewPlan={convertToEventRec(formData.selectedEvents.filter(e => e.selected), formData)}
      />
    </div>
  );
}