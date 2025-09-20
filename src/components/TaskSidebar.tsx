import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, Clock, CheckCircle, User } from "lucide-react";
import { useState } from "react";
import { usePreviewMigration } from "@/hooks/usePreviewMigration";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

interface Milestone {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  owner?: string;
  tasks: Task[];
}

interface TaskSidebarProps {
  selectedEvent: {
    id: string;
    title: string;
    date: Date;
    type: 'apparel' | 'community' | 'holiday' | 'marketing';
    milestones: Milestone[];
  } | null;
  onTaskToggle: (eventId: string, milestoneId: string, taskId: string) => void;
  onTaskNotesUpdate: (eventId: string, milestoneId: string, taskId: string, notes: string) => void;
  onMilestoneToggle?: (eventId: string, milestoneId: string) => void;
  onMilestoneOwnerUpdate?: (eventId: string, milestoneId: string, owner: string) => void;
  onShowSignupModal?: () => void;
  noCard?: boolean; // When true, don't wrap in Card component
}

const eventTypeColors = {
  apparel: 'bg-apparel text-apparel-foreground',
  community: 'bg-community text-community-foreground', 
  holiday: 'bg-holiday text-holiday-foreground',
  marketing: 'bg-marketing text-marketing-foreground'
};

export function TaskSidebar({ selectedEvent, onTaskToggle, onTaskNotesUpdate, onMilestoneToggle, onMilestoneOwnerUpdate, onShowSignupModal, noCard = false }: TaskSidebarProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [editingOwner, setEditingOwner] = useState<string | null>(null);
  const { isAuthenticated } = usePreviewMigration();
  const { toast } = useToast();

  const handleMilestoneToggle = (eventId: string, milestoneId: string) => {
    if (!isAuthenticated) {
      toast({
        description: "Create a free account to save and edit your plan",
      });
      onShowSignupModal?.();
      return;
    }
    onMilestoneToggle?.(eventId, milestoneId);
  };

  const handleTaskToggle = (eventId: string, milestoneId: string, taskId: string) => {
    if (!isAuthenticated) {
      toast({
        description: "Create a free account to save and edit your plan",
      });
      onShowSignupModal?.();
      return;
    }
    onTaskToggle(eventId, milestoneId, taskId);
  };

  const handleMilestoneOwnerUpdate = (eventId: string, milestoneId: string, owner: string) => {
    if (!isAuthenticated) {
      toast({
        description: "Create a free account to save and edit your plan",
      });
      onShowSignupModal?.();
      return;
    }
    onMilestoneOwnerUpdate?.(eventId, milestoneId, owner);
  };

  const handleTaskNotesUpdate = (eventId: string, milestoneId: string, taskId: string, notes: string) => {
    if (!isAuthenticated) {
      toast({
        description: "Create a free account to save and edit your plan",
      });
      onShowSignupModal?.();
      return;
    }
    onTaskNotesUpdate(eventId, milestoneId, taskId, notes);
  };

  if (!selectedEvent) {
    const emptyState = (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select an event to view tasks</p>
        </div>
      </div>
    );

    if (noCard) {
      return <div className="h-full">{emptyState}</div>;
    }

    return (
      <Card className="h-full">
        <CardContent className="h-full">
          {emptyState}
        </CardContent>
      </Card>
    );
  }

  const completedTasks = selectedEvent.milestones.reduce((total, milestone) => 
    total + milestone.tasks.filter(task => task.completed).length, 0
  );
  
  const totalTasks = selectedEvent.milestones.reduce((total, milestone) => 
    total + milestone.tasks.length, 0
  );

  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const taskContent = (
    <div className="h-full flex flex-col min-h-0">
      <div className="p-4">
        {/* Active event selector, badges, etc. */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={eventTypeColors[selectedEvent.type]}>
                {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {selectedEvent.date.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{completedTasks}/{totalTasks} tasks</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="px-4 pb-4 space-y-4">
            {/* Wrap each big checklist in its own card; long lists will scroll because the parent has ScrollArea */}
            {selectedEvent.milestones.map((milestone) => {
              const isExpanded = expandedMilestone === milestone.id;
              const completedMilestoneTasks = milestone.tasks.filter(task => task.completed).length;
              
              return (
                <div key={milestone.id} className="border rounded-lg p-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={milestone.completed}
                        onCheckedChange={() => handleMilestoneToggle(selectedEvent.id, milestone.id)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div>
                        <div className="font-medium">{milestone.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {completedMilestoneTasks}/{milestone.tasks.length} tasks completed
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      {isExpanded ? '−' : '+'}
                    </Button>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-4 space-y-2">
                      {milestone.tasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 ml-6">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => handleTaskToggle(selectedEvent.id, milestone.id, task.id)}
                            className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <div className="flex-1">
                            <div className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </div>
                            {task.notes && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {task.notes}
                              </div>
                            )}
                          </div>
                          {!task.notes && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-6 h-6 text-xs text-muted-foreground"
                              onClick={() => setEditingNotes(task.id)}
                            >
                              Add notes
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  if (noCard) {
    return taskContent;
  }

  return (
    <Card className="h-full">
      <CardContent className="h-full">
        {taskContent}
      </CardContent>
    </Card>
  );
}