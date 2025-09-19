import { useState, useEffect, useCallback } from 'react';
import { supabase, upsertPlan, getEventsInRange, EventRec, MilestoneRec } from '@/integrations/supabase/client';
import { RecommendedEvent } from '@/components/BuildMyPlanDialog';
import { useToast } from '@/hooks/use-toast';

interface PreviewMigrationState {
  isAuthenticated: boolean;
  previewEvents: RecommendedEvent[];
  hasPreviewData: boolean;
  isMigrating: boolean;
}

export function usePreviewMigration() {
  const [state, setState] = useState<PreviewMigrationState>({
    isAuthenticated: false,
    previewEvents: [],
    hasPreviewData: false,
    isMigrating: false
  });
  
  const { toast } = useToast();

  // Store preview events in memory
  const storePreviewEvents = useCallback((events: RecommendedEvent[]) => {
    setState(prev => ({
      ...prev,
      previewEvents: events,
      hasPreviewData: events.length > 0
    }));
  }, []);

  // Clear preview data
  const clearPreviewData = useCallback(() => {
    setState(prev => ({
      ...prev,
      previewEvents: [],
      hasPreviewData: false
    }));
  }, []);

  // Convert RecommendedEvent to EventRec format
  const convertToEventRec = useCallback((events: RecommendedEvent[], formData: { businessType: string; city: string }): EventRec[] => {
    return events.map(event => ({
      name: event.name,
      type: event.type,
      category: event.type,
      date: event.suggestedDate.toISOString().split('T')[0], // yyyy-mm-dd format
      city: formData.city,
      business_type: formData.businessType,
      status: 'planned' as const,
      tags: [],
      milestones: generateMilestonesForEvent(event)
    }));
  }, []);

  // Generate default milestones for an event
  const generateMilestonesForEvent = (event: RecommendedEvent): MilestoneRec[] => {
    const eventDate = new Date(event.suggestedDate);
    const milestones: MilestoneRec[] = [];

    // Generate milestones based on event type
    switch (event.type) {
      case 'apparel':
        milestones.push(
          {
            name: 'Design and Mockups',
            offset_days: -45,
            absolute_date: new Date(eventDate.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            owner: 'Marketing Team',
            status: 'open' as const,
            notes: 'Create product designs and marketing materials',
            sort_order: 1
          },
          {
            name: 'Pre-order Campaign',
            offset_days: -30,
            absolute_date: new Date(eventDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            owner: 'Marketing Team',
            status: 'open' as const,
            notes: 'Launch pre-order campaign and social media push',
            sort_order: 2
          },
          {
            name: 'Product Launch',
            offset_days: 0,
            absolute_date: eventDate.toISOString().split('T')[0],
            owner: 'Operations',
            status: 'open' as const,
            notes: 'Official product launch and fulfillment',
            sort_order: 3
          }
        );
        break;
      case 'community':
        milestones.push(
          {
            name: 'Event Planning',
            offset_days: -21,
            absolute_date: new Date(eventDate.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            owner: 'Community Manager',
            status: 'open' as const,
            notes: 'Plan venue, activities, and logistics',
            sort_order: 1
          },
          {
            name: 'Member Outreach',
            offset_days: -14,
            absolute_date: new Date(eventDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            owner: 'Community Manager',
            status: 'open' as const,
            notes: 'Send invitations and promotion materials',
            sort_order: 2
          },
          {
            name: 'Event Execution',
            offset_days: 0,
            absolute_date: eventDate.toISOString().split('T')[0],
            owner: 'All Staff',
            status: 'open' as const,
            notes: 'Execute the community event',
            sort_order: 3
          }
        );
        break;
      case 'holiday':
        milestones.push(
          {
            name: 'Promotion Planning',
            offset_days: -14,
            absolute_date: new Date(eventDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            owner: 'Marketing Team',
            status: 'open' as const,
            notes: 'Plan holiday-themed promotions and offers',
            sort_order: 1
          },
          {
            name: 'Marketing Launch',
            offset_days: -7,
            absolute_date: new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            owner: 'Marketing Team',
            status: 'open' as const,
            notes: 'Launch holiday marketing campaigns',
            sort_order: 2
          },
          {
            name: 'Holiday Activation',
            offset_days: 0,
            absolute_date: eventDate.toISOString().split('T')[0],
            owner: 'All Staff',
            status: 'open' as const,
            notes: 'Execute holiday promotions and activities',
            sort_order: 3
          }
        );
        break;
      case 'business':
        milestones.push(
          {
            name: 'Strategic Planning',
            offset_days: -30,
            absolute_date: new Date(eventDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            owner: 'Management',
            status: 'open' as const,
            notes: 'Plan business initiative strategy and resources',
            sort_order: 1
          },
          {
            name: 'Implementation Prep',
            offset_days: -14,
            absolute_date: new Date(eventDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            owner: 'Operations',
            status: 'open' as const,
            notes: 'Prepare systems and staff for initiative',
            sort_order: 2
          },
          {
            name: 'Initiative Launch',
            offset_days: 0,
            absolute_date: eventDate.toISOString().split('T')[0],
            owner: 'All Staff',
            status: 'open' as const,
            notes: 'Launch business initiative',
            sort_order: 3
          }
        );
        break;
      default:
        // Custom event - generic milestones
        milestones.push(
          {
            name: 'Event Preparation',
            offset_days: -14,
            absolute_date: new Date(eventDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            owner: 'Team Lead',
            status: 'open' as const,
            notes: 'Prepare for the event',
            sort_order: 1
          },
          {
            name: 'Event Execution',
            offset_days: 0,
            absolute_date: eventDate.toISOString().split('T')[0],
            owner: 'All Staff',
            status: 'open' as const,
            notes: 'Execute the event',
            sort_order: 2
          }
        );
    }

    return milestones;
  };

  // Migrate preview data to Supabase on authentication
  const migratePreviewData = useCallback(async (formData: { businessType: string; city: string }) => {
    if (!state.hasPreviewData || state.isMigrating) return false;

    setState(prev => ({ ...prev, isMigrating: true }));

    try {
      const eventRecords = convertToEventRec(state.previewEvents, formData);
      await upsertPlan(eventRecords);

      toast({
        title: "Plan migrated successfully!",
        description: "Your preview plan has been saved to your account.",
      });

      clearPreviewData();
      return true;
    } catch (error) {
      console.error('Failed to migrate preview data:', error);
      toast({
        title: "Could not save",
        description: "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setState(prev => ({ ...prev, isMigrating: false }));
    }
  }, [state.hasPreviewData, state.isMigrating, state.previewEvents, convertToEventRec, toast, clearPreviewData]);

  // Create a guarded version of upsertPlan for components to use
  const guardedUpsertPlan = useCallback(async (payload: EventRec[]) => {
    if (!state.isAuthenticated) {
      toast({
        description: "Create a free account to save and edit your plan",
      });
      return false;
    }

    try {
      await upsertPlan(payload);
      return true;
    } catch (error) {
      console.error('Failed to save plan:', error);
      toast({
        title: "Could not save",
        description: "Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [state.isAuthenticated, toast]);

  // Save form data to localStorage for migration
  const saveFormDataForMigration = useCallback((formData: { businessType: string; city: string }) => {
    localStorage.setItem('fitbiz_preview_form_data', JSON.stringify(formData));
  }, []);

  // Set up auth state listener
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setState(prev => ({ ...prev, isAuthenticated: !!session }));
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const isAuth = !!session;
      setState(prev => ({ ...prev, isAuthenticated: isAuth }));
      
      // Store the auth state change for potential migration
      if (event === 'SIGNED_IN' && state.hasPreviewData) {
        // The migration will be triggered by the component that has access to formData
        // This is handled in the ReviewStep component
        console.log('User signed in with preview data available for migration');
      }
    });

    return () => subscription.unsubscribe();
  }, [state.hasPreviewData]);

  // Auto-migrate when user becomes authenticated and has preview data
  useEffect(() => {
    const handleAutoMigration = async () => {
      if (state.isAuthenticated && state.hasPreviewData && !state.isMigrating) {
        // Get formData from localStorage if available, or create default
        const savedFormData = localStorage.getItem('fitbiz_preview_form_data');
        if (savedFormData) {
          try {
            const formData = JSON.parse(savedFormData);
            await migratePreviewData(formData);
            localStorage.removeItem('fitbiz_preview_form_data');
          } catch (error) {
            console.error('Failed to parse saved form data:', error);
          }
        }
      }
    };

    // Small delay to ensure auth state is fully settled
    const timeoutId = setTimeout(handleAutoMigration, 1000);
    return () => clearTimeout(timeoutId);
  }, [state.isAuthenticated, state.hasPreviewData, state.isMigrating, migratePreviewData]);

  return {
    isAuthenticated: state.isAuthenticated,
    hasPreviewData: state.hasPreviewData,
    isMigrating: state.isMigrating,
    previewEvents: state.previewEvents,
    storePreviewEvents,
    clearPreviewData,
    migratePreviewData,
    convertToEventRec,
    saveFormDataForMigration,
    guardedUpsertPlan
  };
}