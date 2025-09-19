import { EventTemplate } from '@/types/Event';

export const eventTemplates: EventTemplate[] = [
  {
    id: 'apparel-launch',
    name: 'Apparel Launch',
    type: 'apparel',
    category: 'apparel',
    description: 'Launch seasonal or themed apparel for your community',
    leadTimeDays: 28,
    milestones: [
      {
        name: 'Announce Pre-Orders',
        offsetDays: -28,
        defaultOwner: 'Marketing Team',
        notes: 'Build excitement and gauge demand by showcasing mockups and pricing to your community'
      },
      {
        name: 'Close Pre-Orders',
        offsetDays: -14,
        defaultOwner: 'Sales Team',
        notes: 'Create urgency and finalize order quantities to ensure accurate fulfillment'
      },
      {
        name: 'Fulfill Orders',
        offsetDays: -7,
        defaultOwner: 'Operations',
        notes: 'Process inventory and prepare shipments to deliver on time'
      },
      {
        name: 'Host Launch Event',
        offsetDays: 0,
        defaultOwner: 'Store Manager',
        notes: 'Celebrate the launch with your community and create memorable content'
      }
    ]
  },
  {
    id: 'community-event',
    name: 'Community Event (BBQ, Social, Throwdown)',
    type: 'community',
    category: 'community', 
    description: 'Host community gathering like BBQ, social event, or competition',
    leadTimeDays: 28,
    milestones: [
      {
        name: 'Send Save the Date',
        offsetDays: -28,
        defaultOwner: 'Event Coordinator',
        notes: 'Get your event on everyone\'s calendar early to maximize attendance'
      },
      {
        name: 'Collect RSVPs',
        offsetDays: -14,
        defaultOwner: 'Community Manager',
        notes: 'Accurate headcount ensures you have enough food, supplies, and space'
      },
      {
        name: 'Prepare Supplies',
        offsetDays: -2,
        defaultOwner: 'Event Team',
        notes: 'Last-minute prep prevents day-of stress and ensures smooth execution'
      },
      {
        name: 'Host Event',
        offsetDays: 0,
        defaultOwner: 'Event Lead',
        notes: 'Create memorable experiences that strengthen your community bonds'
      }
    ]
  },
  {
    id: 'holiday-promo',
    name: 'Holiday Promo/Event',
    type: 'holiday',
    category: 'holiday',
    description: 'Plan and execute holiday-themed promotions or events',
    leadTimeDays: 21,
    milestones: [
      {
        name: 'Plan Holiday Theme',
        offsetDays: -21,
        defaultOwner: 'Marketing Team',
        notes: 'Strategic planning maximizes holiday sales and creates cohesive messaging'
      },
      {
        name: 'Launch Campaign',
        offsetDays: -14,
        defaultOwner: 'Marketing Team',
        notes: 'Early promotion builds anticipation and gives customers time to plan'
      },
      {
        name: 'Send Reminders',
        offsetDays: -7,
        defaultOwner: 'Social Media Manager',
        notes: 'Final reminders capture last-minute customers and create urgency'
      },
      {
        name: 'Execute Promotion',
        offsetDays: 0,
        defaultOwner: 'Store Manager',
        notes: 'Successful execution during peak holiday timing maximizes impact'
      }
    ]
  },
  {
    id: 'business-cadence',
    name: 'Business Cadence (Annual, Quarterly, Staff Reviews)',
    type: 'business',
    category: 'business',
    description: 'Regular business meetings, reviews, and planning sessions',
    leadTimeDays: 21,
    milestones: [
      {
        name: 'Prepare Materials',
        offsetDays: -21,
        defaultOwner: 'Leadership Team',
        notes: 'Thorough preparation ensures productive meetings and informed decisions'
      },
      {
        name: 'Conduct Review',
        offsetDays: 0,
        defaultOwner: 'Meeting Leader',
        notes: 'Structured reviews drive accountability and strategic alignment'
      },
      {
        name: 'Assign Follow-ups',
        offsetDays: 7,
        defaultOwner: 'Team Lead',
        notes: 'Clear action items ensure meeting outcomes translate to results'
      }
    ]
  }
];