import { useCallback } from 'react';
import { usePreviewMigration } from './usePreviewMigration';
import { useToast } from './use-toast';
import { upsertPlan, updateMilestoneStatus, EventRec } from '@/integrations/supabase/client';

interface UseAuthGuardProps {
  onShowSignupModal?: () => void;
}

export function useAuthGuard({ onShowSignupModal }: UseAuthGuardProps = {}) {
  const { isAuthenticated } = usePreviewMigration();
  const { toast } = useToast();

  const guardedUpsertPlan = useCallback(async (payload: EventRec[]) => {
    if (!isAuthenticated) {
      toast({
        description: "Create a free account to save and edit your plan",
      });
      onShowSignupModal?.();
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
  }, [isAuthenticated, toast, onShowSignupModal]);

  const guardedUpdateMilestoneStatus = useCallback(async (id: string, status: 'open' | 'done') => {
    if (!isAuthenticated) {
      toast({
        description: "Create a free account to save and edit your plan",
      });
      onShowSignupModal?.();
      return false;
    }

    try {
      await updateMilestoneStatus(id, status);
      return true;
    } catch (error) {
      console.error('Failed to update milestone:', error);
      toast({
        title: "Could not save",
        description: "Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [isAuthenticated, toast, onShowSignupModal]);

  return {
    isAuthenticated,
    guardedUpsertPlan,
    guardedUpdateMilestoneStatus,
  };
}