'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import ReservationForm from '@/app/components/reservations/ReservationForm';
import Alert from '@/app/components/ui/Alert';
import { ReservationFormData, User } from '@/app/types';
import { get } from '@/app/lib/api';
import { useAuth } from '@/app/hooks/useAuth';

export default function EditReservationPage({ params }: { params: { id: string } }) {
  const { role } = useAuth();
  const router = useRouter();
  const [initialData, setInitialData] = useState<Partial<ReservationFormData>>({});
  const [customers, setCustomers] = useState<User[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    Array<{ start: string; end: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservationDate, setReservationDate] = useState<Date>(new Date());

  // Fetch reservation details, available time slots, and customer list on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch the reservation details
        const reservationResponse = await get<{
          data: {
            id: string;
            title: string;
            description: string;
            start_time: string;
            end_time: string;
            customer_id: string;
            status: string;
            reservation_details: {
              special_requests?: string;
              number_of_people?: number;
              additional_notes?: string;
            };
          };
        }>(`/api/reservations/${params.id}`);

        if (reservationResponse.error) {
          setError(reservationResponse.error);
          return;
        }

        if (reservationResponse.data) {
          const reservation = reservationResponse.data.data;

          // Set the reservation date for fetching available time slots
          setReservationDate(new Date(reservation.start_time));

          // Prepare initial form data
          setInitialData({
            title: reservation.title,
            description: reservation.description,
            start_time: reservation.start_time,
            end_time: reservation.end_time,
            customer_id: reservation.customer_id,
            special_requests: reservation.reservation_details?.special_requests,
            number_of_people: reservation.reservation_details?.number_of_people,
            additional_notes: reservation.reservation_details?.additional_notes,
          });

          // Fetch available time slots for the reservation date
          const startDate = new Date(reservation.start_time);
          startDate.setHours(0, 0, 0, 0);

          const endDate = new Date(reservation.start_time);
          endDate.setHours(23, 59, 59, 999);

          const availabilityResponse = await get<{ data: Array<{ start: string; end: string }> }>(
            `/api/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
          );

          if (availabilityResponse.error) {
            setError(availabilityResponse.error);
            return;
          }

          if (availabilityResponse.data) {
            // Add the current reservation time slot to the available slots
            // (to ensure it's included even if normally it would be unavailable due to overlap)
            const currentSlot = {
              start: reservation.start_time,
              end: reservation.end_time,
            };

            const slots = availabilityResponse.data.data;
            const slotExists = slots.some(
              (slot) => slot.start === currentSlot.start && slot.end === currentSlot.end
            );

            if (!slotExists) {
              slots.push(currentSlot);
            }

            setAvailableTimeSlots(slots);
          }

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
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reservation data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, role]);

  // Handle form submission
  const handleSubmit = async (
    data: ReservationFormData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/reservations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || 'Failed to update reservation',
        };
      }

      // Navigate to the reservation details page
      setTimeout(() => {
        router.push(`/dashboard/reservations/${params.id}`);
      }, 1000);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'An unexpected error occurred',
      };
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link
            href={`/dashboard/reservations/${params.id}`}
            className="text-blue-600 hover:text-blue-800 mr-2"
          >
            ← Back to Reservation
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">Edit Reservation</h1>
        <p className="text-gray-500">
          Update the reservation details below. You can change the time slot, title, and other
          information.
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
          isEdit={true}
        />
      </div>
    </DashboardLayout>
  );
}
