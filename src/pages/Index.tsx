import { useState, useEffect } from 'react';
import { EventCalendar } from '@/components/EventCalendar';
import { TaskSidebar } from '@/components/TaskSidebar';
import { AddEventDialog } from '@/components/AddEventDialog';
import { BuildMyPlanDialog } from '@/components/BuildMyPlanDialog';
import { AuthHeader } from '@/components/AuthHeader';
import { OnboardingBanner } from '@/components/OnboardingBanner';
import { OnboardingTour } from '@/components/OnboardingTour';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Users, Shirt, Plus } from 'lucide-react';
import { usePreviewMigration } from '@/hooks/usePreviewMigration';
import { getEventsInRange } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [showBuildPlanDialog, setShowBuildPlanDialog] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { isAuthenticated } = usePreviewMigration();
  const { toast } = useToast();

  // Load events from Supabase for authenticated users
  useEffect(() => {
    const loadEvents = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const now = new Date();
        const fromDate = new Date(now.getFullYear(), 0, 1); // Start of current year
        const toDate = new Date(now.getFullYear() + 1, 11, 31); // End of next year
        
        const fromISO = fromDate.toISOString().split('T')[0];
        const toISO = toDate.toISOString().split('T')[0];
        
        const data = await getEventsInRange(fromISO, toISO);
        
        // Convert Supabase data to calendar format
        const calendarEvents = data.map(event => ({
          id: event.id,
          title: event.name,
          date: new Date(event.date),
          type: event.type,
          milestones: event.milestones?.map(milestone => ({
            id: milestone.id,
            title: milestone.name,
            date: new Date(milestone.absolute_date),
            completed: milestone.status === 'done',
            owner: milestone.owner || 'Unassigned',
            tasks: [] // TODO: Add tasks when implemented
          })) || []
        }));
        
        setEvents(calendarEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
        toast({
          title: "Failed to load events",
          description: "Please try refreshing the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [isAuthenticated, toast]);

  // Generate sample events for demo when not authenticated
  const getSampleEvents = () => {
    const currentDate = new Date();
    return [
      {
        id: 'sample-1',
        title: 'Spring Apparel Launch',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15),
        type: 'apparel' as const,
        milestones: [
          {
            id: 'sm1',
            title: 'Pre-order Announcement',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
            completed: true,
            tasks: [
              { id: 'st1', title: 'Design mockups and get approval', completed: true },
              { id: 'st2', title: 'Set up pre-order system', completed: true },
              { id: 'st3', title: 'Create social media graphics', completed: false },
              { id: 'st4', title: 'Send announcement email to members', completed: false }
            ]
          }
        ]
      },
      {
        id: 'sample-2',
        title: 'Member BBQ',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 22),
        type: 'community' as const,
        milestones: [
          {
            id: 'sm2',
            title: 'Event Planning',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22),
            completed: false,
            tasks: [
              { id: 'st5', title: 'Choose date and location', completed: true },
              { id: 'st6', title: 'Create event theme and activities', completed: false }
            ]
          }
        ]
      }
    ];
  };

  const displayEvents = isAuthenticated ? events : getSampleEvents();

  const handleTaskToggle = (eventId: string, milestoneId: string, taskId: string) => {
    if (!isAuthenticated) {
      toast({
        description: "Sign up to track progress",
      });
      return;
    }
    // This would update the task completion state
    console.log('Toggle task:', { eventId, milestoneId, taskId });
  };

  const handleTaskNotesUpdate = (eventId: string, milestoneId: string, taskId: string, notes: string) => {
    if (!isAuthenticated) {
      toast({
        description: "Sign up to track progress",
      });
      return;
    }
    // This would update the task notes
    console.log('Update notes:', { eventId, milestoneId, taskId, notes });
  };

  const handleMilestoneToggle = async (eventId: string, milestoneId: string) => {
    if (!isAuthenticated) {
      toast({
        description: "Create a free account to save and edit your plan",
      });
      setShowBuildPlanDialog(true);
      return;
    }
    
    try {
      // This would toggle milestone completion
      console.log('Toggle milestone:', { eventId, milestoneId });
      // TODO: Call updateMilestoneStatus when implemented
    } catch (error) {
      toast({
        title: "Could not save",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMilestoneOwnerUpdate = (eventId: string, milestoneId: string, owner: string) => {
    if (!isAuthenticated) {
      toast({
        description: "Create a free account to save and edit your plan",
      });
      return;
    }
    // This would update the milestone owner
    console.log('Update owner:', { eventId, milestoneId, owner });
  };


  return (
    <div className="min-h-screen bg-background">
      <AuthHeader 
        onBuildPlan={() => setShowBuildPlanDialog(true)}
        onAddEvent={() => setShowAddEventDialog(true)}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Onboarding Banner */}
        <OnboardingBanner />

          {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{displayEvents.length}</p>
                <p className="text-sm text-muted-foreground">Active Events</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Target className="h-8 w-8 text-community" />
              <div>
                <p className="text-2xl font-bold">{displayEvents.reduce((sum, e) => sum + (e.milestones?.length || 0), 0)}</p>
                <p className="text-sm text-muted-foreground">Milestones</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Users className="h-8 w-8 text-marketing" />
              <div>
                <p className="text-2xl font-bold">{displayEvents.filter(e => e.type === 'community').length}</p>
                <p className="text-sm text-muted-foreground">Community Events</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Shirt className="h-8 w-8 text-apparel" />
              <div>
                <p className="text-2xl font-bold">{displayEvents.filter(e => e.type === 'apparel').length}</p>
                <p className="text-sm text-muted-foreground">Apparel Launches</p>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your events...</p>
                </div>
              </div>
            ) : (
              <EventCalendar 
                events={displayEvents}
                onEventClick={setSelectedEvent}
                onDateSelect={(date) => {
                  console.log('Date selected:', date);
                }}
                onDateDoubleClick={(date) => {
                  setShowAddEventDialog(true);
                }}
              />
            )}
          </div>

          {/* Task Sidebar */}
          <div>
            <TaskSidebar
              selectedEvent={selectedEvent}
              onTaskToggle={handleTaskToggle}
              onTaskNotesUpdate={handleTaskNotesUpdate}
              onMilestoneToggle={handleMilestoneToggle}
              onMilestoneOwnerUpdate={handleMilestoneOwnerUpdate}
              onShowSignupModal={() => setShowBuildPlanDialog(true)}
            />
          </div>
        </div>

      </div>

      {/* Add Event Dialog */}
      <AddEventDialog
        open={showAddEventDialog}
        onOpenChange={setShowAddEventDialog}
        onShowSignupModal={() => setShowBuildPlanDialog(true)}
      />

      {/* Build My Plan Dialog */}
      <BuildMyPlanDialog
        open={showBuildPlanDialog}
        onOpenChange={setShowBuildPlanDialog}
      />

      {/* Onboarding Tour */}
      <OnboardingTour />
    </div>
  );
};

export default Index;