export interface SportTeam {
  name: string;
  league: 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'MLS' | 'College';
  colors: string[];
  season: 'spring' | 'summer' | 'fall' | 'winter';
}

export interface LocalEvent {
  name: string;
  type: 'sports' | 'festival' | 'marathon' | 'cultural' | 'seasonal';
  timing: 'spring' | 'summer' | 'fall' | 'winter' | 'year-round';
  description: string;
}

export interface CityData {
  name: string;
  state: string;
  region: 'northeast' | 'southeast' | 'midwest' | 'southwest' | 'west' | 'northwest';
  teams: SportTeam[];
  events: LocalEvent[];
  climate: 'hot' | 'cold' | 'temperate' | 'coastal';
  fitnessProfile: string[];
}

const cityDatabase: Record<string, CityData> = {
  'kansas city': {
    name: 'Kansas City',
    state: 'Missouri',
    region: 'midwest',
    climate: 'temperate',
    fitnessProfile: ['BBQ culture', 'Football town', 'Baseball heritage'],
    teams: [
      { name: 'Chiefs', league: 'NFL', colors: ['#E31837', '#FFB81C'], season: 'fall' },
      { name: 'Royals', league: 'MLB', colors: ['#004687', '#BD9B60'], season: 'spring' },
      { name: 'Sporting KC', league: 'MLS', colors: ['#93B1D7', '#8BB8E8'], season: 'spring' }
    ],
    events: [
      { name: 'NFL Draft Day', type: 'sports', timing: 'spring', description: 'Perfect for Chiefs-themed events' },
      { name: 'Royals Opening Day', type: 'sports', timing: 'spring', description: 'Baseball season kickoff' },
      { name: 'BBQ Festival Season', type: 'festival', timing: 'summer', description: 'Local BBQ culture celebration' }
    ]
  },
  'boston': {
    name: 'Boston',
    state: 'Massachusetts',
    region: 'northeast',
    climate: 'cold',
    fitnessProfile: ['Marathon city', 'Sports obsessed', 'College town'],
    teams: [
      { name: 'Patriots', league: 'NFL', colors: ['#002244', '#C60C30'], season: 'fall' },
      { name: 'Celtics', league: 'NBA', colors: ['#007A33', '#BA9653'], season: 'winter' },
      { name: 'Red Sox', league: 'MLB', colors: ['#BD3039', '#0C2340'], season: 'spring' },
      { name: 'Bruins', league: 'NHL', colors: ['#FFB81C', '#000000'], season: 'winter' }
    ],
    events: [
      { name: 'Boston Marathon', type: 'marathon', timing: 'spring', description: 'World-famous marathon event' },
      { name: 'Celtics Playoff Run', type: 'sports', timing: 'spring', description: 'NBA playoffs excitement' },
      { name: 'Red Sox Season', type: 'sports', timing: 'spring', description: 'Fenway Park baseball season' }
    ]
  },
  'los angeles': {
    name: 'Los Angeles',
    state: 'California',
    region: 'west',
    climate: 'hot',
    fitnessProfile: ['Beach culture', 'Fitness lifestyle', 'Year-round outdoor activity'],
    teams: [
      { name: 'Lakers', league: 'NBA', colors: ['#552583', '#FDB927'], season: 'winter' },
      { name: 'Dodgers', league: 'MLB', colors: ['#005A9C', '#FFFFFF'], season: 'spring' },
      { name: 'Rams', league: 'NFL', colors: ['#003594', '#FFA300'], season: 'fall' }
    ],
    events: [
      { name: 'Beach Season', type: 'seasonal', timing: 'summer', description: 'Peak beach and outdoor activity' },
      { name: 'Lakers Season', type: 'sports', timing: 'winter', description: 'NBA season excitement' },
      { name: 'LA Marathon', type: 'marathon', timing: 'spring', description: 'Major west coast marathon' }
    ]
  },
  'miami': {
    name: 'Miami',
    state: 'Florida',
    region: 'southeast',
    climate: 'hot',
    fitnessProfile: ['Beach body culture', 'Latin fitness', 'Year-round outdoor'],
    teams: [
      { name: 'Heat', league: 'NBA', colors: ['#98002E', '#F9A01B'], season: 'winter' },
      { name: 'Dolphins', league: 'NFL', colors: ['#008E97', '#FC4C02'], season: 'fall' }
    ],
    events: [
      { name: 'Art Basel', type: 'cultural', timing: 'winter', description: 'International art and culture' },
      { name: 'Spring Break Season', type: 'seasonal', timing: 'spring', description: 'Peak beach season' },
      { name: 'Hurricane Season Prep', type: 'seasonal', timing: 'summer', description: 'Community preparedness events' }
    ]
  },
  'denver': {
    name: 'Denver',
    state: 'Colorado',
    region: 'west',
    climate: 'cold',
    fitnessProfile: ['Outdoor lifestyle', 'Mountain sports', 'Altitude training'],
    teams: [
      { name: 'Broncos', league: 'NFL', colors: ['#FB4F14', '#002244'], season: 'fall' },
      { name: 'Nuggets', league: 'NBA', colors: ['#0E2240', '#FEC524'], season: 'winter' },
      { name: 'Rockies', league: 'MLB', colors: ['#33006F', '#C4CED4'], season: 'spring' }
    ],
    events: [
      { name: 'Ski Season', type: 'seasonal', timing: 'winter', description: 'Peak mountain sports season' },
      { name: 'Hiking Season', type: 'seasonal', timing: 'summer', description: 'Mountain outdoor activities' },
      { name: 'Denver Marathon', type: 'marathon', timing: 'fall', description: 'High-altitude marathon challenge' }
    ]
  }
};

export class LocationService {
  static getCityData(location: string): CityData | null {
    const normalizedLocation = location.toLowerCase().trim();
    return cityDatabase[normalizedLocation] || null;
  }

  static getAllSupportedCities(): string[] {
    return Object.values(cityDatabase).map(city => `${city.name}, ${city.state}`);
  }

  static getTeamsByLocation(location: string): SportTeam[] {
    const cityData = this.getCityData(location);
    return cityData?.teams || [];
  }

  static getLocalEventsByLocation(location: string): LocalEvent[] {
    const cityData = this.getCityData(location);
    return cityData?.events || [];
  }

  static getFitnessProfile(location: string): string[] {
    const cityData = this.getCityData(location);
    return cityData?.fitnessProfile || [];
  }
}