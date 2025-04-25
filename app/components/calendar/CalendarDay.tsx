'use client';

import { cn, formatDate } from '@/app/lib/utils';
import TimeSlot from '@/app/components/calendar/TimeSlot';
import React, { useEffect, useState } from 'react';

interface CalendarDayProps {
  date: Date;
  timeSlots?: Array<{
    start: string;
    end: string;
    reservation?: {
      id: string;
      title: string;
      status: string;
    };
  }>;
  onSlotSelect?: (start: string, end: string) => void;
  selectedSlot?: { start: string; end: string } | null;
  isLoading?: boolean;
  className?: string;
}

export default function CalendarDay({
  date,
  timeSlots = [],
  onSlotSelect,
  selectedSlot,
  isLoading = false,
  className,
}: CalendarDayProps) {
  const [availableSlots, setAvailableSlots] = useState<
    Array<{
      start: string;
      end: string;
      reservation?: {
        id: string;
        title: string;
        status: string;
      };
    }>
  >([]);

  // Format the date for display
  const formattedDate = formatDate(date);

  // Update available slots when the timeSlots prop changes
  useEffect(() => {
    setAvailableSlots(timeSlots);
  }, [timeSlots]);

  // Check if a slot is selected
  const isSlotSelected = (start: string, end: string) => {
    if (!selectedSlot) return false;
    return selectedSlot.start === start && selectedSlot.end === end;
  };

  // Handle slot click
  const handleSlotClick = (start: string, end: string) => {
    if (onSlotSelect) {
      onSlotSelect(start, end);
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="text-lg font-medium">{formattedDate}</h3>
      </div>

      <div className="flex-grow p-2 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : availableSlots.length > 0 ? (
          <div className="grid gap-2">
            {availableSlots.map((slot, index) => (
              <TimeSlot
                key={`${slot.start}-${index}`}
                startTime={new Date(slot.start)}
                endTime={new Date(slot.end)}
                isAvailable={!slot.reservation}
                isSelected={isSlotSelected(slot.start, slot.end)}
                onClick={() => handleSlotClick(slot.start, slot.end)}
                reservation={slot.reservation}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            No available time slots
          </div>
        )}
      </div>
    </div>
  );
}
