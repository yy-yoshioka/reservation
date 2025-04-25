'use client';

import { cn, formatDate } from '@/app/lib/utils';
import React, { useEffect, useState } from 'react';

interface CalendarMonthProps {
  month: number; // 0-11
  year: number;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
  highlightDates?: Date[];
  className?: string;
}

export default function CalendarMonth({
  month,
  year,
  onDateSelect,
  selectedDate,
  highlightDates = [],
  className,
}: CalendarMonthProps) {
  const [calendarDays, setCalendarDays] = useState<(Date | null)[]>([]);

  // Generate the days for the calendar
  useEffect(() => {
    const days: (Date | null)[] = [];

    // Create a date for the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);

    // Determine the first day to show on the calendar (might be from the previous month)
    const firstDayToShow = new Date(firstDayOfMonth);
    // Move back to the nearest Sunday (or keep it if it's already Sunday)
    firstDayToShow.setDate(firstDayToShow.getDate() - firstDayToShow.getDay());

    // Create a date for the last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Determine the last day to show on the calendar (might be from the next month)
    const lastDayToShow = new Date(lastDayOfMonth);
    // Move forward to the nearest Saturday (or keep it if it's already Saturday)
    const daysToAdd = 6 - lastDayToShow.getDay();
    lastDayToShow.setDate(lastDayToShow.getDate() + daysToAdd);

    // Create an array of dates from firstDayToShow to lastDayToShow
    const currentDay = new Date(firstDayToShow);
    while (currentDay <= lastDayToShow) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    setCalendarDays(days);
  }, [month, year]);

  // Check if a date is in the current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  // Check if a date is the selected date
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Check if a date should be highlighted
  const isHighlighted = (date: Date) => {
    return highlightDates.some((highlightDate) => {
      return (
        date.getDate() === highlightDate.getDate() &&
        date.getMonth() === highlightDate.getMonth() &&
        date.getFullYear() === highlightDate.getFullYear()
      );
    });
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Create an array of day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn('', className)}>
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((day, index) => (
          <div key={index} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day) return <div key={index} className="h-10"></div>;

          const isCurrentMonthDay = isCurrentMonth(day);
          const isSelectedDay = isSelected(day);
          const isHighlightedDay = isHighlighted(day);

          return (
            <div
              key={index}
              className={cn(
                'h-10 flex items-center justify-center rounded-md cursor-pointer',
                isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400',
                isSelectedDay && 'bg-blue-100 text-blue-600 font-medium',
                isHighlightedDay && !isSelectedDay && 'bg-green-50 text-green-600',
                !isSelectedDay && !isHighlightedDay && 'hover:bg-gray-100'
              )}
              onClick={() => handleDateClick(day)}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
