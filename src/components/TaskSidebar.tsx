import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
}

const eventTypeColors = {
  apparel: 'bg-apparel text-apparel-foreground',
  community: 'bg-community text-community-foreground', 
  holiday: 'bg-holiday text-holiday-foreground',
  marketing: 'bg-marketing text-marketing-foreground'
};

export function TaskSidebar({ selectedEvent, onTaskToggle, onTaskNotesUpdate, onMilestoneToggle, onMilestoneOwnerUpdate, onShowSignupModal }: TaskSidebarProps) {
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
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select an event to view tasks</p>
          </div>
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

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
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
      </CardHeader>
      
      <CardContent className="space-y-4">
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
                    className="data-[state=checked]:bg-primary"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{milestone.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {milestone.date.toLocaleDateString()}
                      <span>•</span>
                      <span>{completedMilestoneTasks}/{milestone.tasks.length} tasks</span>
                      {milestone.owner && (
                        <>
                          <span>•</span>
                          <User className="h-3 w-3" />
                          <span>{milestone.owner}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <CheckCircle 
                  className={`h-5 w-5 transition-colors ${
                    milestone.completed ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
              </div>
              
              {isExpanded && (
                <div className="mt-4 space-y-3">
                  {/* Owner editing */}
                  <div className="pb-3 border-b">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Owner:</span>
                      {editingOwner === milestone.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            placeholder="Enter owner name"
                            defaultValue={milestone.owner || ''}
                            className="h-7 text-sm"
                            onBlur={(e) => {
                              handleMilestoneOwnerUpdate(selectedEvent.id, milestone.id, e.target.value);
                              setEditingOwner(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleMilestoneOwnerUpdate(selectedEvent.id, milestone.id, e.currentTarget.value);
                                setEditingOwner(null);
                              }
                              if (e.key === 'Escape') {
                                setEditingOwner(null);
                              }
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setEditingOwner(milestone.id)}
                        >
                          {milestone.owner || 'Assign owner'}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {milestone.tasks.map((task) => (
                    <div key={task.id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleTaskToggle(selectedEvent.id, milestone.id, task.id)}
                          className="mt-0.5"
                        />
                        <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                      </div>
                      
                      {task.notes && editingNotes !== task.id && (
                        <div className="ml-6 p-2 bg-muted rounded text-sm">
                          {task.notes}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-6 text-xs"
                            onClick={() => setEditingNotes(task.id)}
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                      
                      {editingNotes === task.id && (
                        <div className="ml-6 space-y-2">
                          <Textarea
                            placeholder="Add notes..."
                            defaultValue={task.notes}
                            className="text-sm"
                            onBlur={(e) => {
                              handleTaskNotesUpdate(selectedEvent.id, milestone.id, task.id, e.target.value);
                              setEditingNotes(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                handleTaskNotesUpdate(selectedEvent.id, milestone.id, task.id, e.currentTarget.value);
                                setEditingNotes(null);
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                                handleTaskNotesUpdate(selectedEvent.id, milestone.id, task.id, textarea.value);
                                setEditingNotes(null);
                              }}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingNotes(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {!task.notes && editingNotes !== task.id && (
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
      </CardContent>
    </Card>
  );
}