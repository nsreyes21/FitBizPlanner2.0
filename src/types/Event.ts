export interface Event {
  id: string;
  name: string;
  type: 'apparel' | 'community' | 'holiday' | 'business' | 'custom';
  category?: 'apparel' | 'community' | 'holiday' | 'business';
  status?: 'planned' | 'in_progress' | 'done' | 'canceled';
  date: Date;
  businessType?: string;
  city?: string;
  tags: string[];
}

export interface Milestone {
  id: string;
  eventId: string;
  name: string;
  offsetDays: number;
  absoluteDate: Date;
  owner: string;
  status: 'open' | 'completed';
  notes: string;
}

export interface EventTemplate {
  id: string;
  name: string;
  type: 'apparel' | 'community' | 'holiday' | 'business';
  category: 'apparel' | 'community' | 'holiday' | 'business';
  description: string;
  leadTimeDays: number;
  milestones: {
    name: string;
    offsetDays: number;
    defaultOwner: string;
    notes: string;
  }[];
}