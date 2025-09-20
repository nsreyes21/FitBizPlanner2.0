import { useState, useEffect } from 'react';
import { EventCalendar } from '@/components/EventCalendar';
import { TaskSidebar } from '@/components/TaskSidebar';
import { AddEventDialog } from '@/components/AddEventDialog';
import { BuildPlanWizard } from '@/features/plan/BuildPlanWizard';
import { Layout } from '@/components/Layout';
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
              { id: 'st4', title: 'Send announcement email to members', completed: false },
              { id: 'st5', title: 'Create product photography', completed: false },
              { id: 'st6', title: 'Write product descriptions', completed: false },
              { id: 'st7', title: 'Set up inventory tracking', completed: false },
              { id: 'st8', title: 'Plan launch event', completed: false }
            ]
          },
          {
            id: 'sm2',
            title: 'Marketing Campaign',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
            completed: false,
            tasks: [
              { id: 'st9', title: 'Create email marketing sequence', completed: false },
              { id: 'st10', title: 'Design social media posts', completed: false },
              { id: 'st11', title: 'Set up Google Ads campaign', completed: false },
              { id: 'st12', title: 'Coordinate with influencers', completed: false }
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
            id: 'sm3',
            title: 'Event Planning',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22),
            completed: false,
            tasks: [
              { id: 'st13', title: 'Choose date and location', completed: true },
              { id: 'st14', title: 'Create event theme and activities', completed: false },
              { id: 'st15', title: 'Order food and supplies', completed: false },
              { id: 'st16', title: 'Send invitations to members', completed: false },
              { id: 'st17', title: 'Set up registration system', completed: false },
              { id: 'st18', title: 'Plan entertainment and games', completed: false }
            ]
          }
        ]
      },
      {
        id: 'sample-3',
        title: 'Holiday Fitness Challenge',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1),
        type: 'community' as const,
        milestones: [
          {
            id: 'sm4',
            title: 'Challenge Setup',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1),
            completed: false,
            tasks: [
              { id: 'st19', title: 'Design challenge rules and prizes', completed: false },
              { id: 'st20', title: 'Create tracking system', completed: false },
              { id: 'st21', title: 'Recruit judges and volunteers', completed: false },
              { id: 'st22', title: 'Set up leaderboard', completed: false }
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
    <Layout
      onBuildPlan={() => setShowBuildPlanDialog(true)}
      onAddEvent={() => setShowAddEventDialog(true)}
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-2 md:py-3">
        {/* Onboarding Banner */}
        <OnboardingBanner className="mb-2" />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          <Card>
            <CardContent className="py-2 px-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-base font-bold">{displayEvents.length}</p>
                  <p className="text-xs text-muted-foreground">Active Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="py-2 px-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-community" />
                <div>
                  <p className="text-base font-bold">{displayEvents.reduce((sum, e) => sum + (e.milestones?.length || 0), 0)}</p>
                  <p className="text-xs text-muted-foreground">Milestones</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="py-2 px-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-marketing" />
                <div>
                  <p className="text-base font-bold">{displayEvents.filter(e => e.type === 'community').length}</p>
                  <p className="text-xs text-muted-foreground">Community Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="py-2 px-3">
              <div className="flex items-center gap-2">
                <Shirt className="h-5 w-5 text-apparel" />
                <div>
                  <p className="text-base font-bold">{displayEvents.filter(e => e.type === 'apparel').length}</p>
                  <p className="text-xs text-muted-foreground">Apparel Launches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid - Fixed columns with internal scroll */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-6 h-[calc(100vh-280px)] overflow-hidden">
          {/* LEFT: Calendar container - non-scrolling, inner content scrolls */}
          <Card className="overflow-hidden min-h-0">
            <div className="flex h-full flex-col min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your events...</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-auto">
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
                </div>
              )}
            </div>
          </Card>

          {/* RIGHT: Task sidebar - container locked, content scrolls */}
          <Card className="overflow-hidden min-h-0">
            <div className="flex h-full flex-col min-h-0">
              <div className="p-4 border-b bg-background sticky top-0 z-10">
                <h3 className="text-lg font-semibold">Tasks</h3>
              </div>
              <div className="flex-1 min-h-0 overflow-auto">
                <div className="p-6">
                  <TaskSidebar
                    selectedEvent={selectedEvent}
                    onTaskToggle={handleTaskToggle}
                    onTaskNotesUpdate={handleTaskNotesUpdate}
                    onMilestoneToggle={handleMilestoneToggle}
                    onMilestoneOwnerUpdate={handleMilestoneOwnerUpdate}
                    onShowSignupModal={() => setShowBuildPlanDialog(true)}
                    noCard={true}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Event Dialog */}
      <AddEventDialog
        open={showAddEventDialog}
        onOpenChange={setShowAddEventDialog}
        onShowSignupModal={() => setShowBuildPlanDialog(true)}
      />

      {/* Build My Plan Dialog */}
      <BuildPlanWizard
        open={showBuildPlanDialog}
        onOpenChange={setShowBuildPlanDialog}
      />

      {/* Onboarding Tour */}
      <OnboardingTour />
    </Layout>
  );
};

export default Index;