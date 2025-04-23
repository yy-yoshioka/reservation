'use client';

import { cn } from '@/app/lib/utils';
import { Reservation } from '@/app/types';
import React from 'react';
import ReservationCard from './ReservationCard';
import Pagination from '@/app/components/navigation/Pagination';

interface ReservationListProps {
  reservations: Reservation[];
  onCancelReservation?: (id: string) => void;
  onEditReservation?: (id: string) => void;
  onViewReservation?: (id: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function ReservationList({
  reservations,
  onCancelReservation,
  onEditReservation,
  onViewReservation,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
  emptyMessage = 'No reservations found',
  className,
}: ReservationListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : reservations.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancelClick={onCancelReservation}
                onEditClick={onEditReservation}
                onViewClick={onViewReservation}
              />
            ))}
          </div>
          
          {totalPages > 1 && onPageChange && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}