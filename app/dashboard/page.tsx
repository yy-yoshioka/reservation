'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/app/components/layouts/DashboardLayout';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import ReservationCard from '@/app/components/reservations/ReservationCard';
import { get } from '@/app/lib/api';
import { Reservation } from '@/app/types';
import { useAuth } from '@/app/hooks/useAuth';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch reservations on component mount
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      
      try {
        // Fetch upcoming reservations
        const upcomingResponse = await get<{ data: Reservation[] }>('/api/reservations?status=confirmed&startDate=' + new Date().toISOString() + '&limit=3');
        
        if (upcomingResponse.data) {
          setUpcomingReservations(upcomingResponse.data.data || []);
        }
        
        // Fetch recent reservations
        const recentResponse = await get<{ data: Reservation[] }>('/api/reservations?limit=3');
        
        if (recentResponse.data) {
          setRecentReservations(recentResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchReservations();
    }
  }, [user]);
  
  // Statistics data (can be replaced with actual API calls later)
  const stats = [
    {
      title: 'Total Reservations',
      value: '24',
      change: '+12% from last month',
      positive: true,
    },
    {
      title: 'Completed',
      value: '18',
      change: '+5% from last month',
      positive: true,
    },
    {
      title: 'Upcoming',
      value: '6',
      change: '0% change',
      positive: null,
    },
    {
      title: 'Cancellations',
      value: '2',
      change: '-50% from last month',
      positive: true,
    },
  ];
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back, {user?.user_metadata?.first_name || 'User'}! Here&apos;s an overview of your reservations.
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4">
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            {stat.change && (
              <p className={`text-xs mt-1 ${
                stat.positive === true ? 'text-green-600' : 
                stat.positive === false ? 'text-red-600' : 'text-gray-500'
              }`}>
                {stat.change}
              </p>
            )}
          </Card>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/reservations/new">
            <Button fullWidth>New Reservation</Button>
          </Link>
          <Link href="/dashboard/calendar">
            <Button fullWidth variant="outline">View Calendar</Button>
          </Link>
          <Link href="/dashboard/reservations">
            <Button fullWidth variant="outline">All Reservations</Button>
          </Link>
        </div>
      </div>
      
      {/* Upcoming Reservations */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upcoming Reservations</h2>
          <Link href="/dashboard/reservations?status=confirmed">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : upcomingReservations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onViewClick={(id) => {
                  window.location.href = `/dashboard/reservations/${id}`;
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <Card.Content>
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">No upcoming reservations</p>
                <Link href="/dashboard/reservations/new">
                  <Button>Create a Reservation</Button>
                </Link>
              </div>
            </Card.Content>
          </Card>
        )}
      </div>
      
      {/* Recent Reservations */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Reservations</h2>
          <Link href="/dashboard/reservations">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : recentReservations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onViewClick={(id) => {
                  window.location.href = `/dashboard/reservations/${id}`;
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <Card.Content>
              <div className="text-center py-6">
                <p className="text-gray-500">No recent reservations</p>
              </div>
            </Card.Content>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}