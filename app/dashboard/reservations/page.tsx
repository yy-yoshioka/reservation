'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import Button from '@/app/components/ui/Button';
import ReservationList from '@/app/components/reservations/ReservationList';
import ReservationFilter, { ReservationFilters } from '@/app/components/reservations/ReservationFilter';
import Alert from '@/app/components/ui/Alert';
import { get, del } from '@/app/lib/api';
import { Reservation } from '@/app/types';
import { useAuth } from '@/app/hooks/useAuth';

export default function ReservationsPage() {
  const { role } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ReservationFilters>({
    status: searchParams.get('status') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    onlyMine: false,
  });
  
  // Fetch reservations on component mount and when filters or page changes
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('page', currentPage.toString());
        queryParams.append('limit', '9'); // Show 9 reservations per page
        
        if (filters.status) {
          queryParams.append('status', filters.status);
        }
        
        if (filters.startDate) {
          queryParams.append('startDate', new Date(filters.startDate).toISOString());
        }
        
        if (filters.endDate) {
          // Set the end date to the end of the day
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          queryParams.append('endDate', endDate.toISOString());
        }
        
        if (filters.onlyMine) {
          queryParams.append('onlyMine', 'true');
        }
        
        // Fetch reservations
        const response = await get<{
          data: Reservation[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        }>(`/api/reservations?${queryParams.toString()}`);
        
        if (response.error) {
          setError(response.error);
          return;
        }
        
        if (response.data) {
          setReservations(response.data.data);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reservations');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReservations();
  }, [currentPage, filters]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters: ReservationFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle reservation cancellation
  const handleCancelReservation = async (id: string) => {
    try {
      // Cancel the reservation (update status to 'cancelled')
      const response = await put<{ data: Reservation }>(
        `/api/reservations/${id}`,
        { status: 'cancelled' }
      );
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      // Update the local state
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id
            ? { ...reservation, status: 'cancelled' }
            : reservation
        )
      );
      
      setSuccess('Reservation cancelled successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel reservation');
    }
  };
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Reservations</h1>
          <Link href="/dashboard/reservations/new">
            <Button>New Reservation</Button>
          </Link>
        </div>
        <p className="text-gray-500">
          View and manage all your reservations. Use the filters to find specific reservations.
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
      
      {success && (
        <Alert
          variant="success"
          onClose={() => setSuccess(null)}
          className="mb-4"
        >
          {success}
        </Alert>
      )}
      
      <ReservationFilter
        onFilterChange={handleFilterChange}
      />
      
      <ReservationList
        reservations={reservations}
        onCancelReservation={handleCancelReservation}
        onEditReservation={(id) => router.push(`/dashboard/reservations/${id}/edit`)}
        onViewReservation={(id) => router.push(`/dashboard/reservations/${id}`)}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage="No reservations found. Adjust your filters or create a new reservation."
      />
    </DashboardLayout>
  );
}

// Helper function for PUT requests (used for cancellation)
const put = async<T>(url: string, body: any, options?: RequestInit): Promise<{ data?: T; error?: string }> => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `API error: ${response.status}`,
      };
    }

    return { data: data as T };
  } catch (error: any) {
    return {
      error: error.message || 'Unknown error occurred',
    };
  }
};