import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SafeAreaProviderProps {
  children: ReactNode;
  className?: string;
}

export function SafeAreaProvider({ children, className }: SafeAreaProviderProps) {
  return (
    <div 
      className={cn(
        "min-h-screen min-h-[100dvh] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]",
        className
      )}
      style={{
        // Prevent keyboard from covering inputs on mobile
        height: '100dvh',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + env(keyboard-inset-height, 0px))'
      }}
    >
      {children}
    </div>
  );
}