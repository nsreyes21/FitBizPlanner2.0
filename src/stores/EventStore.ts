import { Event, Milestone } from '@/types/Event';

class EventStore {
  private events: Map<string, Event> = new Map();
  private milestones: Map<string, Milestone> = new Map();
  private listeners: (() => void)[] = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  addEvent(event: Event) {
    this.events.set(event.id, event);
    this.notify();
  }

  addMilestone(milestone: Milestone) {
    this.milestones.set(milestone.id, milestone);
    this.notify();
  }

  addMilestones(milestones: Milestone[]) {
    milestones.forEach(milestone => {
      this.milestones.set(milestone.id, milestone);
    });
    this.notify();
  }

  getEvents(): Event[] {
    return Array.from(this.events.values());
  }

  getMilestonesForEvent(eventId: string): Milestone[] {
    return Array.from(this.milestones.values()).filter(m => m.eventId === eventId);
  }

  getAllMilestones(): Milestone[] {
    return Array.from(this.milestones.values());
  }
}

export const eventStore = new EventStore();