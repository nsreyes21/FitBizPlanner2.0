import { LocationService, SportTeam, LocalEvent } from './LocationService';
import { EventTemplate } from '@/types/Event';

export interface EventSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'apparel' | 'community' | 'holiday' | 'business';
  suggestedDate: Date;
  leadTimeWeeks: number;
  localContext: string;
  template: EventTemplate;
  priority: 'high' | 'medium' | 'low';
}

export class EventSuggestionEngine {
  private static getBusinessTypePreferences(businessType: string): string[] {
    const preferences: Record<string, string[]> = {
      'CrossFit Affiliate': ['competitive', 'challenge', 'community', 'strength'],
      'Yoga Studio': ['mindfulness', 'wellness', 'spiritual', 'community'],
      'Martial Arts Academy': ['discipline', 'competition', 'tradition', 'community'],
      'Pilates Studio': ['precision', 'wellness', 'rehabilitation', 'community'],
      'Strength & Conditioning Gym': ['performance', 'athletic', 'competition', 'strength'],
      'Other': ['fitness', 'community', 'health', 'wellness']
    };
    return preferences[businessType] || preferences['Other'];
  }

  private static createApparelSuggestion(
    team: SportTeam,
    businessType: string,
    cityName: string
  ): EventSuggestion {
    const currentDate = new Date();
    const seasonStart = this.getSeasonStartDate(team.season);
    
    return {
      id: `apparel-${team.name.toLowerCase()}-${Date.now()}`,
      title: `${team.name} ${team.league} Season Apparel Launch`,
      description: `Launch ${team.name}-themed workout gear for ${team.league} season`,
      type: 'apparel',
      suggestedDate: seasonStart,
      leadTimeWeeks: 6,
      localContext: `Perfect for ${cityName} ${team.name} fans - use team colors ${team.colors.join(' & ')}`,
      template: this.createApparelTemplate(team, businessType),
      priority: 'high'
    };
  }

  private static createCommunityEventSuggestion(
    localEvent: LocalEvent,
    businessType: string,
    cityName: string
  ): EventSuggestion {
    const currentDate = new Date();
    const eventDate = this.getSeasonDate(localEvent.timing);
    
    return {
      id: `community-${localEvent.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      title: `${localEvent.name} Community Event`,
      description: `Host a community gathering around ${localEvent.name}`,
      type: 'community',
      suggestedDate: eventDate,
      leadTimeWeeks: 4,
      localContext: `Capitalize on ${cityName}'s ${localEvent.description}`,
      template: this.createCommunityTemplate(localEvent, businessType),
      priority: 'medium'
    };
  }

  private static createSeasonalChallenge(
    businessType: string,
    cityName: string,
    season: string
  ): EventSuggestion {
    const currentDate = new Date();
    const challengeDate = this.getSeasonDate(season as any);
    
    const seasonalChallenges: Record<string, any> = {
      'spring': { name: 'Spring Training Challenge', focus: 'renewal and growth' },
      'summer': { name: 'Summer Shred Challenge', focus: 'peak performance' },
      'fall': { name: 'Fall Fitness Challenge', focus: 'preparation and strength' },
      'winter': { name: 'Winter Warrior Challenge', focus: 'resilience and endurance' }
    };

    const challenge = seasonalChallenges[season];
    
    return {
      id: `challenge-${season}-${Date.now()}`,
      title: challenge.name,
      description: `Business planning session focused on ${challenge.focus}`,
      type: 'business',
      suggestedDate: challengeDate,
      leadTimeWeeks: 3,
      localContext: `Tailored for ${cityName}'s business community`,
      template: this.createChallengeTemplate(challenge, businessType),
      priority: 'medium'
    };
  }

  private static getSeasonStartDate(season: string): Date {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    
    switch (season) {
      case 'spring': return new Date(year, 2, 20); // March 20
      case 'summer': return new Date(year, 5, 20); // June 20
      case 'fall': return new Date(year, 8, 22); // September 22
      case 'winter': return new Date(year, 11, 21); // December 21
      default: return new Date(year, currentDate.getMonth() + 2, 1);
    }
  }

  private static getSeasonDate(timing: string): Date {
    return this.getSeasonStartDate(timing);
  }

  private static createApparelTemplate(team: SportTeam, businessType: string): EventTemplate {
    return {
      id: `template-apparel-${team.name.toLowerCase()}`,
      name: `${team.name} Apparel Launch`,
      type: 'apparel',
      category: 'apparel',
      description: `Launch team-themed workout gear for ${team.name} ${team.league} season`,
      leadTimeDays: 28,
      milestones: [
        {
          name: 'Pre-order announcement',
          offsetDays: -28,
          defaultOwner: 'Marketing Team',
          notes: `Create ${team.name}-inspired designs using team colors ${team.colors.join(' & ')}`
        },
        {
          name: 'Pre-order closes',
          offsetDays: -14,
          defaultOwner: 'Sales Team', 
          notes: 'Close pre-order system, finalize quantities for supplier'
        },
        {
          name: 'Fulfillment + shipping',
          offsetDays: -7,
          defaultOwner: 'Operations',
          notes: 'Coordinate with supplier, receive and sort orders'
        },
        {
          name: 'Launch day',
          offsetDays: 0,
          defaultOwner: 'Store Manager',
          notes: 'Launch day event with team theme, member pickup and celebration'
        }
      ]
    };
  }

  private static createCommunityTemplate(localEvent: LocalEvent, businessType: string): EventTemplate {
    return {
      id: `template-community-${localEvent.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: `${localEvent.name} Community Event`,
      type: 'community',
      category: 'community',
      description: `Community gathering themed around ${localEvent.name}`,
      leadTimeDays: 28,
      milestones: [
        {
          name: 'Save the date',
          offsetDays: -28,
          defaultOwner: 'Event Coordinator',
          notes: `Plan ${localEvent.name}-themed community event, book venue`
        },
        {
          name: 'RSVP push',
          offsetDays: -14,
          defaultOwner: 'Community Manager',
          notes: 'Push for RSVPs, promote event details and activities'
        },
        {
          name: 'Shopping list + prep',
          offsetDays: -2,
          defaultOwner: 'Event Team',
          notes: 'Finalize headcount, create shopping list, prep materials'
        },
        {
          name: 'Event day',
          offsetDays: 0,
          defaultOwner: 'Event Lead',
          notes: 'Execute community event, engage with attendees'
        }
      ]
    };
  }

  private static createChallengeTemplate(challenge: any, businessType: string): EventTemplate {
    return {
      id: `template-challenge-${challenge.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: challenge.name,
      type: 'business',
      category: 'business',
      description: `Business planning focused on ${challenge.focus}`,
      leadTimeDays: 21,
      milestones: [
        {
          name: 'Prep + agenda',
          offsetDays: -21,
          defaultOwner: 'Leadership Team',
          notes: 'Prepare materials, set agenda, gather reports and data'
        },
        {
          name: 'Meeting / review',
          offsetDays: 0,
          defaultOwner: 'Meeting Leader',
          notes: 'Conduct planning session, make decisions, document outcomes'
        },
        {
          name: 'Follow-up tasks',
          offsetDays: 7,
          defaultOwner: 'Team Lead',
          notes: 'Assign action items, follow up on decisions, track progress'
        }
      ]
    };
  }

  static generateSuggestions(businessType: string, location: string): EventSuggestion[] {
    if (!location || !businessType) return [];

    const suggestions: EventSuggestion[] = [];
    const cityData = LocationService.getCityData(location);
    
    if (!cityData) return suggestions;

    const preferences = this.getBusinessTypePreferences(businessType);

    // Generate team-based apparel suggestions
    cityData.teams.forEach(team => {
      if (preferences.includes('competitive') || preferences.includes('community')) {
        suggestions.push(this.createApparelSuggestion(team, businessType, cityData.name));
      }
    });

    // Generate local event-based suggestions
    cityData.events.forEach(event => {
      if (event.type === 'marathon' && preferences.includes('athletic')) {
        suggestions.push(this.createCommunityEventSuggestion(event, businessType, cityData.name));
      } else if (event.type === 'festival' && preferences.includes('community')) {
        suggestions.push(this.createCommunityEventSuggestion(event, businessType, cityData.name));
      }
    });

    // Generate seasonal challenges
    const seasons = ['spring', 'summer', 'fall', 'winter'];
    seasons.forEach(season => {
        suggestions.push(this.createSeasonalChallenge(businessType, cityData.name, season));
    });

    // Sort by priority and filter future dates
    return suggestions
      .filter(s => s.suggestedDate > new Date())
      .sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 6); // Return top 6 suggestions
  }
}