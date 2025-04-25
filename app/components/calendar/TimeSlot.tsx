'use client';

import { cn } from '@/app/lib/utils';
import { formatTime } from '@/app/lib/utils';
import React from 'react';

interface TimeSlotProps {
  startTime: Date;
  endTime: Date;
  isAvailable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  reservation?: {
    id: string;
    title: string;
    status: string;
  };
  className?: string;
}

export default function TimeSlot({
  startTime,
  endTime,
  isAvailable = true,
  isSelected = false,
  onClick,
  reservation,
  className,
}: TimeSlotProps) {
  // Determine the style based on availability and selection
  const baseStyles = 'flex flex-col p-2 rounded-md cursor-pointer transition-colors';

  const statusStyles = {
    available: 'bg-green-50 hover:bg-green-100 border border-green-200 text-green-700',
    unavailable: 'bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed',
    selected: 'bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-700',
    reserved: 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-700',
  };

  let status = 'unavailable';
  if (isAvailable) {
    status = isSelected ? 'selected' : 'available';
  }
  if (reservation) {
    status = 'reserved';
  }

  return (
    <div
      className={cn(baseStyles, statusStyles[status as keyof typeof statusStyles], className)}
      onClick={isAvailable && !reservation ? onClick : undefined}
    >
      <div className="text-sm font-medium">
        {formatTime(startTime)} - {formatTime(endTime)}
      </div>

      {reservation && (
        <div className="mt-1 text-xs">
          <div className="font-medium truncate">{reservation.title}</div>
          <div className="uppercase text-xs">{reservation.status}</div>
        </div>
      )}
    </div>
  );
}
