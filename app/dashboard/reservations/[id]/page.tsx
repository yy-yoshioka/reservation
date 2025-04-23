'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import Button from '@/app/components/ui/Button';
import Alert from '@/app/components/ui/Alert';
import Card from '@/app/components/ui/Card';
import Badge from '@/app/components/ui/Badge';
import { get } from '@/app/lib/api';
import { Reservation, ReservationDetails } from '@/app/types';
import { formatDate, formatTime, getStatusColor } from '@/app/lib/utils';
import { useAuth } from '@/app/hooks/useAuth';

interface ReservationWithDetails extends Reservation {
  reservation_details: ReservationDetails;
  users: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function ReservationDetailPage({ params }: { params: { id: string } }) {
  const { role } = useAuth();
  const [reservation, setReservation] = useState<ReservationWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const router = useRouter();
  
  // Fetch reservation details on component mount
  useEffect(() => {
    const fetchReservation = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await get<{ data: ReservationWithDetails }>(`/api/reservations/${params.id}`);
        
        if (response.error) {
          setError(response.error);
          return;
        }
        
        if (response.data) {
          setReservation(response.data.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reservation details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReservation();
  }, [params.id]);
  
  // Handle reservation cancellation
  const handleCancelReservation = async () => {
    setIsLoading(true);
    
    try {
      // Cancel the reservation (update status to 'cancelled')
      const response = await fetch(`/api/reservations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to cancel reservation');
        return;
      }
      
      // Update the local state
      if (reservation) {
        setReservation({
          ...reservation,
          status: 'cancelled',
        });
      }
      
      setCancelConfirm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel reservation');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date and time for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${formatDate(date)} at ${formatTime(date)}`;
  };
  
  // Determine if user can edit the reservation
  const canEdit = () => {
    if (!reservation) return false;
    if (role === 'admin') return true;
    if (role === 'staff' && reservation.created_by === reservation.id) return true;
    return reservation.status !== 'cancelled' && reservation.status !== 'completed';
  };
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link 
            href="/dashboard/reservations"
            className="text-blue-600 hover:text-blue-800 mr-2"
          >
            ← Back to Reservations
          </Link>
        </div>
        
        {error ? (
          <Alert
            variant="error"
            title="Error"
          >
            {error}
          </Alert>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : reservation ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{reservation.title}</h1>
                <p className="text-gray-500">
                  Reservation ID: {reservation.id}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-2">
                {canEdit() && (
                  <Link href={`/dashboard/reservations/${params.id}/edit`}>
                    <Button variant="outline">Edit</Button>
                  </Link>
                )}
                
                {reservation.status !== 'cancelled' && (
                  cancelConfirm ? (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setCancelConfirm(false)}
                      >
                        No, Keep It
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleCancelReservation}
                        isLoading={isLoading}
                      >
                        Yes, Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="danger"
                      onClick={() => setCancelConfirm(true)}
                    >
                      Cancel Reservation
                    </Button>
                  )
                )}
              </div>
            </div>
            
            <Card>
              <Card.Header>
                <div className="flex justify-between items-center">
                  <Card.Title>Reservation Details</Card.Title>
                  <Badge
                    variant={
                      reservation.status === 'confirmed' ? 'success' :
                      reservation.status === 'pending' ? 'warning' :
                      reservation.status === 'cancelled' ? 'danger' :
                      'default'
                    }
                  >
                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                  </Badge>
                </div>
              </Card.Header>
              
              <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                    <p className="mt-1">{formatDateTime(reservation.start_time)} - {formatTime(new Date(reservation.end_time))}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Reserved By</h3>
                    <p className="mt-1">
                      {reservation.users?.first_name} {reservation.users?.last_name}
                      <br />
                      <span className="text-gray-500 text-sm">{reservation.users?.email}</span>
                    </p>
                  </div>
                  
                  {reservation.description && (
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1">{reservation.description}</p>
                    </div>
                  )}
                  
                  {reservation.reservation_details?.number_of_people && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Number of People</h3>
                      <p className="mt-1">{reservation.reservation_details.number_of_people}</p>
                    </div>
                  )}
                  
                  {reservation.reservation_details?.special_requests && (
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Special Requests</h3>
                      <p className="mt-1">{reservation.reservation_details.special_requests}</p>
                    </div>
                  )}
                  
                  {reservation.reservation_details?.additional_notes && (
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Additional Notes</h3>
                      <p className="mt-1">{reservation.reservation_details.additional_notes}</p>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>
            
            <Card>
              <Card.Header>
                <Card.Title>Reservation Timeline</Card.Title>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="h-4 w-4 rounded-full bg-green-500 mt-1"></div>
                      <div className="h-full w-0.5 bg-gray-200 ml-2"></div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium">Reservation Created</h3>
                      <p className="text-gray-500 text-sm">{formatDateTime(reservation.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="h-4 w-4 rounded-full bg-blue-500 mt-1"></div>
                      <div className="h-full w-0.5 bg-gray-200 ml-2"></div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium">Last Updated</h3>
                      <p className="text-gray-500 text-sm">{formatDateTime(reservation.updated_at)}</p>
                    </div>
                  </div>
                  
                  {reservation.status === 'cancelled' && (
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-4 w-4 rounded-full bg-red-500 mt-1"></div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium">Reservation Cancelled</h3>
                        <p className="text-gray-500 text-sm">{formatDateTime(reservation.updated_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>
          </div>
        ) : (
          <Alert
            variant="warning"
            title="Reservation Not Found"
          >
            The reservation could not be found or you do not have permission to view it.
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}