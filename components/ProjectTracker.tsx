'use client';

import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  'Order Created',
  'Assigned to Admin',
  'Assigned to Freelancer',
  'Work In Progress',
  'Review Phase',
  'Revisions',
  'Completed'
];

export default function ProjectTracker({ currentStatusIndex }: { currentStatusIndex: number }) {
  return (
    <div className="bg-secondary/40 border border-border rounded-none p-8 mb-8">
      <h2 className="text-lg font-bold text-foreground mb-8">Project Progress</h2>
      <div className="relative flex justify-between">
        {/* Line */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-black/5 -z-0" />
        <div 
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-700 -z-0" 
          style={{ width: `${(currentStatusIndex / (steps.length - 1)) * 100}%` }} 
        />

        {steps.map((step, i) => (
          <div key={step} className="flex flex-col items-center relative z-10">
            <div className={cn(
              "w-8 h-8 rounded-none flex items-center justify-center transition-all duration-500",
              i <= currentStatusIndex 
                ? "bg-primary text-white shadow-xl shadow-primary/30" 
                : "bg-white border border-border text-muted-foreground/30"
            )}>
              {i < currentStatusIndex ? <Check size={16} strokeWidth={3} /> : <Circle size={8} fill="currentColor" />}
            </div>
            <span className={cn(
               "mt-4 text-[10px] font-black uppercase tracking-widest text-center max-w-[80px]",
               i <= currentStatusIndex ? "text-foreground" : "text-muted-foreground/30"
            )}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
