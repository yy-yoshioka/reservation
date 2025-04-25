'use client';

import { cn } from '@/app/lib/utils';
import CalendarDay from '@/app/components/calendar/CalendarDay';
import React, { useEffect, useState } from 'react';

interface CalendarWeekProps {
  startDate: Date;
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

export default function CalendarWeek({
  startDate,
  timeSlots = [],
  onSlotSelect,
  selectedSlot,
  isLoading = false,
  className,
}: CalendarWeekProps) {
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  // Generate the days of the week based on the start date
  useEffect(() => {
    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setWeekDays(days);
  }, [startDate]);

  // Group time slots by day
  const getTimeSlotsForDay = (day: Date) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return timeSlots.filter((slot) => {
      const slotStart = new Date(slot.start);
      return slotStart >= dayStart && slotStart <= dayEnd;
    });
  };

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-7 gap-4', className)}>
      {weekDays.map((day, index) => (
        <div key={index} className="border rounded-md shadow-sm h-96">
          <CalendarDay
            date={day}
            timeSlots={getTimeSlotsForDay(day)}
            onSlotSelect={onSlotSelect}
            selectedSlot={selectedSlot}
            isLoading={isLoading}
          />
        </div>
      ))}
    </div>
  );
}
