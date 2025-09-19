import * as React from "react";
import { CheckCircle, Circle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimelineItem {
  id?: string;
  name: string;
  offsetDays: number;
  owner: string;
  notes: string;
  computedDate?: string;
  completed?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  onUpdateItem?: (index: number, field: string, value: string | number) => void;
  onRemoveItem?: (index: number) => void;
  editable?: boolean;
  className?: string;
}

export function Timeline({
  items,
  onUpdateItem,
  onRemoveItem,
  editable = false,
  className,
}: TimelineProps) {
  return (
    <TooltipProvider>
      <div className={cn("relative", className)}>
        {/* Timeline line */}
        <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="relative flex items-start gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0">
                {item.completed ? (
                  <CheckCircle className="h-6 w-6 text-primary" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    {editable ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => onUpdateItem?.(index, 'name', e.target.value)}
                        className="text-base font-semibold bg-transparent border-0 p-0 focus:outline-none focus:ring-0 w-full"
                        placeholder="Milestone name..."
                      />
                    ) : (
                      <h4 className="text-base font-semibold text-foreground">
                        {item.name}
                      </h4>
                    )}
                    
                    {item.computedDate && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.computedDate}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Owner:</span>
                        {editable ? (
                          <input
                            type="text"
                            value={item.owner}
                            onChange={(e) => onUpdateItem?.(index, 'owner', e.target.value)}
                            className="text-xs text-foreground bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
                            placeholder="Owner..."
                          />
                        ) : (
                          <span className="text-xs text-foreground">{item.owner}</span>
                        )}
                      </div>
                      
                      {editable && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Days:</span>
                          <input
                            type="number"
                            value={item.offsetDays}
                            onChange={(e) => onUpdateItem?.(index, 'offsetDays', parseInt(e.target.value) || 0)}
                            className="text-xs text-foreground bg-transparent border-0 p-0 focus:outline-none focus:ring-0 w-16"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info tooltip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="text-sm">{item.notes}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Remove button for editable mode */}
                  {editable && onRemoveItem && (
                    <button
                      onClick={() => onRemoveItem(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Editable notes field */}
                {editable && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => onUpdateItem?.(index, 'notes', e.target.value)}
                      className="text-xs text-muted-foreground bg-transparent border-0 p-0 focus:outline-none focus:ring-0 w-full"
                      placeholder="Notes..."
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}