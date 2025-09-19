import { PlanFormData, RecommendedEvent } from '../BuildMyPlanDialog';

export function generateQuarterlyPlan(formData: PlanFormData): RecommendedEvent[] {
  const currentYear = new Date().getFullYear();
  const recommendations: RecommendedEvent[] = [];
  
  // Define quarterly months (Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec)
  const quarters = [
    { months: [0, 1, 2], name: 'Q1' },    // Jan-Mar
    { months: [3, 4, 5], name: 'Q2' },    // Apr-Jun
    { months: [6, 7, 8], name: 'Q3' },    // Jul-Sep
    { months: [9, 10, 11], name: 'Q4' }   // Oct-Dec
  ];

  quarters.forEach((quarter, qIndex) => {
    const baseMonth = quarter.months[1]; // Use middle month of quarter for base dates
    
    // Apparel launches - one per quarter if focused
    if (formData.focusApparel) {
      recommendations.push({
        id: `apparel-q${qIndex + 1}`,
        name: `${quarter.name} ${getSeasonalTheme(baseMonth)} Apparel Launch`,
        type: 'apparel',
        description: `Launch ${getSeasonalTheme(baseMonth).toLowerCase()} themed fitness apparel`,
        suggestedDate: new Date(currentYear, baseMonth, 15),
        template: 'Apparel Launch',
        selected: true
      });
    }

    // Community events - one per quarter if focused
    if (formData.focusCommunity) {
      recommendations.push({
        id: `community-q${qIndex + 1}`,
        name: `${quarter.name} ${getCommunityEventTheme(baseMonth, formData.businessType)}`,
        type: 'community',
        description: `Quarterly community building event for ${formData.businessType}`,
        suggestedDate: new Date(currentYear, baseMonth, Math.floor(Math.random() * 15) + 10), // Random date in month
        template: 'Community Event (BBQ, Social, Throwdown)',
        selected: true
      });
    }

    // Business cadence - quarterly reviews if focused
    if (formData.focusBusiness) {
      recommendations.push({
        id: `business-q${qIndex + 1}`,
        name: `${quarter.name} Business Review`,
        type: 'business',
        description: `Quarterly business planning and review session`,
        suggestedDate: new Date(currentYear, quarter.months[2], 25), // End of quarter
        template: 'Business Cadence (Annual, Quarterly, Staff Reviews)',
        selected: true
      });
    }
  });

  // Holiday events - distributed across year if focused
  if (formData.focusHolidays) {
    const holidayEvents = [
      {
        name: 'New Year New You Challenge',
        month: 0,
        day: 8,
        description: 'Start the year strong with fitness resolutions'
      },
      {
        name: 'Spring Renewal Promo',
        month: 2,
        day: 20,
        description: 'Spring cleaning for your fitness routine'
      },
      {
        name: 'Summer Body Bootcamp',
        month: 5,
        day: 1,
        description: 'Get ready for summer with intensive training'
      },
      {
        name: 'Back to School Fitness',
        month: 8,
        day: 1,
        description: 'Get back into routine with fall fitness'
      },
      {
        name: 'Holiday Gratitude Challenge',
        month: 10,
        day: 15,
        description: 'Thanksgiving themed wellness challenge'
      }
    ];

    holidayEvents.forEach((holiday, index) => {
      recommendations.push({
        id: `holiday-${index}`,
        name: holiday.name,
        type: 'holiday',
        description: holiday.description,
        suggestedDate: new Date(currentYear, holiday.month, holiday.day),
        template: 'Holiday Promo/Event',
        selected: true
      });
    });
  }

  // Add city-specific events
  if (formData.city.toLowerCase().includes('kansas city')) {
    recommendations.push({
      id: 'kc-baseball',
      name: 'Royals Opening Day Celebration',
      type: 'community',
      description: 'Celebrate baseball season with Royals-themed workouts',
      suggestedDate: new Date(currentYear, 3, 10),
      template: 'Community Event (BBQ, Social, Throwdown)',
      selected: true
    });
  }

  if (formData.city.toLowerCase().includes('boston')) {
    recommendations.push({
      id: 'boston-marathon',
      name: 'Marathon Monday Motivation',
      type: 'community',
      description: 'Boston Marathon inspired endurance challenge',
      suggestedDate: new Date(currentYear, 3, 15),
      template: 'Community Event (BBQ, Social, Throwdown)',
      selected: true
    });
  }

  return recommendations.sort((a, b) => a.suggestedDate.getTime() - b.suggestedDate.getTime());
}

function getSeasonalTheme(month: number): string {
  if (month <= 2) return 'Winter Warrior';
  if (month <= 5) return 'Spring Training';
  if (month <= 8) return 'Summer Strong';
  return 'Fall Fitness';
}

function getCommunityEventTheme(month: number, businessType: string): string {
  const themes = {
    'CrossFit Affiliate': ['Box Battle', 'Community WOD', 'Partner Challenge', 'Fundraiser WOD'],
    'Yoga Studio': ['Yoga in the Park', 'Meditation Circle', 'Wellness Workshop', 'Community Flow'],
    'Martial Arts Academy': ['Belt Testing', 'Demo Day', 'Community Sparring', 'Technique Workshop'],
    'Pilates Studio': ['Pilates Mixer', 'Core Challenge', 'Wellness Fair', 'Community Class']
  };

  const businessThemes = themes[businessType as keyof typeof themes] || ['Community Event', 'Social Gathering', 'Group Activity', 'Team Building'];
  return businessThemes[month % businessThemes.length];
}