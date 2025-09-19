import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Building2 } from "lucide-react";

interface BusinessSelectorProps {
  businessType: string;
  location: string;
  onBusinessTypeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

const businessTypes = [
  "CrossFit Affiliate",
  "Yoga Studio", 
  "Martial Arts Academy",
  "Pilates Studio",
  "Strength & Conditioning Gym",
  "Other"
];

export function BusinessSelector({ 
  businessType, 
  location, 
  onBusinessTypeChange, 
  onLocationChange 
}: BusinessSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-gradient-card p-6 rounded-lg shadow-soft border">
      <div className="flex-1">
        <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Business Type
        </label>
        <Select value={businessType} onValueChange={onBusinessTypeChange}>
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
      
      <div className="flex-1">
        <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </label>
        <Input
          placeholder="Enter your city (e.g., Kansas City, Boston, Los Angeles)"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        />
        <div className="mt-1 text-xs text-muted-foreground">
          Supported cities: Kansas City, Boston, Los Angeles, Miami, Denver
        </div>
      </div>
    </div>
  );
}