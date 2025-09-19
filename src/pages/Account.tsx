import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getSession } from '@/integrations/supabase/auth';

interface Profile {
  id: string;
  business_type?: string;
  city?: string;
  email?: string;
}

const businessTypes = [
  'Gym/Fitness Center',
  'CrossFit Box', 
  'Yoga Studio',
  'Personal Training',
  'Martial Arts Studio',
  'Dance Studio',
  'Pilates Studio',
  'Rock Climbing Gym',
  'Swimming Pool/Aquatics',
  'Sports Club',
  'Rehabilitation Center',
  'Wellness Center',
  'Other'
];

export default function Account() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [businessType, setBusinessType] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const session = await getSession();
      
      if (!session?.user) {
        navigate('/auth/signin?redirect=/account');
        return;
      }

      setUser(session.user);

      // Load existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }

      if (data) {
        setProfile(data);
        setBusinessType(data.business_type || '');
        setCity(data.city || '');
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error loading profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your profile.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const profileData = {
        id: user.id,
        business_type: businessType || null,
        city: city || null,
        email: user.email,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        });

      if (error) throw error;

      setProfile(profileData);
      
      toast({
        title: "Profile saved",
        description: "Your account information has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Calendar
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-xl font-semibold">Account Settings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>
              Update your business information. This will be used as defaults when creating your annual plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                <p className="text-xs text-muted-foreground">
                  Your email address cannot be changed here.
                </p>
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
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

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Enter your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  autoComplete="address-level2"
                  autoCapitalize="words"
                  spellCheck={false}
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="min-w-[100px]"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}