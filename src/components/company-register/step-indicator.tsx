"use client";

import * as Tabs from "@radix-ui/react-tabs";
import React from "react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  onStepChange?: (step: number) => void;
  className?: string;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  stepLabels,
  onStepChange,
  className,
}: StepIndicatorProps) {
  return (
    <Tabs.Root
      value={`${currentStep}`}
      onValueChange={(val) => onStepChange?.(parseInt(val))}
      className={cn("w-full", className)}
    >
      <Tabs.List className="flex justify-between items-center w-full">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const label = stepLabels?.[index];

          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              <Tabs.Trigger
                value={`${stepNumber}`}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-blue-600 text-white"
                    : isCompleted
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {stepNumber}
              </Tabs.Trigger>
              {label && (
                <span
                  className={cn(
                    "mt-1 text-xs text-center",
                    isActive
                      ? "text-blue-600 font-medium"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  )}
                >
                  {label}
                </span>
              )}
            </div>
          );
        })}
      </Tabs.List>
    </Tabs.Root>
  );
}
