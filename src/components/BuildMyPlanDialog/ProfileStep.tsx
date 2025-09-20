import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { PlanFormData } from '../BuildMyPlanDialog';

interface ProfileStepProps {
  formData: PlanFormData;
  onUpdateFormData: (updates: Partial<PlanFormData>) => void;
}

const businessTypes = [
  'CrossFit Affiliate',
  'Yoga Studio', 
  'Martial Arts Academy',
  'Pilates Studio',
  'Strength and Conditioning Gym',
  'Other'
];

export function ProfileStep({ formData, onUpdateFormData }: ProfileStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
      {/* Form Column */}
      <div className="min-w-0 space-y-4">
        <Card>
          <CardContent className="p-4 md:p-5 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-sm font-medium">Business Type</Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) => onUpdateFormData({ businessType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">City</Label>
              <Input
                id="city"
                placeholder="Enter your city"
                value={formData.city}
                onChange={(e) => onUpdateFormData({ city: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Examples: Kansas City, Boston, Miami, Denver
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-5 space-y-3">
            <h3 className="text-sm font-medium mb-1">Focus Areas (Optional)</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="focusApparel" className="text-sm">Focus on Apparel</Label>
                <p className="text-xs text-muted-foreground">
                  Include more apparel launch opportunities
                </p>
              </div>
              <Switch
                id="focusApparel"
                checked={formData.focusApparel}
                onCheckedChange={(checked) => onUpdateFormData({ focusApparel: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="focusCommunity" className="text-sm">Focus on Community Events</Label>
                <p className="text-xs text-muted-foreground">
                  Emphasize community building activities
                </p>
              </div>
              <Switch
                id="focusCommunity"
                checked={formData.focusCommunity}
                onCheckedChange={(checked) => onUpdateFormData({ focusCommunity: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="focusHolidays" className="text-sm">Focus on Holidays</Label>
                <p className="text-xs text-muted-foreground">
                  Add holiday-themed promotions and events
                </p>
              </div>
              <Switch
                id="focusHolidays"
                checked={formData.focusHolidays}
                onCheckedChange={(checked) => onUpdateFormData({ focusHolidays: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="focusBusiness" className="text-sm">Focus on Business Cadence</Label>
                <p className="text-xs text-muted-foreground">
                  Include regular business meetings and reviews
                </p>
              </div>
              <Switch
                id="focusBusiness"
                checked={formData.focusBusiness}
                onCheckedChange={(checked) => onUpdateFormData({ focusBusiness: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Column - Desktop Only */}
      <div className="min-w-0 hidden md:block">
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            <Calendar className="mx-auto mb-3 h-8 w-8" />
            No recommendations yet<br/>
            <span className="text-xs">Complete your profile to see a 12-month preview.</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}