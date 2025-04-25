'use client';

import { cn } from '@/app/lib/utils';
import React, { useState, useEffect } from 'react';
import CalendarMonth from './CalendarMonth';
import CalendarWeek from './CalendarWeek';
import CalendarDay from './CalendarDay';
import Button from '@/app/components/ui/Button';

type CalendarView = 'day' | 'week' | 'month';

interface CalendarProps {
  initialDate?: Date;
  view?: CalendarView;
  timeSlots?: Array<{
    start: string;
    end: string;
    reservation?: {
      id: string;
      title: string;
      status: string;
    };
  }>;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: CalendarView) => void;
  onSlotSelect?: (start: string, end: string) => void;
  isLoading?: boolean;
  className?: string;
  selectedSlot?: { start: string; end: string } | null;
}

export default function Calendar({
  initialDate = new Date(),
  view = 'month',
  timeSlots = [],
  onDateChange,
  onViewChange,
  onSlotSelect,
  isLoading = false,
  className,
  selectedSlot: externalSelectedSlot,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [currentView, setCurrentView] = useState<CalendarView>(view);
  const [internalSelectedSlot, setInternalSelectedSlot] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // Use external selectedSlot if provided, otherwise use internal state
  const selectedSlot = externalSelectedSlot || internalSelectedSlot;

  // Update state when props change
  useEffect(() => {
    setCurrentDate(initialDate);
  }, [initialDate]);

  useEffect(() => {
    setCurrentView(view);
  }, [view]);

  // Generate dates with reservations for the month view
  const getDatesWithReservations = () => {
    const dates: Date[] = [];

    timeSlots.forEach((slot) => {
      if (slot.reservation) {
        const date = new Date(slot.start);
        // Check if this date is already in the array
        const exists = dates.some(
          (existingDate) =>
            existingDate.getDate() === date.getDate() &&
            existingDate.getMonth() === date.getMonth() &&
            existingDate.getFullYear() === date.getFullYear()
        );

        if (!exists) {
          dates.push(date);
        }
      }
    });

    return dates;
  };

  // Navigate to the previous period
  const goToPrevious = () => {
    const newDate = new Date(currentDate);

    if (currentView === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }

    setCurrentDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  // Navigate to the next period
  const goToNext = () => {
    const newDate = new Date(currentDate);

    if (currentView === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }

    setCurrentDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  // Handle view change
  const handleViewChange = (newView: CalendarView) => {
    setCurrentView(newView);
    if (onViewChange) {
      onViewChange(newView);
    }
  };

  // Handle date selection in month view
  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setCurrentView('day');
    if (onDateChange) {
      onDateChange(date);
    }
    if (onViewChange) {
      onViewChange('day');
    }
  };

  // Handle time slot selection
  const handleSlotSelect = (start: string, end: string) => {
    setInternalSelectedSlot({ start, end });
    if (onSlotSelect) {
      onSlotSelect(start, end);
    }
  };

  // Get start date for week view (Sunday of the week containing currentDate)
  const getWeekStartDate = () => {
    const date = new Date(currentDate);
    const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    date.setDate(date.getDate() - day); // Set to the previous Sunday
    return date;
  };

  // Generate title for the current view
  const getTitle = () => {
    const options: Intl.DateTimeFormatOptions = {};

    if (currentView === 'day') {
      options.weekday = 'long';
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
    } else if (currentView === 'week') {
      const weekStart = getWeekStartDate();
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Format: "February 2023" or "February - March 2023"
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.toLocaleDateString('en-US', {
          month: 'long',
        })} ${weekStart.getFullYear()}`;
      } else {
        return `${weekStart.toLocaleDateString('en-US', {
          month: 'long',
        })} - ${weekEnd.toLocaleDateString('en-US', {
          month: 'long',
        })} ${weekStart.getFullYear()}`;
      }
    } else {
      options.year = 'numeric';
      options.month = 'long';
    }

    return currentDate.toLocaleDateString('en-US', options);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button onClick={goToPrevious} variant="outline" size="sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Button>

          <h2 className="text-xl font-medium">{getTitle()}</h2>

          <Button onClick={goToNext} variant="outline" size="sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handleViewChange('day')}
            variant={currentView === 'day' ? 'primary' : 'outline'}
            size="sm"
          >
            Day
          </Button>
          <Button
            onClick={() => handleViewChange('week')}
            variant={currentView === 'week' ? 'primary' : 'outline'}
            size="sm"
          >
            Week
          </Button>
          <Button
            onClick={() => handleViewChange('month')}
            variant={currentView === 'month' ? 'primary' : 'outline'}
            size="sm"
          >
            Month
          </Button>
        </div>
      </div>

      <div className="flex-grow">
        {currentView === 'day' && (
          <div className="border rounded-md shadow-sm h-96">
            <CalendarDay
              date={currentDate}
              timeSlots={timeSlots.filter((slot) => {
                const slotDate = new Date(slot.start);
                return (
                  slotDate.getDate() === currentDate.getDate() &&
                  slotDate.getMonth() === currentDate.getMonth() &&
                  slotDate.getFullYear() === currentDate.getFullYear()
                );
              })}
              onSlotSelect={handleSlotSelect}
              selectedSlot={selectedSlot}
              isLoading={isLoading}
            />
          </div>
        )}

        {currentView === 'week' && (
          <CalendarWeek
            startDate={getWeekStartDate()}
            timeSlots={timeSlots}
            onSlotSelect={handleSlotSelect}
            selectedSlot={selectedSlot}
            isLoading={isLoading}
          />
        )}

        {currentView === 'month' && (
          <CalendarMonth
            month={currentDate.getMonth()}
            year={currentDate.getFullYear()}
            onDateSelect={handleDateSelect}
            selectedDate={currentDate}
            highlightDates={getDatesWithReservations()}
          />
        )}
      </div>
    </div>
  );
}
