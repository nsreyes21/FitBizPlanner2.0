import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
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
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Enter your city"
              value={formData.city}
              onChange={(e) => onUpdateFormData({ city: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Examples: Kansas City, Boston, Miami, Denver
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-3">
          <h3 className="font-medium">Focus Areas (Optional)</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="focusApparel">Focus on Apparel</Label>
              <p className="text-sm text-muted-foreground">
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
              <Label htmlFor="focusCommunity">Focus on Community Events</Label>
              <p className="text-sm text-muted-foreground">
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
              <Label htmlFor="focusHolidays">Focus on Holidays</Label>
              <p className="text-sm text-muted-foreground">
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
              <Label htmlFor="focusBusiness">Focus on Business Cadence</Label>
              <p className="text-sm text-muted-foreground">
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
  );
}