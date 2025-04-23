'use client';

import { cn, formatDate, formatTime, getStatusColor } from '@/app/lib/utils';
import { Reservation } from '@/app/types';
import Card from '@/app/components/ui/Card';
import Badge from '@/app/components/ui/Badge';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';
import { useState } from 'react';

interface ReservationCardProps {
  reservation: Reservation;
  onCancelClick?: (id: string) => void;
  onEditClick?: (id: string) => void;
  onViewClick?: (id: string) => void;
  showActions?: boolean;
  className?: string;
}

export default function ReservationCard({
  reservation,
  onCancelClick,
  onEditClick,
  onViewClick,
  showActions = true,
  className,
}: ReservationCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Format dates for display
  const date = formatDate(new Date(reservation.start_time));
  const startTime = formatTime(new Date(reservation.start_time));
  const endTime = formatTime(new Date(reservation.end_time));
  
  // Handle cancel click
  const handleCancelClick = () => {
    setIsLoading(true);
    if (onCancelClick) {
      onCancelClick(reservation.id);
    }
    setIsLoading(false);
  };
  
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <Card.Header className="flex flex-row items-center justify-between pb-2">
        <Card.Title className="truncate">{reservation.title}</Card.Title>
        <Badge variant={
          reservation.status === 'confirmed' ? 'success' :
          reservation.status === 'pending' ? 'warning' :
          reservation.status === 'cancelled' ? 'danger' :
          'default'
        }>
          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
        </Badge>
      </Card.Header>
      
      <Card.Content>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Date:</span> {date}
          </div>
          <div className="text-sm">
            <span className="font-medium">Time:</span> {startTime} - {endTime}
          </div>
          {reservation.description && (
            <div className="text-sm">
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-gray-600">{reservation.description}</p>
            </div>
          )}
        </div>
      </Card.Content>
      
      {showActions && (
        <Card.Footer className="flex justify-end space-x-2">
          {onViewClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewClick(reservation.id)}
            >
              View
            </Button>
          )}
          
          {onEditClick && reservation.status !== 'cancelled' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditClick(reservation.id)}
            >
              Edit
            </Button>
          )}
          
          {onCancelClick && reservation.status !== 'cancelled' && (
            <Button
              size="sm"
              variant="danger"
              onClick={handleCancelClick}
              isLoading={isLoading}
            >
              Cancel
            </Button>
          )}
        </Card.Footer>
      )}
    </Card>
  );
}