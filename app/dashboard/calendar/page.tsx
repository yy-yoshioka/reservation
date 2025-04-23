'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import Calendar from '@/app/components/calendar/Calendar';
import Button from '@/app/components/ui/Button';
import Alert from '@/app/components/ui/Alert';
import { get } from '@/app/lib/api';
import { Reservation } from '@/app/types';

interface TimeSlot {
  start: string;
  end: string;
  reservation?: {
    id: string;
    title: string;
    status: string;
  };
}

export default function CalendarPage() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Fetch calendar data when the view or date changes
  useEffect(() => {
    const fetchCalendarData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Determine the date range to fetch based on the view
        let startDate = new Date(currentDate);
        let endDate = new Date(currentDate);
        
        if (view === 'day') {
          // For day view, just use the current date
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
        } else if (view === 'week') {
          // For week view, start with Sunday of the current week
          const day = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
          startDate.setDate(currentDate.getDate() - day);
          startDate.setHours(0, 0, 0, 0);
          
          // End with Saturday of the current week
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
        } else {
          // For month view, start with the first day of the month
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          
          // End with the last day of the month
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
        }
        
        // Fetch available time slots
        const availabilityResponse = await get<{ data: TimeSlot[] }>(
          `/api/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        
        // Fetch reservations for the same date range
        const reservationsResponse = await get<{ data: Reservation[] }>(
          `/api/reservations?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        
        if (availabilityResponse.error) {
          setError(availabilityResponse.error);
          return;
        }
        
        if (reservationsResponse.error) {
          setError(reservationsResponse.error);
          return;
        }
        
        // Combine availability and reservations
        const availableSlots = availabilityResponse.data?.data || [];
        const reservations = reservationsResponse.data?.data || [];
        
        // Map reservations to the time slots format
        const reservationSlots: TimeSlot[] = reservations.map((reservation) => ({
          start: reservation.start_time,
          end: reservation.end_time,
          reservation: {
            id: reservation.id,
            title: reservation.title,
            status: reservation.status,
          },
        }));
        
        // Merge available slots and reservation slots
        const mergedSlots = [...availableSlots, ...reservationSlots];
        
        setTimeSlots(mergedSlots);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch calendar data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCalendarData();
  }, [view, currentDate]);
  
  // Handle time slot selection
  const handleSlotSelect = (start: string, end: string) => {
    // Check if the slot has a reservation
    const slot = timeSlots.find(
      (slot) => slot.start === start && slot.end === end
    );
    
    if (slot?.reservation) {
      // If it's a reservation, navigate to the reservation details page
      router.push(`/dashboard/reservations/${slot.reservation.id}`);
    } else {
      // If it's an available slot, navigate to the new reservation page with the time pre-filled
      router.push(
        `/dashboard/reservations/new?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
      );
    }
  };
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Calendar</h1>
        <p className="text-gray-500">
          View and manage your schedule. Click on an available time slot to create a new reservation.
        </p>
      </div>
      
      {error && (
        <Alert
          variant="error"
          onClose={() => setError(null)}
          className="mb-4"
        >
          {error}
        </Alert>
      )}
      
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/reservations/new')}
        >
          New Reservation
        </Button>
      </div>
      
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <Calendar
          initialDate={currentDate}
          view={view}
          timeSlots={timeSlots}
          onDateChange={setCurrentDate}
          onViewChange={setView}
          onSlotSelect={handleSlotSelect}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}