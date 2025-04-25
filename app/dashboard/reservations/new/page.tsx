'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import ReservationForm from '@/app/components/reservations/ReservationForm';
import Alert from '@/app/components/ui/Alert';
import { ReservationFormData, User } from '@/app/types';
import { get } from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';

export default function NewReservationPage() {
  const { role } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<User[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    Array<{ start: string; end: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get initial date from URL parameters or use current date
  const initialDateParam = searchParams.get('date');
  const initialDate = initialDateParam ? new Date(initialDateParam) : new Date();

  // Get initial time slot from URL parameters if available
  const initialData: Partial<ReservationFormData> = {};
  if (searchParams.get('start') && searchParams.get('end')) {
    initialData.start_time = searchParams.get('start')!;
    initialData.end_time = searchParams.get('end')!;
  }

  // Fetch customers and initial time slots data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // If user is an admin, fetch the customer list
        if (role === 'admin') {
          const customersResponse = await get<{ data: User[] }>('/api/users');

          if (customersResponse.error) {
            setError(customersResponse.error);
            return;
          }

          if (customersResponse.data) {
            setCustomers(customersResponse.data.data);
          }
        }

        // Fetch initial time slots
        const startDate = new Date(initialDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(initialDate);
        endDate.setHours(23, 59, 59, 999);

        const availabilityResponse = await get<{
          data: Array<{ start: string; end: string }>;
        }>(
          `/api/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );

        if (availabilityResponse.error) {
          setError(availabilityResponse.error);
          return;
        }

        if (availabilityResponse.data) {
          setAvailableTimeSlots(availabilityResponse.data.data);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch required data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Only run this effect once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle form submission
  const handleSubmit = async (
    data: ReservationFormData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          status: 'confirmed',
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || 'Failed to create reservation',
        };
      }

      // Navigate to the reservation details page
      setTimeout(() => {
        router.push(`/dashboard/reservations/${responseData.data.id}`);
      }, 1000);

      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link href="/dashboard/reservations" className="text-blue-600 hover:text-blue-800 mr-2">
            ← Back to Reservations
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">Create New Reservation</h1>
        <p className="text-gray-500">
          Fill out the form below to create a new reservation. Select an available time slot from
          the calendar.
        </p>
      </div>

      {error && (
        <Alert variant="error" title="Error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <ReservationForm
          initialData={initialData}
          onSubmit={handleSubmit}
          availableTimeSlots={availableTimeSlots}
          customers={customers}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
}
