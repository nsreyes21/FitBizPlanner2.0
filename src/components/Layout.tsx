import { ReactNode } from 'react';
import { AuthHeader } from './AuthHeader';

interface LayoutProps {
  children: ReactNode;
  onBuildPlan?: () => void;
  onAddEvent?: () => void;
}

export function Layout({ children, onBuildPlan, onAddEvent }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AuthHeader 
        onBuildPlan={onBuildPlan}
        onAddEvent={onAddEvent}
      />
      
      <main className="flex-1 min-h-0">
        {children}
      </main>
    </div>
  );
}
